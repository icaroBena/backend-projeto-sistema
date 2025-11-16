/**
 * 📁 Index: Casos de Uso
 * Arquivo central para importar todos os controllers de casos de uso
 * Facilita a manutenção e documentação da estrutura
 */

// ============================================
// CONFIRMAR PROPOSTA
// ============================================
const confirmarPropostaController = require('./confirmarProposta/confirmarPropostaController');
const confirmarPropostaService = require('./confirmarProposta/confirmarPropostaService');

// ============================================
// NEGOCIAR PROPOSTA
// ============================================
const negociarPropostaController = require('./negociarProposta/negociarPropostaController');
const negociarPropostaService = require('./negociarProposta/negociarPropostaService');

// ============================================
// RECEBER PROPOSTA
// ============================================
const receberPropostaController = require('./receberProposta/receberPropostaController');
const receberPropostaService = require('./receberProposta/receberPropostaService');

// ============================================
// PUBLICAR SERVIÇO
// ============================================
const publicarServicoController = require('./publicarServico/publicarServicoController');
const publicarServicoService = require('./publicarServico/publicarServicoService');

// ============================================
// FINALIZAR SERVIÇO
// ============================================
const finalizarServicoController = require('./finalizarServico/finalizarServicoController');
const finalizarServicoService = require('./finalizarServico/finalizarServicoService');

// ============================================
// PROCESSAR PAGAMENTO
// ============================================
const processarPagamentoController = require('./processarPagamento/processarPagamentoController');
const processarPagamentoService = require('./processarPagamento/processarPagamentoService');

// ============================================
// REEMBOLSO
// ============================================
const reembolsoController = require('./reembolso/reembolsoController');
const reembolsoService = require('./reembolso/reembolsoService');

// ============================================
// VERIFICAR PRESTADOR
// ============================================
const verificarPrestadorController = require('./verificarPrestador/verificarPrestadorController');
const verificarPrestadorService = require('./verificarPrestador/verificarPrestadorService');

// ============================================
// RECUPERAR SENHA
// ============================================
const recuperarSenhaController = require('./recuperarSenha/recuperarSenhaController');
const recuperarSenhaService = require('./recuperarSenha/recuperarSenhaService');

// ============================================
// Exports
// ============================================
module.exports = {
  // Proposta
  confirmarPropostaController,
  confirmarPropostaService,
  negociarPropostaController,
  negociarPropostaService,
  receberPropostaController,
  receberPropostaService,
  // Serviço
  publicarServicoController,
  publicarServicoService,
  finalizarServicoController,
  finalizarServicoService,
  // Pagamento
  processarPagamentoController,
  processarPagamentoService,
  reembolsoController,
  reembolsoService,
  // Verificação
  verificarPrestadorController,
  verificarPrestadorService,
  // Autenticação
  recuperarSenhaController
  , recuperarSenhaService
};

/**
 * 📖 Como Usar
 * 
 * // Importar controlador específico
 * const { confirmarPropostaController } = require('../usecases');
 * 
 * // Ou direto do diretório
 * const confirmarPropostaController = require('../usecases/confirmarProposta/confirmarPropostaController');
 */
