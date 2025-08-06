const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChatbotIntent = require('../models/ChatbotIntent');

router.post('/query', auth, async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Nenhuma mensagem fornecida' });
  }

  try {
    const userMessage = message.toLowerCase();
    const intents = await ChatbotIntent.find();
    let matchedIntent = null;

    for (const intent of intents) {
      if (intent.patterns && Array.isArray(intent.patterns)) {
        for (const pattern of intent.patterns) {
          if (userMessage.includes(pattern.toLowerCase())) {
            matchedIntent = intent;
            break;
          }
        }
      }
      if (matchedIntent) {
        break;
      }
    }

    let botResponse;
    if (matchedIntent && matchedIntent.responses && matchedIntent.responses.length > 0) {
      const responses = matchedIntent.responses;
      botResponse = responses[Math.floor(Math.random() * responses.length)];
    } else {
      const fallbackIntent = await ChatbotIntent.findOne({ tag: 'default_fallback' });
      
      // Esta verificação extra impede o "crash"
      if (fallbackIntent && fallbackIntent.responses && fallbackIntent.responses.length > 0) {
        const fallbackResponses = fallbackIntent.responses;
        botResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      } else {
        // Resposta final super segura se até o fallback falhar ou não existir
        botResponse = "Desculpe, estou com um problema técnico e não consigo responder agora.";
      }
    }

    res.json({ response: botResponse });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao processar a mensagem do chatbot.');
  }
});

module.exports = router;