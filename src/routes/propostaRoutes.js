const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const receberPropostaController = require('../usecases/receberProposta/receberPropostaController');
const confirmarPropostaController = require('../usecases/confirmarProposta/confirmarPropostaController');
const negociarPropostaController = require('../usecases/negociarProposta/negociarPropostaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

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
router.post('/',
  auth,
  propostaValidation,
  validateInput,
  receberPropostaController.receberPropostaServico
);

router.get('/servico/:servicoId',
  auth,
  receberPropostaController.buscarPropostasServico
);

router.get('/prestador/:prestadorId',
  auth,
  receberPropostaController.buscarPropostasPrestador
);

router.get('/cliente/:clienteId',
  auth,
  receberPropostaController.buscarPropostasCliente
);

router.get('/:id',
  auth,
  receberPropostaController.buscarPropostaPorId
);

// ============================================
// CONFIRMAR PROPOSTA - Cliente aceita/recusa
// ============================================
router.put('/:id/aceitar',
  auth,
  confirmarPropostaController.aceitarProposta
);

router.put('/:id/recusar',
  auth,
  confirmarPropostaController.recusarProposta
);

router.put('/:id/cancelar',
  auth,
  confirmarPropostaController.cancelarProposta
);

// ============================================
// NEGOCIAR PROPOSTA
// ============================================
router.put('/:id/renegociar',
  auth,
  negociarPropostaController.renegociarProposta
);

router.put('/:id/finalizarNegociacao',
  auth,
  negociarPropostaController.finalizarNegociacao
);

router.get('/negociacao',
  auth,
  negociarPropostaController.listarPropostasEmNegociacao
);

module.exports = router;