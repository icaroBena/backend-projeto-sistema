/**
 * Controller: Reembolso
 * Caso de Uso: Cliente solicita reembolso de pagamento
 */

const Pagamento = require('../../models/Pagamento');
const Reembolso = require('../../models/Reembolso');
const Cliente = require('../../models/Cliente');
const { PagamentoStatus, ReembolsoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Solicitar reembolso
 * @route   POST /api/pagamentos/:id/reembolso
 * @access  Private (Cliente)
 */
exports.solicitarReembolso = async (req, res) => {
  try {
    const pagamento = await Pagamento.findById(req.params.id);
    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || pagamento.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const { motivo } = req.body;
    if (!motivo) {
      return res.status(400).json({ message: 'Motivo do reembolso é obrigatório' });
    }

    // Verificar se já existe um reembolso para este pagamento
    const reembolsoExistente = await Reembolso.findOne({ pagamento: pagamento._id });
    if (reembolsoExistente) {
      return res.status(400).json({ message: 'Já existe uma solicitação de reembolso para este pagamento' });
    }

    const reembolso = new Reembolso({
      pagamento: pagamento._id,
      servico: pagamento.servico,
      solicitante: req.user.id,
      motivo,
      valor: pagamento.valor,
      status: ReembolsoStatus.PENDENTE
    });

    await reembolso.save();

    // Atualizar status do pagamento
    pagamento.status = PagamentoStatus.EM_ANALISE;
    await pagamento.save();

    // Notificar administrador
    await notificacaoService.criarNotificacao({
      tipo: 'reembolso_solicitado',
      titulo: 'Nova solicitação de reembolso',
      mensagem: `Nova solicitação de reembolso para o pagamento #${pagamento._id}`,
      dadosAdicionais: { 
        pagamentoId: pagamento._id,
        reembolsoId: reembolso._id
      }
    });

    res.status(201).json({
      message: 'Solicitação de reembolso criada com sucesso',
      reembolso
    });

  } catch (error) {
    console.error('Erro ao solicitar reembolso:', error);
    res.status(500).json({ message: 'Erro ao solicitar reembolso' });
  }
};

/**
 * @desc    Obter reembolsos de um pagamento
 * @route   GET /api/reembolsos/pagamento/:pagamentoId
 * @access  Private
 */
exports.obterReembolsosPagamento = async (req, res) => {
  try {
    const { pagamentoId } = req.params;

    const reembolsos = await Reembolso.find({ pagamento: pagamentoId })
      .populate('pagamento')
      .populate('solicitante', 'nome email')
      .sort({ dataSolicitacao: -1 });

    res.json(reembolsos);

  } catch (error) {
    console.error('Erro ao obter reembolsos:', error);
    res.status(500).json({ message: 'Erro ao obter reembolsos' });
  }
};

/**
 * @desc    Listar todos os reembolsos
 * @route   GET /api/reembolsos
 * @access  Private (Admin)
 */
exports.listarReembolsos = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const reembolsos = await Reembolso.find(query)
      .populate('pagamento')
      .populate('solicitante', 'nome email')
      .sort({ dataSolicitacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Reembolso.countDocuments(query);

    res.json({
      reembolsos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });

  } catch (error) {
    console.error('Erro ao listar reembolsos:', error);
    res.status(500).json({ message: 'Erro ao listar reembolsos' });
  }
};

/**
 * @desc    Aprovar reembolso
 * @route   PUT /api/reembolsos/:id/aprovar
 * @access  Private (Admin)
 */
exports.aprovarReembolso = async (req, res) => {
  try {
    const reembolso = await Reembolso.findById(req.params.id)
      .populate('pagamento')
      .populate('solicitante');

    if (!reembolso) {
      return res.status(404).json({ message: 'Reembolso não encontrado' });
    }

    if (reembolso.status !== ReembolsoStatus.PENDENTE) {
      return res.status(400).json({ message: 'Este reembolso já foi processado' });
    }

    reembolso.status = ReembolsoStatus.APROVADO;
    reembolso.dataAprovacao = new Date();
    await reembolso.save();

    // Atualizar status do pagamento
    const pagamento = await Pagamento.findById(reembolso.pagamento);
    pagamento.status = PagamentoStatus.REEMBOLSADO;
    await pagamento.save();

    // Notificar cliente
    await notificacaoService.criarNotificacao({
      destinatario: reembolso.solicitante._id,
      tipo: 'reembolso_aprovado',
      titulo: 'Reembolso aprovado',
      mensagem: `Seu pedido de reembolso no valor de R$ ${reembolso.valor.toFixed(2)} foi aprovado`,
      dadosAdicionais: { reembolsoId: reembolso._id }
    });

    res.json({ message: 'Reembolso aprovado com sucesso' });

  } catch (error) {
    console.error('Erro ao aprovar reembolso:', error);
    res.status(500).json({ message: 'Erro ao aprovar reembolso' });
  }
};

/**
 * @desc    Rejeitar reembolso
 * @route   PUT /api/reembolsos/:id/rejeitar
 * @access  Private (Admin)
 */
exports.rejeitarReembolso = async (req, res) => {
  try {
    const { motivo } = req.body;
    const reembolso = await Reembolso.findById(req.params.id)
      .populate('solicitante');

    if (!reembolso) {
      return res.status(404).json({ message: 'Reembolso não encontrado' });
    }

    if (reembolso.status !== ReembolsoStatus.PENDENTE) {
      return res.status(400).json({ message: 'Este reembolso já foi processado' });
    }

    reembolso.status = ReembolsoStatus.REJEITADO;
    reembolso.dataRejeicao = new Date();
    reembolso.motivoRejeicao = motivo || 'Motivo não especificado';
    await reembolso.save();

    // Atualizar status do pagamento
    const pagamento = await Pagamento.findById(reembolso.pagamento);
    pagamento.status = PagamentoStatus.APROVADO;
    await pagamento.save();

    // Notificar cliente
    await notificacaoService.criarNotificacao({
      destinatario: reembolso.solicitante._id,
      tipo: 'reembolso_rejeitado',
      titulo: 'Reembolso rejeitado',
      mensagem: `Seu pedido de reembolso foi rejeitado. Motivo: ${reembolso.motivoRejeicao}`,
      dadosAdicionais: { reembolsoId: reembolso._id }
    });

    res.json({ message: 'Reembolso rejeitado com sucesso' });

  } catch (error) {
    console.error('Erro ao rejeitar reembolso:', error);
    res.status(500).json({ message: 'Erro ao rejeitar reembolso' });
  }
};
