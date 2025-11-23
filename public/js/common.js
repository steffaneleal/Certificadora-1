const AppState = {
  currentUser: null,
  isAdmin: false,
  workshops: [],
  enrollments: [],
  volunteers: [],
  users: [],
};

function initializeApp() {
  // Carregar dados do localStorage
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
    AppState.isAdmin = AppState.currentUser.role === "admin";
  }

  // Tentar carregar oficinas do servidor, com fallback para localStorage/default
  fetch("/oficinas")
    .then((res) => {
      if (!res.ok) throw new Error("no-data");
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        AppState.workshops = data.map((w) => {
          const rawLevel = (w.nivel || w.level || "basic" || "")
            .toString()
            .toLowerCase();
          let normalizedLevel = "basic";
          if (/^(basico|básico|basic)$/i.test(rawLevel))
            normalizedLevel = "basic";
          else if (
            /^(intermediario|intermediário|intermediate)$/i.test(rawLevel)
          )
            normalizedLevel = "intermediate";
          else if (/^(avancado|avançado|advanced)$/i.test(rawLevel))
            normalizedLevel = "advanced";

          return {
            id: w.id,
            title: w.titulo || w.title || w.titulo,
            description: w.descricao || w.description || w.descricao,
            level: normalizedLevel,
            instructor: w.instrutor || w.instructor || w.instrutor,
            category: w.categoria || w.category || w.categoria,
            duration: w.duracao || w.duration || w.duration,
            date: w.data_inicio || w.date || w.data_inicio,
            maxParticipants: w.vagas || w.maxParticipants || null,
            createdAt:
              w.createdAt || w.data_criacao || new Date().toISOString(),
          };
        });
        localStorage.setItem("workshops", JSON.stringify(AppState.workshops));
      } else {
        if (!localStorage.getItem("workshops")) initializeDefaultData();
        loadDataFromStorage();
      }
    })
    .catch(() => {
      if (!localStorage.getItem("workshops")) initializeDefaultData();
      loadDataFromStorage();
    })
    .finally(() => {
      const finish = () => {
        try {
          document.dispatchEvent(new Event("app-ready"));
        } catch (e) {}
      };

      if (AppState.currentUser && AppState.currentUser.id) {
        fetch(`/inscricoes/usuario/${AppState.currentUser.id}`)
          .then((r) => {
            if (!r.ok) throw new Error("no-inscricoes");
            return r.json();
          })
          .then((inscricoes) => {
            if (Array.isArray(inscricoes)) {
              AppState.enrollments = inscricoes.map((i) => ({
                id: i.id || i.inscricaoId || null,
                userId: i.usuario_id || i.userId || AppState.currentUser.id,
                workshopId: i.oficina_id || i.oficinaId || i.workshopId || null,
                enrolledAt:
                  i.data_inscricao || i.enrolledAt || new Date().toISOString(),
              }));
              localStorage.setItem(
                "enrollments",
                JSON.stringify(AppState.enrollments)
              );
            }
          })
          .catch(() => {
            loadDataFromStorage();
          })
          .finally(finish);
      } else {
        finish();
      }
    });
}

// Autenticação
function openLoginModal() {
  const modal = document.getElementById("login-modal");
  if (modal) {
    modal.classList.add("active");
  }
}

function openSignupModal() {
  const modal = document.getElementById("signup-modal");
  if (modal) {
    modal.classList.add("active");
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha: password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showAlert(body.erro || "Email ou senha inválidos!", "error");
      return;
    }

    const data = await res.json().catch(() => ({}));
    AppState.currentUser = data.usuario || data.user || data;
    if (AppState.currentUser) {
      AppState.currentUser.role =
        AppState.currentUser.tipo || AppState.currentUser.role || "user";
      AppState.isAdmin =
        AppState.currentUser.role === "admin" ||
        AppState.currentUser.role === "administrador";
      localStorage.setItem("currentUser", JSON.stringify(AppState.currentUser));
    }

    const modal = document.getElementById("login-modal");
    if (modal) modal.classList.remove("active");
    document.getElementById("login-form").reset();
    updateUI();
    showAlert("Login realizado com sucesso!", "success");
    setTimeout(() => window.location.reload(), 400);
  } catch (err) {
    console.error(err);
    showAlert("Erro ao processar login", "error");
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const nome = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const senha = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;

  if (senha !== confirmPassword) {
    showAlert("As senhas não correspondem!", "error");
    return;
  }

  try {
    const res = await fetch("/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!res.ok) {
      let body = {};
      try {
        body = await res.json();
      } catch (e) {
        try {
          const txt = await res.text();
          body = { erro: txt };
        } catch (ee) {
          body = { erro: `Erro (status ${res.status})` };
        }
      }

      console.error("Signup error", res.status, body);
      showAlert(
        body.erro || `Erro ao cadastrar (status ${res.status})`,
        "error"
      );
      return;
    }

    const loginRes = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    if (loginRes.ok) {
      const data = await loginRes.json().catch(() => ({}));
      AppState.currentUser = data.usuario || data.user || data;
      if (AppState.currentUser) {
        AppState.currentUser.role =
          AppState.currentUser.tipo || AppState.currentUser.role || "user";
        AppState.isAdmin =
          AppState.currentUser.role === "admin" ||
          AppState.currentUser.role === "administrador";
        localStorage.setItem(
          "currentUser",
          JSON.stringify(AppState.currentUser)
        );
      }
    }

    const modal = document.getElementById("signup-modal");
    if (modal) modal.classList.remove("active");
    document.getElementById("signup-form").reset();
    updateUI();
    showAlert("Cadastro realizado com sucesso!", "success");
    setTimeout(() => window.location.reload(), 400);
  } catch (err) {
    console.error(err);
    showAlert("Erro ao cadastrar usuário", "error");
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;

  if (email === "admin@tedi.com" && password === "admin123") {
    const adminUser = {
      id: 0,
      name: "Administrador",
      email: "admin@tedi.com",
      role: "admin",
      createdAt: new Date().toISOString(),
    };

    AppState.currentUser = adminUser;
    AppState.isAdmin = true;
    localStorage.setItem("currentUser", JSON.stringify(adminUser));

    const modal = document.getElementById("admin-login-modal");
    if (modal) {
      modal.classList.remove("active");
    }

    document.getElementById("admin-login-form").reset();
    updateUI();
    showAlert("Login administrativo realizado com sucesso!", "success");
    window.location.href = "index.html#admin";
  } else {
    showAlert("Email ou senha de administrador inválidos!", "error");
  }
}

function logout() {
  AppState.currentUser = null;
  AppState.isAdmin = false;
  localStorage.removeItem("currentUser");
  updateUI();
  showAlert("Logout realizado com sucesso!", "success");
  window.location.href = "index.html";
}

// Navegação simples (apenas para home/admin no index.html)
function navigateTo(page) {
  const isIndexPage =
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/");

  if (!isIndexPage) return;

  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.add("hidden");
  });

  const pageEl = document.querySelector(`[data-page="${page}"]`);
  if (pageEl) {
    pageEl.classList.remove("hidden");
  }

  if (page === "admin" && typeof initAdminPanel === "function") {
    setTimeout(() => {
      initAdminPanel();
    }, 100);
  }

  window.scrollTo(0, 0);
}

// ============================================
// Utilitários
// ============================================

function updateUI() {
  const authSection = document.getElementById("auth-section");
  const userSection = document.getElementById("user-section");
  const adminSection = document.getElementById("admin-section");

  if (AppState.currentUser) {
    if (authSection) authSection.classList.add("hidden");
    if (userSection) {
      userSection.classList.remove("hidden");
      const userNameEl = document.getElementById("user-name");
      if (userNameEl) {
        userNameEl.textContent =
          AppState.currentUser.name ||
          AppState.currentUser.nome ||
          AppState.currentUser.nome_completo ||
          "Usuário";
      }
    }

    if (AppState.isAdmin && adminSection) {
      adminSection.classList.remove("hidden");
    }
  } else {
    if (authSection) authSection.classList.remove("hidden");
    if (userSection) userSection.classList.add("hidden");
    if (adminSection) adminSection.classList.add("hidden");
  }
}

function loadDataFromStorage() {
  const workshops = localStorage.getItem("workshops");
  const enrollments = localStorage.getItem("enrollments");
  const volunteers = localStorage.getItem("volunteers");
  const users = localStorage.getItem("users");

  if (workshops) AppState.workshops = JSON.parse(workshops);
  if (enrollments) AppState.enrollments = JSON.parse(enrollments);
  if (volunteers) AppState.volunteers = JSON.parse(volunteers);
  if (users) AppState.users = JSON.parse(users);
}

function initializeDefaultData() {
  // Minimal initializer: no hard-coded workshops (they come from DB)
  const defaultUsers = [
    {
      id: 1,
      name: "João da Silva",
      email: "joao@example.com",
      password: "senha123",
      role: "user",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@example.com",
      password: "senha123",
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ];

  AppState.workshops = []; // no hardcoded workshops
  AppState.users = defaultUsers;

  localStorage.setItem("workshops", JSON.stringify(AppState.workshops));
  localStorage.setItem("users", JSON.stringify(defaultUsers));
  localStorage.setItem("enrollments", JSON.stringify([]));
  localStorage.setItem("volunteers", JSON.stringify([]));
}

function showAlert(message, type = "info") {
  const alertDiv = document.createElement("div");
  alertDiv.className = `alert alert-${type}`;
  alertDiv.innerHTML = `
    <span>${message}</span>
  `;

  const container = document.querySelector("body");
  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.remove();
  }, 4000);
}

function setupModalListeners() {
  // Fechar modal ao clicar no X
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Fechar modal ao clicar fora
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // Formulários
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  const adminLoginForm = document.getElementById("admin-login-form");
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", handleAdminLogin);
  }
}

function setupEventListeners() {
  // Botão de logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Botão de login
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", openLoginModal);
  }

  // Botão de cadastro
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", openSignupModal);
  }

  // Menu Hambúrguer
  const menuToggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  // Criar overlay se não existir
  let menuOverlay = document.querySelector(".menu-overlay");
  if (!menuOverlay) {
    menuOverlay = document.createElement("div");
    menuOverlay.className = "menu-overlay";
    document.body.appendChild(menuOverlay);
  }

  function toggleMenu() {
    const isActive = navLinks.classList.contains("active");
    navLinks.classList.toggle("active");
    menuOverlay.classList.toggle("active");

    const icon = menuToggle.querySelector("i");
    if (icon) {
      if (!isActive) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    }
  }

  function closeMenu() {
    navLinks.classList.remove("active");
    menuOverlay.classList.remove("active");
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Fechar menu ao clicar no overlay
    menuOverlay.addEventListener("click", closeMenu);

    // Fechar menu ao clicar em um link
    const links = navLinks.querySelectorAll("a");
    links.forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    // Fechar menu ao pressionar ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        closeMenu();
      }
    });
  }

  // Modais
  setupModalListeners();
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
    setupEventListeners();
    updateUI();

    // Só executar navegação se estiver no index.html (apenas para home/admin)
    const isIndexPage =
      window.location.pathname.includes("index.html") ||
      window.location.pathname === "/" ||
      window.location.pathname.endsWith("/");

    if (isIndexPage) {
      // Verificar se há hash na URL para navegação (apenas admin)
      if (window.location.hash) {
        const page = window.location.hash.substring(1);
        if (page === "admin" || page === "home") {
          navigateTo(page);
        }
      } else {
        // Por padrão, mostrar a página home
        navigateTo("home");
      }
    }
  });
} else {
  initializeApp();
  setupEventListeners();
  updateUI();

  // Só executar navegação se estiver no index.html (apenas para home/admin)
  const isIndexPage =
    window.location.pathname.includes("index.html") ||
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("/");

  if (isIndexPage) {
    // Verificar se há hash na URL para navegação (apenas admin)
    if (window.location.hash) {
      const page = window.location.hash.substring(1);
      if (page === "admin" || page === "home") {
        navigateTo(page);
      }
    } else {
      // Por padrão, mostrar a página home
      navigateTo("home");
    }
  }
}
