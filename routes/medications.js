// Arquivo: routes/medications.js
// CORRIGIDO: Adicionada a importação do express.
const express = require('express'); // <-- LINHA ADICIONADA
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Medication = require('../models/Medication');

// @route   GET api/medications
router.get('/', auth, async (req, res) => {
  try {
    const medications = await Medication.find({ user: req.user.id }).sort({ date: -1 });
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   POST api/medications
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

module.exports = router;
