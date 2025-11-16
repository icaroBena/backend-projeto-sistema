const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const recuperarSenhaController = require('../../usecases/recuperarSenha/recuperarSenhaController');
const validateInput = require('../middlewares/validateInput');

// Validações
const emailValidation = [
  check('email').isEmail().withMessage('Email inválido')
];

const resetPasswordValidation = [
  check('token').notEmpty().withMessage('Token é obrigatório'),
  check('novaSenha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  check('confirmacaoSenha').notEmpty().withMessage('Confirmação de senha é obrigatória')
];

// ============================================
// RECUPERAR SENHA
// ============================================

// Solicitar recuperação de senha
router.post('/solicitar',
  emailValidation,
  validateInput,
  recuperarSenhaController.solicitarRecuperacao
);

// Validar token
router.get('/validar/:token',
  recuperarSenhaController.validarTokenRecuperacao
);

// Resetar senha com token
router.put('/resetar',
  resetPasswordValidation,
  validateInput,
  recuperarSenhaController.resetarSenhaComToken
);

module.exports = router;
