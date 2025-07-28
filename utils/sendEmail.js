// NOVO ARQUIVO: utils/sendEmail.js
// Utilitário para configurar e enviar emails com Nodemailer.
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Criar um "transportador" (serviço que vai enviar o email)
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // Usamos Gmail
    auth: {
      user: process.env.EMAIL_USER, // Seu email do arquivo .env
      pass: process.env.EMAIL_PASS, // Sua senha de app do arquivo .env
    },
  });

  // 2. Definir as opções do email
  const mailOptions = {
    from: `VitaLog <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: para emails mais bonitos com HTML
  };

  // 3. Enviar o email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;