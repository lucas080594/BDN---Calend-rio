// ===== VARIÁVEIS GLOBAIS =====
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let scales = {};
let teamMembers = ['Vitor', 'Cauan', 'Carlinhos', 'Clovis'];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ Página carregada');
  renderCalendar();
  updateTeamSelect();
  setupEventListeners();
});

// ===== CONFIGURAR EVENT LISTENERS =====
function setupEventListeners() {
  // Botões de navegação
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  const todayBtn = document.getElementById('todayBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      renderCalendar();
      console.log('⬅️ Mês anterior:', currentMonth + 1, currentYear);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.preventDefault();
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      renderCalendar();
      console.log('➡️ Próximo mês:', currentMonth + 1, currentYear);
    });
  }

  if (todayBtn) {
    todayBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const today = new Date();
      currentMonth = today.getMonth();
      currentYear = today.getFullYear();
      renderCalendar();
      console.log('📅 Hoje:', currentMonth + 1, currentYear);
    });
  }

  // Formulário de agenda
  const agendaForm = document.getElementById('agendaForm');
  if (agendaForm) {
    agendaForm.addEventListener('submit', addScale);
  }
}

// ===== RENDERIZAR CALENDÁRIO =====
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // Atualizar título do mês
  const monthYearElement = document.getElementById('monthYear');
  if (monthYearElement) {
    monthYearElement.textContent = `${monthNames[currentMonth]} de ${currentYear}`;
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

  // Buscar escalas para este dia
  const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  if (scales[dateKey]) {
    scales[dateKey].forEach(scale => {
      const scaleDiv = document.createElement('div');
      scaleDiv.className = scale === 'VAGO' ? 'vago' : 'team-member';
      scaleDiv.textContent = scale;
      dayContent.appendChild(scaleDiv);
    });
  }

  dayElement.appendChild(dayNumber);
  dayElement.appendChild(dayContent);

  return dayElement;
}

// ===== ADICIONAR ESCALA =====
function addScale(e) {
  e.preventDefault();

  const dataInput = document.getElementById('agendaData').value;
  const tipo = document.getElementById('agendaTipo').value;
  const membro = document.getElementById('agendaMembro').value;

  if (!dataInput || !tipo || !membro) {
    alert('❌ Preencha todos os campos!');
    return;
  }

  // Converter data de YYYY-MM-DD para formato interno
  const dateKey = dataInput;

  if (!scales[dateKey]) {
    scales[dateKey] = [];
  }

  scales[dateKey].push(membro);

  console.log('✅ Escala adicionada:', membro, 'em', dateKey);

  document.getElementById('agendaForm').reset();
  renderCalendar();

  alert(`✅ Escala de ${membro} adicionada com sucesso em ${dataInput}!`);
}

// ===== ADICIONAR MEMBRO DA EQUIPE =====
function addTeamMember() {
  const nameInput = document.getElementById('teamName');
  const name = nameInput.value.trim();

  if (!name) {
    alert('❌ Digite um nome!');
    return;
  }

  if (teamMembers.includes(name)) {
    alert('❌ Este membro já existe!');
    return;
  }

  teamMembers.push(name);

  // Atualizar lista visual
  const teamList = document.getElementById('teamList');
  const li = document.createElement('li');
  li.innerHTML = `
    ${name}
    <button class="delete-btn" type="button" onclick="deleteMember(this)">❌</button>
  `;
  teamList.appendChild(li);

  console.log('✅ Membro adicionado:', name);

  nameInput.value = '';
  updateTeamSelect();
}

// ===== DELETAR MEMBRO =====
function deleteMember(button) {
  const li = button.parentElement;
  const name = li.textContent.replace('❌', '').trim();

  if (confirm(`Deseja remover ${name}?`)) {
    teamMembers = teamMembers.filter(m => m !== name);
    li.remove();
    console.log('❌ Membro removido:', name);
    updateTeamSelect();
  }
}

// ===== ATUALIZAR SELECT DE MEMBROS =====
function updateTeamSelect() {
  const select = document.getElementById('agendaMembro');
  if (!select) return;

  select.innerHTML = '<option value="">Selecionar Membro...</option>';
  select.innerHTML += '<option value="VAGO">VAGO</option>';

  teamMembers.forEach(member => {
    const option = document.createElement('option');
    option.value = member;
    option.textContent = member;
    select.appendChild(option);
  });
}