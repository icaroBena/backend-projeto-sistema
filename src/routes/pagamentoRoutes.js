const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const processarPagamentoController = require('../usecases/processarPagamento/processarPagamentoController');
const reembolsoController = require('../usecases/reembolso/reembolsoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para iniciar pagamento
const pagamentoValidation = [
  check('servicoId').notEmpty().withMessage('ID do serviço é obrigatório'),
  check('metodoPagamento').notEmpty().withMessage('Método de pagamento é obrigatório')
];

// ============================================
// PROCESSAR PAGAMENTO
// ============================================

// Rotas privadas (todas requerem autenticação)

// Iniciar pagamento (escrow)
router.post('/escrow',
  auth,
  pagamentoValidation,
  validateInput,
  processarPagamentoController.iniciarPagamento
);

// Listar pagamentos (cliente ou prestador via query tipo=cliente|prestador)
router.get('/',
  auth,
  processarPagamentoController.listarPagamentos
);

// Obter detalhes de um pagamento
router.get('/:id',
  auth,
  processarPagamentoController.obterDetalhesPagamento
);

// Liberar pagamento
router.put('/:id/liberar',
  auth,
  processarPagamentoController.liberarPagamento
);

// ============================================
// REEMBOLSO
// ============================================

// Solicitar reembolso
router.post('/:id/reembolso',
  auth,
  reembolsoController.solicitarReembolso
);

// Listar reembolsos
router.get('/reembolsos',
  auth,
  reembolsoController.listarReembolsos
);

// Obter reembolsos de um pagamento
router.get('/reembolsos/pagamento/:pagamentoId',
  auth,
  reembolsoController.obterReembolsosPagamento
);

// Aprovar reembolso (Admin)
router.put('/reembolsos/:id/aprovar',
  auth,
  reembolsoController.aprovarReembolso
);

// Rejeitar reembolso (Admin)
router.put('/reembolsos/:id/rejeitar',
  auth,
  reembolsoController.rejeitarReembolso
);

module.exports = router;
