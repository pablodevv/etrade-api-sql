require("dotenv").config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8100;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
};


app.get("/tabelas", async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query(`
            SELECT TABLE_NAME
            FROM INFORMATION_SCHEMA.TABLES
            WHERE TABLE_TYPE = 'BASE TABLE'
        `);
        const tabelas = result.recordset.map(item => item.TABLE_NAME);
        res.json(tabelas);
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.get("/dados/:tabela/:coluna", async (req, res) => {
    const { tabela, coluna } = req.params;

    try {
        await sql.connect(dbConfig);
        // Monta a query dinamicamente com base na tabela e coluna passadas
        const query = `SELECT ${coluna} FROM ${tabela}`;
        const result = await sql.query(query);
        res.json(result.recordset); // Retorna os dados encontrados
    } catch (err) {
        res.status(500).send(`Erro ao consultar dados: ${err.message}`);
    }
});


app.get("/dados/:tabela/:coluna/:valor", async (req, res) => {
    const { tabela, coluna, valor } = req.params;

    try {
        await sql.connect(dbConfig);

        const query = `SELECT * FROM ${tabela} WHERE ${coluna} = @valor`;

        const request = new sql.Request();
        request.input('valor', sql.VarChar, valor);

        const result = await request.query(query);

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send("Nenhum dado encontrado.");
        }
    } catch (err) {
        res.status(500).send(`Erro ao consultar dados: ${err.message}`);
    }
});

app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
