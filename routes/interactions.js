// ARQUIVO ATUALIZADO FINAL: routes/interactions.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
// Importa o novo modelo de Interação
const Interaction = require('../models/Interaction');

// @route   POST /api/interactions/check
// @desc    Verifica interações consultando a coleção de interações
// @access  Private
router.post('/check', auth, async (req, res) => {
  const { medicationNames } = req.body;

  if (!medicationNames || medicationNames.length < 2) {
    return res.json({ hasInteraction: false, warnings: [] });
  }

  try {
    // Cria todas as combinações de pares possíveis a partir da lista de medicamentos
    const pairs = [];
    for (let i = 0; i < medicationNames.length; i++) {
      for (let j = i + 1; j < medicationNames.length; j++) {
        pairs.push([medicationNames[i], medicationNames[j]]);
      }
    }

    // Para cada par, verifica se existe uma interação no banco de dados
    for (const pair of pairs) {
      // Cria uma busca case-insensitive para os dois medicamentos no par
      const med1Regex = new RegExp(`^${pair[0]}$`, 'i');
      const med2Regex = new RegExp(`^${pair[1]}$`, 'i');

      // Procura um documento de interação que contenha AMBOS os medicamentos
      const interactionFound = await Interaction.findOne({
        medications: { $all: [med1Regex, med2Regex] }
      });

      if (interactionFound) {
        // INTERAÇÃO ENCONTRADA! Retorna o aviso e para.
        return res.json({
          hasInteraction: true,
          warnings: [interactionFound.warning]
        });
      }
    }

    // Se o loop terminar, nenhuma interação foi encontrada.
    return res.json({ hasInteraction: false, warnings: [] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao verificar interações.');
  }
});

module.exports = router;