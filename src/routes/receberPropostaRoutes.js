const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const receberPropostaController = require('../usecases/receberProposta/receberPropostaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Receber Proposta
 * Responsável por criação de propostas e busca
 * @access Private
 */

// Validações para criação de proposta
const propostaValidation = [
  check('servicoId').notEmpty().withMessage('ID do serviço é obrigatório'),
  check('valor').isNumeric().withMessage('Valor deve ser numérico'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  check('prazoEstimado').notEmpty().withMessage('Prazo estimado é obrigatório')
];

// ============================================
// RECEBER PROPOSTA - Prestador cria proposta
// ============================================

/**
 * @desc Criar uma nova proposta
 * @route POST /api/propostas
 * @access Private - Prestador
 */
router.post('/',
  auth,
  propostaValidation,
  validateInput,
  receberPropostaController.receberProposta
);

/**
 * @desc Buscar propostas de um serviço
 * @route GET /api/propostas/servico/:servicoId
 * @access Private
 */
router.get('/servico/:servicoId',
  auth,
  receberPropostaController.buscarPropostasPorServico
);

/**
 * @desc Buscar propostas de um prestador
 * @route GET /api/propostas/prestador/:prestadorId
 * @access Private
 */
router.get('/prestador/:prestadorId',
  auth,
  receberPropostaController.buscarPropostasPrestador
);

/**
 * @desc Buscar propostas de um cliente
 * @route GET /api/propostas/cliente/:clienteId
 * @access Private - Cliente
 */
router.get('/cliente/:clienteId',
  auth,
  receberPropostaController.buscarPropostasCliente
);

/**
 * @desc Obter detalhes de uma proposta
 * @route GET /api/propostas/:id
 * @access Private
 */
router.get('/:id',
  auth,
  receberPropostaController.buscarPropostaPorId
);

module.exports = router;
