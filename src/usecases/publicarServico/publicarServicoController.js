/**
 * Controller: Publicar Serviço
 * Caso de Uso: Cliente cria e publica um novo serviço
 */

const Servico = require('../../models/Servico');
const Cliente = require('../../models/Cliente');
const Prestador = require('../../models/Prestador');
const Categoria = require('../../models/Categoria');
const { ServicoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Criar novo serviço (publicar)
 * @route   POST /api/servicos
 * @access  Private (Cliente)
 */
exports.publicarServico = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente) {
      return res.status(403).json({ message: 'Apenas clientes podem criar serviços' });
    }

    const {
      titulo,
      descricao,
      categoriaId,
      orcamentoEstimado,
      localServico
    } = req.body;

    // Verificar se categoria existe
    const categoria = await Categoria.findById(categoriaId);
    if (!categoria) {
      return res.status(404).json({ message: 'Categoria não encontrada' });
    }

    const servico = new Servico({
      titulo,
      descricao,
      categoria: categoriaId,
      cliente: cliente._id,
      orcamentoEstimado,
      localServico,
      status: ServicoStatus.PENDENTE
    });

    await servico.save();

    // Notificar prestadores da categoria
    const prestadores = await Prestador.find({ categorias: categoriaId });
    for (const prestador of prestadores) {
      await notificacaoService.criarNotificacao({
        destinatario: prestador.usuario,
        tipo: 'novo_servico',
        titulo: 'Novo serviço disponível',
        mensagem: `Novo serviço em ${categoria.nome}: ${titulo}`,
        dadosAdicionais: { servicoId: servico._id }
      });
    }

    res.status(201).json(servico);

  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({ message: 'Erro ao criar serviço' });
  }
};

/**
 * @desc    Buscar serviços (com filtros)
 * @route   GET /api/servicos
 * @access  Public
 */
exports.buscarServicos = async (req, res) => {
  try {
    const {
      categoria,
      localidade,
      precoMin,
      precoMax,
      status,
      busca,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (categoria) query.categoria = categoria;
    if (status) query.status = status;
    if (localidade) {
      query['localServico.endereco.cidade'] = new RegExp(localidade, 'i');
    }
    if (precoMin || precoMax) {
      query.orcamentoEstimado = {};
      if (precoMin) query.orcamentoEstimado.$gte = Number(precoMin);
      if (precoMax) query.orcamentoEstimado.$lte = Number(precoMax);
    }
    if (busca) {
      query.$or = [
        { titulo: new RegExp(busca, 'i') },
        { descricao: new RegExp(busca, 'i') }
      ];
    }

    const servicos = await Servico.find(query)
      .populate('categoria', 'nome')
      .populate('cliente', 'nome')
      .sort({ dataPublicacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Servico.countDocuments(query);

    res.json({
      servicos,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });

  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({ message: 'Erro ao buscar serviços' });
  }
};

/**
 * @desc    Buscar serviço por ID
 * @route   GET /api/servicos/:id
 * @access  Public
 */
exports.buscarServicoPorId = async (req, res) => {
  try {
    const servico = await Servico.findById(req.params.id)
      .populate('categoria', 'nome')
      .populate('cliente', 'nome')
      .populate('prestador', 'nome')
      .populate('propostas');

    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    res.json(servico);

  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({ message: 'Erro ao buscar serviço' });
  }
};

/**
 * @desc    Atualizar serviço
 * @route   PUT /api/servicos/:id
 * @access  Private (Cliente dono do serviço)
 */
exports.atualizarServico = async (req, res) => {
  try {
    const servico = await Servico.findById(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o dono do serviço
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Verificar se o serviço pode ser atualizado (apenas em PENDENTE)
    if (servico.status !== ServicoStatus.PENDENTE) {
      return res.status(400).json({ 
        message: 'Não é possível atualizar um serviço que já está em andamento ou concluído' 
      });
    }

    const {
      titulo,
      descricao,
      categoriaId,
      orcamentoEstimado,
      localServico
    } = req.body;

    if (categoriaId) {
      const categoria = await Categoria.findById(categoriaId);
      if (!categoria) {
        return res.status(404).json({ message: 'Categoria não encontrada' });
      }
      servico.categoria = categoriaId;
    }

    servico.titulo = titulo || servico.titulo;
    servico.descricao = descricao || servico.descricao;
    servico.orcamentoEstimado = orcamentoEstimado || servico.orcamentoEstimado;
    servico.localServico = localServico || servico.localServico;

    await servico.save();

    res.json(servico);

  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({ message: 'Erro ao atualizar serviço' });
  }
};
