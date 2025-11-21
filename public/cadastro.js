// ========== ELEMENTOS DO DOM ==========
const cadastroForm = document.getElementById('cadastro-form');

// ========== VALIDAÇÃO E ENVIO DO FORMULÁRIO ==========
cadastroForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha').value;
  const confirmar = document.getElementById('confirmar').value;

  // Validação básica
  if (!nome || !email || !senha || !confirmar) {
    alert('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  if (senha.length < 6) {
    alert('A senha deve ter no mínimo 6 caracteres.');
    return;
  }

  if (senha !== confirmar) {
    alert('As senhas não coincidem.');
    return;
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Por favor, insira um email válido.');
    return;
  }

  try {
    const response = await fetch(`/cadastro`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome: nome,
        email: email,
        senha: senha,
        tipo: 'aluno'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro ao cadastrar usuário');
    }

    alert('Cadastro realizado com sucesso! Você será redirecionado para o login.');
    window.location.href = 'login.html';
  } catch (error) {
    alert('Erro: ' + error.message);
  }
});

// ========== INICIALIZAR ==========
document.addEventListener('DOMContentLoaded', () => {
  // Se o usuário já está logado, redirecionar para minha-conta
  const usuario = localStorage.getItem('tedi_user');
  if (usuario) {
    window.location.href = 'minha-conta.html';
  }
});
