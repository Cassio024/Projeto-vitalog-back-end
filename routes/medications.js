const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');

const Medication = require('../models/Medication');
const User = require('../models/User');

// @route   GET api/medications
// @desc    Obter todos os medicamentos do usuário
// @access  Private
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
// @desc    Adicionar um novo medicamento (com verificação de interação)
// @access  Private
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
    let interactionWarning = null;

    try {
      const existingMedications = await Medication.find({ user: req.user.id });
      const existingMedicationNames = existingMedications.map(med => med.name);
      
      if (existingMedicationNames.length > 0) {
        for (const existingName of existingMedicationNames) {
          const interaction = await Medication.findOne({
            warning: { $exists: true },
            medications: {
              $all: [
                new RegExp(`^${name}$`, 'i'),
                new RegExp(`^${existingName}$`, 'i')
              ]
            }
          });

          if (interaction) {
            // A CORREÇÃO ESTÁ AQUI: Usamos .toObject() para garantir a leitura correta.
            interactionWarning = interaction.toObject().warning;
            break;
          }
        }
      }

      const newMedication = new Medication({
        name,
        dosage,
        schedules,
        user: req.user.id,
      });

      const medication = await newMedication.save();
      
      res.json({ medication, warning: interactionWarning });

    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
  }
);

// @route   PUT api/medications/:id
// @desc    Atualizar um medicamento
// @access  Private
router.put('/:id', auth, async (req, res) => {
    const { name, dosage, schedules } = req.body;
    
    const medicationFields = {};
    if (name) medicationFields.name = name;
    if (dosage) medicationFields.dosage = dosage;
    if (schedules) medicationFields.schedules = schedules;
    
    try {
        let medication = await Medication.findById(req.params.id);

        if (!medication) {
            return res.status(404).json({ msg: 'Medicamento não encontrado' });
        }

        if (medication.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Não autorizado' });
        }

        medication = await Medication.findByIdAndUpdate(
            req.params.id,
            { $set: medicationFields },
            { new: true }
        );

        res.json(medication);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no Servidor');
    }
});

// @route   DELETE api/medications/:id
// @desc    Deletar um medicamento
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    let medication = await Medication.findById(req.params.id);

    if (!medication) {
      return res.status(404).json({ msg: 'Medicamento não encontrado' });
    }

    if (medication.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Não autorizado' });
    }

    await Medication.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Medicamento removido' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no Servidor');
  }
});

module.exports = router;