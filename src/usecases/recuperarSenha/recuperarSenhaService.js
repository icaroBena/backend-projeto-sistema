const crypto = require('crypto');
const logger = require('../../utils/logger');
const User = require('../../models/User');
const emailService = require('../../services/emailService');

/**
 * Serviço para gerenciar recuperação de senha
 * Responsável por geração de tokens, validação e redefinição de senha
 */
class RecuperarSenhaService {
  /**
   * Gera um token de recuperação de senha com validade de 30 minutos
   * @param {string} email - Email do usuário
   * @returns {Object} - Token gerado e data de expiração
   */
  static gerarTokenRecuperacao(email) {
    try {
      // Gerar token aleatório de 32 bytes
      const token = crypto.randomBytes(32).toString('hex');

      // Definir expiração (30 minutos)
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      logger.info('Token de recuperação gerado', {
        email,
        expiresAt
      });

      return {
        token,
        expiresAt,
        tokenHash: crypto.createHash('sha256').update(token).digest('hex')
      };
    } catch (error) {
      logger.error('Erro ao gerar token de recuperação', {
        error: error.message,
        email
      });
      throw new Error('Erro ao gerar token de recuperação');
    }
  }

  /**
   * Valida se o token de recuperação é válido e não expirou
   * @param {string} token - Token a validar
   * @param {User} user - Documento do usuário
   * @returns {boolean} - True se válido, false caso contrário
   */
  static validarToken(token, user) {
    try {
      if (!user.resetTokens || user.resetTokens.length === 0) {
        return false;
      }

      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const tokenValido = user.resetTokens.find(rt => {
        const tempoRestante = rt.expiresAt.getTime() - Date.now();
        return rt.token === tokenHash && tempoRestante > 0;
      });

      return !!tokenValido;
    } catch (error) {
      logger.error('Erro ao validar token', {
        error: error.message
      });
      throw new Error('Erro ao validar token');
    }
  }

  /**
   * Remove token de recuperação expirado
   * @param {User} user - Documento do usuário
   */
  static limparTokensExpirados(user) {
    try {
      if (!user.resetTokens) {
        user.resetTokens = [];
        return;
      }

      user.resetTokens = user.resetTokens.filter(rt => {
        const tempoRestante = rt.expiresAt.getTime() - Date.now();
        return tempoRestante > 0;
      });

      logger.info('Tokens expirados removidos', {
        userId: user._id
      });
    } catch (error) {
      logger.error('Erro ao limpar tokens expirados', {
        error: error.message
      });
      throw new Error('Erro ao limpar tokens expirados');
    }
  }

  /**
   * Redefinir senha do usuário
   * @param {User} user - Documento do usuário
   * @param {string} novaSenha - Nova senha em texto plano (será hash no controller)
   */
  static redefinirSenha(user, novaSenha) {
    try {
      // Controller fará o hash - aqui só atualizamos
      user.senha = novaSenha;
      user.resetTokens = []; // Limpar tokens após uso

      logger.info('Senha redefinida com sucesso', {
        userId: user._id
      });

      return user;
    } catch (error) {
      logger.error('Erro ao redefinir senha', {
        error: error.message,
        userId: user._id
      });
      throw new Error('Erro ao redefinir senha');
    }
  }
}

module.exports = RecuperarSenhaService;
