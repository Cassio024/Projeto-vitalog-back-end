// Arquivo: routes/medications.js
// (Sem alterações)
const medicationRouter = express.Router();
const authMiddleware = require('../middleware/auth');
const MedicationModel = require('../models/Medication');
const { check: checkMed, validationResult: validationResultMed } = require('express-validator');

medicationRouter.get('/', authMiddleware, async (req, res) => {
  try {
    const medications = await MedicationModel.find({ user: req.user.id }).sort({ date: -1 });
    res.json(medications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

medicationRouter.post('/', [authMiddleware, [
    checkMed('name', 'Nome é obrigatório').not().isEmpty(),
    checkMed('dosage', 'Dosagem é obrigatória').not().isEmpty(),
    checkMed('schedules', 'Horários são obrigatórios e devem ser uma lista').isArray({ min: 1 }),
]], async (req, res) => {
    const errors = validationResultMed(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, dosage, schedules } = req.body;
    try {
      const newMedication = new MedicationModel({
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
});

module.exports = medicationRouter;
