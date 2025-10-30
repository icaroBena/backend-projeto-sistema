const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async enviarEmail(to, subject, html) {
    try {
      const info = await this.transporter.sendMail({
        from: `"WorkMatch" <${process.env.EMAIL_FROM}>`,
        to,
        subject,
        html
      });
      logger.info('E-mail enviado com sucesso', { to, messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Erro ao enviar e-mail', { error: error.message, to });
      throw new Error('Erro ao enviar e-mail');
    }
  }

  async enviarEmailBoasVindas(user) {
    const html = `
      <h1>Olá ${user.nome}!</h1>
      <p>Bem-vindo ao WorkMatch! Estamos felizes em ter você conosco.</p>
      <p>Para começar, complete seu perfil e explore nossa plataforma.</p>
      <a href="${process.env.FRONTEND_URL}/perfil">Complete seu perfil</a>
    `;
    return this.enviarEmail(user.email, 'Bem-vindo ao WorkMatch!', html);
  }

  async enviarEmailVerificacao(email, token) {
    const html = `
      <h1>Verifique seu e-mail - WorkMatch</h1>
      <p>Para verificar seu e-mail, clique no link abaixo:</p>
      <a href="${process.env.FRONTEND_URL}/verificar-email/${token}">
        Verificar E-mail
      </a>
      <p>Este link expira em 24 horas.</p>
    `;
    return this.enviarEmail(email, 'Verifique seu e-mail - WorkMatch', html);
  }

  async enviarEmailRecuperacaoSenha(email, token) {
    const html = `
      <h1>Recuperação de Senha - WorkMatch</h1>
      <p>Para redefinir sua senha, clique no link abaixo:</p>
      <a href="${process.env.FRONTEND_URL}/recuperar-senha/${token}">
        Redefinir Senha
      </a>
      <p>Este link expira em 1 hora.</p>
      <p>Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
    `;
    return this.enviarEmail(email, 'Recuperação de Senha - WorkMatch', html);
  }

  async enviarNotificacaoPropostaRecebida(email, servico) {
    const html = `
      <h1>Nova Proposta Recebida!</h1>
      <p>Você recebeu uma nova proposta para o serviço:</p>
      <h2>${servico.titulo}</h2>
      <p>Acesse sua conta para visualizar os detalhes e responder à proposta.</p>
      <a href="${process.env.FRONTEND_URL}/servicos/${servico._id}">Ver Proposta</a>
    `;
    return this.enviarEmail(email, 'Nova Proposta Recebida - WorkMatch', html);
  }

  async enviarConfirmacaoPagamento(email, pagamento) {
    const html = `
      <h1>Pagamento Confirmado!</h1>
      <p>O pagamento de R$ ${pagamento.valor.toFixed(2)} para o serviço "${pagamento.servico.titulo}" foi confirmado.</p>
      <p>O valor está em custódia e será liberado após a conclusão do serviço.</p>
      <a href="${process.env.FRONTEND_URL}/pagamentos/${pagamento._id}">Ver Detalhes</a>
    `;
    return this.enviarEmail(email, 'Pagamento Confirmado - WorkMatch', html);
  }

  async enviarNotificacaoServicoFinalizado(email, servico) {
    const html = `
      <h1>Serviço Finalizado!</h1>
      <p>O serviço "${servico.titulo}" foi marcado como finalizado.</p>
      <p>Por favor, avalie o serviço prestado para liberar o pagamento.</p>
      <a href="${process.env.FRONTEND_URL}/servicos/${servico._id}/avaliacao">Avaliar Serviço</a>
    `;
    return this.enviarEmail(email, 'Serviço Finalizado - WorkMatch', html);
  }
}

module.exports = new EmailService();