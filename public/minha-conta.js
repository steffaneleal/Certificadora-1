// ========== ELEMENTOS DO DOM ==========
const userNameSpan = document.getElementById('user-name');
const userEmailSpan = document.getElementById('user-email');
const userPhoneSpan = document.getElementById('user-phone');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const editProfileForm = document.getElementById('edit-profile-form');
const inscriptionsContainer = document.getElementById('inscriptions-container');
const completedContainer = document.getElementById('completed-container');
const closeButtons = document.querySelectorAll('.close');
const closeModalButtons = document.querySelectorAll('.close-modal');

let currentUser = null;

// ========== VERIFICAR SE ESTÁ LOGADO ==========
function checkLogin() {
  const usuario = localStorage.getItem('tedi_user');
  if (!usuario) {
    alert('Você precisa estar logado para acessar esta página.');
    window.location.href = 'login.html';
    return false;
  }
  currentUser = JSON.parse(usuario);
  return true;
}

// ========== CARREGAR INFORMAÇÕES DO USUÁRIO ==========
async function loadUserInfo() {
  try {
    const response = await fetch(`/usuarios/${currentUser.id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao carregar dados do usuário');
    }

    userNameSpan.textContent = data.nome || 'Não informado';
    userEmailSpan.textContent = data.email || 'Não informado';
    userPhoneSpan.textContent = data.telefone || 'Não informado';
  } catch (error) {
    console.error('Erro ao carregar usuário:', error);
  }
}

// ========== CARREGAR INSCRIÇÕES ==========
async function loadInscriptions() {
  try {
    const response = await fetch(`/inscricoes/usuario/${currentUser.id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao carregar inscrições');
    }

    if (data.length === 0) {
      inscriptionsContainer.innerHTML = '<p class="empty-message">Você ainda não se inscreveu em nenhuma oficina. <a href="oficinas.html">Explorar oficinas</a></p>';
      return;
    }

    inscriptionsContainer.innerHTML = '';

    data.forEach(inscricao => {
      const item = createInscriptionItem(inscricao);
      inscriptionsContainer.appendChild(item);
    });
  } catch (error) {
    console.error('Erro ao carregar inscrições:', error);
    inscriptionsContainer.innerHTML = '<p class="empty-message">Erro ao carregar inscrições.</p>';
  }
}

// ========== CRIAR ITEM DE INSCRIÇÃO ==========
function createInscriptionItem(inscricao) {
  const item = document.createElement('div');
  item.className = 'inscription-item';
  item.setAttribute('role', 'article');

  const dataInicio = new Date(inscricao.data_inicio);
  const horario = dataInicio.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  item.innerHTML = `
    <div class="inscription-info">
      <h3>${inscricao.titulo}</h3>
      <p>Instrutor: ${inscricao.instrutor}</p>
      <p>Horário: ${horario}</p>
      <p><small>Descrição: ${inscricao.descricao.substring(0, 100)}...</small></p>
    </div>
    <div class="inscription-actions">
      <button class="btn btn-danger cancel-btn" data-id="${inscricao.id}">Cancelar Inscrição</button>
    </div>
  `;

  return item;
}

// ========== CARREGAR OFICINAS CONCLUÍDAS ==========
function loadCompleted() {
  // Por enquanto, vazio - pode ser implementado futuramente
  completedContainer.innerHTML = '<p class="empty-message">Você ainda não completou nenhuma oficina.</p>';
}

// ========== DELEGAÇÃO DE EVENTOS PARA INSCRIÇÕES ==========
inscriptionsContainer.addEventListener('click', async (e) => {
  if (e.target.classList.contains('cancel-btn')) {
    const inscricaoId = e.target.getAttribute('data-id');
    
    if (confirm('Tem certeza que deseja cancelar a inscrição?')) {
      try {
        const response = await fetch(`/inscricoes/${inscricaoId}`, {
          method: 'DELETE'
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.erro || 'Erro ao cancelar inscrição');
        }

        alert('Inscrição cancelada com sucesso.');
        loadInscriptions();
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
  }
});

// ========== EDITAR PERFIL ==========
editProfileBtn.addEventListener('click', () => {
  document.getElementById('edit-nome').value = currentUser.nome || '';
  document.getElementById('edit-email').value = currentUser.email || '';
  document.getElementById('edit-telefone').value = '';
  editProfileModal.style.display = 'flex';
});

// ========== ENVIAR FORMULÁRIO DE EDIÇÃO ==========
editProfileForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('edit-nome').value.trim();
  const email = document.getElementById('edit-email').value.trim();
  const telefone = document.getElementById('edit-telefone').value.trim();

  if (!nome || !email) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  try {
    const response = await fetch(`/usuarios/${currentUser.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: nome,
        email: email
        ,telefone: telefone || null
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao atualizar perfil');
    }

    // Atualizar localStorage
    currentUser.nome = nome;
    currentUser.email = email;
    localStorage.setItem('tedi_user', JSON.stringify(currentUser));

    alert('Perfil atualizado com sucesso!');
    editProfileModal.style.display = 'none';
    loadUserInfo();
  } catch (error) {
    alert('Erro: ' + error.message);
  }
});

// ========== FECHAR MODAIS ==========
closeButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) modal.style.display = 'none';
  });
});

closeModalButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal');
    if (modal) modal.style.display = 'none';
  });
});

// ========== FECHAR MODAL AO CLICAR FORA ==========
window.addEventListener('click', (e) => {
  if (e.target === editProfileModal) {
    editProfileModal.style.display = 'none';
  }
});

// ========== LOGOUT ==========
const navLogoutBtn = document.getElementById('nav-logout-btn');
if (navLogoutBtn) {
  navLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('tedi_user');
    window.location.href = 'index.html';
  });
}

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
  if (checkLogin()) {
    loadUserInfo();
    loadInscriptions();
    loadCompleted();
  }
});
