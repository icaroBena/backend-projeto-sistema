const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');
const { checkRole } = require('../middlewares/checkRole');
const { validate } = require('../middlewares/validateInput');

// Middleware para verificar se é admin
router.use(auth);
router.use(checkRole(['admin']));

// Usuários
router.get('/usuarios', adminController.listarUsuarios);
router.put('/usuarios/:id/bloquear', validate('bloquearUsuario'), adminController.bloquearUsuario);

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Gateway de Pagamento
router.post('/gateway', validate('configurarGateway'), adminController.configurarGateway);

// Relatórios
router.get('/relatorios/financeiro', adminController.gerarRelatorioFinanceiro);

module.exports = router;