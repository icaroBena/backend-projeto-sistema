const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const confirmarPropostaController = require('../usecases/confirmarProposta/confirmarPropostaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Confirmar Proposta
 * Responsável por aceitação, recusa e cancelamento de propostas
 * @access Private
 */

// ============================================
// CONFIRMAR PROPOSTA - Cliente aceita/recusa
// ============================================

/**
 * @desc Aceitar uma proposta
 * @route PUT /api/propostas/:id/aceitar
 * @access Private - Cliente
 */
router.put('/:id/aceitar',
  auth,
  confirmarPropostaController.aceitarProposta
);

/**
 * @desc Recusar uma proposta
 * @route PUT /api/propostas/:id/recusar
 * @access Private - Cliente
 */
router.put('/:id/recusar',
  auth,
  confirmarPropostaController.recusarProposta
);

/**
 * @desc Cancelar uma proposta
 * @route PUT /api/propostas/:id/cancelar
 * @access Private - Cliente ou Prestador
 */
router.put('/:id/cancelar',
  auth,
  confirmarPropostaController.cancelarProposta
);

module.exports = router;
