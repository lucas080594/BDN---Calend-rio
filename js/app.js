let isAdmin = false;
let currentDate = new Date();
let teamMembers = [];
let schedulesByDate = {};

const monthNames = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
                     "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

function formatDate(d) {
  return d.toISOString().split('T')[0];
}
function toBR(dateStr) {
  const [y,m,day] = dateStr.split('-');
  return `${day}/${m}/${y}`;
}

document.getElementById('btn-open-login').onclick = () =>
  document.getElementById('login-modal').classList.remove('hidden');
document.getElementById('btn-close-login').onclick = () =>
  document.getElementById('login-modal').classList.add('hidden');

document.getElementById('btn-login').onclick = () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById('login-modal').classList.add('hidden');
      document.getElementById('login-error').classList.add('hidden');
    })
    .catch(err => {
      const el = document.getElementById('login-error');
      el.textContent = 'Erro: ' + err.message;
      el.classList.remove('hidden');
    });
};

document.getElementById('btn-logout').onclick = () => auth.signOut();

auth.onAuthStateChanged(user => {
  isAdmin = !!user;
  document.getElementById('btn-open-login').classList.toggle('hidden', isAdmin);
  document.getElementById('admin-info').classList.toggle('hidden', !isAdmin);
  document.getElementById('team-form').classList.toggle('hidden', !isAdmin);
  if (user) document.getElementById('admin-email').textContent = user.email;
  renderTeam();
  renderCalendar();
});

function loadTeam() {
  db.collection('team').orderBy('name').onSnapshot(snap => {
    teamMembers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTeam();
    populateAssignSelect();
  });
}

function renderTeam() {
  const list = document.getElementById('team-list');
  list.innerHTML = '';
  teamMembers.forEach(m => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${m.name}</strong> — ${m.role || ''}`;
    if (isAdmin) {
      const btnDel = document.createElement('button');
      btnDel.textContent = '🗑️';
      btnDel.className = 'btn-icon';
      btnDel.onclick = () => {
        if (confirm(`Remover ${m.name} da equipe?`)) {
          db.collection('team').doc(m.id).delete();
        }
      };
      li.appendChild(btnDel);
    }
    list.appendChild(li);
  });
}

document.getElementById('btn-add-member').onclick = () => {
  const name = document.getElementById('member-name').value.trim();
  const role = document.getElementById('member-role').value.trim();
  if (!name) return alert('Informe o nome do membro.');
  db.collection('team').add({ name, role }).then(() => {
    document.getElementById('member-name').value = '';
    document.getElementById('member-role').value = '';
  });
};

function loadSchedules() {
  db.collection('schedules').onSnapshot(snap => {
    schedulesByDate = {};
    snap.docs.forEach(doc => schedulesByDate[doc.id] = doc.data());
    renderCalendar();
    renderUpcoming();
  });
}

document.getElementById('prev-month').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
};
document.getElementById('next-month').onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
};

function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById('calendar-title').textContent = `${monthNames[month]} ${year}`;

  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  ['D','S','T','Q','Q','S','S'].forEach(d => {
    const el = document.createElement('div');
    el.className = 'weekday';
    el.textContent = d;
    grid.appendChild(el);
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement('div'));

  for (let day = 1; day <= daysInMonth; day++) {
    const dateObj = new Date(year, month, day);
    const dateStr = formatDate(dateObj);
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    const schedule = schedulesByDate[dateStr];
    cell.innerHTML = `<span class="day-number">${day}</span>`;
    if (schedule) {
      cell.classList.add('has-schedule');
      cell.innerHTML += `<span class="day-member">${schedule.memberName}</span>`;
    }

    if (isAdmin) {
      cell.classList.add('clickable');
      cell.onclick = () => openAssignModal(dateStr, schedule);
    }
    grid.appendChild(cell);
  }
}

function populateAssignSelect() {
  const select = document.getElementById('assign-member-select');
  select.innerHTML = '<option value="">-- Selecione --</option>';
  teamMembers.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    select.appendChild(opt);
  });
}

let editingDate = null;

function openAssignModal(dateStr, schedule) {
  editingDate = dateStr;
  document.getElementById('assign-date-title').textContent = `Escala de ${toBR(dateStr)}`;
  document.getElementById('assign-member-select').value = schedule?.memberId || '';
  document.getElementById('assign-note').value = schedule?.note || '';
  document.getElementById('assign-modal').classList.remove('hidden');
}

document.getElementById('btn-close-assign').onclick = () =>
  document.getElementById('assign-modal').classList.add('hidden');

document.getElementById('btn-save-assign').onclick = () => {
  const memberId = document.getElementById('assign-member-select').value;
  const note = document.getElementById('assign-note').value.trim();
  if (!memberId) return alert('Selecione um membro da equipe.');
  const member = teamMembers.find(m => m.id === memberId);

  db.collection('schedules').doc(editingDate).set({
    memberId,
    memberName: member.name,
    note
  }).then(() => document.getElementById('assign-modal').classList.add('hidden'));
};

document.getElementById('btn-remove-assign').onclick = () => {
  db.collection('schedules').doc(editingDate).delete()
    .then(() => document.getElementById('assign-modal').classList.add('hidden'));
};

function renderUpcoming() {
  const list = document.getElementById('upcoming-list');
  list.innerHTML = '';

  const today = formatDate(new Date());
  const upcoming = Object.entries(schedulesByDate)
    .filter(([date]) => date >= today)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(0, 5);

  if (upcoming.length === 0) {
    list.innerHTML = '<li>Nenhuma escala futura cadastrada.</li>';
    return;
  }

  upcoming.forEach(([date, data]) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${toBR(date)}</strong> — ${data.memberName}${data.note ? ` (${data.note})` : ''}`;
    list.appendChild(li);
  });
}

loadTeam();
loadSchedules();