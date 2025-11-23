/* Criar banco de dados */
CREATE DATABASE IF NOT EXISTS tedi_workshops;
USE tedi_workshops;

/* Tabela de usuários */
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
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
  nivel ENUM('basico','intermediario','avancado') DEFAULT 'basico',
  instrutor VARCHAR(100) NOT NULL,
  data_inicio DATETIME NOT NULL,
  data_fim DATETIME,
  vagas INT DEFAULT 20,
  categoria ENUM('Computador','Smartphone','Segurança Digital','Eventos','Programação','Inovação') DEFAULT NULL,
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
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (oficina_id) REFERENCES oficinas(id) ON DELETE CASCADE,
  UNIQUE KEY unique_inscricao (usuario_id, oficina_id),
  INDEX idx_usuario (usuario_id),
  INDEX idx_oficina (oficina_id)
);

/* Tabela de voluntarios */
CREATE TABLE IF NOT EXISTS voluntarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  departamento VARCHAR(100),
  especializacao VARCHAR(100),
  data_adesao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_departamento (departamento)
);

/* Teste */
INSERT INTO usuarios (nome, email, senha, tipo) VALUES
('Admin TEDI', 'admin@tedi.com', '$2b$10$X5S3sbkAg1MTiqZOGxpGyO3mgb45xVIIXIKfZ2JeYdXgKMklDgKLS', 'admin'), -- senha admin123
('Maria Silva', 'maria@email.com', '$2b$10$OMOsnRe865T6UXPhU23xrOQvPjp06.NUFhm6Mh0Q.AnrscFQeFV7a', 'instrutor'); -- senha maria123

INSERT INTO oficinas (titulo, descricao, nivel, instrutor, data_inicio, data_fim, vagas, categoria) VALUES
('Introdução à Programação', 'Aprenda os fundamentos da programação com Python', 'basico', 'Maria Silva', '2025-02-01 14:00:00', '2025-02-01 16:00:00', 30, 'Programação'),
('Design Thinking', 'Metodologias criativas para solução de problemas', 'intermediario', 'João Santos', '2025-02-05 10:00:00', '2025-02-05 12:00:00', 25, 'Inovação'),
('Desenvolvimento Web', 'Crie seu primeiro site com HTML, CSS e JavaScript', 'basico', 'Ana Costa', '2025-02-10 15:00:00', '2025-02-10 17:00:00', 20, 'Programação');

INSERT INTO oficinas (titulo, descricao, nivel, instrutor, data_inicio, data_fim, vagas, categoria) VALUES
('Computador Básico', 'Noções essenciais de uso de computador: ligar, navegar e usar email', 'basico', 'Carlos Pereira', '2025-03-01 09:00:00', '2025-03-01 11:00:00', 20, 'Computador'),
('Smartphone para Iniciantes', 'Aprenda a usar chamadas, mensagens e apps básicos no celular', 'basico', 'Fernanda Lima', '2025-03-05 14:00:00', '2025-03-05 16:00:00', 20, 'Smartphone'),
('Segurança Online', 'Boas práticas para evitar golpes e proteger seus dados na internet', 'intermediario', 'Roberto Alves', '2025-03-10 10:00:00', '2025-03-10 12:00:00', 25, 'Segurança Digital'),
('Café com Tecnologia (Evento)', 'Encontro informal com palestras e troca de experiências', 'basico', 'Equipe TEDI', '2025-03-15 09:00:00', '2025-03-15 12:00:00', 50, 'Eventos');
