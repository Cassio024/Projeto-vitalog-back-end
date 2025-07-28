const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// Conecta ao banco de dados
connectDB();

const app = express();

// Middleware para permitir requisições de origens diferentes (CORS)
app.use(cors());

// Middleware para fazer o parse do corpo das requisições como JSON
app.use(express.json({ extended: false }));

// Rota de teste inicial
app.get('/', (req, res) => {
  res.send('API VitaLog está rodando...');
});

// Definindo as rotas da aplicação
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medications', require('./routes/medications'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));