/**
 * Controller: Negociar Proposta
 * Caso de Uso: Permite negociação entre cliente e prestador (pode incluir contra-propostas, etc)
 * Nota: Atual implementação suporta aceitar/recusar e cancelar
 * Esta estrutura permite expansão para negociação de valores, prazos, etc
 */

const Proposta = require('../../models/Proposta');
const Servico = require('../../models/Servico');
const Cliente = require('../../models/Cliente');
const Prestador = require('../../models/Prestador');
const { PropostaStatus, ServicoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Solicitar renegociação de proposta
 * @route   PUT /api/propostas/:id/renegociar
 * @access  Private (Cliente ou Prestador)
 * @note    Estrutura preparada para futuro desenvolvimento de contra-propostas
 */
exports.renegociarProposta = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id);
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    const { novoValor, novosPrazo, observacoes } = req.body;
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    const prestador = await Prestador.findOne({ usuario: req.user.id });

    // Verificar autorização
    const podeRenegociar = (cliente && proposta.servico) || 
                          (prestador && proposta.prestador.toString() === prestador._id.toString());

    if (!podeRenegociar) {
      return res.status(403).json({ message: 'Não autorizado para renegociar esta proposta' });
    }

    // Apenas propostas pendentes podem ser renegociadas
    if (proposta.status !== PropostaStatus.PENDENTE) {
      return res.status(400).json({ message: 'Apenas propostas pendentes podem ser renegociadas' });
    }

    // Atualizar dados da proposta se fornecidos
    if (novoValor) proposta.valor = novoValor;
    if (novosPrazo) proposta.prazoEstimado = novosPrazo;
    if (observacoes) proposta.observacoesNegociacao = observacoes;

    proposta.emNegociacao = true;
    proposta.dataUltimaNegociacao = new Date();
    await proposta.save();

    // Notificar a outra parte
    if (cliente) {
      await notificacaoService.criarNotificacao({
        destinatario: proposta.prestador,
        tipo: 'proposta_renegociacao',
        titulo: 'Proposta em renegociação',
        mensagem: `O cliente solicitou renegociação para a proposta: ${observacoes || 'Sem detalhes'}`,
        dadosAdicionais: { propostaId: proposta._id }
      });
    } else if (prestador) {
      const servico = await Servico.findById(proposta.servico);
      await notificacaoService.criarNotificacao({
        destinatario: servico.cliente,
        tipo: 'proposta_renegociacao',
        titulo: 'Proposta em renegociação',
        mensagem: `O prestador solicitou renegociação: ${observacoes || 'Sem detalhes'}`,
        dadosAdicionais: { propostaId: proposta._id }
      });
    }

    res.json({ 
      message: 'Proposta enviada para renegociação',
      proposta 
    });

  } catch (error) {
    console.error('Erro ao renegociar proposta:', error);
    res.status(500).json({ message: 'Erro ao renegociar proposta' });
  }
};

/**
 * @desc    Finalizar renegociação
 * @route   PUT /api/propostas/:id/finalizarNegociacao
 * @access  Private (Cliente ou Prestador)
 */
exports.finalizarNegociacao = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id);
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    if (!proposta.emNegociacao) {
      return res.status(400).json({ message: 'Esta proposta não está em negociação' });
    }

    proposta.emNegociacao = false;
    await proposta.save();

    res.json({ 
      message: 'Negociação finalizada',
      proposta 
    });

  } catch (error) {
    console.error('Erro ao finalizar negociação:', error);
    res.status(500).json({ message: 'Erro ao finalizar negociação' });
  }
};

/**
 * @desc    Listar propostas em negociação
 * @route   GET /api/propostas/negociacao
 * @access  Private
 */
exports.listarPropostasEmNegociacao = async (req, res) => {
  try {
    const { tipo } = req.query;
    const query = { emNegociacao: true };

    if (tipo === 'cliente') {
      const cliente = await Cliente.findOne({ usuario: req.user.id });
      if (cliente) {
        const servicos = await Servico.find({ cliente: cliente._id }).select('_id');
        query.servico = { $in: servicos.map(s => s._id) };
      }
    } else if (tipo === 'prestador') {
      const prestador = await Prestador.findOne({ usuario: req.user.id });
      if (prestador) {
        query.prestador = prestador._id;
      }
    }

    const propostas = await Proposta.find(query)
      .populate('prestador', 'nome')
      .populate('servico', 'titulo')
      .sort({ dataUltimaNegociacao: -1 });

    res.json(propostas);

  } catch (error) {
    console.error('Erro ao listar propostas em negociação:', error);
    res.status(500).json({ message: 'Erro ao listar propostas em negociação' });
  }
};
