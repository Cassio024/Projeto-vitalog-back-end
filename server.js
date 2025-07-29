// Arquivo: server.js
// (Sem alterações)
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();
const app = express();
app.use(cors());
app.use(express.json({ extended: false }));
app.get('/', (req, res) => res.send('API VitaLog está rodando...'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/medications', require('./routes/medications'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));


// Arquivo: config/db.js
// (Sem alterações)
const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Conectado...');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;


// Arquivo: models/User.js
// (Sem alterações)
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  passwordResetCode: { type: String },
  passwordResetExpires: { type: Date },
});

module.exports = mongoose.model('user', UserSchema);


// Arquivo: models/Medication.js
// (Sem alterações)
const mongoose = require('mongoose');
const MedicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  schedules: [{ type: String, required: true }],
  date: { type: Date, default: Date.now },
});
module.exports = mongoose.model('medication', MedicationSchema);


// Arquivo: middleware/auth.js
// (Sem alterações)
const jwt = require('jsonwebtoken');
module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'Sem token, autorização negada' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token não é válido' });
  }
};


// Arquivo: utils/sendEmail.js
// (Sem alterações)
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `VitaLog <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;