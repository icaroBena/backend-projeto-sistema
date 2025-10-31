const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const auth = require('../middlewares/auth');
const { validate } = require('../middlewares/validateInput');

router.use(auth);

// Criar avaliação
router.post('/', validate('criarAvaliacao'), avaliacaoController.criar);

// Listar avaliações por serviço
router.get('/servico/:servicoId', avaliacaoController.listarPorServico);

// Listar avaliações por usuário
router.get('/usuario/:userId', avaliacaoController.listarPorUsuario);

// Editar avaliação
router.put('/:id', validate('editarAvaliacao'), avaliacaoController.editar);

// Excluir avaliação
router.delete('/:id', avaliacaoController.excluir);

module.exports = router;