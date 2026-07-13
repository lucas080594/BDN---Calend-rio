// ===== VARIÁVEIS GLOBAIS =====
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let popupMonth = new Date().getMonth();
let popupYear = new Date().getFullYear();
let selectedDate = null;
let scales = {};
let teamMembers = ['Lucas', 'Vitor', 'Cauan', 'Carlinhos', 'Clovis'];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  renderCalendar();
  updateTeamSelect();
  initDatePicker();
  
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

// ===== INICIALIZAR DATE PICKER =====
function initDatePicker() {
  const agendaDataInput = document.getElementById('agendaData');
  const calendarPopup = document.getElementById('calendarPopup');

  agendaDataInput.addEventListener('click', () => {
    calendarPopup.classList.toggle('active');
    if (calendarPopup.classList.contains('active')) {
      renderDatePickerCalendar();
    }
  });

  document.getElementById('prevMonthPopup').addEventListener('click', (e) => {
    e.preventDefault();
    popupMonth--;
    if (popupMonth < 0) {
      popupMonth = 11;
      popupYear--;
    }
    renderDatePickerCalendar();
  });

  document.getElementById('nextMonthPopup').addEventListener('click', (e) => {
    e.preventDefault();
    popupMonth++;
    if (popupMonth > 11) {
      popupMonth = 0;
      popupYear++;
    }
    renderDatePickerCalendar();
  });

  // Fechar ao clicar fora
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.date-picker-wrapper')) {
      calendarPopup.classList.remove('active');
    }
  });
}

// ===== RENDERIZAR CALENDÁRIO DO DATE PICKER =====
function renderDatePickerCalendar() {
  const firstDay = new Date(popupYear, popupMonth, 1).getDay();
  const daysInMonth = new Date(popupYear, popupMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(popupYear, popupMonth, 0).getDate();

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  document.getElementById('monthYearPopup').textContent = 
    `${monthNames[popupMonth]} ${popupYear}`;

  const calendarDays = document.getElementById('calendarDaysPopup');
  calendarDays.innerHTML = '';

  // Dias do mês anterior
  for (let i = firstDay - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const dayElement = createDatePickerDay(day, true);
    calendarDays.appendChild(dayElement);
  }

  // Dias do mês atual
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = createDatePickerDay(day, false);
    calendarDays.appendChild(dayElement);
  }

  // Dias do próximo mês
  const totalCells = calendarDays.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day++) {
    const dayElement = createDatePickerDay(day, true);
    calendarDays.appendChild(dayElement);
  }
}

// ===== CRIAR ELEMENTO DO DIA (DATE PICKER) =====
function createDatePickerDay(day, isOtherMonth) {
  const dayElement = document.createElement('div');
  dayElement.className = `calendar-day-popup ${isOtherMonth ? 'other-month' : ''}`;
  dayElement.textContent = day;

  // Marcar hoje
  const today = new Date();
  if (!isOtherMonth && 
      day === today.getDate() && 
      popupMonth === today.getMonth() && 
      popupYear === today.getFullYear()) {
    dayElement.classList.add('today');
  }

  // Marcar data selecionada
  if (selectedDate) {
    const [selDay, selMonth, selYear] = selectedDate.split('/').map(Number);
    if (day === selDay && popupMonth === selMonth - 1 && popupYear === selYear) {
      dayElement.classList.add('selected');
    }
  }

  if (!isOtherMonth) {
    dayElement.addEventListener('click', () => {
      selectedDate = `${String(day).padStart(2, '0')}/${String(popupMonth + 1).padStart(2, '0')}/${popupYear}`;
      document.getElementById('agendaData').value = selectedDate;
      document.getElementById('calendarPopup').classList.remove('active');
      renderDatePickerCalendar(); // Atualizar seleção visual
    });
  }

  return dayElement;
}

// ===== RENDERIZAR CALENDÁRIO PRINCIPAL =====
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

// ===== CRIAR ELEMENTO DO DIA (CALENDÁRIO PRINCIPAL) =====
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

  const dataInput = document.getElementById('agendaData').value;
  const tipo = document.getElementById('agendaTipo').value;
  const membro = document.getElementById('agendaMembro').value;

  if (!dataInput || !tipo || !membro) {
    alert('Preencha todos os campos!');
    return;
  }

  // Converter data de YYYY-MM-DD para formato interno
  const dateKey = dataInput; // Já está em YYYY-MM-DD

  if (!scales[dateKey]) {
    scales[dateKey] = [];
  }

  scales[dateKey].push(membro);

  document.getElementById('agendaForm').reset();
  renderCalendar();

  alert('✅ Escala adicionada com sucesso!');
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