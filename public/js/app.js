const AppState = {
  currentUser: null,
  isAdmin: false,
  workshops: [],
  enrollments: [],
  volunteers: [],
  users: [],
};

document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  setupEventListeners();
  loadDataFromStorage();
  updateUI();
});

function initializeApp() {
  const savedUser = localStorage.getItem("currentUser");
  if (savedUser) {
    AppState.currentUser = JSON.parse(savedUser);
    AppState.isAdmin = AppState.currentUser.role === "admin";
  }

  fetch("/oficinas")
    .then((res) => {
      if (!res.ok) throw new Error("no-data");
      return res.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
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
      }
      loadDataFromStorage();
    })
    .catch(() => {
      loadDataFromStorage();
    });
}

function setupEventListeners() {
  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-nav");
      navigateTo(page);
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", openLoginModal);
  }

  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", openSignupModal);
  }

  setupModalListeners();
}

function setupModalListeners() {
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      if (modal) {
        modal.classList.remove("active");
      }
    });
  });

  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

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

  const createWorkshopForm = document.getElementById("create-workshop-form");
  if (createWorkshopForm) {
    createWorkshopForm.addEventListener("submit", handleCreateWorkshop);
  }

  const createVolunteerForm = document.getElementById("create-volunteer-form");
  if (createVolunteerForm) {
    createVolunteerForm.addEventListener("submit", handleCreateVolunteer);
  }
}

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

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const user = AppState.users.find(
    (u) => u.email === email && u.password === password
  );

  if (user && user.role !== "admin") {
    AppState.currentUser = user;
    AppState.isAdmin = false;
    localStorage.setItem("currentUser", JSON.stringify(user));

    const modal = document.getElementById("login-modal");
    if (modal) {
      modal.classList.remove("active");
    }

    document.getElementById("login-form").reset();
    updateUI();
    showAlert("Login realizado com sucesso!", "success");
  } else {
    showAlert("Email ou senha inválidos!", "error");
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById("signup-name").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;

  if (password !== confirmPassword) {
    showAlert("As senhas não correspondem!", "error");
    return;
  }

  if (AppState.users.find((u) => u.email === email)) {
    showAlert("Este email já está cadastrado!", "error");
    return;
  }

  const newUser = {
    id: AppState.users.length + 1,
    name,
    email,
    password,
    role: "user",
    createdAt: new Date().toISOString(),
  };

  AppState.users.push(newUser);
  localStorage.setItem("users", JSON.stringify(AppState.users));

  AppState.currentUser = newUser;
  AppState.isAdmin = false;
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  const modal = document.getElementById("signup-modal");
  if (modal) {
    modal.classList.remove("active");
  }

  document.getElementById("signup-form").reset();
  updateUI();
  showAlert("Cadastro realizado com sucesso!", "success");
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
    navigateTo("admin");
    updateUI();
    showAlert("Login administrativo realizado com sucesso!", "success");
  } else {
    showAlert("Email ou senha de administrador inválidos!", "error");
  }
}

function logout() {
  AppState.currentUser = null;
  AppState.isAdmin = false;
  localStorage.removeItem("currentUser");
  updateUI();
  navigateTo("home");
  showAlert("Logout realizado com sucesso!", "success");
}

function navigateTo(page) {
  document.querySelectorAll("[data-page]").forEach((el) => {
    el.classList.add("hidden");
  });

  const pageEl = document.querySelector(`[data-page="${page}"]`);
  if (pageEl) {
    pageEl.classList.remove("hidden");
  }

  document.querySelectorAll("[data-nav]").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-nav") === page) {
      link.classList.add("active");
    }
  });

  loadPageData(page);
  window.scrollTo(0, 0);
}

function loadPageData(page) {
  switch (page) {
    case "oficinas":
      renderWorkshops();
      break;
    case "admin":
      if (AppState.isAdmin) {
        renderAdminPanel();
      } else {
        navigateTo("home");
        showAlert(
          "Acesso negado! Apenas administradores podem acessar esta página.",
          "error"
        );
      }
      break;
  }
}

function renderWorkshops() {
  const container = document.getElementById("workshops-list");
  if (!container) return;

  const level = document.getElementById("filter-level")?.value || "";
  const category = document.getElementById("filter-category")?.value || "";

  let filtered = AppState.workshops;

  if (level) {
    filtered = filtered.filter((w) => w.level === level);
  }

  if (category) {
    filtered = filtered.filter((w) => w.category === category);
  }

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML =
      '<p class="text-center">Nenhuma oficina encontrada.</p>';
    return;
  }

  filtered.forEach((workshop) => {
    const isEnrolled = AppState.enrollments.some(
      (e) =>
        e.userId === AppState.currentUser?.id && e.workshopId === workshop.id
    );

    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <h3>${workshop.title}</h3>
        <span class="badge" style="background-color: var(--primary-light); color: var(--primary-dark); padding: 4px 8px; border-radius: 4px; font-size: 12px;">
          ${
            workshop.level === "basic"
              ? "Básico"
              : workshop.level === "intermediate"
              ? "Intermediário"
              : "Avançado"
          }
        </span>
      </div>
      <div class="card-body">
        <p>${workshop.description}</p>
        <div style="margin-top: 12px; font-size: 14px; color: var(--dark-gray);">
          ${
            workshop.instructor
              ? `<p>👨‍🏫 Instrutor: ${workshop.instructor}</p>`
              : ""
          }
          ${
            workshop.category ? `<p>📚 Categoria: ${workshop.category}</p>` : ""
          }
          ${
            workshop.duration
              ? `<p>⏱️ Duração: ${workshop.duration} minutos</p>`
              : ""
          }
          ${
            workshop.date
              ? `<p>📅 Data: ${new Date(workshop.date).toLocaleDateString(
                  "pt-BR"
                )}</p>`
              : ""
          }
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-secondary" onclick="viewWorkshopDetail(${
          workshop.id
        })">Ver Detalhes</button>
        ${
          AppState.currentUser && !AppState.isAdmin
            ? `
          <button class="btn btn-primary" onclick="enrollWorkshop(${
            workshop.id
          })" ${isEnrolled ? "disabled" : ""}>
            ${isEnrolled ? "Já Inscrito" : "Inscrever-se"}
          </button>
        `
            : ""
        }
      </div>
    `;
    container.appendChild(card);
  });
}

function enrollWorkshop(workshopId) {
  if (!AppState.currentUser) {
    showAlert("Você precisa fazer login para se inscrever!", "error");
    openLoginModal();
    return;
  }

  const enrollment = {
    id: AppState.enrollments.length + 1,
    userId: AppState.currentUser.id,
    workshopId,
    enrolledAt: new Date().toISOString(),
  };

  AppState.enrollments.push(enrollment);
  localStorage.setItem("enrollments", JSON.stringify(AppState.enrollments));

  renderWorkshops();
  showAlert("Inscrição realizada com sucesso!", "success");
}

function viewWorkshopDetail(workshopId) {
  const workshop = AppState.workshops.find((w) => w.id === workshopId);
  if (!workshop) return;

  const modal = document.createElement("div");
  modal.className = "modal active";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${workshop.title}</h2>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <p><strong>Descrição:</strong> ${workshop.description}</p>
        <p><strong>Nível:</strong> ${
          workshop.level === "basic"
            ? "Básico"
            : workshop.level === "intermediate"
            ? "Intermediário"
            : "Avançado"
        }</p>
        ${
          workshop.instructor
            ? `<p><strong>Instrutor:</strong> ${workshop.instructor}</p>`
            : ""
        }
        ${
          workshop.category
            ? `<p><strong>Categoria:</strong> ${workshop.category}</p>`
            : ""
        }
        ${
          workshop.duration
            ? `<p><strong>Duração:</strong> ${workshop.duration} minutos</p>`
            : ""
        }
        ${
          workshop.date
            ? `<p><strong>Data:</strong> ${new Date(
                workshop.date
              ).toLocaleDateString("pt-BR")}</p>`
            : ""
        }
        ${
          workshop.maxParticipants
            ? `<p><strong>Máximo de Participantes:</strong> ${workshop.maxParticipants}</p>`
            : ""
        }
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Fechar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector(".close-btn").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function renderAdminPanel() {
  if (!AppState.isAdmin) return;

  const tabs = document.querySelectorAll("[data-admin-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      const tabName = tab.getAttribute("data-admin-tab");

      document.querySelectorAll("[data-admin-tab]").forEach((t) => {
        t.classList.remove("active");
        t.style.color = "var(--dark-gray)";
        t.style.borderBottom = "none";
      });
      document.querySelectorAll("[data-admin-content]").forEach((c) => {
        c.classList.add("hidden");
      });

      tab.classList.add("active");
      tab.style.color = "var(--primary-color)";
      tab.style.borderBottom = "3px solid var(--primary-color)";
      document
        .querySelector(`[data-admin-content="${tabName}"]`)
        ?.classList.remove("hidden");
    });
  });

  renderEnrollmentsList();
  renderVolunteersList();
}

function renderEnrollmentsList() {
  const container = document.getElementById("enrollments-list");
  if (!container) return;

  container.innerHTML = "";

  if (AppState.enrollments.length === 0) {
    container.innerHTML = "<p>Nenhuma inscrição registrada.</p>";
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const header = table.createTHead();
  const headerRow = header.insertRow();
  ["Usuário", "Oficina", "Data de Inscrição"].forEach((text) => {
    const cell = headerRow.insertCell();
    cell.textContent = text;
    cell.style.padding = "12px";
    cell.style.borderBottom = "2px solid var(--primary-color)";
    cell.style.fontWeight = "bold";
  });

  const body = table.createTBody();
  AppState.enrollments.forEach((enrollment) => {
    const user = AppState.users.find((u) => u.id === enrollment.userId);
    const workshop = AppState.workshops.find(
      (w) => w.id === enrollment.workshopId
    );

    const row = body.insertRow();
    row.style.borderBottom = "1px solid var(--medium-gray)";

    const cells = [
      user?.name || "Desconhecido",
      workshop?.title || "Desconhecida",
      new Date(enrollment.enrolledAt).toLocaleDateString("pt-BR"),
    ];

    cells.forEach((text) => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.style.padding = "12px";
    });
  });

  container.appendChild(table);
}

function renderVolunteersList() {
  const container = document.getElementById("volunteers-list");
  if (!container) return;

  container.innerHTML = "";

  if (AppState.volunteers.length === 0) {
    container.innerHTML = "<p>Nenhum voluntário registrado.</p>";
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";

  const header = table.createTHead();
  const headerRow = header.insertRow();
  ["Nome", "Departamento", "Especialização", "Data de Entrada"].forEach(
    (text) => {
      const cell = headerRow.insertCell();
      cell.textContent = text;
      cell.style.padding = "12px";
      cell.style.borderBottom = "2px solid var(--primary-color)";
      cell.style.fontWeight = "bold";
    }
  );

  const body = table.createTBody();
  AppState.volunteers.forEach((volunteer) => {
    const user = AppState.users.find((u) => u.id === volunteer.userId);

    const row = body.insertRow();
    row.style.borderBottom = "1px solid var(--medium-gray)";

    const cells = [
      user?.name || "Desconhecido",
      volunteer.department || "-",
      volunteer.specialization || "-",
      new Date(volunteer.joinDate).toLocaleDateString("pt-BR"),
    ];

    cells.forEach((text) => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.style.padding = "12px";
    });
  });

  container.appendChild(table);
}

function handleCreateWorkshop(e) {
  e.preventDefault();
  const title = document.getElementById("workshop-title").value;
  const description = document.getElementById("workshop-description").value;
  const level = document.getElementById("workshop-level").value;
  const instructor = document.getElementById("workshop-instructor").value;
  const category = document.getElementById("workshop-category").value;
  const duration = document.getElementById("workshop-duration").value;

  const newWorkshop = {
    id: AppState.workshops.length + 1,
    title,
    description,
    level,
    instructor,
    category,
    duration: duration ? parseInt(duration) : null,
    date: new Date().toISOString(),
    maxParticipants: null,
    materials: null,
    createdAt: new Date().toISOString(),
  };

  AppState.workshops.push(newWorkshop);
  localStorage.setItem("workshops", JSON.stringify(AppState.workshops));

  document.getElementById("create-workshop-form").reset();
  showAlert("Oficina criada com sucesso!", "success");
}

function handleCreateVolunteer(e) {
  e.preventDefault();
  const userId = parseInt(document.getElementById("volunteer-user-id").value);
  const department = document.getElementById("volunteer-department").value;
  const specialization = document.getElementById(
    "volunteer-specialization"
  ).value;

  const user = AppState.users.find((u) => u.id === userId);
  if (!user) {
    showAlert("Usuário não encontrado!", "error");
    return;
  }

  const existingVolunteer = AppState.volunteers.find(
    (v) => v.userId === userId
  );
  if (existingVolunteer) {
    showAlert("Este usuário já está cadastrado como voluntário!", "error");
    return;
  }

  const newVolunteer = {
    id: AppState.volunteers.length + 1,
    userId,
    department,
    specialization,
    joinDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  AppState.volunteers.push(newVolunteer);
  localStorage.setItem("volunteers", JSON.stringify(AppState.volunteers));

  document.getElementById("create-volunteer-form").reset();
  renderVolunteersList();
  showAlert("Voluntário cadastrado com sucesso!", "success");
}

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
        userNameEl.textContent = AppState.currentUser.name;
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
  AppState.workshops = [];
  AppState.users = [];

  localStorage.setItem("workshops", JSON.stringify(AppState.workshops));
  localStorage.setItem("users", JSON.stringify(AppState.users));
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
