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
