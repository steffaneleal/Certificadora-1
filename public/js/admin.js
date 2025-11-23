// PAINEL ADMINISTRATIVO

let adminInitialized = false;

// NOVO: Função para carregar voluntários do servidor
async function loadVolunteersFromDatabase() {
  const container = document.getElementById("volunteers-list");
  if (container) {
    // Mensagem de carregamento
    container.innerHTML =
      "<p style='text-align: center; padding: 20px;'>Carregando voluntários do banco de dados...</p>";
  }

  try {
    const res = await fetch("/voluntarios");
    if (!res.ok) throw new Error("Falha ao carregar voluntários do servidor.");

    // Atualiza o AppState com dados do DB
    AppState.volunteers = await res.json();
    localStorage.setItem("volunteers", JSON.stringify(AppState.volunteers));
  } catch (error) {
    console.error("Erro ao carregar voluntários:", error);
    if (container) {
      container.innerHTML = `<p style='text-align: center; padding: 20px; color: var(--error-color);'>Erro ao carregar voluntários. Verifique o servidor.</p>`;
    }
  }
}

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

  // NOVO: Carrega os voluntários do DB antes de renderizar
  loadVolunteersFromDatabase().then(() => {
    renderAdminPanel();
  });
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

      // Recarregar dados ao trocar de aba
      if (tabName === "enrollments") {
        renderEnrollmentsList();
      } else if (tabName === "volunteers") {
        // NOVO: Garantir que a lista seja recarregada do DB ao trocar de aba
        loadVolunteersFromDatabase().then(() => {
          renderVolunteersList();
        });
      }
    });
  });

  // Renderizar lista inicial
  renderEnrollmentsList();
  renderVolunteersList();

  const createWorkshopForm = document.getElementById("create-workshop-form");
  if (createWorkshopForm) {
    createWorkshopForm.removeEventListener("submit", handleCreateWorkshop);
    createWorkshopForm.addEventListener("submit", handleCreateWorkshop);
  }

  const createVolunteerForm = document.getElementById("create-volunteer-form");
  if (createVolunteerForm) {
    createVolunteerForm.removeEventListener("submit", handleCreateVolunteer);
    createVolunteerForm.addEventListener("submit", handleCreateVolunteer);

    // Adicionar ajuda ao campo ID
    const userIdInput = document.getElementById("volunteer-user-id");
    if (userIdInput && !userIdInput.dataset.helpAdded) {
      userIdInput.dataset.helpAdded = "true";
      const helpText = document.createElement("small");
      helpText.style.display = "block";
      helpText.style.marginTop = "5px";
      helpText.style.color = "var(--dark-gray)";
      helpText.style.fontSize = "13px";
      helpText.innerHTML =
        "💡 <strong>Dica:</strong> Para encontrar o ID de um usuário, você pode verificá-lo no email de cadastro ou consultar diretamente no banco de dados.";
      userIdInput.parentElement.appendChild(helpText);
    }
  }
}

async function renderEnrollmentsList() {
  const container = document.getElementById("enrollments-list");
  if (!container) return;

  container.innerHTML =
    "<p style='text-align: center; padding: 20px;'>Carregando inscrições...</p>";

  try {
    // Buscar todas as inscrições do servidor
    const res = await fetch("/inscricoes");

    if (!res.ok) {
      throw new Error("Erro ao buscar inscrições");
    }

    const inscricoes = await res.json();

    container.innerHTML = "";

    if (!inscricoes || inscricoes.length === 0) {
      container.innerHTML =
        "<p style='text-align: center; padding: 20px; color: var(--dark-gray);'>Nenhuma inscrição registrada no momento.</p>";
      return;
    }

    // Criar tabela
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.borderCollapse = "collapse";
    table.style.marginTop = "10px";

    // Cabeçalho
    const header = table.createTHead();
    const headerRow = header.insertRow();
    ["Usuário", "Email", "Oficina", "Data de Inscrição"].forEach((text) => {
      const cell = headerRow.insertCell();
      cell.textContent = text;
      cell.style.padding = "12px";
      cell.style.borderBottom = "2px solid var(--primary-color)";
      cell.style.fontWeight = "bold";
      cell.style.backgroundColor = "var(--primary-light)";
      cell.style.textAlign = "left";
    });

    // Corpo da tabela
    const body = table.createTBody();
    inscricoes.forEach((inscricao) => {
      const row = body.insertRow();
      row.style.borderBottom = "1px solid var(--medium-gray)";
      row.style.transition = "background-color 0.2s";

      // Efeito hover
      row.addEventListener("mouseenter", () => {
        row.style.backgroundColor = "var(--light-gray)";
      });
      row.addEventListener("mouseleave", () => {
        row.style.backgroundColor = "transparent";
      });

      const cells = [
        inscricao.usuario_nome || "Não informado",
        inscricao.usuario_email || "Não informado",
        inscricao.oficina_titulo || "Não informado",
        new Date(inscricao.data_inscricao).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      ];

      cells.forEach((text, index) => {
        const cell = row.insertCell();
        cell.textContent = text;
        cell.style.padding = "12px";
        cell.style.textAlign = "left";

        // Email em fonte menor
        if (index === 1) {
          cell.style.fontSize = "14px";
          cell.style.color = "var(--dark-gray)";
        }
      });
    });

    container.appendChild(table);

    // Adicionar contagem
    const count = document.createElement("p");
    count.style.marginTop = "15px";
    count.style.fontSize = "14px";
    count.style.color = "var(--dark-gray)";
    count.style.textAlign = "right";
    count.textContent = `Total de inscrições: ${inscricoes.length}`;
    container.appendChild(count);
  } catch (error) {
    console.error("Erro ao carregar inscrições:", error);
    container.innerHTML = `
      <div style="padding: 20px; text-align: center;">
        <p style="color: var(--error-color); margin-bottom: 10px;">
          <i class="fas fa-exclamation-triangle"></i> 
          Erro ao carregar inscrições
        </p>
        <p style="font-size: 14px; color: var(--dark-gray);">
          Por favor, verifique sua conexão e tente novamente.
        </p>
        <button onclick="renderEnrollmentsList()" class="btn btn-primary" style="margin-top: 15px;">
          Tentar Novamente
        </button>
      </div>
    `;
  }
}

function renderVolunteersList() {
  const container = document.getElementById("volunteers-list");
  if (!container) return;

  container.innerHTML = "";

  if (AppState.volunteers.length === 0) {
    container.innerHTML =
      "<p style='text-align: center; padding: 20px; color: var(--dark-gray);'>Nenhum voluntário registrado.</p>";
    return;
  }

  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "10px";

  const header = table.createTHead();
  const headerRow = header.insertRow();
  [
    "ID",
    "Nome",
    "Email",
    "Departamento",
    "Especialização",
    "Data de Entrada",
    "Ações",
  ].forEach((text) => {
    const cell = headerRow.insertCell();
    cell.textContent = text;
    cell.style.padding = "12px";
    cell.style.borderBottom = "2px solid var(--primary-color)";
    cell.style.fontWeight = "bold";
    cell.style.backgroundColor = "var(--primary-light)";
    cell.style.textAlign = "left";
  });

  const body = table.createTBody();
  AppState.volunteers.forEach((volunteer) => {
    const row = body.insertRow();
    row.style.borderBottom = "1px solid var(--medium-gray)";
    row.style.transition = "background-color 0.2s";

    // Efeito hover
    row.addEventListener("mouseenter", () => {
      row.style.backgroundColor = "var(--light-gray)";
    });
    row.addEventListener("mouseleave", () => {
      row.style.backgroundColor = "transparent";
    });

    const cells = [
      volunteer.userId || "N/A",
      volunteer.userName || "Não informado",
      volunteer.userEmail || "Não informado",
      volunteer.department || "Não especificado",
      volunteer.specialization || "Não especificado",
      new Date(volunteer.joinDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    ];

    cells.forEach((text, index) => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.style.padding = "12px";
      cell.style.textAlign = "left";

      // Email em fonte menor
      if (index === 2) {
        cell.style.fontSize = "14px";
        cell.style.color = "var(--dark-gray)";
      }
    });

    // Célula de ações (botão remover)
    const actionCell = row.insertCell();
    actionCell.style.padding = "12px";
    actionCell.style.textAlign = "center";

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remover";
    removeBtn.className = "btn btn-secondary";
    removeBtn.style.padding = "6px 12px";
    removeBtn.style.fontSize = "14px";
    removeBtn.style.backgroundColor = "var(--error-color)";
    removeBtn.style.color = "white";
    removeBtn.onclick = () => removeVolunteer(volunteer.id);

    actionCell.appendChild(removeBtn);
  });

  container.appendChild(table);

  // Adicionar contagem
  const count = document.createElement("p");
  count.style.marginTop = "15px";
  count.style.fontSize = "14px";
  count.style.color = "var(--dark-gray)";
  count.style.textAlign = "right";
  count.textContent = `Total de voluntários: ${AppState.volunteers.length}`;
  container.appendChild(count);
}

// CORRIGIDO: Agora chama a API DELETE para remover do banco de dados
function removeVolunteer(volunteerId) {
  if (!confirm("Deseja realmente remover este voluntário?")) {
    return;
  }

  const volunteer = AppState.volunteers.find((v) => v.id === volunteerId);

  if (!volunteer) {
    showAlert("Voluntário não encontrado!", "error");
    return;
  }

  // 1. Faz a chamada DELETE para o servidor
  fetch(`/voluntarios/${volunteerId}`, {
    method: "DELETE",
  })
    .then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        showAlert(
          errorData.erro || "Erro ao remover voluntário do servidor.",
          "error"
        );
        return;
      }

      // 2. Se a remoção no servidor foi bem-sucedida, atualiza o estado local
      const volunteerIndex = AppState.volunteers.findIndex(
        (v) => v.id === volunteerId
      );

      if (volunteerIndex !== -1) {
        AppState.volunteers.splice(volunteerIndex, 1);
        localStorage.setItem("volunteers", JSON.stringify(AppState.volunteers));
      }

      // 3. Recarrega a lista para garantir a consistência e atualiza a UI
      loadVolunteersFromDatabase().then(() => {
        renderVolunteersList();
        showAlert(
          `Voluntário ${volunteer.userName || "removido"} com sucesso!`,
          "success"
        );
      });
    })
    .catch((error) => {
      console.error("Erro na comunicação com o servidor ao deletar:", error);
      showAlert("Erro de rede ao tentar remover voluntário.", "error");
    });
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

      // Recarregar a página após 1 segundo
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    })
    .catch((err) => {
      console.error(err);
      showAlert("Erro ao criar oficina", "error");
    });
}

// CORRIGIDO: handleCreateVolunteer agora usa POST /voluntarios
async function handleCreateVolunteer(e) {
  e.preventDefault();
  const userId = parseInt(document.getElementById("volunteer-user-id").value);
  const department = document.getElementById("volunteer-department").value;
  const specialization = document.getElementById(
    "volunteer-specialization"
  ).value;

  if (!userId || isNaN(userId)) {
    showAlert("Por favor, informe um ID de usuário válido!", "error");
    return;
  }

  try {
    // 1. Verificar se o usuário existe no banco de dados (API: /usuarios/:id)
    const userRes = await fetch(`/usuarios/${userId}`);

    if (!userRes.ok) {
      showAlert("Usuário não encontrado no sistema!", "error");
      return;
    }

    const user = await userRes.json();

    // 2. Enviar dados do novo voluntário para o servidor (API: POST /voluntarios)
    const volunteerData = {
      userId: user.id,
      department: department || "Não especificado",
      specialization: specialization || "Não especificado",
    };

    const createRes = await fetch("/voluntarios", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(volunteerData),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      if (createRes.status === 409) {
        showAlert("Este usuário já está cadastrado como voluntário!", "error");
      } else {
        showAlert(
          createData.erro || "Erro ao cadastrar voluntário no servidor.",
          "error"
        );
      }
      return;
    }

    // 3. Se o cadastro for bem-sucedido, recarregar a lista do banco de dados
    await loadVolunteersFromDatabase();

    document.getElementById("create-volunteer-form").reset();
    renderVolunteersList();
    showAlert(
      `Voluntário ${user.nome || user.name} cadastrado com sucesso!`,
      "success"
    );
  } catch (error) {
    console.error("Erro ao cadastrar voluntário:", error);
    showAlert("Erro ao cadastrar voluntário. Tente novamente.", "error");
  }
}
