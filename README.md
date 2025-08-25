# ETrade API – Integração com SQL Server

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js) 
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-red?style=for-the-badge&logo=microsoftsqlserver) 
![Ngrok](https://img.shields.io/badge/Ngrok-Secure%20Tunnels-orange?style=for-the-badge&logo=ngrok) 
![Render](https://img.shields.io/badge/Render-Cloud-blue?style=for-the-badge&logo=render)

---

## Introdução

Bem-vindo ao **tutorial completo da ETrade API**!  
Esta API foi desenvolvida em **Node.js** para integrar o banco de dados **SQL Server** local com a internet, permitindo **consultas SQL em tempo real** via requisições HTTP.  

Com ela, você poderá:

- Executar **consultas SQL dinâmicas** (SELECT, JOIN, filtros, cálculos e muito mais).  
- Acessar dados em **tempo real** de qualquer lugar.  
- Expor seu banco local com **Ngrok** e integrá-lo a sistemas externos.  
- Simplificar integrações e automatizações sem complicação.  

---

## O que é a ETrade API?

A **ETrade API** é um middleware que conecta o **SQL Server** do sistema **ETrade** à internet.  
Ela funciona como uma ponte que transforma consultas SQL em endpoints HTTP acessíveis remotamente.

### Principais Funcionalidades
- **Consultas SQL dinâmicas** via query string.  
- **Respostas em tempo real** com dados atualizados.  
- **Acesso remoto seguro** via túnel do Ngrok.  
- **Deploy rápido** com suporte a ambientes cloud (ex: Render).  

---

## Passo a Passo de Configuração

### Passo 1 – Instalar e Configurar o SQL Server
1. Instale o **SQL Server 2019**.  
2. Abra o **SQL Server Management Studio** e conecte-se:
   
Servidor: localhost\sql2019  
Usuário: sa  
Senha: senha
Configure TCP/IP no SQL Server Configuration Manager:

Habilite o protocolo TCP/IP.

Defina a porta 8100.

Reinicie o serviço SQL Server (SQL2019).

### Passo 2 – Baixar e Configurar o Ngrok
1. Baixe o Ngrok.

No CMD (Admin), execute:

ngrok tcp 8100
O Ngrok gerará um endereço no formato:

bash
Copiar
Editar
x.tcp.ngrok.io:XXXX
📸 Exemplo do Ngrok

🔹 Passo 3 – Configurar a API
Clone o repositório:

bash
Copiar
Editar
git clone https://github.com/pablodevv/etrade-api-sql.git
cd etrade-api-sql
npm install
📸 Repositório GitHub

Configure o arquivo .env:

env
Copiar
Editar
DB_USER=sa
DB_PASSWORD=senha
DB_SERVER=x.tcp.ngrok.io
DB_PORT=XXXX
DB_DATABASE=etrade
Rode localmente:

bash
Copiar
Editar
node server.js
📸 Configuração .env

🔹 Passo 4 – Deploy no Render
Crie um serviço web no Render.

Configure:

Build Command: npm install

Start Command: node server.js

Environment Variables: copie as do .env (use o host e porta do Ngrok).

Clique em Deploy 🎉

🔹 Passo 5 – Testar a API
Quando o Render finalizar, acesse sua URL:

bash
Copiar
Editar
https://seuprojeto.onrender.com
Faça consultas SQL:

bash
Copiar
Editar
https://seuprojeto.onrender.com/consulta?query=SELECT%20*%20FROM%20movimento
📸 Exemplo de Consulta

📖 Considerações Finais
Enquanto o Ngrok estiver rodando, a API ficará acessível.

Caso o túnel seja reiniciado, atualize o .env e o Render com o novo host/porta.

Com isso, você terá consultas SQL Server em tempo real via API HTTP.

👨‍💻 Autor
Pablo Rodriguez
🔗 GitHub

💡 Desenvolvido para facilitar integrações rápidas e seguras entre SQL Server e aplicações web.
