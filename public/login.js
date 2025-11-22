// ========== ELEMENTOS DO DOM ==========
const loginForm = document.getElementById('login-form');

// ========== VALIDAÇÃO E ENVIO DO FORMULÁRIO ==========
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const senha = document.getElementById('senha') ? 
    document.getElementById('senha').value.trim() : 
    document.getElementById('password').value.trim();

  // Validação básica
  if (!email || !senha) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  try {
    const response = await fetch(`/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        senha: senha
      })
    });

    // Safely parse JSON only if response has JSON content-type
    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // If server returned HTML or plain text, include it in the thrown error
      if (!response.ok) throw new Error(text || 'Erro ao fazer login');
      // If response OK but not JSON, try to proceed but set data to empty object
      data = {};
    }

    if (!response.ok) {
      throw new Error((data && data.erro) || 'Erro ao fazer login');
    }

    // Salvar usuário no localStorage
    localStorage.setItem('tedi_user', JSON.stringify(data.usuario));

    alert('Login realizado com sucesso! Bem-vindo(a)!');
    window.location.href = 'minha-conta.html';
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
