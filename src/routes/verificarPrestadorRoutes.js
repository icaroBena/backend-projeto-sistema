const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const verificarPrestadorController = require('../../usecases/verificarPrestador/verificarPrestadorController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Verificar Prestador
 * Responsável por submissão, avaliação e aprovação de documentos
 * @access Private
 */

// ============================================
// VERIFICAR PRESTADOR - Verificação de documentos
// ============================================

/**
 * @desc Enviar documentos de verificação
 * @route POST /api/verificacao/documentos
 * @access Private - Prestador
 */
router.post('/documentos',
  auth,
  upload.array('documentos', 5),
  verificarPrestadorController.enviarDocumentosVerificacao
);

/**
 * @desc Buscar documentos de um usuário
 * @route GET /api/verificacao/documentos/:userId
 * @access Private - Admin ou próprio usuário
 */
router.get('/documentos/:userId',
  auth,
  verificarPrestadorController.buscarDocumentosVerificacao
);

/**
 * @desc Aprovar verificação de prestador
 * @route PUT /api/verificacao/:id/aprovar
 * @access Private - Admin
 */
router.put('/:id/aprovar',
  auth,
  verificarPrestadorController.aprovarVerificacaoPrestador
);

/**
 * @desc Rejeitar verificação de prestador
 * @route PUT /api/verificacao/:id/rejeitar
 * @access Private - Admin
 */
router.put('/:id/rejeitar',
  auth,
  verificarPrestadorController.rejeitarVerificacaoPrestador
);

/**
 * @desc Verificar status de verificação pessoal
 * @route GET /api/verificacao/status
 * @access Private
 */
router.get('/status',
  auth,
  verificarPrestadorController.verificarStatusPrestador
);

/**
 * @desc Listar todas as verificações
 * @route GET /api/verificacao
 * @access Private - Admin
 */
router.get('/',
  auth,
  verificarPrestadorController.listarVerificacoes
);

module.exports = router;
