/**
 * Controller: Finalizar Serviço
 * Caso de Uso: Cliente ou Prestador finaliza a execução do serviço
 */

const Servico = require('../../models/Servico');
const Cliente = require('../../models/Cliente');
const Prestador = require('../../models/Prestador');
const { ServicoStatus } = require('../../utils/systemEnums');
const notificacaoService = require('../../services/notificacaoService');

/**
 * @desc    Cancelar serviço
 * @route   PUT /api/servicos/:id/cancelar
 * @access  Private (Cliente dono ou Prestador contratado)
 */
exports.cancelarServico = async (req, res) => {
  try {
    const servico = await Servico.findById(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar autorização
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    const prestador = await Prestador.findOne({ usuario: req.user.id });

    const isCliente = cliente && servico.cliente.toString() === cliente._id.toString();
    const isPrestador = prestador && servico.prestador && 
                       servico.prestador.toString() === prestador._id.toString();

    if (!isCliente && !isPrestador) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Verificar se o serviço pode ser cancelado (apenas PENDENTE ou EXECUÇÃO)
    if (![ServicoStatus.PENDENTE, ServicoStatus.EXECUÇÃO].includes(servico.status)) {
      return res.status(400).json({ 
        message: 'Não é possível cancelar um serviço que já foi concluído ou aprovado' 
      });
    }

    // Mudar para CONCLUÍDO (cancelado) em vez de criar um novo status
    servico.status = ServicoStatus.CONCLUÍDO;
    await servico.save();

    // Notificar as partes envolvidas
    if (isCliente && servico.prestador) {
      await notificacaoService.criarNotificacao({
        destinatario: servico.prestador,
        tipo: 'servico_cancelado',
        titulo: 'Serviço cancelado pelo cliente',
        mensagem: `O serviço "${servico.titulo}" foi cancelado pelo cliente`,
        dadosAdicionais: { servicoId: servico._id }
      });
    } else if (isPrestador) {
      await notificacaoService.criarNotificacao({
        destinatario: servico.cliente,
        tipo: 'servico_cancelado',
        titulo: 'Serviço cancelado pelo prestador',
        mensagem: `O serviço "${servico.titulo}" foi cancelado pelo prestador`,
        dadosAdicionais: { servicoId: servico._id }
      });
    }

    res.json({ message: 'Serviço cancelado com sucesso' });

  } catch (error) {
    console.error('Erro ao cancelar serviço:', error);
    res.status(500).json({ message: 'Erro ao cancelar serviço' });
  }
};

/**
 * @desc    Marcar serviço como concluído
 * @route   PUT /api/servicos/:id/finalizar
 * @access  Private (Prestador contratado)
 */
exports.finalizarServico = async (req, res) => {
  try {
    const servico = await Servico.findById(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o prestador contratado
    const prestador = await Prestador.findOne({ usuario: req.user.id });
    if (!prestador || !servico.prestador || servico.prestador.toString() !== prestador._id.toString()) {
      return res.status(403).json({ message: 'Apenas o prestador contratado pode finalizar o serviço' });
    }

    // Verificar status do serviço
    if (servico.status !== ServicoStatus.EXECUÇÃO) {
      return res.status(400).json({ 
        message: 'Apenas serviços em execução podem ser finalizados' 
      });
    }

    servico.status = ServicoStatus.CONCLUÍDO;
    servico.dataConclusao = new Date();
    await servico.save();

    // Notificar o cliente
    await notificacaoService.criarNotificacao({
      destinatario: servico.cliente,
      tipo: 'servico_concluido',
      titulo: 'Serviço concluído',
      mensagem: `O serviço "${servico.titulo}" foi concluído pelo prestador. Favor avaliar.`,
      dadosAdicionais: { servicoId: servico._id }
    });

    res.json({ message: 'Serviço finalizado com sucesso' });

  } catch (error) {
    console.error('Erro ao finalizar serviço:', error);
    res.status(500).json({ message: 'Erro ao finalizar serviço' });
  }
};

/**
 * @desc    Aprovar conclusão de serviço
 * @route   PUT /api/servicos/:id/aprovar
 * @access  Private (Cliente dono do serviço)
 */
exports.aprovarServicoFinalizacao = async (req, res) => {
  try {
    const servico = await Servico.findById(req.params.id);
    if (!servico) {
      return res.status(404).json({ message: 'Serviço não encontrado' });
    }

    // Verificar se é o cliente dono
    const cliente = await Cliente.findOne({ usuario: req.user.id });
    if (!cliente || servico.cliente.toString() !== cliente._id.toString()) {
      return res.status(403).json({ message: 'Apenas o cliente pode aprovar a conclusão' });
    }

    // Verificar status do serviço
    if (servico.status !== ServicoStatus.CONCLUÍDO) {
      return res.status(400).json({ 
        message: 'Apenas serviços concluídos podem ser aprovados' 
      });
    }

    servico.status = ServicoStatus.APROVADO;
    servico.dataAprovacao = new Date();
    await servico.save();

    // Notificar o prestador
    await notificacaoService.criarNotificacao({
      destinatario: servico.prestador,
      tipo: 'servico_aprovado',
      titulo: 'Serviço aprovado',
      mensagem: `Seu serviço "${servico.titulo}" foi aprovado pelo cliente`,
      dadosAdicionais: { servicoId: servico._id }
    });

    res.json({ message: 'Serviço aprovado com sucesso' });

  } catch (error) {
    console.error('Erro ao aprovar serviço:', error);
    res.status(500).json({ message: 'Erro ao aprovar serviço' });
  }
};
