// ===== VARIÁVEIS GLOBAIS =====
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let scales = {};
let teamMembers = ['Lucas', 'Vitor', 'Cauan', 'Carlinhos', 'Clovis'];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  renderCalendar();
  updateTeamSelect();
  
  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });

  document.getElementById('agendaForm').addEventListener('submit', addScale);
});

// ===== RENDERIZAR CALENDÁRIO =====
function renderCalendar() {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
  
  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  document.getElementById('monthYear').textContent = `${monthNames[currentMonth]} de ${currentYear}`;

  const calendarGrid = document.getElementById('calendarGrid');
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

  // Simular escalas para exemplo
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

  const data = document.getElementById('agendaData').value;
  const tipo = document.getElementById('agendaTipo').value;
  const membro = document.getElementById('agendaMembro').value;

  if (!data || !tipo || !membro) {
    alert('Preencha todos os campos!');
    return;
  }

  if (!scales[data]) {
    scales[data] = [];
  }

  scales[data].push(membro);

  document.getElementById('agendaForm').reset();
  renderCalendar();

  alert('Escala adicionada com sucesso!');
}

// ===== ADICIONAR MEMBRO DA EQUIPE =====
function addTeamMember() {
  const name = document.getElementById('teamName').value.trim();

  if (!name) {
    alert('Digite um nome!');
    return;
  }

  if (teamMembers.includes(name)) {
    alert('Este membro já existe!');
    return;
  }

  teamMembers.push(name);

  const teamList = document.getElementById('teamList');
  const li = document.createElement('li');
  li.innerHTML = `
    ${name}
    <button class="delete-btn" onclick="deleteMember(this)">❌</button>
  `;
  teamList.appendChild(li);

  document.getElementById('teamName').value = '';
  updateTeamSelect();
}

// ===== DELETAR MEMBRO =====
function deleteMember(button) {
  const li = button.parentElement;
  const name = li.textContent.replace('❌', '').trim();

  teamMembers = teamMembers.filter(m => m !== name);
  li.remove();

  updateTeamSelect();
}

// ===== ATUALIZAR SELECT DE MEMBROS =====
function updateTeamSelect() {
  const select = document.getElementById('agendaMembro');
  select.innerHTML = '<option value="">Selecionar Membro...</option>';

  teamMembers.forEach(member => {
    const option = document.createElement('option');
    option.value = member;
    option.textContent = member;
    select.appendChild(option);
  });
}