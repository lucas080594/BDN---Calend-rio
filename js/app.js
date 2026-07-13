// ===== FIREBASE CONFIG =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, deleteDoc, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCeArSQ8R9W8japktjIfdigLkWldcqTyF0",
    authDomain: "escala-audio-bola-de-neve.firebaseapp.com",
    projectId: "escala-audio-bola-de-neve",
    storageBucket: "escala-audio-bola-de-neve.firebasestorage.app",
    messagingSenderId: "200217286724",
    appId: "1:200217286724:web:8ab4bef67cf53f2fec0411",
    measurementId: "G-2FMTJVEHVH"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===== VARIÁVEIS GLOBAIS =====
let calendar;
let listaNomesGlobal = [];
let todasEscalas = [];

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  console.log('Página carregada');
  
  // Inicializar FullCalendar
  const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    height: 'auto',
    locale: 'pt-br',
    headerToolbar: { 
      left: 'prev,next', 
      center: 'title', 
      right: 'today' 
    },
    datesSet: () => atualizarEstatisticas(),
    events: []
  });
  calendar.render();

  // Event Listeners
  document.getElementById('agendaForm').addEventListener('submit', addScale);
});

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
  if (!calendar) return;
  
  const viewDate = calendar.getDate();
  const mesAtual = viewDate.getMonth();
  const anoAtual = viewDate.getFullYear();
  
  const contagem = {};
  listaNomesGlobal.forEach(nome => contagem[nome] = 0);

  todasEscalas.forEach(escala => {
    const dataE = new Date(escala.data + "T00:00:00");
    if (dataE.getMonth() === mesAtual && dataE.getFullYear() === anoAtual && escala.responsavel !== "VAGO") {
      contagem[escala.responsavel] = (contagem[escala.responsavel] || 0) + 1;
    }
  });

  const listaStats = document.getElementById('listaStats');
  listaStats.innerHTML = '';
  
  Object.entries(contagem)
    .sort((a, b) => b[1] - a[1])
    .forEach(([nome, qtd]) => {
      listaStats.innerHTML += `
        <div class="stat-card">
          <div class="stat-name">${nome.split(' ')[0]}</div>
          <div class="stat-count">${qtd}</div>
        </div>
      `;
    });
}

// ===== ATUALIZAR PRÓXIMAS ESCALAS =====
function atualizarProximasEscalas() {
  const listaE = document.getElementById('nextScalesList');
  listaE.innerHTML = '';
  const calendarEvents = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  todasEscalas
    .filter(e => new Date(e.data + "T00:00:00") >= hoje)
    .sort((a, b) => new Date(a.data) - new Date(b.data))
    .forEach(data => {
      const isVago = data.responsavel === "VAGO";
      const dataF = new Date(data.data + "T00:00:00").toLocaleDateString('pt-BR');

      listaE.innerHTML += `
        <div class="scale-card ${isVago ? 'vago' : ''}">
          <div class="scale-date">${dataF} - ${data.tipo}</div>
          <div class="scale-name">${data.responsavel}</div>
          <div class="scale-actions">
            <button class="edit-btn" onclick="editarEscala('${data.id}', '${data.responsavel}')">EDIT</button>
            <button class="delete-btn" onclick="removerEscala('${data.id}')">❌</button>
          </div>
        </div>
      `;

      calendarEvents.push({
        title: data.responsavel,
        start: data.data,
        backgroundColor: isVago ? "#ef4444" : "#4a9eff",
        borderColor: 'transparent'
      });
    });

  if (calendar) {
    calendar.removeAllEvents();
    calendar.addEventSource(calendarEvents);
  }
}

// ===== FIREBASE: OUVIR MEMBROS =====
onSnapshot(collection(db, "membros"), (snap) => {
  const listaM = document.getElementById('teamList');
  const selectM = document.getElementById('selectMembros');
  
  listaM.innerHTML = '';
  listaNomesGlobal = [];
  selectM.innerHTML = '<option value="">Selecionar Membro...</option><option value="VAGO">-- VAGO --</option>';

  snap.forEach(d => {
    const m = d.data().nome;
    listaNomesGlobal.push(m);
    
    listaM.innerHTML += `
      <li>
        ${m}
        <button class="delete-btn" onclick="removerMembro('${d.id}')">❌</button>
      </li>
    `;
    
    selectM.innerHTML += `<option value="${m}">${m}</option>`;
  });

  atualizarEstatisticas();
});

// ===== FIREBASE: OUVIR ESCALAS =====
onSnapshot(query(collection(db, "escalas"), orderBy("data", "asc")), (snap) => {
  todasEscalas = [];

  snap.forEach(d => {
    todasEscalas.push({ id: d.id, ...d.data() });
  });

  atualizarProximasEscalas();
  atualizarEstatisticas();
});

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

  addDoc(collection(db, "escalas"), {
    data,
    tipo,
    responsavel: membro
  }).then(() => {
    document.getElementById('agendaForm').reset();
    alert('✅ Escala adicionada com sucesso!');
  }).catch(error => {
    console.error('Erro ao adicionar escala:', error);
    alert('❌ Erro ao adicionar escala!');
  });
}

// ===== ADICIONAR MEMBRO =====
function addTeamMember() {
  const name = document.getElementById('teamName').value.trim();

  if (!name) {
    alert('Digite um nome!');
    return;
  }

  if (listaNomesGlobal.includes(name)) {
    alert('Este membro já existe!');
    return;
  }

  addDoc(collection(db, "membros"), {
    nome: name
  }).then(() => {
    document.getElementById('teamName').value = '';
  }).catch(error => {
    console.error('Erro ao adicionar membro:', error);
    alert('❌ Erro ao adicionar membro!');
  });
}

// ===== REMOVER MEMBRO =====
function removerMembro(id) {
  if (confirm('Tem certeza que deseja remover este membro?')) {
    deleteDoc(doc(db, "membros", id));
  }
}

// ===== REMOVER ESCALA =====
function removerEscala(id) {
  if (confirm('Tem certeza que deseja remover esta escala?')) {
    deleteDoc(doc(db, "escalas", id));
  }
}

// ===== EDITAR ESCALA =====
function editarEscala(id, atual) {
  const modal = document.getElementById('modalEditar');
  const selectEdit = document.getElementById('editSelectMembro');
  
  document.getElementById('editEscalaId').value = id;
  selectEdit.innerHTML = '<option value="VAGO">-- VAGO --</option>';
  
  listaNomesGlobal.forEach(nome => {
    const selected = nome === atual ? 'selected' : '';
    selectEdit.innerHTML += `<option value="${nome}" ${selected}>${nome}</option>`;
  });
  
  modal.classList.remove('modal-hidden');
}

// ===== FECHAR MODAL =====
function fecharModal() {
  document.getElementById('modalEditar').classList.add('modal-hidden');
}

// ===== SALVAR EDIÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
  const btnSalvar = document.getElementById('btnSalvarEdicao');
  if (btnSalvar) {
    btnSalvar.addEventListener('click', async function() {
      const id = document.getElementById('editEscalaId').value;
      const novo = document.getElementById('editSelectMembro').value;
      
      try {
        await updateDoc(doc(db, "escalas", id), { responsavel: novo });
        fecharModal();
        alert('✅ Escala atualizada com sucesso!');
      } catch (error) {
        console.error('Erro ao atualizar:', error);
        alert('❌ Erro ao atualizar escala!');
      }
    });
  }
});

// ===== GLOBAL FUNCTIONS =====
window.addTeamMember = addTeamMember;
window.removerMembro = removerMembro;
window.removerEscala = removerEscala;
window.editarEscala = editarEscala;
window.fecharModal = fecharModal;