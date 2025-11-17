const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const publicarServicoController = require('../usecases/publicarServico/publicarServicoController');
const finalizarServicoController = require('../usecases/finalizarServico/finalizarServicoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

// Validações para criação de serviço
const servicoValidation = [
  check('titulo').notEmpty().withMessage('Título é obrigatório'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  check('categoriaId').notEmpty().withMessage('Categoria é obrigatória'),
  check('localServico.tipo').isIn(['presencial', 'remoto', 'hibrido']).withMessage('Tipo de local inválido')
];

// ============================================
// PUBLICAR SERVIÇO - Cliente publica novo serviço
// ============================================

// Rotas públicas
router.get('/', publicarServicoController.buscarServicos);
router.get('/:id', publicarServicoController.buscarServicoPorId);

// Rotas privadas
router.post('/', 
  auth,
  servicoValidation,
  validateInput,
  publicarServicoController.publicarServico
);

router.put('/:id',
  auth,
  servicoValidation,
  validateInput,
  publicarServicoController.atualizarServico
);

// ============================================
// FINALIZAR SERVIÇO - Conclusão e aprovação
// ============================================
router.put('/:id/cancelar',
  auth,
  finalizarServicoController.cancelarServico
);

router.put('/:id/finalizar',
  auth,
  finalizarServicoController.finalizarServico
);

router.put('/:id/aprovar',
  auth,
  finalizarServicoController.aprovarServicoFinalizacao
);

// Rotas de busca e filtros
router.get('/categoria/:categoriaId', publicarServicoController.buscarServicos);
router.get('/prestador/:prestadorId', publicarServicoController.buscarServicos);
router.get('/cliente/:clienteId', auth, publicarServicoController.buscarServicos);

module.exports = router;