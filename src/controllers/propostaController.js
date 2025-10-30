const Proposta = require('../models/Proposta');
const Servico = require('../models/Servico');
const Prestador = require('../models/Prestador');
const Cliente = require('../models/Cliente');
const { StatusProposta, StatusServico } = require('../utils/enums');
const notificacaoService = require('../services/notificacaoService');

// @desc    Criar proposta para um serviço
// @route   POST /api/propostas
// @access  Private (Prestador)
exports.criarProposta = async (req, res) => {
  try {
    const prestador = await Prestador.findOne({ usuario: req.user.id });
    if (!prestador) {
      return res.status(403).json({ message: 'Apenas prestadores podem criar propostas' });
    }

    const { servicoId, valor, prazoEstimado, descricao, formaPagamento } = req.body;

    // Verificar se o serviço existe e está disponível
    const servico = await Servico.findById(servicoId);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    if (servico.status !== StatusServico.ABERTO) {
      return res.status(400).json({ message: 'Este serviço não está mais disponível para propostas' });
    }

    // Verificar se já existe uma proposta deste prestador
    const propostaExistente = await Proposta.findOne({
      servico: servicoId,
      prestador: prestador._id
    });

    if (propostaExistente) {
      return res.status(400).json({ message: 'Você já fez uma proposta para este serviço' });
    }

    const proposta = new Proposta({
      servico: servicoId,
      prestador: prestador._id,
      valor,
      prazoEstimado,
      descricao,
      formaPagamento
    });

    await proposta.save();

    // Atualizar status do serviço
    servico.status = StatusServico.EM_NEGOCIACAO;
    servico.propostas.push(proposta._id);
    await servico.save();

    // Notificar o cliente
    await notificacaoService.criarNotificacao({
      destinatario: servico.cliente,
      tipo: 'nova_proposta',
      titulo: 'Nova proposta recebida',
      mensagem: `Você recebeu uma nova proposta para o serviço "${servico.titulo}"`,
      dadosAdicionais: { 
        servicoId: servico._id,
        propostaId: proposta._id
      }
    });

    res.status(201).json(proposta);

  } catch (error) {
    console.error('Erro ao criar proposta:', error);
    res.status(500).json({ message: 'Erro ao criar proposta' });
  }
};

// @desc    Listar propostas de um serviço
// @route   GET /api/servicos/:servicoId/propostas
// @access  Private (Cliente dono do serviço)
exports.listarPropostas = async (req, res) => {
  try {
    const { servicoId } = req.params;

    const servico = await Servico.findById(servicoId);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o dono do serviço
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const propostas = await Proposta.find({ servico: servicoId })
      .populate('prestador', 'nome avaliacaoMedia')
      .sort({ dataEnvio: -1 });

    res.json(propostas);

  } catch (error) {
    console.error('Erro ao listar propostas:', error);
    res.status(500).json({ message: 'Erro ao listar propostas' });
  }
};

// @desc    Aceitar proposta
// @route   PUT /api/propostas/:id/aceitar
// @access  Private (Cliente dono do serviço)
exports.aceitarProposta = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id);
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    const servico = await Servico.findById(proposta.servico);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o dono do serviço
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Verificar se a proposta já foi aceita/recusada
    if (proposta.status !== StatusProposta.PENDENTE) {
      return res.status(400).json({ message: 'Esta proposta não está mais pendente' });
    }

    // Atualizar status da proposta
    proposta.status = StatusProposta.ACEITA;
    proposta.dataResposta = new Date();
    await proposta.save();

    // Atualizar serviço
    servico.status = StatusServico.CONFIRMADO;
    servico.prestador = proposta.prestador;
    await servico.save();

    // Recusar outras propostas
    await Proposta.updateMany(
      {
        servico: servico._id,
        _id: { $ne: proposta._id }
      },
      {
        status: StatusProposta.RECUSADA,
        dataResposta: new Date()
      }
    );

    // Notificar o prestador
    await notificacaoService.criarNotificacao({
      destinatario: servico.prestador,
      tipo: 'proposta_aceita',
      titulo: 'Proposta aceita',
      mensagem: `Sua proposta para o serviço "${servico.titulo}" foi aceita`,
      dadosAdicionais: { 
        servicoId: servico._id,
        propostaId: proposta._id
      }
    });

    res.json({ message: 'Proposta aceita com sucesso' });

  } catch (error) {
    console.error('Erro ao aceitar proposta:', error);
    res.status(500).json({ message: 'Erro ao aceitar proposta' });
  }
};

// @desc    Recusar proposta
// @route   PUT /api/propostas/:id/recusar
// @access  Private (Cliente dono do serviço)
exports.recusarProposta = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id);
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    const servico = await Servico.findById(proposta.servico);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o dono do serviço
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Verificar se a proposta está pendente
    if (proposta.status !== StatusProposta.PENDENTE) {
      return res.status(400).json({ message: 'Esta proposta não está mais pendente' });
    }

    proposta.status = StatusProposta.RECUSADA;
    proposta.dataResposta = new Date();
    await proposta.save();

    // Se não houver mais propostas pendentes, voltar status do serviço para aberto
    const propostasPendentes = await Proposta.countDocuments({
      servico: servico._id,
      status: StatusProposta.PENDENTE
    });

    if (propostasPendentes === 0) {
      servico.status = StatusServico.ABERTO;
      await servico.save();
    }

    // Notificar o prestador
    await notificacaoService.criarNotificacao({
      destinatario: proposta.prestador,
      tipo: 'proposta_recusada',
      titulo: 'Proposta recusada',
      mensagem: `Sua proposta para o serviço "${servico.titulo}" foi recusada`,
      dadosAdicionais: { 
        servicoId: servico._id,
        propostaId: proposta._id
      }
    });

    res.json({ message: 'Proposta recusada com sucesso' });

  } catch (error) {
    console.error('Erro ao recusar proposta:', error);
    res.status(500).json({ message: 'Erro ao recusar proposta' });
  }
};