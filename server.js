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
    server: '6.tcp.ngrok.io',
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false, // Ajuste para true se usar Azure
        trustServerCertificate: true,
    },
};

// Rota para buscar os dados
app.get("/dados", async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query("SELECT * FROM Produto");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
