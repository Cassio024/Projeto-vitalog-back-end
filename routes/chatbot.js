const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Importa o novo modelo que acabámos de criar
const ChatbotIntent = require('../models/ChatbotIntent');

// @route   POST /api/chatbot/query
// @desc    Recebe uma mensagem e retorna uma resposta consultando o MongoDB
// @access  Private
router.post('/query', auth, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Nenhuma mensagem fornecida' });
  }

  try {
    const userMessage = message.toLowerCase();
    
    // Procura no banco de dados por uma intenção que corresponda à mensagem do utilizador.
    // Usamos uma expressão regular para encontrar o padrão dentro da mensagem.
    const intents = await ChatbotIntent.find();
    let matchedIntent = null;

    for (const intent of intents) {
      for (const pattern of intent.patterns) {
        if (userMessage.includes(pattern.toLowerCase())) {
          matchedIntent = intent;
          break;
        }
      }
      if (matchedIntent) {
        break;
      }
    }

    let botResponse;
    if (matchedIntent) {
      // Se encontrou uma intenção, escolhe uma resposta aleatória dela
      const responses = matchedIntent.responses;
      botResponse = responses[Math.floor(Math.random() * responses.length)];
    } else {
      // Se não encontrou, busca pela intenção 'default_fallback' no DB
      const fallbackIntent = await ChatbotIntent.findOne({ tag: 'default_fallback' });
      const fallbackResponses = fallbackIntent.responses;
      botResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }

    res.json({ response: botResponse });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao processar a mensagem do chatbot.');
  }
});

module.exports = router;