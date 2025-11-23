# Plataforma de Oficinas Online para o TEDI

![Badge](https://img.shields.io/badge/-HTML-df8638?logo=html5&logoColor=0d2c46&style=for-the-badge)
![Badge](https://img.shields.io/badge/-CSS-264de4?logo=css&logoColor=FFFFFF&style=for-the-badge)
![JavaScript Badge](https://img.shields.io/badge/-JS-F7DF1E?logo=javascript&logoColor=0d2c46&style=for-the-badge)

# Índice 
* [Descrição do Projeto](#descrição-do-projeto)
* [Pessoas Desenvolvedoras do Projeto](#pessoas-desenvolvedoras)
* [Licença](#licença)
* [Conclusão](#conclusão)

## 📌 Descrição do projeto
A **Plataforma de Oficinas Online para o TEDI** é um ambiente digital educativo direcionado ao público idoso, com o propósito de reduzir a exclusão digital por meio de oficinas síncronas e assíncronas, materiais multimídia acessíveis e suporte humano (monitores e instrutores).

### Funcionalidades
- ✅ Sistema de cadastro e autenticação de usuários
- ✅ Gerenciamento de oficinas (criação, edição, listagem)
- ✅ Sistema de inscrições em oficinas
- ✅ Painel administrativo para gestão completa
- ✅ Interface responsiva e acessível
- ✅ Filtros por nível e categoria de oficinas


 ## Estrutura do projeto
 
 - `server.js` — servidor Express + rotas;
 - `schema.sql` — criação do banco e tabelas iniciais (`usuarios`, `oficinas`, `inscricoes`);
 - `public/` — frontend estático (HTML, CSS, JS);
 - `.env.example` / `.env` — variáveis de ambiente (BD, PORT);
 - `package.json` — dependências e scripts.


 ## Configuração e execução

 1. Instale dependências:

 ```bash
 npm install
 ```

2. Crie o arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
DB_HOST=localhost
DB_USER=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
DB_NAME=tedi_workshops
PORT=3000
```

3. Crie o banco e as tabelas (se ainda não existirem):

```bash
mysql -u <seu_usuario> -p < tedi.sql
```

4. Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

5. Acesse o frontend no navegador:

- **Frontend:** http://localhost:3000/

### 🔐 Credenciais de Acesso

**Perfil Administrativo:**
- **Email:** `admin@tedi.com`
- **Senha:** `admin123`


## Pessoas desenvolvedoras do projeto
- [Ellian Maciel Moreira Ribeiro](https://github.com/Ellian-Ribeiro) (Ellian-Ribeiro)
- [Filipe Antonio de Lima Nogueira](https://github.com/filipelimma/) (filipelimma)
- [Gabriel Augusto Morisaki Rita](https://github.com/gasakiri/) (gasakiri)
- [Steffane Leal Silva Santos](https://github.com/steffaneleal/) (steffaneleal)
- [Vithoria Cabreira](https://github.com/cabreiraTech) (cabreiraTech)


## 📝 Licença
Este projeto está licenciado sob a Licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.


## 🔚 Conclusão

A Plataforma de Oficinas Online para o TEDI foi desenvolvida com foco na acessibilidade e usabilidade para o público idoso, oferecendo uma interface intuitiva e recursos que facilitam o aprendizado digital. O sistema permite o gerenciamento completo de oficinas, usuários e inscrições, proporcionando uma experiência educativa inclusiva e eficiente.

### Tecnologias Utilizadas
- **Backend:** Node.js, Express.js
- **Banco de Dados:** MySQL
- **Frontend:** HTML5, CSS3, JavaScript 
- **Autenticação:** bcrypt para hash de senhas
- **Gerenciamento de Variáveis:** dotenv

### Status do Projeto
✅ **Projeto Finalizado** 

