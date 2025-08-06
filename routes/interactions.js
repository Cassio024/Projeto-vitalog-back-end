// ARQUIVO ATUALIZADO: routes/interactions.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Medication = require('../models/Medication'); // Precisamos do modelo para consultar o DB

// @route   POST /api/interactions/check
// @desc    Verifica interações entre uma lista de medicamentos consultando o banco de dados
// @access  Private
router.post('/check', auth, async (req, res) => {
  const { medicationNames } = req.body;

  if (!medicationNames || medicationNames.length < 2) {
    // Não há o que verificar se tiver menos de 2 medicamentos
    return res.json({ hasInteraction: false, warnings: [] });
  }

  try {
    // Itera por cada medicamento enviado pelo app
    for (const medName of medicationNames) {
      
      // Busca no banco de dados pelo medicamento atual, ignorando maiúsculas/minúsculas
      const medInDB = await Medication.findOne({ name: new RegExp('^' + medName + '$', 'i') });

      // Se encontramos o medicamento no DB e ele tem interações listadas
      if (medInDB && medInDB.interactions && medInDB.interactions.length > 0) {
        
        // Agora, verificamos se algum dos OUTROS medicamentos da lista interage com ele
        for (const otherMedName of medicationNames) {
          if (medName.toLowerCase() === otherMedName.toLowerCase()) {
            continue; // Não compara um medicamento com ele mesmo
          }

          // Procura pela interação na lista de interações do 'medInDB'
          const interactionFound = medInDB.interactions.find(
            (interaction) => interaction.with_medication.toLowerCase() === otherMedName.toLowerCase()
          );

          if (interactionFound) {
            // INTERAÇÃO ENCONTRADA!
            // Retorna o aviso do banco de dados e para a execução.
            return res.json({
              hasInteraction: true,
              warnings: [interactionFound.warning]
            });
          }
        }
      }
    }

    // Se todos os loops terminarem, nenhuma interação foi encontrada.
    return res.json({ hasInteraction: false, warnings: [] });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor ao verificar interações.');
  }
});

module.exports = router;