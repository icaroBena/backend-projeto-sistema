/**
 * Controller: Confirmar Proposta
 * Caso de Uso: Cliente aceita ou recusa uma proposta
 */

const Proposta = require('../../models/Proposta');
const Servico = require('../../models/Servico');
const Cliente = require('../../models/Cliente');
const { PropostaStatus, ServicoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Aceitar proposta
 * @route   PUT /api/propostas/:id/aceitar
 * @access  Private (Cliente dono do serviço)
 */
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
    if (proposta.status !== PropostaStatus.PENDENTE) {
      return res.status(400).json({ message: 'Esta proposta não está mais pendente' });
    }

    // Atualizar status da proposta
    proposta.status = PropostaStatus.ACEITA;
    proposta.dataResposta = new Date();
    await proposta.save();

    // Atualizar serviço
    servico.status = ServicoStatus.EXECUÇÃO;
    servico.prestador = proposta.prestador;
    await servico.save();

    // Recusar outras propostas
    await Proposta.updateMany(
      {
        servico: servico._id,
        _id: { $ne: proposta._id }
      },
      {
        status: PropostaStatus.RECUSADA,
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

/**
 * @desc    Recusar proposta
 * @route   PUT /api/propostas/:id/recusar
 * @access  Private (Cliente dono do serviço)
 */
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
    if (proposta.status !== PropostaStatus.PENDENTE) {
      return res.status(400).json({ message: 'Esta proposta não está mais pendente' });
    }

    proposta.status = PropostaStatus.RECUSADA;
    proposta.dataResposta = new Date();
    await proposta.save();

    // Se não houver mais propostas pendentes, voltar status do serviço para PENDENTE
    const propostasPendentes = await Proposta.countDocuments({
      servico: servico._id,
      status: PropostaStatus.PENDENTE
    });

    if (propostasPendentes === 0) {
      servico.status = ServicoStatus.PENDENTE;
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

/**
 * @desc    Cancelar proposta
 * @route   PUT /api/propostas/:id/cancelar
 * @access  Private
 */
exports.cancelarProposta = async (req, res) => {
  try {
    const proposta = await Proposta.findById(req.params.id);
    if (!proposta) {
      return res.status(404).json({ message: 'Proposta não encontrada' });
    }

    // Apenas propostas pendentes ou aceitas podem ser canceladas
    if (![PropostaStatus.PENDENTE, PropostaStatus.ACEITA].includes(proposta.status)) {
      return res.status(400).json({ message: 'Esta proposta não pode ser cancelada' });
    }

    const novoStatus = proposta.status === PropostaStatus.ACEITA 
      ? PropostaStatus.RECUSADA 
      : PropostaStatus.RECUSADA;
    
    proposta.status = novoStatus;
    await proposta.save();

    res.json({ message: 'Proposta cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar proposta:', error);
    res.status(500).json({ message: 'Erro ao cancelar proposta' });
  }
};
