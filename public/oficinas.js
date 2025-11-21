// ========== ELEMENTOS DO DOM ==========
const workshopsContainer = document.getElementById('workshops-container');
const filterButtons = document.querySelectorAll('.filter-btn');
const inscricaoModal = document.getElementById('inscricao-modal');
const loginModal = document.getElementById('login-modal');
const inscreverBtn = document.getElementById('inscrever-btn');
const closeButtons = document.querySelectorAll('.close');
const closeModalButtons = document.querySelectorAll('.close-modal');

let currentFilter = 'todos';
let selectedWorkshop = null;
let workshops = [];

// ========== CARREGAR OFICINAS DA API ==========
async function loadWorkshops() {
  try {
    const response = await fetch(`/oficinas`);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao carregar oficinas');
    }

    // Mapear dados da API para formato esperado
    workshops = data.map(oficina => ({
      id: oficina.id.toString(),
      title: oficina.titulo,
      description: oficina.descricao,
      instructor: oficina.instrutor,
      level: oficina.categoria ? oficina.categoria.toLowerCase() : 'basico',
      category: oficina.categoria || 'Geral',
      duration: calcularDuracao(oficina.data_inicio, oficina.data_fim),
      schedule: formatarHorario(oficina.data_inicio),
      maxParticipants: oficina.vagas,
      currentParticipants: 0
    }));

    renderWorkshops();
  } catch (error) {
    console.error('Erro ao carregar oficinas:', error);
    workshopsContainer.innerHTML = '<p class="empty-message">Erro ao carregar oficinas. Tente novamente mais tarde.</p>';
  }
}

// ========== FUNÇÕES AUXILIARES ==========
function calcularDuracao(inicio, fim) {
  if (!fim) return '1 sessão';
  const dataInicio = new Date(inicio);
  const dataFim = new Date(fim);
  const dias = Math.ceil((dataFim - dataInicio) / (1000 * 60 * 60 * 24));
  if (dias < 7) return `${dias} dias`;
  const semanas = Math.ceil(dias / 7);
  return `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
}

function formatarHorario(dataHora) {
  const data = new Date(dataHora);
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const dia = diasSemana[data.getDay()];
  const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `${dia}, ${hora}`;
}

// ========== RENDERIZAR OFICINAS ==========
function renderWorkshops(filter = 'todos') {
  workshopsContainer.innerHTML = '';

  const filteredWorkshops = filter === 'todos' 
    ? workshops 
    : workshops.filter(w => w.level === filter || w.category.toLowerCase() === filter);

  if (filteredWorkshops.length === 0) {
    workshopsContainer.innerHTML = '<p class="empty-message">Nenhuma oficina encontrada para este filtro.</p>';
    return;
  }

  filteredWorkshops.forEach(workshop => {
    const card = createWorkshopCard(workshop);
    workshopsContainer.appendChild(card);
  });
}

// ========== CRIAR CARD DE OFICINA ==========
function createWorkshopCard(workshop) {
  const card = document.createElement('div');
  card.className = 'workshop-card';
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', `Oficina: ${workshop.title}`);

  const spotsAvailable = workshop.maxParticipants - workshop.currentParticipants;
  const spotsText = spotsAvailable > 0 
    ? `${spotsAvailable} vagas disponíveis` 
    : 'Sem vagas disponíveis';

  card.innerHTML = `
    <div class="workshop-image">📚</div>
    <div class="workshop-content">
      <span class="workshop-level level-${workshop.level}">${workshop.category}</span>
      <h3 class="workshop-title">${workshop.title}</h3>
      <p class="workshop-description">${workshop.description}</p>
      <div class="workshop-meta">
        <span>👨‍🏫 Instrutor: <strong class="workshop-instructor">${workshop.instructor}</strong></span>
        <span>⏱️ Duração: ${workshop.duration}</span>
        <span>📅 ${workshop.schedule}</span>
        <span>👥 ${spotsText}</span>
      </div>
      <div class="workshop-actions">
        <button class="btn btn-primary view-details-btn" data-id="${workshop.id}">Ver Detalhes</button>
        <button class="btn btn-secondary enroll-btn" data-id="${workshop.id}" ${spotsAvailable === 0 ? 'disabled' : ''}>
          ${spotsAvailable === 0 ? 'Sem Vagas' : 'Inscrever-se'}
        </button>
      </div>
    </div>
  `;

  return card;
}

// ========== FILTROS ==========
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    renderWorkshops(currentFilter);
  });
});

// ========== ABRIR MODAL DE DETALHES ==========
function openDetailsModal(workshopId) {
  selectedWorkshop = workshops.find(w => w.id === workshopId);

  if (!selectedWorkshop) return;

  const spotsAvailable = selectedWorkshop.maxParticipants - selectedWorkshop.currentParticipants;

  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <div class="workshop-details">
      <p><strong>Categoria:</strong> ${selectedWorkshop.category}</p>
      <p><strong>Descrição:</strong> ${selectedWorkshop.description}</p>
      <p><strong>Instrutor:</strong> ${selectedWorkshop.instructor}</p>
      <p><strong>Duração:</strong> ${selectedWorkshop.duration}</p>
      <p><strong>Horário:</strong> ${selectedWorkshop.schedule}</p>
      <p><strong>Vagas disponíveis:</strong> ${spotsAvailable} de ${selectedWorkshop.maxParticipants}</p>
    </div>
  `;

  inscricaoModal.style.display = 'flex';
  inscreverBtn.disabled = spotsAvailable === 0;
  inscreverBtn.textContent = spotsAvailable === 0 ? 'Sem Vagas Disponíveis' : 'Inscrever-se';
}

// ========== INSCREVER-SE ==========
async function enrollWorkshop() {
  if (!selectedWorkshop) return;

  const usuario = JSON.parse(localStorage.getItem('tedi_user'));

  if (!usuario) {
    inscricaoModal.style.display = 'none';
    loginModal.style.display = 'flex';
    return;
  }

  try {
    const response = await fetch(`/inscricoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario_id: usuario.id,
        oficina_id: parseInt(selectedWorkshop.id)
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao realizar inscrição');
    }

    alert('Você foi inscrito com sucesso nesta oficina!');
    inscricaoModal.style.display = 'none';
    loadWorkshops();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
}

// ========== FECHAR MODAIS ==========
function closeModal(modal) {
  modal.style.display = 'none';
}

closeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) closeModal(modal);
  });
});

closeModalButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) closeModal(modal);
  });
});

// ========== FECHAR MODAL AO CLICAR FORA ==========
window.addEventListener('click', (e) => {
  if (e.target === inscricaoModal) {
    closeModal(inscricaoModal);
  }
  if (e.target === loginModal) {
    closeModal(loginModal);
  }
});

// ========== BOTÃO INSCREVER-SE ==========
inscreverBtn.addEventListener('click', enrollWorkshop);

// ========== DELEGAÇÃO DE EVENTOS PARA BOTÕES ==========
workshopsContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('view-details-btn')) {
    const workshopId = e.target.getAttribute('data-id');
    openDetailsModal(workshopId);
  }

  if (e.target.classList.contains('enroll-btn')) {
    const workshopId = e.target.getAttribute('data-id');
    selectedWorkshop = workshops.find(w => w.id === workshopId);
    enrollWorkshop();
  }
});

// ========== FORMULÁRIO DE LOGIN NO MODAL ==========
const loginInscricaoForm = document.getElementById('login-inscricao-form');
if (loginInscricaoForm) {
  loginInscricaoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email-modal').value;
    const senha = document.getElementById('login-senha-modal').value;

    try {
      const response = await fetch(`/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || 'Erro ao fazer login');
      }

      localStorage.setItem('tedi_user', JSON.stringify(data.usuario));
      alert('Login realizado com sucesso!');
      loginModal.style.display = 'none';
      updateNavbar();
      loginInscricaoForm.reset();

      // Inscrever na oficina após login
      if (selectedWorkshop) {
        await enrollWorkshop();
      }
    } catch (error) {
      alert('Erro: ' + error.message);
    }
  });
}

// ========== ATUALIZAR NAVBAR ==========
function updateNavbar() {
  const navUserLink = document.getElementById('nav-user-link');
  const navLogoutBtn = document.getElementById('nav-logout-btn');
  const navLoginLink = document.getElementById('nav-login-link');

  const usuario = localStorage.getItem('tedi_user');

  if (usuario) {
    if (navUserLink) {
      navUserLink.style.display = 'block';
      navUserLink.href = 'minha-conta.html';
    }
    if (navLogoutBtn) navLogoutBtn.style.display = 'block';
    if (navLoginLink) navLoginLink.style.display = 'none';
  } else {
    if (navUserLink) navUserLink.style.display = 'none';
    if (navLogoutBtn) navLogoutBtn.style.display = 'none';
    if (navLoginLink) navLoginLink.style.display = 'block';
  }
}

// ========== LOGOUT ==========
const navLogoutBtn = document.getElementById('nav-logout-btn');
if (navLogoutBtn) {
  navLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('tedi_user');
    updateNavbar();
    window.location.href = 'index.html';
  });
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  loadWorkshops();
});
