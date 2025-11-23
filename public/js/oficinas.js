// PÁGINA DE OFICINAS

document.addEventListener("DOMContentLoaded", () => {
  // Garantir que o conteúdo principal esteja visível
  const main = document.querySelector("main");
  if (main) {
    main.classList.remove("hidden");
    main.style.display = "block";
  }

  // Se as oficinas já estiverem carregadas, renderizar imediatamente,
  // caso contrário esperar pelo evento 'app-ready' disparado por common.js
  const initRender = () => {
    renderWorkshops();

    // Event listeners para filtros
    const filterLevel = document.getElementById("filter-level");
    const filterCategory = document.getElementById("filter-category");

    if (filterLevel) {
      filterLevel.addEventListener("change", renderWorkshops);
    }

    if (filterCategory) {
      filterCategory.addEventListener("change", renderWorkshops);
    }
  };

  if (Array.isArray(AppState.workshops) && AppState.workshops.length > 0) {
    initRender();
  } else {
    document.addEventListener(
      "app-ready",
      () => {
        initRender();
      },
      { once: true }
    );
  }
});

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
    const enrollmentObj = AppState.enrollments.find(
      (e) =>
        e.userId === AppState.currentUser?.id && e.workshopId === workshop.id
    );
    const isEnrolled = Boolean(enrollmentObj);

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
          ${
            isEnrolled
              ? `
            <button class="btn btn-danger" onclick="cancelEnrollment(${workshop.id})">Cancelar Inscrição</button>
          `
              : `
            <button class="btn btn-primary" onclick="enrollWorkshop(${workshop.id})">Inscrever-se</button>
          `
          }
        `
            : ""
        }
      </div>
    `;
    container.appendChild(card);
  });
}

async function cancelEnrollment(workshopId) {
  if (!AppState.currentUser) {
    showAlert("Você precisa fazer login para cancelar a inscrição!", "error");
    openLoginModal();
    return;
  }

  const enrollment = AppState.enrollments.find(
    (e) => e.userId === AppState.currentUser.id && e.workshopId === workshopId
  );
  if (!enrollment) {
    showAlert("Inscrição não encontrada.", "error");
    return;
  }

  if (!confirm("Deseja realmente cancelar sua inscrição nesta oficina?"))
    return;

  // If we have a server-side id, call DELETE endpoint
  if (enrollment.id) {
    try {
      const res = await fetch(`/inscricoes/${enrollment.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        showAlert(body.erro || "Erro ao cancelar inscrição", "error");
        return;
      }

      // remove locally
      AppState.enrollments = AppState.enrollments.filter(
        (e) => e.id !== enrollment.id
      );
      localStorage.setItem("enrollments", JSON.stringify(AppState.enrollments));
      renderWorkshops();
      showAlert("Inscrição cancelada com sucesso!", "success");
    } catch (err) {
      console.error(err);
      showAlert("Erro ao cancelar inscrição", "error");
    }
  } else {
    // local-only enrollment: just remove locally
    AppState.enrollments = AppState.enrollments.filter(
      (e) =>
        !(
          e.userId === enrollment.userId &&
          e.workshopId === enrollment.workshopId
        )
    );
    localStorage.setItem("enrollments", JSON.stringify(AppState.enrollments));
    renderWorkshops();
    showAlert("Inscrição cancelada.", "success");
  }
}

async function enrollWorkshop(workshopId) {
  if (!AppState.currentUser) {
    showAlert("Você precisa fazer login para se inscrever!", "error");
    openLoginModal();
    return;
  }

  try {
    const res = await fetch("/inscricoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_id: AppState.currentUser.id,
        oficina_id: workshopId,
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showAlert(body.erro || "Erro ao realizar inscrição", "error");
      return;
    }

    const json = await res.json().catch(() => ({}));
    const enrollment = {
      id: json.inscricaoId || AppState.enrollments.length + 1,
      userId: AppState.currentUser.id,
      workshopId,
      enrolledAt: new Date().toISOString(),
    };
    AppState.enrollments.push(enrollment);
    localStorage.setItem("enrollments", JSON.stringify(AppState.enrollments));
    renderWorkshops();
    showAlert("Inscrição realizada com sucesso!", "success");
  } catch (err) {
    console.error(err);
    showAlert("Erro ao realizar inscrição", "error");
  }
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
