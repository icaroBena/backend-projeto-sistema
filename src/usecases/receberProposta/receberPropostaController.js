/**
 * Controller: Receber Proposta
 * Caso de Uso: Prestador cria e envia proposta para um serviço
 */

const Proposta = require('../../models/Proposta');
const Servico = require('../../models/Servico');
const Prestador = require('../../models/Prestador');
const Cliente = require('../../models/Cliente');
const { PropostaStatus, ServicoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Criar proposta para um serviço
 * @route   POST /api/propostas
 * @access  Private (Prestador)
 */
exports.receberProposta = async (req, res) => {
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

    if (servico.status !== ServicoStatus.PENDENTE) {
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
      formaPagamento,
      status: PropostaStatus.PENDENTE
    });

    await proposta.save();

    // Atualizar status do serviço para EXECUÇÃO se não houver propostas
    if (!servico.propostas || servico.propostas.length === 0) {
      servico.status = ServicoStatus.EXECUÇÃO;
    }
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

/**
 * @desc    Listar propostas de um serviço
 * @route   GET /api/servicos/:servicoId/propostas
 * @access  Private (Cliente dono do serviço)
 */
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

/**
 * @desc    Buscar propostas por serviço
 * @route   GET /api/propostas/servico/:servicoId
 * @access  Private
 */
exports.buscarPropostasPorServico = async (req, res) => {
  try {
    const { servicoId } = req.params;
    const propostas = await Proposta.find({ servico: servicoId })
      .populate('prestador', 'nome avaliacaoMedia')
      .sort({ dataEnvio: -1 });

    res.json(propostas);
  } catch (error) {
    console.error('Erro ao buscar propostas do serviço:', error);
    res.status(500).json({ message: 'Erro ao buscar propostas do serviço' });
  }
};

/**
 * @desc    Buscar propostas por prestador
 * @route   GET /api/propostas/prestador/:prestadorId
 * @access  Private
 */
exports.buscarPropostasPrestador = async (req, res) => {
  try {
    const { prestadorId } = req.params;
    const propostas = await Proposta.find({ prestador: prestadorId })
      .populate('servico', 'titulo status')
      .sort({ dataEnvio: -1 });

    res.json(propostas);
  } catch (error) {
    console.error('Erro ao buscar propostas do prestador:', error);
    res.status(500).json({ message: 'Erro ao buscar propostas do prestador' });
  }
};

/**
 * @desc    Buscar propostas por cliente
 * @route   GET /api/propostas/cliente/:clienteId
 * @access  Private
 */
exports.buscarPropostasCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;
    const servicos = await Servico.find({ cliente: clienteId }).select('_id');
    const servicoIds = servicos.map(s => s._id);

    const propostas = await Proposta.find({ servico: { $in: servicoIds } })
      .populate('prestador', 'nome')
      .sort({ dataEnvio: -1 });

    res.json(propostas);
  } catch (error) {
    console.error('Erro ao buscar propostas do cliente:', error);
    res.status(500).json({ message: 'Erro ao buscar propostas do cliente' });
  }
};

/**
 * @desc    Buscar proposta por ID
 * @route   GET /api/propostas/:id
 * @access  Private
 */
exports.buscarPropostaPorId = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id)
      .populate('prestador', 'nome')
      .populate('servico', 'titulo status');
      
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    res.json(proposta);
  } catch (error) {
    console.error('Erro ao buscar proposta por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar proposta por ID' });
  }
};
