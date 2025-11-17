const express = require('express');
const router = express.Router();
const verificarPrestadorController = require('../usecases/verificarPrestador/verificarPrestadorController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// ============================================
// VERIFICAR PRESTADOR
// ============================================

// Rotas privadas (todas requerem autenticação)

// Enviar documentos de verificação
router.post('/documentos',
  auth,
  upload.fields([
    { name: 'identidade', maxCount: 1 },
    { name: 'comprovante', maxCount: 1 }
  ]),
  verificarPrestadorController.enviarDocumentosVerificacao
);

// Buscar documentos de um usuário
router.get('/documentos/:userId',
  auth,
  verificarPrestadorController.buscarDocumentosVerificacao
);

// Verificar status de um usuário
router.get('/status/:userId',
  auth,
  verificarPrestadorController.verificarStatusPrestador
);

// Listar todas as verificações (Admin)
router.get('/',
  auth,
  verificarPrestadorController.listarVerificacoes
);

// Aprovar verificação (Admin)
router.put('/documentos/:documentoId/aprovar',
  auth,
  verificarPrestadorController.aprovarVerificacaoPrestador
);

// Rejeitar verificação (Admin)
router.put('/documentos/:documentoId/rejeitar',
  auth,
  verificarPrestadorController.rejeitarVerificacaoPrestador
);

module.exports = router;