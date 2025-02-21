require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8100;

app.use(cors());
app.use(express.json());

// Configuração do banco de dados
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false, // Ajuste para true se usar Azure
        trustServerCertificate: true,
    },
};

// Função para pegar os dados de todas as tabelas com paginação
async function getPaginatedTableData(page, limit) {
    try {
        // Conectar ao banco de dados
        await sql.connect(dbConfig);

        // Pega todas as tabelas do banco de dados
        const tablesQuery = `
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
        `;
        const tablesResult = await sql.query(tablesQuery);
        const tables = tablesResult.recordset.map(item => item.TABLE_NAME);

        // Para cada tabela, pega os dados com limite e página especificados
        const data = {};
        for (const table of tables) {
            const dataQuery = `
                SELECT * FROM ${table}
                ORDER BY (SELECT NULL)  -- Para garantir uma ordem (evita erros de paginação)
                OFFSET ${(page - 1) * limit} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `;
            const tableData = await sql.query(dataQuery);
            data[table] = tableData.recordset; // Adiciona os dados da tabela no objeto 'data'
        }

        return data; // Retorna os dados paginados de todas as tabelas
    } catch (err) {
        console.error('Erro ao buscar dados:', err.message);
        throw err;
    }
}

// Rota para obter dados de todas as tabelas com paginação
app.get("/dados", async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página inicial
    const limit = parseInt(req.query.limit) || 10; // Limite de registros por página

    try {
        const allData = await getPaginatedTableData(page, limit);
        res.json(allData); // Retorna os dados paginados de todas as tabelas
    } catch (err) {
        res.status(500).send(`Erro: ${err.message}`);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
