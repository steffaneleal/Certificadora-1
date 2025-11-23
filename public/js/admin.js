// PAINEL ADMINISTRATIVO

let adminInitialized = false;

function initAdminPanel() {
  const adminPage = document.querySelector('[data-page="admin"]');
  if (!adminPage || adminPage.classList.contains("hidden")) {
    adminInitialized = false;
    return;
  }

  if (adminInitialized) return;

  if (!AppState.isAdmin) {
    showAlert(
      "Acesso negado! Apenas administradores podem acessar esta página.",
      "error"
    );

    window.location.href = "index.html";
    return;
  }

  adminInitialized = true;
  renderAdminPanel();
}

document.addEventListener("DOMContentLoaded", () => {
  const adminPage = document.querySelector('[data-page="admin"]');
  if (!adminPage) {
    return;
  }

  setTimeout(() => {
    initAdminPanel();
  }, 200);
});

function renderAdminPanel() {
  if (!AppState.isAdmin) return;

  // Renderizar abas
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

  const createWorkshopForm = document.getElementById("create-workshop-form");
  if (createWorkshopForm) {
    createWorkshopForm.addEventListener("submit", handleCreateWorkshop);
  }

  const createVolunteerForm = document.getElementById("create-volunteer-form");
  if (createVolunteerForm) {
    createVolunteerForm.addEventListener("submit", handleCreateVolunteer);
  }
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
  const titulo = document.getElementById("workshop-title").value;
  const descricao = document.getElementById("workshop-description").value;
  const instrutor = document.getElementById("workshop-instructor").value;
  const categoria = document.getElementById("workshop-category").value;
  const vagas =
    parseInt(document.getElementById("workshop-vagas")?.value) || null;
  const data_inicio =
    document.getElementById("workshop-start")?.value ||
    new Date().toISOString();
  const data_fim = document.getElementById("workshop-end")?.value || null;

  const payload = {
    titulo,
    descricao,
    instrutor,
    data_inicio,
    data_fim,
    vagas,
    categoria,
  };

  fetch("/oficinas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showAlert(body.erro || "Erro ao criar oficina", "error");
        return;
      }
      const json = await res.json().catch(() => ({}));

      const newWorkshop = {
        id: json.oficinaId || AppState.workshops.length + 1,
        title: titulo,
        description: descricao,
        instructor: instrutor,
        category: categoria,
        date: data_inicio,
      };
      AppState.workshops.unshift(newWorkshop);
      localStorage.setItem("workshops", JSON.stringify(AppState.workshops));
      document.getElementById("create-workshop-form").reset();
      showAlert("Oficina criada com sucesso!", "success");
      if (window.location.pathname.includes("oficinas.html")) {
        setTimeout(() => window.location.reload(), 800);
      }
    })
    .catch((err) => {
      console.error(err);
      showAlert("Erro ao criar oficina", "error");
    });
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
