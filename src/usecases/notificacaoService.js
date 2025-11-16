const logger = require('../../utils/logger');
const Notificacao = require('../../models/Notificacao');
const User = require('../../models/User');

/**
 * Serviço para gerenciar notificações do sistema
 * Responsável por criar, listar e gerenciar notificações de usuários
 */
class NotificacaoService {
  /**
   * Cria uma nova notificação para um usuário
   * @param {string} userId - ID do usuário
   * @param {string} tipo - Tipo de notificação
   * @param {string} conteudo - Conteúdo da notificação
   * @param {string} referencia - ID do documento referenciado (opcional)
   * @returns {Object} - Notificação criada
   */
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

  /**
   * Marca uma notificação como lida
   * @param {string} notificacaoId - ID da notificação
   * @param {string} userId - ID do usuário
   * @returns {Object} - Notificação atualizada
   */
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

  /**
   * Busca notificações de um usuário com paginação
   * @param {string} userId - ID do usuário
   * @param {Object} options - Opções (page, limit, lida)
   * @returns {Object} - Notificações paginadas
   */
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
}

module.exports = NotificacaoService;
