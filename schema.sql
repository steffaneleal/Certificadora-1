/* Criar banco de dados */
CREATE DATABASE IF NOT EXISTS tedi_workshops;
USE tedi_workshops;

/* Tabela de usuários */
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('aluno', 'instrutor', 'admin') DEFAULT 'aluno',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

/* Tabela de oficinas */
CREATE TABLE IF NOT EXISTS oficinas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT NOT NULL,
  instrutor VARCHAR(100) NOT NULL,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  vagas INT DEFAULT 20,
  categoria VARCHAR(50),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_data_inicio (data_inicio),
  INDEX idx_categoria (categoria)
);

/* Tabela de inscrições */
CREATE TABLE IF NOT EXISTS inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  oficina_id INT NOT NULL,
  data_inscricao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('ativa', 'cancelada', 'concluida') DEFAULT 'ativa',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (oficina_id) REFERENCES oficinas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscricao (usuario_id, oficina_id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_oficina (oficina_id)
);

/* Teste */
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Admin TEDI', 'admin@tedi.com', '$2b$10$XQqP.WqF0YvQZN8YvZGHQeZ6rW3qxJjLKF5xJjMfZ5qW3qxJjLKF5', 'admin'),
('Maria Silva', 'maria@email.com', '$2b$10$XQqP.WqF0YvQZN8YvZGHQeZ6rW3qxJjLKF5xJjMfZ5qW3qxJjLKF5', 'instrutor');

INSERT INTO oficinas (titulo, descricao, instrutor, data_inicio, data_fim, vagas, categoria) VALUES
('Introdução à Programação', 'Aprenda os fundamentos da programação com Python', 'Maria Silva', '2025-02-01 14:00:00', '2025-02-01 16:00:00', 30, 'Programação'),
('Design Thinking', 'Metodologias criativas para solução de problemas', 'João Santos', '2025-02-05 10:00:00', '2025-02-05 12:00:00', 25, 'Inovação'),
('Desenvolvimento Web', 'Crie seu primeiro site com HTML, CSS e JavaScript', 'Ana Costa', '2025-02-10 15:00:00', '2025-02-10 17:00:00', 20, 'Programação');
