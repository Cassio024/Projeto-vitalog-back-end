// Arquivo: config/db.js
// CORRIGIDO: Removidas as opções depreciadas para uma conexão mais limpa.
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // As opções useNewUrlParser e useUnifiedTopology não são mais necessárias
    // nas versões recentes do driver do Mongoose.
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Conectado...');
  } catch (err) {
    console.error('ERRO DE CONEXÃO COM MONGODB:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
