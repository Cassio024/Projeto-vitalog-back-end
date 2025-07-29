// Arquivo: server.js
// CORRIGIDO: dotenv.config() é a primeira linha e com caminho explícito para robustez.
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Conecta ao banco de dados
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ extended: false }));

// Rota de teste
app.get('/', (req, res) => res.send('API VitaLog está rodando...'));

// Rotas da Aplicação
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medications', require('./routes/medications'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


