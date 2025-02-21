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

// Função para pegar os dados de todas as tabelas
async function getAllTablesData() {
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

        // Para cada tabela, pega os dados e retorna
        const data = {};
        for (const table of tables) {
            const dataQuery = `SELECT * FROM ${table}`;
            const tableData = await sql.query(dataQuery);
            data[table] = tableData.recordset; // Adiciona os dados da tabela no objeto 'data'
        }

        return data; // Retorna os dados de todas as tabelas
    } catch (err) {
        console.error('Erro ao buscar dados:', err.message);
        throw err;
    }
}

// Rota para obter todos os dados de todas as tabelas
app.get("/dados", async (req, res) => {
    try {
        const allData = await getAllTablesData();
        res.json(allData); // Retorna os dados de todas as tabelas
    } catch (err) {
        res.status(500).send(`Erro: ${err.message}`);
    }
});

// Rota para juntar dados de tabelas diferentes
app.get("/dados/juntar/:tabela1/:tabela2/:campo", async (req, res) => {
    const { tabela1, tabela2, campo } = req.params;

    try {
        await sql.connect(dbConfig);

        // Consulta para juntar duas tabelas
        const query = `
            SELECT t1.*, t2.*
            FROM ${tabela1} AS t1
            JOIN ${tabela2} AS t2
            ON t1.${campo} = t2.${campo}
        `;
        const result = await sql.query(query);

        res.json(result.recordset); // Retorna os dados das duas tabelas unidas
    } catch (err) {
        res.status(500).send(`Erro: ${err.message}`);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
