let currentDate = new Date(2026, 6, 1); // Julho 2026

// Dados de exemplo (depois integraremos com Firebase)
const teamMembers = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Silva'];
const scales = {
    '2026-07-14': 'João Silva',
    '2026-07-21': 'Maria Santos',
    '2026-07-28': 'Pedro Costa',
    '2026-07-07': 'Ana Silva',
    '2026-07-05': 'VAGO'
};

// Renderizar calendário
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Atualizar título
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    document.getElementById('monthYear').textContent = `${monthNames[month]} ${year}`;
    
    // Limpar grid
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const dayDiv = createDayDiv(day, true);
        grid.appendChild(dayDiv);
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDiv = createDayDiv(day, false, year, month);
        grid.appendChild(dayDiv);
    }
    
    // Dias do próximo mês
    const totalCells = grid.children.length;
    const remainingCells = 42 - totalCells; // 6 linhas x 7 dias
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = createDayDiv(day, true);
        grid.appendChild(dayDiv);
    }
}

// Criar div de dia
function createDayDiv(day, isOtherMonth, year, month) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);
    
    // Adicionar escala se existir
    if (!isOtherMonth && year && month !== undefined) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (scales[dateStr]) {
            const content = document.createElement('div');
            content.className = 'day-content';
            
            const scale = scales[dateStr];
            const span = document.createElement('span');
            span.className = scale === 'VAGO' ? 'vago' : 'team-member';
            span.textContent = scale;
            
            content.appendChild(span);
            dayDiv.appendChild(content);
        }
    }
    
    return dayDiv;
}

// Navegação
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Adicionar membro
function addMember() {
    const name = document.getElementById('memberName').value;
    const role = document.getElementById('memberRole').value;
    
    if (!name.trim()) {
        alert('Por favor, insira o nome do membro');
        return;
    }
    
    const li = document.createElement('li');
    li.innerHTML = `
        ${name} (${role})
        <button class="delete-btn" onclick="deleteMember(this)">Remover</button>
    `;
    
    document.getElementById('teamList').appendChild(li);
    document.getElementById('memberName').value = '';
}

// Remover membro
function deleteMember(button) {
    button.parentElement.remove();
}

// Adicionar culto
function addCulto() {
    const date = document.getElementById('cultoDate').value;
    const time = document.getElementById('cultoTime').value;
    const type = document.getElementById('cultoType').value;
    
    if (!date || !time) {
        alert('Por favor, preencha data e horário');
        return;
    }
    
    alert(`Culto adicionado: ${date} às ${time} (${type})`);
    document.getElementById('cultoDate').value = '';
    document.getElementById('cultoTime').value = '';
}

// Renderizar calendário ao carregar
renderCalendar();