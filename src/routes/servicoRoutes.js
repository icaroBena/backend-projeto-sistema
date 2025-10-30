const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const servicoController = require('../controllers/servicoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para criação de serviço
const servicoValidation = [
  check('titulo').notEmpty().withMessage('Título é obrigatório'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  check('categoriaId').notEmpty().withMessage('Categoria é obrigatória'),
  check('localServico.tipo').isIn(['presencial', 'remoto', 'hibrido']).withMessage('Tipo de local inválido')
];

// Rotas públicas
router.get('/', servicoController.buscarServicos);
router.get('/:id', servicoController.buscarServicoPorId);

// Rotas privadas
router.post('/', 
  auth,
  servicoValidation,
  validateInput,
  servicoController.criarServico
);

router.put('/:id',
  auth,
  servicoValidation,
  validateInput,
  servicoController.atualizarServico
);

router.put('/:id/cancelar',
  auth,
  servicoController.cancelarServico
);

// Rotas de busca e filtros
router.get('/categoria/:categoriaId', servicoController.buscarServicos);
router.get('/prestador/:prestadorId', servicoController.buscarServicos);
router.get('/cliente/:clienteId', auth, servicoController.buscarServicos);

module.exports = router;