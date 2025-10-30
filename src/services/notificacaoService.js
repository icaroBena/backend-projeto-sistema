const logger = require('../utils/logger');
const Notificacao = require('../models/Notificacao');
const emailService = require('./emailService');

class NotificacaoService {
  static async criarNotificacao(userId, tipo, conteudo, referencia = null) {
    try {
      const notificacao = await Notificacao.create({
        usuario: userId,
        tipo,
        conteudo,
        referencia,
        lida: false,
        dataEnvio: new Date()
      });

      logger.info('Notificação criada', {
        userId,
        tipo,
        notificacaoId: notificacao._id
      });

      return notificacao;
    } catch (error) {
      logger.error('Erro ao criar notificação', {
        error: error.message,
        userId,
        tipo
      });
      throw new Error('Erro ao criar notificação');
    }
  }

  static async marcarComoLida(notificacaoId, userId) {
    try {
      const notificacao = await Notificacao.findOneAndUpdate(
        { _id: notificacaoId, usuario: userId },
        { lida: true },
        { new: true }
      );

      if (!notificacao) {
        throw new Error('Notificação não encontrada');
      }

      logger.info('Notificação marcada como lida', {
        notificacaoId,
        userId
      });

      return notificacao;
    } catch (error) {
      logger.error('Erro ao marcar notificação como lida', {
        error: error.message,
        notificacaoId,
        userId
      });
      throw error;
    }
  }

  static async buscarNotificacoesUsuario(userId, { page = 1, limit = 10, lida = null }) {
    try {
      const query = { usuario: userId };
      if (lida !== null) {
        query.lida = lida;
      }

      const notificacoes = await Notificacao.find(query)
        .sort({ dataEnvio: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('referencia');

      const total = await Notificacao.countDocuments(query);

      logger.info('Notificações buscadas com sucesso', {
        userId,
        page,
        limit,
        total
      });

      return {
        notificacoes,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      };
    } catch (error) {
      logger.error('Erro ao buscar notificações', {
        error: error.message,
        userId
      });
      throw new Error('Erro ao buscar notificações');
    }
  }

  static async notificarNovaPropostaServico(servico, proposta) {
    try {
      // Criar notificação para o cliente
      await this.criarNotificacao(
        servico.cliente,
        'NOVA_PROPOSTA',
        `Nova proposta recebida para o serviço "${servico.titulo}"`,
        proposta._id
      );

      // Enviar e-mail
      const cliente = await User.findById(servico.cliente);
      await emailService.enviarNotificacaoPropostaRecebida(cliente.email, servico);

      logger.info('Notificação de nova proposta enviada', {
        servicoId: servico._id,
        propostaId: proposta._id
      });
    } catch (error) {
      logger.error('Erro ao notificar nova proposta', {
        error: error.message,
        servicoId: servico._id,
        propostaId: proposta._id
      });
      throw new Error('Erro ao notificar nova proposta');
    }
  }

  static async notificarPropostaAceita(proposta) {
    try {
      // Criar notificação para o prestador
      await this.criarNotificacao(
        proposta.prestador,
        'PROPOSTA_ACEITA',
        `Sua proposta para o serviço "${proposta.servico.titulo}" foi aceita!`,
        proposta._id
      );

      // Enviar e-mail para o prestador
      const prestador = await User.findById(proposta.prestador);
      await emailService.enviarEmail(
        prestador.email,
        'Proposta Aceita - WorkMatch',
        `<h1>Sua proposta foi aceita!</h1>
         <p>Sua proposta para o serviço "${proposta.servico.titulo}" foi aceita pelo cliente.</p>
         <a href="${process.env.FRONTEND_URL}/propostas/${proposta._id}">Ver Detalhes</a>`
      );

      logger.info('Notificação de proposta aceita enviada', {
        propostaId: proposta._id
      });
    } catch (error) {
      logger.error('Erro ao notificar proposta aceita', {
        error: error.message,
        propostaId: proposta._id
      });
      throw new Error('Erro ao notificar proposta aceita');
    }
  }

  static async notificarServicoFinalizado(servico) {
    try {
      // Notificar cliente
      await this.criarNotificacao(
        servico.cliente,
        'SERVICO_FINALIZADO',
        `O serviço "${servico.titulo}" foi finalizado. Por favor, faça a avaliação.`,
        servico._id
      );

      // Notificar prestador
      await this.criarNotificacao(
        servico.prestador,
        'SERVICO_FINALIZADO',
        `O serviço "${servico.titulo}" foi finalizado. Aguardando avaliação do cliente.`,
        servico._id
      );

      // Enviar e-mail para o cliente
      const cliente = await User.findById(servico.cliente);
      await emailService.enviarNotificacaoServicoFinalizado(cliente.email, servico);

      logger.info('Notificações de serviço finalizado enviadas', {
        servicoId: servico._id
      });
    } catch (error) {
      logger.error('Erro ao notificar serviço finalizado', {
        error: error.message,
        servicoId: servico._id
      });
      throw new Error('Erro ao notificar serviço finalizado');
    }
  }
}

module.exports = NotificacaoService;