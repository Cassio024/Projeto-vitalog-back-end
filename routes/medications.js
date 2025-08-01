const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Medication = require('../models/Medication');
const User = require('../models/User');

// ... (as rotas GET e POST continuam as mesmas)
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ user: req.user.id }).sort({ date: -1 });
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('name', 'Nome é obrigatório').not().isEmpty(),
      check('dosage', 'Dosagem é obrigatória').not().isEmpty(),
      check('schedules', 'Horários são obrigatórios e devem ser uma lista').isArray({ min: 1 }),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, dosage, schedules } = req.body;

    try {
      const newMedication = new Medication({
        name,
        dosage,
        schedules,
        user: req.user.id,
      });

      const medication = await newMedication.save();
      res.json(medication);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
  }
);


// @route   DELETE api/medications/:id
// @desc    Deletar um medicamento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log(`DIAGNÓSTICO (DELETE): Tentando deletar medicamento com ID: ${req.params.id}`);
    
    let medication = await Medication.findById(req.params.id);

    if (!medication) {
      console.log('DIAGNÓSTICO (DELETE): Medicamento não encontrado no banco.');
      return res.status(404).json({ msg: 'Medicamento não encontrado' });
    }
    console.log('DIAGNÓSTICO (DELETE): Medicamento encontrado.');

    // Garante que o usuário é dono do medicamento
    console.log(`DIAGNÓSTICO (DELETE): ID do dono do remédio: ${medication.user.toString()}`);
    console.log(`DIAGNÓSTICO (DELETE): ID do usuário logado: ${req.user.id}`);

    if (medication.user.toString() !== req.user.id) {
      console.log('DIAGNÓSTICO (DELETE): FALHA DE AUTORIZAÇÃO! Usuário não é o dono do medicamento.');
      return res.status(401).json({ msg: 'Não autorizado' });
    }
    console.log('DIAGNÓSTICO (DELETE): Autorização OK. Usuário é o dono.');

    await Medication.findByIdAndDelete(req.params.id); // Usando findByIdAndDelete que é mais moderno

    console.log('DIAGNÓSTICO (DELETE): Medicamento removido do banco com sucesso.');
    res.json({ msg: 'Medicamento removido' });

  } catch (err) {
    console.error('ERRO CRÍTICO NO DELETE:', err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;