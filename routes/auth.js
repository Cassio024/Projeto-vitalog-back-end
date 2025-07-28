// Arquivo: routes/auth.js
// MODIFICADO: Lógica de forgot-password e reset-password implementada.
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto'); // Módulo nativo do Node para gerar códigos

// @route   POST api/auth/register
// (Sem alterações)
router.post('/register', [
    check('name', 'Por favor, adicione um nome').not().isEmpty(),
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('password', 'Por favor, insira uma senha com 6 ou mais caracteres').isLength({ min: 6 }),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'Usuário já existe' });
      }
      user = new User({ name, email, password });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
});

// @route   POST api/auth/login
// (Sem alterações)
router.post('/login', [
    check('email', 'Por favor, inclua um email válido').isEmail(),
    check('password', 'Senha é obrigatória').exists(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Credenciais inválidas' });
      }
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 3600 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro no servidor');
    }
});

// @route   POST api/auth/forgot-password
// @desc    Gera e envia o código de redefinição de senha
// @access  Public
router.post('/forgot-password', [check('email', 'Email é obrigatório').isEmail()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado com este email' });
    }

    // Gerar o código
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString(); // Gera um código de 6 dígitos

    // Salvar o código e a data de expiração no usuário
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Expira em 10 minutos
    await user.save();

    // Enviar o email
    const message = `Você está recebendo este email porque solicitou a redefinição de senha. Seu código de verificação é: ${resetCode}`;

    await sendEmail({
      email: user.email,
      subject: 'VitaLog - Código de Redefinição de Senha',
      message,
    });

    res.status(200).json({ success: true, msg: 'Email enviado' });
  } catch (err) {
    console.error(err.message);
    // Limpar o código do usuário em caso de erro no envio
    const user = await User.findOne({ email: req.body.email });
    if (user) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
    }
    res.status(500).send('Erro ao enviar o email');
  }
});

// @route   POST api/auth/reset-password
// @desc    Redefine a senha com o código
// @access  Public
router.post('/reset-password', [
    check('code', 'Código é obrigatório').not().isEmpty(),
    check('password', 'A nova senha é obrigatória').isLength({ min: 6 }),
    check('email', 'Email é obrigatório').isEmail(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { code, password, email } = req.body;

    try {
        const user = await User.findOne({
            email,
            passwordResetCode: code,
            passwordResetExpires: { $gt: Date.now() }, // Verifica se o código não expirou
        });

        if (!user) {
            return res.status(400).json({ msg: 'Código inválido ou expirado' });
        }

        // Redefinir a senha
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, msg: 'Senha redefinida com sucesso' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

module.exports = router;