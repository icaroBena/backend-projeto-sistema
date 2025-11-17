const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const negociarPropostaController = require('../usecases/negociarProposta/negociarPropostaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Negociar Proposta
 * Responsável por renegociação de termos e valores
 * @access Private
 */

// Validações para renegociação
const negociacaoValidation = [
  check('novoValor').optional().isNumeric().withMessage('Novo valor deve ser numérico'),
  check('novosPrazo').optional().notEmpty().withMessage('Novo prazo é obrigatório'),
  check('motivo').optional().notEmpty().withMessage('Motivo da renegociação')
];

// ============================================
// NEGOCIAR PROPOSTA
// ============================================

/**
 * @desc Iniciar renegociação de uma proposta
 * @route PUT /api/propostas/:id/renegociar
 * @access Private - Cliente ou Prestador
 */
router.put('/:id/renegociar',
  auth,
  negociacaoValidation,
  validateInput,
  negociarPropostaController.renegociarProposta
);

/**
 * @desc Finalizar renegociação de uma proposta
 * @route PUT /api/propostas/:id/finalizarNegociacao
 * @access Private - Cliente ou Prestador
 */
router.put('/:id/finalizarNegociacao',
  auth,
  negociarPropostaController.finalizarNegociacao
);

/**
 * @desc Listar propostas em negociação
 * @route GET /api/propostas/negociacao/listar
 * @access Private
 */
router.get('/listar',
  auth,
  negociarPropostaController.listarPropostasEmNegociacao
);

module.exports = router;
