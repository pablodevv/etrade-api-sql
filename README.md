# ETrade API – Integração com SQL Server

![Node.js](https://img.shields.io/badge/Node.js-18.x-green?style=for-the-badge&logo=node.js) 
![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-red?style=for-the-badge&logo=microsoftsqlserver) 
![Docker](https://img.shields.io/badge/Docker-Containerized-blue?style=for-the-badge&logo=docker)
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
- Rodar em **containers Docker** para máxima portabilidade.
- Simplificar integrações e automatizações sem complicação.  

---

## O que é a ETrade API?

A **ETrade API** é um middleware que conecta o **SQL Server** do sistema **ETrade** à internet.  
Ela funciona como uma ponte que transforma consultas SQL em endpoints HTTP acessíveis remotamente.

### Principais Funcionalidades
- **Consultas SQL dinâmicas** via query string.  
- **Respostas em tempo real** com dados atualizados.  
- **Acesso remoto seguro** via túnel do Ngrok.  
- **Deploy rápido** com suporte a ambientes cloud e Docker.
- **Containerização completa** para desenvolvimento e produção.

---

## Passo a Passo de Configuração

### Método 1: Configuração com Docker (Recomendado)

#### Pré-requisitos
- Docker e Docker Compose instalados
- SQL Server configurado e acessível

#### Passo 1 – Configurar o SQL Server
1. Instale o **SQL Server 2019**.  
2. Abra o **SQL Server Management Studio** e conecte-se:

```
Servidor: localhost\sql2019  
Usuário: sa  
Senha: senha
```

3. Configure TCP/IP no SQL Server Configuration Manager:
   - Habilite o protocolo TCP/IP.
   - Defina a porta 8100.
   - Reinicie o serviço SQL Server (SQL2019).

#### Passo 2 – Configurar o Ngrok
1. Baixe o Ngrok.
2. No CMD (Admin), execute:

```bash
ngrok tcp 8100
```

O Ngrok gerará um endereço no formato: `x.tcp.ngrok.io:XXXX`

#### Passo 3 – Rodar com Docker
1. Clone o repositório:

```bash
git clone https://github.com/pablodevv/etrade-api-sql.git
cd etrade-api-sql
```

2. Crie o arquivo `.env`:

```env
DB_USER=sa
DB_PASSWORD=senha
DB_SERVER=x.tcp.ngrok.io
DB_PORT=XXXX
DB_DATABASE=etrade
NODE_ENV=production
PORT=3000
```

3. Execute com Docker Compose:

```bash
docker-compose up -d
```

4. Acesse a API em: `http://localhost:3000`

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

USER node

CMD ["node", "server.js"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  etrade-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_SERVER=${DB_SERVER}
      - DB_PORT=${DB_PORT}
      - DB_DATABASE=${DB_DATABASE}
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

---

### Método 2: Configuração Manual

#### Passo 1 – Instalar dependências
```bash
git clone https://github.com/pablodevv/etrade-api-sql.git
cd etrade-api-sql
npm install
```

#### Passo 2 – Configurar ambiente
Configure o arquivo `.env` conforme mostrado acima.

#### Passo 3 – Executar
```bash
node server.js
```

---

## Deploy no Render

### Passo 1 – Configurar o serviço
1. Crie um serviço web no Render.
2. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment Variables**: copie as do `.env`

### Passo 2 – Deploy
Clique em Deploy e aguarde a finalização.

---

## Exemplos de Uso

### Consultas Básicas

```bash
# Últimos 10 lançamentos financeiros
GET /consulta?query=SELECT TOP 10 id, descricao, valor, data FROM movimento ORDER BY data DESC

# Total de entradas e saídas no mês atual
GET /consulta?query=SELECT SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) AS total_entradas, SUM(CASE WHEN valor < 0 THEN valor ELSE 0 END) AS total_saidas FROM movimento WHERE MONTH(data) = MONTH(GETDATE())
```

### Exemplos de Consultas do ETrade

#### Relatório Financeiro Mensal
```sql
SELECT 
  DAY(data) as dia,
  SUM(CASE WHEN valor > 0 THEN valor ELSE 0 END) AS entradas,
  SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END) AS saidas,
  SUM(valor) AS saldo_dia
FROM movimento 
WHERE MONTH(data) = MONTH(GETDATE()) 
  AND YEAR(data) = YEAR(GETDATE())
GROUP BY DAY(data)
ORDER BY dia;
```

#### Top 5 Maiores Movimentações
```sql
SELECT TOP 5 
  id,
  descricao,
  valor,
  data,
  CASE 
    WHEN valor > 0 THEN 'ENTRADA'
    ELSE 'SAÍDA'
  END as tipo
FROM movimento 
ORDER BY ABS(valor) DESC;
```

#### Saldo Atual por Categoria
```sql
SELECT 
  categoria,
  COUNT(*) as quantidade_lancamentos,
  SUM(valor) as saldo_total,
  AVG(valor) as valor_medio
FROM movimento 
WHERE categoria IS NOT NULL
GROUP BY categoria
ORDER BY saldo_total DESC;
```

### Testando a API

**Localmente:**
```bash
curl "http://localhost:3000/consulta?query=SELECT%20COUNT(*)%20as%20total%20FROM%20movimento"
```

**No Render:**
```bash
curl "https://seuprojeto.onrender.com/consulta?query=SELECT%20TOP%205%20*%20FROM%20movimento"
```

---

## Comandos Docker Úteis

```bash
# Build da imagem
docker build -t etrade-api .

# Executar container
docker run -d -p 3000:3000 --env-file .env etrade-api

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild e restart
docker-compose up -d --build
```

---

## Monitoramento e Saúde

A API inclui endpoints de monitoramento:

- **Health Check**: `GET /health`
- **Status do Banco**: `GET /status`
- **Métricas**: `GET /metrics`

---

## Boas Práticas de Segurança

> ⚠️ **Atenção**: Nunca exponha o `sa` diretamente em produção.  
> Crie um usuário SQL apenas para **consulta (SELECT)** com permissões mínimas.

### Criando Usuário de Consulta

```sql
-- Criar login
CREATE LOGIN etrade_readonly WITH PASSWORD = 'SuaSenhaSegura123!';

-- Criar usuário no banco
USE etrade;
CREATE USER etrade_readonly FOR LOGIN etrade_readonly;

-- Conceder apenas permissões de leitura
ALTER ROLE db_datareader ADD MEMBER etrade_readonly;

-- Negar permissões de escrita
DENY INSERT, UPDATE, DELETE ON SCHEMA::dbo TO etrade_readonly;
```

### Outras Recomendações

> 🔒 **Dicas de Segurança**:
> - Use HTTPS sempre que possível
> - Implemente rate limiting
> - Monitore logs de acesso
> - Mantenha o Ngrok atualizado
> - Use variáveis de ambiente para credenciais

---

## Troubleshooting

### Problemas Comuns

#### Erro de Conexão SQL
```bash
# Verificar se o SQL Server está rodando
docker ps | grep sql

# Testar conexão
telnet x.tcp.ngrok.io XXXX
```

#### Container não inicia
```bash
# Verificar logs
docker-compose logs etrade-api

# Verificar arquivo .env
cat .env
```

#### API não responde
```bash
# Verificar status do container
docker-compose ps

# Restart do serviço
docker-compose restart
```

---

## Considerações Finais

- Enquanto o Ngrok estiver rodando, a API ficará acessível.
- Caso o túnel seja reiniciado, atualize o `.env` e faça restart dos containers.
- Para produção, considere usar VPN ou conexão direta ao SQL Server.
- Docker garante consistência entre ambientes de desenvolvimento e produção.

---

## Estrutura do Projeto

```
etrade-api-sql/
├── server.js              # Servidor principal
├── package.json           # Dependências Node.js
├── Dockerfile            # Configuração Docker
├── docker-compose.yml    # Orquestração de containers
├── .env.example         # Exemplo de variáveis de ambiente
├── .dockerignore        # Arquivos ignorados pelo Docker
├── healthcheck.js       # Script de verificação de saúde
└── README.md           # Este arquivo
```

---

## Roadmap

- [ ] Implementar autenticação JWT
- [ ] Adicionar cache Redis
- [ ] Criar dashboard de monitoramento
- [ ] Suporte a múltiplos bancos
- [ ] API GraphQL
- [ ] Testes automatizados

---

🔒 Desenvolvido com foco em **segurança, simplicidade e integração**  
Feito com 💻 + ☕ por [Pablo Rodriguez](https://github.com/pablodevv)

**Transformando dados locais em APIs globais, um container por vez.**
