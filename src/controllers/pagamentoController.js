const Pagamento = require('../models/Pagamento');
const Servico = require('../models/Servico');
const Proposta = require('../models/Proposta');
const Cliente = require('../models/Cliente');
const Prestador = require('../models/Prestador');
const { StatusServico, StatusPagamento } = require('../utils/enums');
const pagamentoService = require('../services/pagamentoService');
const notificacaoService = require('../services/notificacaoService');

// @desc    Iniciar pagamento (escrow)
// @route   POST /api/pagamentos/escrow
// @access  Private (Cliente)
exports.iniciarPagamento = async (req, res) => {
  try {
    const {
      servicoId,
      metodoPagamento,
      detalhes
    } = req.body;

    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente) {
      return res.status(403).json({ message: 'Apenas clientes podem realizar pagamentos' });
    }

    const servico = await Servico.findById(servicoId)
      .populate('prestador')
      .populate({
        path: 'propostas',
        match: { status: 'aceita' }
      });

    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    if (servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    if (!servico.prestador || servico.propostas.length === 0) {
      return res.status(400).json({ message: 'Nenhuma proposta aceita para este serviço' });
    }

    const propostaAceita = servico.propostas[0];
    const valorTotal = propostaAceita.valor;

    // Calcular taxa do serviço (exemplo: 10%)
    const taxaServico = valorTotal * 0.10;

    // Criar pagamento em escrow
    const pagamento = new Pagamento({
      servico: servicoId,
      cliente: cliente._id,
      prestador: servico.prestador._id,
      valor: valorTotal,
      metodoPagamento: {
        tipo: metodoPagamento,
        detalhes
      },
      taxaServico
    });

    // Processar pagamento através do serviço de pagamento
    const resultado = await pagamentoService.processarPagamento({
      pagamento,
      metodoPagamento,
      detalhes
    });

    if (resultado.success) {
      pagamento.status = StatusPagamento.PROCESSANDO;
      pagamento.transacaoId = resultado.transacaoId;
      await pagamento.save();

      // Atualizar status do serviço
      servico.status = StatusServico.EM_ANDAMENTO;
      await servico.save();

      // Notificar prestador
      await notificacaoService.criarNotificacao({
        destinatario: servico.prestador.usuario,
        tipo: 'pagamento_recebido',
        titulo: 'Pagamento em processamento',
        mensagem: `O pagamento para o serviço "${servico.titulo}" está sendo processado`,
        dadosAdicionais: { 
          servicoId: servico._id,
          pagamentoId: pagamento._id
        }
      });

      res.json({
        message: 'Pagamento iniciado com sucesso',
        pagamento
      });
    } else {
      res.status(400).json({ message: 'Erro ao processar pagamento' });
    }

  } catch (error) {
    console.error('Erro ao iniciar pagamento:', error);
    res.status(500).json({ message: 'Erro ao iniciar pagamento' });
  }
};

// @desc    Confirmar conclusão e liberar pagamento
// @route   PUT /api/pagamentos/:id/liberar
// @access  Private (Cliente)
exports.liberarPagamento = async (req, res) => {
  try {
    const pagamento = await Pagamento.findById(req.params.id);
    if (!pagamento) {
      return res.status(404).json({ message: 'Pagamento não encontrado' });
    }

    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || pagamento.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    if (pagamento.status !== StatusPagamento.PROCESSANDO) {
      return res.status(400).json({ message: 'Este pagamento não pode ser liberado' });
    }

    // Liberar pagamento para o prestador
    const resultado = await pagamentoService.liberarPagamento(pagamento);

    if (resultado.success) {
      pagamento.status = StatusPagamento.CONCLUIDO;
      pagamento.dataProcessamento = new Date();
      await pagamento.save();

      const servico = await Servico.findById(pagamento.servico);
      servico.status = StatusServico.CONCLUIDO;
      servico.dataConclusao = new Date();
      await servico.save();

      // Notificar prestador
      await notificacaoService.criarNotificacao({
        destinatario: pagamento.prestador,
        tipo: 'pagamento_liberado',
        titulo: 'Pagamento liberado',
        mensagem: `O pagamento para o serviço "${servico.titulo}" foi liberado`,
        dadosAdicionais: { 
          servicoId: servico._id,
          pagamentoId: pagamento._id
        }
      });

      res.json({ message: 'Pagamento liberado com sucesso' });
    } else {
      res.status(400).json({ message: 'Erro ao liberar pagamento' });
    }

  } catch (error) {
    console.error('Erro ao liberar pagamento:', error);
    res.status(500).json({ message: 'Erro ao liberar pagamento' });
  }
};

// @desc    Solicitar reembolso
// @route   POST /api/pagamentos/:id/reembolso
// @access  Private (Cliente)
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
      valor: pagamento.valor
    });

    await reembolso.save();

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

// @desc    Obter histórico de pagamentos
// @route   GET /api/pagamentos
// @access  Private
exports.listarPagamentos = async (req, res) => {
  try {
    const { tipo } = req.query;
    const query = {};

    // Filtrar por tipo de usuário (cliente ou prestador)
    if (tipo === 'cliente') {
      const cliente = await Cliente.findOne({ usuario: req.user.id });
      if (cliente) {
        query.cliente = cliente._id;
      }
    } else if (tipo === 'prestador') {
      const prestador = await Prestador.findOne({ usuario: req.user.id });
      if (prestador) {
        query.prestador = prestador._id;
      }
    }

    const pagamentos = await Pagamento.find(query)
      .populate('servico', 'titulo')
      .populate('cliente', 'nome')
      .populate('prestador', 'nome')
      .sort({ dataPagamento: -1 });

    res.json(pagamentos);

  } catch (error) {
    console.error('Erro ao listar pagamentos:', error);
    res.status(500).json({ message: 'Erro ao listar pagamentos' });
  }
};