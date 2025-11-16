const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const reembolsoController = require('../../usecases/reembolso/reembolsoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Reembolso
 * Responsável por solicitação, aprovação e rejeição de reembolsos
 * @access Private
 */

// Validações para solicitar reembolso
const reembolsoValidation = [
  check('motivo').notEmpty().withMessage('Motivo do reembolso é obrigatório'),
  check('descricao').optional().notEmpty().withMessage('Descrição do problema')
];

// ============================================
// REEMBOLSO
// ============================================

/**
 * @desc Solicitar reembolso de um pagamento
 * @route POST /api/reembolsos/solicitar/:pagamentoId
 * @access Private - Cliente
 */
router.post('/solicitar/:pagamentoId',
  auth,
  reembolsoValidation,
  validateInput,
  reembolsoController.solicitarReembolso
);

/**
 * @desc Listar reembolsos
 * @route GET /api/reembolsos
 * @access Private - Admin ou próprio usuário
 */
router.get('/',
  auth,
  reembolsoController.listarReembolsos
);

/**
 * @desc Obter reembolsos de um pagamento
 * @route GET /api/reembolsos/pagamento/:pagamentoId
 * @access Private
 */
router.get('/pagamento/:pagamentoId',
  auth,
  reembolsoController.obterReembolsosPagamento
);

/**
 * @desc Aprovar reembolso
 * @route PUT /api/reembolsos/:id/aprovar
 * @access Private - Admin
 */
router.put('/:id/aprovar',
  auth,
  reembolsoController.aprovarReembolso
);

/**
 * @desc Rejeitar reembolso
 * @route PUT /api/reembolsos/:id/rejeitar
 * @access Private - Admin
 */
router.put('/:id/rejeitar',
  auth,
  reembolsoController.rejeitarReembolso
);

module.exports = router;
