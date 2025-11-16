/**
 * Índice centralizado de serviços
 * Importa e exporta todos os serviços utilizados pelos casos de uso
 */

// Serviços compartilhados
const emailService = require('../../services/emailService');
const notificacaoService = require('../../services/notificacaoService');
const tokenService = require('../../services/tokenService');

// Serviços específicos de casos de uso
const ProcessarPagamentoService = require('./processarPagamento/processarPagamentoService');
const RecuperarSenhaService = require('./recuperarSenha/recuperarSenhaService');
const VerificarPrestadorService = require('./verificarPrestador/verificarPrestadorService');

module.exports = {
  // Serviços compartilhados
  emailService,
  notificacaoService,
  tokenService,

  // Serviços específicos
  ProcessarPagamentoService,
  RecuperarSenhaService,
  VerificarPrestadorService
};
