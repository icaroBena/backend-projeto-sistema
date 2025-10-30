const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class TokenService {
  static generateToken(payload) {
    try {
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION || '24h'
      });
      logger.info('Token gerado com sucesso', { userId: payload.id });
      return token;
    } catch (error) {
      logger.error('Erro ao gerar token', { error: error.message });
      throw new Error('Erro ao gerar token');
    }
  }

  static verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      logger.error('Token inválido', { error: error.message });
      throw new Error('Token inválido ou expirado');
    }
  }

  static generateRefreshToken(userId) {
    try {
      const refreshToken = jwt.sign(
        { id: userId, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
      logger.info('Refresh token gerado', { userId });
      return refreshToken;
    } catch (error) {
      logger.error('Erro ao gerar refresh token', { error: error.message });
      throw new Error('Erro ao gerar refresh token');
    }
  }

  static verifyRefreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      return decoded;
    } catch (error) {
      logger.error('Refresh token inválido', { error: error.message });
      throw new Error('Refresh token inválido');
    }
  }
}

module.exports = TokenService;