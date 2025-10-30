const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const pagamentoController = require('../controllers/pagamentoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para pagamento
const pagamentoValidation = [
  check('propostaId').notEmpty().withMessage('ID da proposta é obrigatório'),
  check('valor').isNumeric().withMessage('Valor deve ser numérico'),
  check('metodoPagamento').isIn(['credito', 'debito', 'pix']).withMessage('Método de pagamento inválido')
];

// Rotas privadas (todas requerem autenticação)
router.post('/',
  auth,
  pagamentoValidation,
  validateInput,
  pagamentoController.criarPagamento
);

router.get('/cliente/:clienteId',
  auth,
  pagamentoController.buscarPagamentosCliente
);

router.get('/prestador/:prestadorId',
  auth,
  pagamentoController.buscarPagamentosPrestador
);

router.post('/:id/liberar',
  auth,
  pagamentoController.liberarPagamento
);

router.post('/:id/estornar',
  auth,
  pagamentoController.estornarPagamento
);

router.get('/:id',
  auth,
  pagamentoController.buscarPagamentoPorId
);

module.exports = router;