const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const propostaController = require('../controllers/propostaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para criação de proposta
const propostaValidation = [
  check('servicoId').notEmpty().withMessage('ID do serviço é obrigatório'),
  check('valor').isNumeric().withMessage('Valor deve ser numérico'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  check('prazoEntrega').notEmpty().withMessage('Prazo de entrega é obrigatório')
];

// Rotas privadas (todas requerem autenticação)
router.post('/',
  auth,
  propostaValidation,
  validateInput,
  propostaController.criarProposta
);

router.get('/servico/:servicoId',
  auth,
  propostaController.buscarPropostasServico
);

router.get('/prestador/:prestadorId',
  auth,
  propostaController.buscarPropostasPrestador
);

router.get('/cliente/:clienteId',
  auth,
  propostaController.buscarPropostasCliente
);

router.put('/:id/aceitar',
  auth,
  propostaController.aceitarProposta
);

router.put('/:id/recusar',
  auth,
  propostaController.recusarProposta
);

router.put('/:id/cancelar',
  auth,
  propostaController.cancelarProposta
);

router.get('/:id',
  auth,
  propostaController.buscarPropostaPorId
);

module.exports = router;