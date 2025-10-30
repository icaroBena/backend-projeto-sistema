const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const categoriaController = require('../controllers/categoriaController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');
const checkRole = require('../middlewares/checkRole');

// Validações para categoria
const categoriaValidation = [
  check('nome').notEmpty().withMessage('Nome é obrigatório'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória')
];

// Rotas públicas
router.get('/', categoriaController.listarCategorias);
router.get('/:id', categoriaController.buscarCategoriaPorId);

// Rotas privadas (apenas admin)
router.post('/',
  auth,
  checkRole(['admin']),
  categoriaValidation,
  validateInput,
  categoriaController.criarCategoria
);

router.put('/:id',
  auth,
  checkRole(['admin']),
  categoriaValidation,
  validateInput,
  categoriaController.atualizarCategoria
);

router.delete('/:id',
  auth,
  checkRole(['admin']),
  categoriaController.deletarCategoria
);

module.exports = router;