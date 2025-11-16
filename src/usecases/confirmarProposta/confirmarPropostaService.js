/**
 * Service: Confirmar Proposta
 * Responsável por regras de negócio relacionadas à confirmação de propostas
 */

const Proposta = require('../../models/Proposta');
const Servico = require('../../models/Servico');
const { PropostaStatus, ServicoStatus } = require('../../utils/systemEnums');

class ConfirmarPropostaService {
  static async aceitarProposta(propostaId, usuarioId) {
    // Implementação de negócio reutilizável (chamada pelo controller)
    const proposta = await Proposta.findById(propostaId);
    if (!proposta) throw new Error('Proposta não encontrada');

    const servico = await Servico.findById(proposta.servico);
    if (!servico) throw new Error('Serviço não encontrado');

    if (proposta.status !== PropostaStatus.PENDENTE) throw new Error('Proposta não pendente');

    proposta.status = PropostaStatus.ACEITA;
    proposta.dataResposta = new Date();
    await proposta.save();

    servico.status = ServicoStatus.EXECUÇÃO;
    servico.prestador = proposta.prestador;
    await servico.save();

    await Proposta.updateMany({ servico: servico._id, _id: { $ne: proposta._id } }, { status: PropostaStatus.RECUSADA, dataResposta: new Date() });

    return { proposta, servico };
  }

  static async recusarProposta(propostaId) {
    const proposta = await Proposta.findById(propostaId);
    if (!proposta) throw new Error('Proposta não encontrada');

    if (proposta.status !== PropostaStatus.PENDENTE) throw new Error('Proposta não pendente');

    proposta.status = PropostaStatus.RECUSADA;
    proposta.dataResposta = new Date();
    await proposta.save();

    return proposta;
  }

  static async cancelarProposta(propostaId) {
    const proposta = await Proposta.findById(propostaId);
    if (!proposta) throw new Error('Proposta não encontrada');

    if (![PropostaStatus.PENDENTE, PropostaStatus.ACEITA].includes(proposta.status)) throw new Error('Esta proposta não pode ser cancelada');

    proposta.status = PropostaStatus.RECUSADA;
    await proposta.save();

    return proposta;
  }
}

module.exports = ConfirmarPropostaService;
