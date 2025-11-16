const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const finalizarServicoController = require('../../usecases/finalizarServico/finalizarServicoController');
const auth = require('../middlewares/auth');
const validateInput = require('../middlewares/validateInput');

/**
 * @desc Rotas para o caso de uso: Finalizar Serviço
 * Responsável por conclusão, aprovação e cancelamento de serviços
 * @access Private
 */

// ============================================
// FINALIZAR SERVIÇO - Conclusão e aprovação
// ============================================

/**
 * @desc Cancelar um serviço (apenas em status PENDENTE ou EXECUÇÃO)
 * @route PUT /api/servicos/:id/cancelar
 * @access Private - Cliente
 */
router.put('/:id/cancelar',
  auth,
  finalizarServicoController.cancelarServico
);

/**
 * @desc Marcar serviço como finalizado
 * @route PUT /api/servicos/:id/finalizar
 * @access Private - Prestador
 */
router.put('/:id/finalizar',
  auth,
  finalizarServicoController.finalizarServico
);

/**
 * @desc Aprovar conclusão de um serviço
 * @route PUT /api/servicos/:id/aprovar
 * @access Private - Cliente
 */
router.put('/:id/aprovar',
  auth,
  finalizarServicoController.aprovarServicoFinalizacao
);

module.exports = router;
