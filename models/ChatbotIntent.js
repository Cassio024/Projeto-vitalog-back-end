const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Este schema descreve a estrutura de um documento na sua coleção de chatbot
const ChatbotIntentSchema = new Schema({
  tag: {
    type: String,
    required: true,
    unique: true // Cada tag (intenção) deve ser única
  },
  patterns: {
    type: [String], // Lista de exemplos de perguntas do utilizador
    required: true
  },
  responses: {
    type: [String], // Lista de possíveis respostas do bot
    required: true
  }
});

module.exports = mongoose.model('chatbot_intent', ChatbotIntentSchema);