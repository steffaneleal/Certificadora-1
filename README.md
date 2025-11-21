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
A **Plataforma de Oficinas Online para o TEDI** será um ambiente digital educativo direcionado ao público idoso, com o propósito de reduzir a exclusão digital por meio de oficinas síncronas e assíncronas, materiais multimídia acessíveis e suporte humano (monitores e instrutores)


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

 2. Crie o arquivo de ambiente a partir do exemplo e ajuste os valores:

 ```bash
 cp .env.example .env
 # editar .env com seu editor: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, PORT
 ```

 3. Crie o banco e as tabelas (se ainda não existirem):

 ```bash
 mysql -u <seu_usuario> -p < schema.sql
 ```

 4. Inicie o servidor em modo de desenvolvimento:

 ```bash
 npm run dev
 ```

 5. Acesse o frontend no navegador:

 - http://localhost:3000/


## Pessoas desenvolvedoras do projeto
- [Ellian Maciel Moreira Ribeiro](https://github.com/Ellian-Ribeiro) (Ellian-Ribeiro)
- [Filipe Antonio de Lima Nogueira](https://github.com/filipelimma/) (filipelimma)
- [Gabriel Augusto Morisaki Rita](https://github.com/gasakiri/) (gasakiri)
- [Steffane Leal Silva Santos](https://github.com/steffaneleal/) (steffaneleal)
- [Vithoria Cabreira](https://github.com/cabreiraTech) (cabreiraTech)


## 📝 Licença
Este projeto está licenciado sob a Licença MIT — veja o arquivo [LICENSE](LICENSE) para detalhes.


## 🔚 Conclusão

