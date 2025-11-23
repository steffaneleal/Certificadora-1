require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.static("public"));

// Configuração do banco de dados MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "tedi_workshops",
});

// Conectar ao banco de dados
db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao MySQL:", err);
    return;
  }
  console.log("Conectado ao MySQL");
});

// ==================== ROTAS DE USUÁRIOS ====================

// Cadastro de usuário
app.post("/cadastro", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" });
  }

  try {
    console.log("POST /cadastro received:", { nome, email, tipo });
    // Verificar se o email já existe
    db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email],
      async (err, results) => {
        if (err) console.error("DB error on SELECT usuarios (cadastro):", err);
        if (err) {
          return res.status(500).json({ erro: "Erro no servidor" });
        }

        if (results.length > 0) {
          console.log("Cadastro attempt with existing email:", email);
          return res.status(400).json({ erro: "Email já cadastrado" });
        }

        // Hash da senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // Inserir usuário
        const query =
          "INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)";
        db.query(
          query,
          [nome, email, senhaHash, tipo || "aluno"],
          (err, result) => {
            if (err) {
              console.error("DB error on INSERT usuarios (cadastro):", err);
              return res
                .status(500)
                .json({ erro: "Erro ao cadastrar usuário" });
            }

            console.log(
              "Usuário cadastrado id=",
              result.insertId,
              "email=",
              email
            );
            res.status(201).json({
              mensagem: "Usuário cadastrado com sucesso",
              usuarioId: result.insertId,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("Unexpected error in /cadastro handler:", error);
    res.status(500).json({ erro: "Erro no servidor" });
  }
});

// Login de usuário
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha são obrigatórios" });
  }

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      const usuario = results[0];
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ erro: "Credenciais inválidas" });
      }

      // Remover senha do objeto retornado
      delete usuario.senha;

      res.json({
        mensagem: "Login realizado com sucesso",
        usuario,
      });
    }
  );
});

// Buscar usuário por ID
app.get("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT id, nome, email, tipo, data_criacao FROM usuarios WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("DB error on GET /usuarios/:id ->", err);
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      res.json(results[0]);
    }
  );
});

// Atualizar usuário
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha } = req.body;

  let query = "UPDATE usuarios SET nome = ?, email = ?";
  let params = [nome, email];

  if (senha) {
    const senhaHash = await bcrypt.hash(senha, 10);
    query += ", senha = ?";
    params.push(senhaHash);
  }

  query += " WHERE id = ?";
  params.push(id);

  db.query(query, params, (err, result) => {
    if (err) {
      console.error("DB error on PUT /usuarios/:id ->", err);
      return res.status(500).json({ erro: "Erro ao atualizar usuário" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ mensagem: "Usuário atualizado com sucesso" });
  });
});

// Deletar usuário
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM usuarios WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao deletar usuário" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    res.json({ mensagem: "Usuário deletado com sucesso" });
  });
});

// ==================== ROTAS DE OFICINAS ====================

// Listar todas as oficinas
app.get("/oficinas", (req, res) => {
  db.query(
    "SELECT * FROM oficinas ORDER BY data_inicio DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro no servidor" });
      }
      res.json(results);
    }
  );
});

// Buscar oficina por ID
app.get("/oficinas/:id", (req, res) => {
  const { id } = req.params;

  db.query("SELECT * FROM oficinas WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro no servidor" });
    }

    if (results.length === 0) {
      return res.status(404).json({ erro: "Oficina não encontrada" });
    }

    res.json(results[0]);
  });
});

// Criar oficina
app.post("/oficinas", (req, res) => {
  const {
    titulo,
    descricao,
    instrutor,
    data_inicio,
    data_fim,
    vagas,
    categoria,
  } = req.body;

  if (!titulo || !descricao || !instrutor || !data_inicio) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando" });
  }

  const query =
    "INSERT INTO oficinas (titulo, descricao, instrutor, data_inicio, data_fim, vagas, categoria) VALUES (?, ?, ?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      titulo,
      descricao,
      instrutor,
      data_inicio,
      data_fim,
      vagas || 20,
      categoria,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao criar oficina" });
      }

      res.status(201).json({
        mensagem: "Oficina criada com sucesso",
        oficinaId: result.insertId,
      });
    }
  );
});

// Atualizar oficina
app.put("/oficinas/:id", (req, res) => {
  const { id } = req.params;
  const {
    titulo,
    descricao,
    instrutor,
    data_inicio,
    data_fim,
    vagas,
    categoria,
  } = req.body;

  const query =
    "UPDATE oficinas SET titulo = ?, descricao = ?, instrutor = ?, data_inicio = ?, data_fim = ?, vagas = ?, categoria = ? WHERE id = ?";

  db.query(
    query,
    [titulo, descricao, instrutor, data_inicio, data_fim, vagas, categoria, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ erro: "Erro ao atualizar oficina" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ erro: "Oficina não encontrada" });
      }

      res.json({ mensagem: "Oficina atualizada com sucesso" });
    }
  );
});

// Deletar oficina
app.delete("/oficinas/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM oficinas WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao deletar oficina" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Oficina não encontrada" });
    }

    res.json({ mensagem: "Oficina deletada com sucesso" });
  });
});

// ==================== ROTAS DE INSCRIÇÕES ====================

// Listar TODAS as inscrições (para admin)
app.get("/inscricoes", (req, res) => {
  const query = `
    SELECT 
      i.id,
      i.usuario_id,
      i.oficina_id,
      i.data_inscricao,
      u.nome as usuario_nome,
      u.email as usuario_email,
      o.titulo as oficina_titulo
    FROM inscricoes i
    JOIN usuarios u ON i.usuario_id = u.id
    JOIN oficinas o ON i.oficina_id = o.id
    ORDER BY i.data_inscricao DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao buscar inscrições:", err);
      return res.status(500).json({ erro: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Listar inscrições de um usuário específico
app.get("/inscricoes/usuario/:usuarioId", (req, res) => {
  const { usuarioId } = req.params;

  const query = `
    SELECT i.*, o.titulo, o.descricao, o.instrutor, o.data_inicio, o.data_fim
    FROM inscricoes i
    JOIN oficinas o ON i.oficina_id = o.id
    WHERE i.usuario_id = ?
    ORDER BY i.data_inscricao DESC
  `;

  db.query(query, [usuarioId], (err, results) => {
    if (err) {
      return res.status(500).json({ erro: "Erro no servidor" });
    }
    res.json(results);
  });
});

// Criar inscrição
app.post("/inscricoes", (req, res) => {
  const { usuario_id, oficina_id } = req.body;

  if (!usuario_id || !oficina_id) {
    return res
      .status(400)
      .json({ erro: "Usuario_id e oficina_id são obrigatórios" });
  }

  // Verificar se já existe inscrição
  db.query(
    "SELECT * FROM inscricoes WHERE usuario_id = ? AND oficina_id = ?",
    [usuario_id, oficina_id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ erro: "Erro no servidor" });
      }

      if (results.length > 0) {
        return res
          .status(400)
          .json({ erro: "Você já está inscrito nesta oficina" });
      }

      // Criar inscrição
      const query =
        "INSERT INTO inscricoes (usuario_id, oficina_id) VALUES (?, ?)";
      db.query(query, [usuario_id, oficina_id], (err, result) => {
        if (err) {
          return res.status(500).json({ erro: "Erro ao criar inscrição" });
        }

        res.status(201).json({
          mensagem: "Inscrição realizada com sucesso",
          inscricaoId: result.insertId,
        });
      });
    }
  );
});

// Deletar inscrição
app.delete("/inscricoes/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM inscricoes WHERE id = ?", [id], (err, result) => {
    if (err) {
      return res.status(500).json({ erro: "Erro ao deletar inscrição" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: "Inscrição não encontrada" });
    }

    res.json({ mensagem: "Inscrição cancelada com sucesso" });
  });
});

// ==================== ROTAS DE VOLUNTÁRIOS ====================

// Listar todos os voluntários
app.get("/voluntarios", (req, res) => {
  const query = `
    SELECT
      v.id,
      v.departamento AS department,
      v.especializacao AS specialization,
      v.data_adesao AS joinDate,
      u.id AS userId,
      u.nome AS userName,
      u.email AS userEmail
    FROM voluntarios v
    JOIN usuarios u ON v.usuario_id = u.id
    ORDER BY v.data_adesao DESC;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao listar voluntários:", err);
      return res.status(500).json({ erro: "Erro interno do servidor" });
    }
    // Formata o resultado para o formato esperado pelo frontend
    res.json(
      results.map((v) => ({
        id: v.id, // ID da tabela de voluntarios
        userId: v.userId, // ID do usuário
        userName: v.userName,
        userEmail: v.userEmail,
        department: v.department,
        specialization: v.specialization,
        joinDate: new Date(v.joinDate).toISOString(),
        createdAt: new Date(v.joinDate).toISOString(), // Usado como fallback
      }))
    );
  });
});

// Cadastrar novo voluntário
app.post("/voluntarios", (req, res) => {
  const { userId, department, specialization } = req.body;

  if (!userId) {
    return res.status(400).json({ erro: "ID do usuário é obrigatório" });
  }

  // 1. Verificar se o usuário já é voluntário
  db.query(
    "SELECT * FROM voluntarios WHERE usuario_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("DB error on checking volunteer:", err);
        return res.status(500).json({ erro: "Erro interno do servidor" });
      }

      if (results.length > 0) {
        return res
          .status(409)
          .json({ erro: "Este usuário já está cadastrado como voluntário" });
      }

      // 2. Criar novo voluntário
      const query =
        "INSERT INTO voluntarios (usuario_id, departamento, especializacao) VALUES (?, ?, ?)";
      db.query(
        query,
        [
          userId,
          department || "Não especificado",
          specialization || "Não especificado",
        ],
        (err, result) => {
          if (err) {
            console.error("Erro ao cadastrar voluntário:", err);
            return res
              .status(500)
              .json({ erro: "Erro ao cadastrar voluntário" });
          }

          // 3. Atualizar o tipo do usuário para 'instrutor' se for o caso
          db.query(
            "UPDATE usuarios SET tipo = 'instrutor' WHERE id = ? AND tipo != 'admin'",
            [userId],
            (updateErr) => {
              if (updateErr) {
                console.warn(
                  "Aviso: Falha ao atualizar tipo do usuário para 'instrutor'.",
                  updateErr
                );
              }

              // Sucesso no cadastro
              res.status(201).json({
                mensagem: "Voluntário cadastrado com sucesso",
                id: result.insertId,
              });
            }
          );
        }
      );
    }
  );
});

// Deletar voluntário por ID (FIX PARA REMOÇÃO PERSISTENTE)
app.delete("/voluntarios/:id", (req, res) => {
  const { id } = req.params; // ID da tabela voluntarios

  // 1. Obter o usuario_id do voluntário a ser deletado
  db.query(
    "SELECT usuario_id FROM voluntarios WHERE id = ?",
    [id],
    (selectErr, selectResults) => {
      if (selectErr) {
        console.error("Erro ao buscar usuario_id do voluntário:", selectErr);
        // Não interrompe, continua a tentar deletar o voluntário
      }

      const usuarioId =
        selectResults.length > 0 ? selectResults[0].usuario_id : null;

      // 2. Deletar o registro da tabela 'voluntarios'
      db.query(
        "DELETE FROM voluntarios WHERE id = ?",
        [id],
        (deleteErr, result) => {
          if (deleteErr) {
            console.error("Erro ao deletar voluntário:", deleteErr);
            return res.status(500).json({ erro: "Erro ao deletar voluntário" });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ erro: "Voluntário não encontrado" });
          }

          // 3. Opcional: Se o usuário foi encontrado, reverter o tipo para 'aluno'
          if (usuarioId) {
            db.query(
              "UPDATE usuarios SET tipo = 'aluno' WHERE id = ? AND tipo != 'admin'",
              [usuarioId],
              (updateErr) => {
                if (updateErr) {
                  console.warn(
                    "Aviso: Falha ao reverter tipo do usuário para 'aluno'.",
                    updateErr
                  );
                }
              }
            );
          }

          res.json({ mensagem: "Voluntário deletado com sucesso" });
        }
      );
    }
  );
});

// ==================== ROTAS DE REDIRECIONAMENTO ====================

app.get("/login", (req, res) => res.redirect("/login.html"));
app.get("/cadastro", (req, res) => res.redirect("/cadastro.html"));
app.get("/", (req, res) => res.redirect("/index.html"));

// ==================== INICIALIZAÇÃO ====================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}

module.exports = { app, db };
