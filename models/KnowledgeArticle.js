// ARQUIVO NOVO: models/KnowledgeArticle.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Este schema descreve a estrutura de um documento na sua nova coleção 'knowledgearticles'
const KnowledgeArticleSchema = new Schema({
  medication_name: {
    type: String,
    required: true,
    unique: true // Garante que não haverá dois artigos para o mesmo medicamento
  },
  keywords: {
    type: [String], // Uma lista de palavras-chave para ajudar na busca
    required: true
  },
  content: {
    type: String, // O texto da bula ou a informação detalhada
    required: true
  }
});

// IMPORTANTE: Isto cria um "índice de texto" no MongoDB.
// Permite que a nossa busca por texto (`$text: { $search: ... }`) na rota do chatbot
// seja super rápida e eficiente.
KnowledgeArticleSchema.index({ 
  content: 'text', 
  keywords: 'text', 
  medication_name: 'text' 
});

module.exports = mongoose.model('knowledge_article', KnowledgeArticleSchema);