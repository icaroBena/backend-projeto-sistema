const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const publicarServicoController = require('../usecases/publicarServico/publicarServicoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Publicar Serviço
 * Responsável por criação, busca e atualização de serviços
 * @access Public para GET, Private para POST/PUT
 */

// Validações para criação e atualização de serviço
const servicoValidation = [
  check('titulo').notEmpty().withMessage('Título é obrigatório'),
  check('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  check('categoriaId').notEmpty().withMessage('Categoria é obrigatória'),
  check('localServico.tipo').isIn(['presencial', 'remoto', 'hibrido']).withMessage('Tipo de local inválido')
];

// ============================================
// PUBLICAR SERVIÇO - Cliente publica novo serviço
// ============================================

/**
 * @desc Buscar todos os serviços com filtros
 * @route GET /api/servicos
 * @access Public
 */
router.get('/', publicarServicoController.buscarServicos);

/**
 * @desc Obter detalhes de um serviço
 * @route GET /api/servicos/:id
 * @access Public
 */
router.get('/:id', publicarServicoController.buscarServicoPorId);

/**
 * @desc Criar novo serviço
 * @route POST /api/servicos
 * @access Private - Cliente
 */
router.post('/', 
  auth,
  servicoValidation,
  validateInput,
  publicarServicoController.publicarServico
);

/**
 * @desc Atualizar serviço existente
 * @route PUT /api/servicos/:id
 * @access Private - Cliente (dono do serviço)
 */
router.put('/:id',
  auth,
  servicoValidation,
  validateInput,
  publicarServicoController.atualizarServico
);

/**
 * @desc Buscar serviços por categoria
 * @route GET /api/servicos/categoria/:categoriaId
 * @access Public
 */
router.get('/categoria/:categoriaId', publicarServicoController.buscarServicos);

/**
 * @desc Buscar serviços de um prestador
 * @route GET /api/servicos/prestador/:prestadorId
 * @access Public
 */
router.get('/prestador/:prestadorId', publicarServicoController.buscarServicos);

/**
 * @desc Buscar serviços de um cliente
 * @route GET /api/servicos/cliente/:clienteId
 * @access Private - Cliente (seu próprio perfil)
 */
router.get('/cliente/:clienteId', auth, publicarServicoController.buscarServicos);

module.exports = router;
