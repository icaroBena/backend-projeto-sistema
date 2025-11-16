/**
 * Índice de rotas de casos de uso
 * Centraliza e exporta todas as rotas específicas dos casos de uso
 */

const confirmarPropostaRoutes = require('./confirmarPropostaRoutes');
const negociarPropostaRoutes = require('./negociarPropostaRoutes');
const receberPropostaRoutes = require('./receberPropostaRoutes');
const publicarServicoRoutes = require('./publicarServicoRoutes');
const finalizarServicoRoutes = require('./finalizarServicoRoutes');
const processarPagamentoRoutes = require('./processarPagamentoRoutes');
const reembolsoRoutes = require('./reembolsoRoutes');
const verificarPrestadorRoutes = require('./verificarPrestadorRoutes');
const recuperarSenhaRoutes = require('./recuperarSenhaRoutes');

module.exports = {
  confirmarPropostaRoutes,
  negociarPropostaRoutes,
  receberPropostaRoutes,
  publicarServicoRoutes,
  finalizarServicoRoutes,
  processarPagamentoRoutes,
  reembolsoRoutes,
  verificarPrestadorRoutes,
  recuperarSenhaRoutes
};
