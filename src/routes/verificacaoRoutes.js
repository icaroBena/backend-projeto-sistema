const express = require('express');
const router = express.Router();
const verificacaoController = require('../controllers/verificacaoController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rotas privadas (todas requerem autenticação)
router.post('/documentos',
  auth,
  upload.fields([
    { name: 'identidade', maxCount: 1 },
    { name: 'comprovante', maxCount: 1 }
  ]),
  verificacaoController.enviarDocumentos
);

router.get('/documentos/:userId',
  auth,
  verificacaoController.buscarDocumentos
);

router.put('/documentos/:documentoId/aprovar',
  auth,
  verificacaoController.aprovarDocumento
);

router.put('/documentos/:documentoId/rejeitar',
  auth,
  verificacaoController.rejeitarDocumento
);

router.get('/status/:userId',
  auth,
  verificacaoController.verificarStatus
);

module.exports = router;