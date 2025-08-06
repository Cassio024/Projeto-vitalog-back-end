// ARQUIVO NOVO: models/Interaction.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Este schema descreve a estrutura de um documento na sua coleção de interações,
// exatamente como vimos na captura de tela do seu banco de dados.
const InteractionSchema = new Schema({
  // Uma lista com os nomes dos medicamentos que interagem
  medications: {
    type: [String],
    required: true,
  },
  // A mensagem de aviso para essa interação específica
  warning: {
    type: String,
    required: true,
  },
  // (Opcional, mas boa prática) Para ligar a interação a um usuário, se aplicável.
  // Pode remover este campo se não for usar.
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  }
});

module.exports = mongoose.model('interaction', InteractionSchema);