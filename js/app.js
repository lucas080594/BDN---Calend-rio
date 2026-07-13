// ===== VARIÁVEIS GLOBAIS =====
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let scales = {};
let teamMembers = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Aplicação iniciada');
  
  loadTeamMembers();
  renderCalendar();
  
  // Event Listeners - SETAS DO CALENDÁRIO
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
    });
  }

  // Formulários
  const agendaForm = document.getElementById('agendaForm');
  const teamForm = document.getElementById('teamForm');
  
  if (agendaForm) {
    agendaForm.addEventListener('submit', addScale);
  }
  
  if (teamForm) {
    teamForm.addEventListener('submit', addTeamMember);
  }
});

// ===== CARREGAR MEMBROS DO FIREBASE =====
async function loadTeamMembers() {
  try {
    const snapshot = await db.collection('team').get();
    teamMembers = [];
    
    snapshot.forEach(doc => {
      teamMembers.push(doc.data().name);
    });
    
    updateTeamSelect();
    renderTeamList();
    console.log('✅ Membros carregados:', teamMembers);
  } catch (error) {
    console.error('❌ Erro ao carregar membros:', error);
  }
}

// ===== CARREGAR ESCALAS DO FIREBASE =====
async function loadScales() {
  try {
    const snapshot = await db.collection('scales').get();
    scales = {};
    
    snapshot.forEach(doc => {
      const data = doc.data();
      scales[data.date] = data.members || [];
    });
    
    renderCalendar();
    console.log('✅ Escalas carregadas:', scales);
  } catch (error) {
    console.error('❌ Erro ao carregar escalas:', error);
  }
}

// ===== RENDERIZAR CALENDÁRIO =====
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const monthYearElement = document.getElementById('monthYear');
  if (monthYearElement) {
    monthYearElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  const calendarGrid = document.getElementById('calendarGrid');
  if (!calendarGrid) return;
  
  calendarGrid.innerHTML = '';

  // Dias do mês anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayElement = createDayElement(day, true);
    calendarGrid.appendChild(dayElement);
  }

  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDayElement(day, false);
    calendarGrid.appendChild(dayElement);
  }

  // Dias do próximo mês
  const totalCells = calendarGrid.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDayElement(day, true);
    calendarGrid.appendChild(dayElement);
  }
}

// ===== CRIAR ELEMENTO DO DIA =====
function createDayElement(day, isOtherMonth) {
  const dayElement = document.createElement('div');
  dayElement.className = `calendar-day ${isOtherMonth ? 'other-month' : ''}`;

  const dayNumber = document.createElement('div');
  dayNumber.className = 'day-number';
  dayNumber.textContent = day;

  const dayContent = document.createElement('div');
  dayContent.className = 'day-content';

  // Formatar data
  const month = String(currentMonth + 1).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const dateKey = `${currentYear}-${month}-${dayStr}`;

  // Exibir escalas
  if (scales[dateKey] && scales[dateKey].length > 0) {
    scales[dateKey].forEach(scale => {
      const scaleDiv = document.createElement('div');
      scaleDiv.className = scale === 'VAGO' ? 'vago' : 'team-member';
      scaleDiv.textContent = scale;
      dayContent.appendChild(scaleDiv);
    });
  } else if (!isOtherMonth) {
    // Se não tem escala, mostrar "VAGO"
    const vagoDiv = document.createElement('div');
    vagoDiv.className = 'vago';
    vagoDiv.textContent = 'VAGO';
    dayContent.appendChild(vagoDiv);
  }

  dayElement.appendChild(dayNumber);
  dayElement.appendChild(dayContent);

  return dayElement;
}

// ===== ADICIONAR ESCALA =====
async function addScale(e) {
  e.preventDefault();

  const dataInput = document.getElementById('agendaData').value;
  const tipo = document.getElementById('agendaTipo').value;
  const membro = document.getElementById('agendaMembro').value;

  if (!dataInput || !tipo || !membro) {
    alert('⚠️ Preencha todos os campos!');
    return;
  }

  try {
    // Salvar no Firebase
    await db.collection('scales').doc(dataInput).set({
      date: dataInput,
      members: [membro],
      type: tipo,
      timestamp: new Date()
    }, { merge: true });

    console.log('✅ Escala salva no Firebase:', { dataInput, membro, tipo });

    // Atualizar local
    if (!scales[dataInput]) {
      scales[dataInput] = [];
    }
    scales[dataInput].push(membro);

    // Limpar formulário
    document.getElementById('agendaForm').reset();

    // Atualizar calendário
    renderCalendar();

    alert('✅ Escala adicionada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao salvar escala:', error);
    alert('❌ Erro ao salvar escala!');
  }
}

// ===== ADICIONAR MEMBRO DA EQUIPE =====
async function addTeamMember(e) {
  e.preventDefault();

  const name = document.getElementById('teamName').value.trim();

  if (!name) {
    alert('⚠️ Digite um nome!');
    return;
  }

  if (teamMembers.includes(name)) {
    alert('⚠️ Este membro já existe!');
    return;
  }

  try {
    // Salvar no Firebase
    await db.collection('team').add({
      name: name,
      timestamp: new Date()
    });

    console.log('✅ Membro salvo no Firebase:', name);

    teamMembers.push(name);

    // Limpar formulário
    document.getElementById('teamName').value = '';

    // Atualizar UI
    updateTeamSelect();
    renderTeamList();

    alert('✅ Membro adicionado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao salvar membro:', error);
    alert('❌ Erro ao salvar membro!');
  }
}

// ===== DELETAR MEMBRO =====
async function deleteMember(button) {
  const li = button.parentElement;
  const name = li.textContent.replace('❌', '').trim();

  if (!confirm(`Deseja deletar ${name}?`)) {
    return;
  }

  try {
    // Deletar do Firebase
    const snapshot = await db.collection('team').where('name', '==', name).get();
    snapshot.forEach(doc => {
      doc.ref.delete();
    });

    console.log('✅ Membro deletado do Firebase:', name);

    teamMembers = teamMembers.filter(m => m !== name);
    li.remove();

    updateTeamSelect();
  } catch (error) {
    console.error('❌ Erro ao deletar membro:', error);
    alert('❌ Erro ao deletar membro!');
  }
}

// ===== ATUALIZAR SELECT DE MEMBROS =====
function updateTeamSelect() {
  const select = document.getElementById('agendaMembro');
  if (!select) return;

  select.innerHTML = '<option value="">Selecionar Membro...</option>';

  teamMembers.forEach(member => {
    const option = document.createElement('option');
    option.value = member;
    option.textContent = member;
    select.appendChild(option);
  });
}

// ===== RENDERIZAR LISTA DE EQUIPE =====
function renderTeamList() {
  const teamList = document.getElementById('teamList');
  if (!teamList) return;

  teamList.innerHTML = '';

  teamMembers.forEach(member => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${member}
      <button class="delete-btn" onclick="deleteMember(this)">❌</button>
    `;
    teamList.appendChild(li);
  });
}

// ===== CARREGAR DADOS AO INICIAR =====
window.addEventListener('load', () => {
  loadTeamMembers();
  loadScales();
});