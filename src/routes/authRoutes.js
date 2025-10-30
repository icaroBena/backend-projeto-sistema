const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

const router = express.Router();

// Validações para registro
const registerValidation = [
  check('name', 'Nome é obrigatório').not().isEmpty(),
  check('email', 'Por favor, inclua um email válido').isEmail(),
  check('password', 'Por favor, digite uma senha com 6 ou mais caracteres').isLength({ min: 6 })
];

// Validações para login
const loginValidation = [
  check('email', 'Por favor, inclua um email válido').isEmail(),
  check('password', 'Senha é obrigatória').exists()
];

// Rotas públicas
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;