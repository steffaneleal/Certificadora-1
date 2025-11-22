// FUNCIONALIDADES COMUNS

// Estado da aplicação
const AppState = {
  currentUser: null,
  isAdmin: false,
  workshops: [],
  enrollments: [],
  volunteers: [],
  users: [],
};

// Inicialização
function initializeApp() {
  // Carregar dados do localStorage
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
    AppState.isAdmin = AppState.currentUser.role === 'admin';
  }

  // Inicializar dados padrão se não existirem
  if (!localStorage.getItem('workshops')) {
    initializeDefaultData();
  }

  loadDataFromStorage();
}


// Autenticação
function openLoginModal() {
  const modal = document.getElementById('login-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function openSignupModal() {
  const modal = document.getElementById('signup-modal');
  if (modal) {
    modal.classList.add('active');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  // Validar credenciais
  const user = AppState.users.find(u => u.email === email && u.password === password);

  if (user && user.role !== 'admin') {
    AppState.currentUser = user;
    AppState.isAdmin = false;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    const modal = document.getElementById('login-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    
    document.getElementById('login-form').reset();
    updateUI();
    showAlert('Login realizado com sucesso!', 'success');
    
    // Recarregar a página para atualizar o estado
    setTimeout(() => window.location.reload(), 500);
  } else {
    showAlert('Email ou senha inválidos!', 'error');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    showAlert('As senhas não correspondem!', 'error');
    return;
  }

  if (AppState.users.find(u => u.email === email)) {
    showAlert('Este email já está cadastrado!', 'error');
    return;
  }

  const newUser = {
    id: AppState.users.length + 1,
    name,
    email,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };

  AppState.users.push(newUser);
  localStorage.setItem('users', JSON.stringify(AppState.users));

  AppState.currentUser = newUser;
  AppState.isAdmin = false;
  localStorage.setItem('currentUser', JSON.stringify(newUser));

  const modal = document.getElementById('signup-modal');
  if (modal) {
    modal.classList.remove('active');
  }

  document.getElementById('signup-form').reset();
  updateUI();
  showAlert('Cadastro realizado com sucesso!', 'success');
  
  // Recarregar a página para atualizar o estado
  setTimeout(() => window.location.reload(), 500);
}

function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  // Credenciais de admin padrão
  if (email === 'admin@tedi.com' && password === 'admin123') {
    const adminUser = {
      id: 0,
      name: 'Administrador',
      email: 'admin@tedi.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };

    AppState.currentUser = adminUser;
    AppState.isAdmin = true;
    localStorage.setItem('currentUser', JSON.stringify(adminUser));

    const modal = document.getElementById('admin-login-modal');
    if (modal) {
      modal.classList.remove('active');
    }

    document.getElementById('admin-login-form').reset();
    updateUI();
    showAlert('Login administrativo realizado com sucesso!', 'success');
    
    // Redirecionar para a página admin
    window.location.href = 'index.html#admin';
  } else {
    showAlert('Email ou senha de administrador inválidos!', 'error');
  }
}

function logout() {
  AppState.currentUser = null;
  AppState.isAdmin = false;
  localStorage.removeItem('currentUser');
  updateUI();
  showAlert('Logout realizado com sucesso!', 'success');
  
  // Redirecionar para home
  window.location.href = 'index.html';
}


// Navegação simples (apenas para home/admin no index.html)
function navigateTo(page) {
  // Só funciona no index.html para navegação entre home e admin
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
  
  if (!isIndexPage) return;

  // Esconder todas as páginas
  document.querySelectorAll('[data-page]').forEach(el => {
    el.classList.add('hidden');
  });

  // Mostrar página solicitada
  const pageEl = document.querySelector(`[data-page="${page}"]`);
  if (pageEl) {
    pageEl.classList.remove('hidden');
  }

  // Se navegou para a página admin, inicializar o painel
  if (page === 'admin' && typeof initAdminPanel === 'function') {
    setTimeout(() => {
      initAdminPanel();
    }, 100);
  }

  // Scroll para o topo
  window.scrollTo(0, 0);
}

// ============================================
// Utilitários
// ============================================

function updateUI() {
  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const adminSection = document.getElementById('admin-section');

  if (AppState.currentUser) {
    if (authSection) authSection.classList.add('hidden');
    if (userSection) {
      userSection.classList.remove('hidden');
      const userNameEl = document.getElementById('user-name');
      if (userNameEl) {
        userNameEl.textContent = AppState.currentUser.name;
      }
    }

    if (AppState.isAdmin && adminSection) {
      adminSection.classList.remove('hidden');
    }
  } else {
    if (authSection) authSection.classList.remove('hidden');
    if (userSection) userSection.classList.add('hidden');
    if (adminSection) adminSection.classList.add('hidden');
  }
}

function loadDataFromStorage() {
  const workshops = localStorage.getItem('workshops');
  const enrollments = localStorage.getItem('enrollments');
  const volunteers = localStorage.getItem('volunteers');
  const users = localStorage.getItem('users');

  if (workshops) AppState.workshops = JSON.parse(workshops);
  if (enrollments) AppState.enrollments = JSON.parse(enrollments);
  if (volunteers) AppState.volunteers = JSON.parse(volunteers);
  if (users) AppState.users = JSON.parse(users);
}

function initializeDefaultData() {
  const defaultWorkshops = [
    {
      id: 1,
      title: 'Introdução ao Computador',
      description: 'Aprenda o básico sobre como usar um computador. Perfeito para iniciantes.',
      level: 'basic',
      instructor: 'João Silva',
      category: 'Computador',
      duration: 60,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 20,
      materials: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Como Usar o Smartphone',
      description: 'Domine as funcionalidades básicas do seu smartphone.',
      level: 'basic',
      instructor: 'Maria Santos',
      category: 'Smartphone',
      duration: 90,
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 25,
      materials: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      title: 'Segurança Digital para Idosos',
      description: 'Aprenda a se proteger contra fraudes e golpes online.',
      level: 'intermediate',
      instructor: 'Carlos Oliveira',
      category: 'Segurança Digital',
      duration: 75,
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 30,
      materials: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      title: 'Internet e Navegadores',
      description: 'Conheça a internet e aprenda a navegar com segurança.',
      level: 'basic',
      instructor: 'Ana Costa',
      category: 'Computador',
      duration: 60,
      date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 20,
      materials: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 5,
      title: 'Redes Sociais Seguras',
      description: 'Aprenda a usar redes sociais de forma segura e responsável.',
      level: 'intermediate',
      instructor: 'Pedro Gomes',
      category: 'Segurança Digital',
      duration: 90,
      date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 25,
      materials: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 6,
      title: 'Evento Solidário - Café com Tecnologia',
      description: 'Encontro informal para conversar sobre tecnologia e tirar dúvidas.',
      level: 'basic',
      instructor: 'Equipe TEDI',
      category: 'Eventos',
      duration: 120,
      date: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      materials: null,
      createdAt: new Date().toISOString(),
    },
  ];

  const defaultUsers = [
    {
      id: 1,
      name: 'João da Silva',
      email: 'joao@example.com',
      password: 'senha123',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: 'Maria Santos',
      email: 'maria@example.com',
      password: 'senha123',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
  ];

  AppState.workshops = defaultWorkshops;
  AppState.users = defaultUsers;

  localStorage.setItem('workshops', JSON.stringify(defaultWorkshops));
  localStorage.setItem('users', JSON.stringify(defaultUsers));
  localStorage.setItem('enrollments', JSON.stringify([]));
  localStorage.setItem('volunteers', JSON.stringify([]));
}

function showAlert(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
  `;

  const container = document.querySelector('body');
  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

function setupModalListeners() {
  // Fechar modal ao clicar no X
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Fechar modal ao clicar fora
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Formulários
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  const adminLoginForm = document.getElementById('admin-login-form');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', handleAdminLogin);
  }
}

function setupEventListeners() {
  // Botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }

  // Botão de login
  const loginBtn = document.getElementById('login-btn');
  if (loginBtn) {
    loginBtn.addEventListener('click', openLoginModal);
  }

  // Botão de cadastro
  const signupBtn = document.getElementById('signup-btn');
  if (signupBtn) {
    signupBtn.addEventListener('click', openSignupModal);
  }

  // Modais
  setupModalListeners();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    updateUI();
    
    // Só executar navegação se estiver no index.html (apenas para home/admin)
    const isIndexPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname === '/' || 
                        window.location.pathname.endsWith('/');
    
    if (isIndexPage) {
      // Verificar se há hash na URL para navegação (apenas admin)
      if (window.location.hash) {
        const page = window.location.hash.substring(1);
        if (page === 'admin' || page === 'home') {
          navigateTo(page);
        }
      } else {
        // Por padrão, mostrar a página home
        navigateTo('home');
      }
    }
  });
} else {
  initializeApp();
  setupEventListeners();
  updateUI();
  
  // Só executar navegação se estiver no index.html (apenas para home/admin)
  const isIndexPage = window.location.pathname.includes('index.html') || 
                      window.location.pathname === '/' || 
                      window.location.pathname.endsWith('/');
  
  if (isIndexPage) {
    // Verificar se há hash na URL para navegação (apenas admin)
    if (window.location.hash) {
      const page = window.location.hash.substring(1);
      if (page === 'admin' || page === 'home') {
        navigateTo(page);
      }
    } else {
      // Por padrão, mostrar a página home
      navigateTo('home');
    }
  }
}

