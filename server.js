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

        // Para armazenar os dados e o total de registros
        const data = {};
        let totalRecords = 0;

        // Para cada tabela, pega os dados com limite e página especificados
        for (const table of tables) {
            // Consulta para contar o número total de registros na tabela
            const countQuery = `
                SELECT COUNT(*) AS totalRecords
                FROM ${table}
            `;
            const countResult = await sql.query(countQuery);
            totalRecords += countResult.recordset[0].totalRecords; // Soma o total de registros

            // Consulta para pegar os dados da tabela com paginação
            const dataQuery = `
                SELECT * FROM ${table}
                ORDER BY (SELECT NULL)  -- Para garantir uma ordem (evita erros de paginação)
                OFFSET ${(page - 1) * limit} ROWS
                FETCH NEXT ${limit} ROWS ONLY;
            `;
            const tableData = await sql.query(dataQuery);
            data[table] = tableData.recordset; // Adiciona os dados da tabela no objeto 'data'
        }

        // Calcular o número total de páginas
        const totalPages = Math.ceil(totalRecords / limit);

        // Retorna os dados e o número total de páginas
        return {
            data,
            totalPages,
            totalRecords
        };
    } catch (err) {
        console.error('Erro ao buscar dados:', err.message);
        throw err;
    }
}

// Rota para obter dados de todas as tabelas com paginação
app.get("/dados", async (req, res) => {
    const page = parseInt(req.query.page) || 1; // Página inicial
    const limit = parseInt(req.query.limit) || 5; // Limite de registros por página

    try {
        const allData = await getPaginatedTableData(page, limit);
        res.json(allData); // Retorna os dados paginados de todas as tabelas, totalPages e totalRecords
    } catch (err) {
        res.status(500).send(`Erro: ${err.message}`);
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`API rodando na porta ${port}`);
});
