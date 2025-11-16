const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const processarPagamentoController = require('../../usecases/processarPagamento/processarPagamentoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Processar Pagamento
 * Responsável por inicialização, liberação e consulta de pagamentos em escrow
 * @access Private
 */

// Validações para iniciar pagamento
const pagamentoValidation = [
  check('servicoId').notEmpty().withMessage('ID do serviço é obrigatório'),
  check('metodoPagamento').notEmpty().withMessage('Método de pagamento é obrigatório')
];

// ============================================
// PROCESSAR PAGAMENTO
// ============================================

/**
 * @desc Iniciar pagamento em escrow
 * @route POST /api/pagamentos/escrow
 * @access Private - Cliente
 */
router.post('/escrow',
  auth,
  pagamentoValidation,
  validateInput,
  processarPagamentoController.iniciarPagamento
);

/**
 * @desc Listar pagamentos do usuário
 * @route GET /api/pagamentos
 * @access Private
 * @query tipo - 'cliente' ou 'prestador'
 */
router.get('/',
  auth,
  processarPagamentoController.listarPagamentos
);

/**
 * @desc Obter detalhes de um pagamento
 * @route GET /api/pagamentos/:id
 * @access Private
 */
router.get('/:id',
  auth,
  processarPagamentoController.obterDetalhesPagamento
);

/**
 * @desc Liberar pagamento em escrow
 * @route PUT /api/pagamentos/:id/liberar
 * @access Private - Cliente
 */
router.put('/:id/liberar',
  auth,
  processarPagamentoController.liberarPagamento
);

module.exports = router;
