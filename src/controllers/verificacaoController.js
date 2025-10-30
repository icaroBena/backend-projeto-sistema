const Documento = require('../models/Documentos');
const Prestador = require('../models/Prestador');
const User = require('../models/User');
const upload = require('../middlewares/upload');
const verificacaoService = require('../services/verificacaoService');
const notificacaoService = require('../services/notificacaoService');

// @desc    Enviar documento para verificação
// @route   POST /api/verificacao/documentos
// @access  Private (Prestador)
exports.enviarDocumento = async (req, res) => {
  try {
    const prestador = await Prestador.findOne({ usuario: req.user.id });
    if (!prestador) {
      return res.status(403).json({ message: 'Apenas prestadores podem enviar documentos' });
    }

    const {
      tipo,
      numeroDocumento,
      orgaoEmissor,
      dataEmissao
    } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhum arquivo enviado' });
    }

    // Verificar se já existe documento do mesmo tipo pendente
    const documentoExistente = await Documento.findOne({
      usuario: req.user.id,
      tipo,
      status: { $in: ['pendente', 'em_analise'] }
    });

    if (documentoExistente) {
      return res.status(400).json({ 
        message: 'Já existe um documento deste tipo em análise' 
      });
    }

    const documento = new Documento({
      usuario: req.user.id,
      tipo,
      arquivo: {
        nome: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        mimetype: req.file.mimetype,
        tamanho: req.file.size
      },
      metadata: {
        numeroDocumento,
        orgaoEmissor,
        dataEmissao: new Date(dataEmissao)
      }
    });

    await documento.save();

    // Notificar administradores
    await notificacaoService.notificarAdministradores({
      tipo: 'novo_documento',
      titulo: 'Novo documento para verificação',
      mensagem: `Novo documento ${tipo} enviado por prestador para verificação`,
      dadosAdicionais: { documentoId: documento._id }
    });

    res.status(201).json(documento);

  } catch (error) {
    console.error('Erro ao enviar documento:', error);
    res.status(500).json({ message: 'Erro ao enviar documento' });
  }
};

// @desc    Analisar documento
// @route   PUT /api/verificacao/documentos/:id
// @access  Private (Admin)
exports.analisarDocumento = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.tipo !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem analisar documentos' });
    }

    const documento = await Documento.findById(req.params.id);
    if (!documento) {
      return res.status(404).json({ message: 'Documento não encontrado' });
    }

    const { status, observacoes } = req.body;

    documento.status = status;
    documento.observacoes = observacoes;
    documento.verificadoPor = req.user.id;
    documento.dataVerificacao = new Date();

    await documento.save();

    // Se todos os documentos necessários foram aprovados, atualizar status do prestador
    if (status === 'aprovado') {
      await verificacaoService.verificarStatusPrestador(documento.usuario);
    }

    // Notificar usuário
    await notificacaoService.criarNotificacao({
      destinatario: documento.usuario,
      tipo: 'documento_verificado',
      titulo: 'Documento verificado',
      mensagem: `Seu documento ${documento.tipo} foi ${status}`,
      dadosAdicionais: { documentoId: documento._id }
    });

    res.json(documento);

  } catch (error) {
    console.error('Erro ao analisar documento:', error);
    res.status(500).json({ message: 'Erro ao analisar documento' });
  }
};

// @desc    Listar documentos do usuário
// @route   GET /api/verificacao/documentos
// @access  Private
exports.listarDocumentos = async (req, res) => {
  try {
    const documentos = await Documento.find({ usuario: req.user.id })
      .sort({ dataEnvio: -1 });

    res.json(documentos);

  } catch (error) {
    console.error('Erro ao listar documentos:', error);
    res.status(500).json({ message: 'Erro ao listar documentos' });
  }
};

// @desc    Listar documentos pendentes
// @route   GET /api/verificacao/documentos/pendentes
// @access  Private (Admin)
exports.listarDocumentosPendentes = async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin || admin.tipo !== 'admin') {
      return res.status(403).json({ message: 'Apenas administradores podem ver documentos pendentes' });
    }

    const documentos = await Documento.find({ 
      status: { $in: ['pendente', 'em_analise'] } 
    })
      .populate('usuario', 'nome email')
      .sort({ dataEnvio: 1 });

    res.json(documentos);

  } catch (error) {
    console.error('Erro ao listar documentos pendentes:', error);
    res.status(500).json({ message: 'Erro ao listar documentos pendentes' });
  }
};

// @desc    Verificar status de verificação do prestador
// @route   GET /api/verificacao/status
// @access  Private (Prestador)
exports.verificarStatus = async (req, res) => {
  try {
    const prestador = await Prestador.findOne({ usuario: req.user.id });
    if (!prestador) {
      return res.status(403).json({ message: 'Apenas prestadores podem verificar status' });
    }

    const status = await verificacaoService.obterStatusVerificacao(req.user.id);

    res.json({
      status: status.status,
      documentosNecessarios: status.documentosNecessarios,
      documentosAprovados: status.documentosAprovados,
      documentosPendentes: status.documentosPendentes
    });

  } catch (error) {
    console.error('Erro ao verificar status:', error);
    res.status(500).json({ message: 'Erro ao verificar status' });
  }
};