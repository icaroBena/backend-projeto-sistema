const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const pagamentoController = require('../controllers/pagamentoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para iniciar pagamento
const pagamentoValidation = [
  check('servicoId').notEmpty().withMessage('ID do serviço é obrigatório'),
  check('metodoPagamento').notEmpty().withMessage('Método de pagamento é obrigatório')
];

// Rotas privadas (todas requerem autenticação)

// Iniciar pagamento (escrow)
router.post('/escrow',
  auth,
  pagamentoValidation,
  validateInput,
  pagamentoController.iniciarPagamento
);

// Listar pagamentos (cliente ou prestador via query tipo=cliente|prestador)
router.get('/',
  auth,
  pagamentoController.listarPagamentos
);

// Liberar pagamento
router.put('/:id/liberar',
  auth,
  pagamentoController.liberarPagamento
);

// Solicitar reembolso
router.post('/:id/reembolso',
  auth,
  pagamentoController.solicitarReembolso
);

module.exports = router;
