const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    });
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Bem-vindo ao WorkMatch!';
  const html = `
    <h1>Olá ${user.name}!</h1>
    <p>Bem-vindo ao WorkMatch. Estamos felizes em ter você conosco!</p>
    <p>Para começar, complete seu perfil e explore nossa plataforma.</p>
  `;
  return sendEmail({ to: user.email, subject, html });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const subject = 'Recuperação de Senha';
  const html = `
    <h1>Você solicitou a recuperação de senha</h1>
    <p>Clique no link abaixo para redefinir sua senha:</p>
    <a href="${resetUrl}">Redefinir Senha</a>
    <p>Se você não solicitou isso, ignore este email.</p>
  `;
  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};