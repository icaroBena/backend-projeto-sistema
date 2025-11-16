/**
 * Service: Receber Proposta
 * Lógica relacionada à criação e consulta de propostas
 */

const Proposta = require('../../models/Proposta');
const Servico = require('../../models/Servico');
const { PropostaStatus, ServicoStatus } = require('../../utils/systemEnums');

class ReceberPropostaService {
  static async receberProposta(dados) {
    const proposta = new Proposta(dados);
    await proposta.save();

    const servico = await Servico.findById(dados.servico);
    if (servico) {
      if (!servico.propostas || servico.propostas.length === 0) {
        servico.status = ServicoStatus.EXECUÇÃO;
      }
      servico.propostas = servico.propostas || [];
      servico.propostas.push(proposta._id);
      await servico.save();
    }

    return proposta;
  }

  static async listarPropostasServico(servicoId) {
    return Proposta.find({ servico: servicoId }).sort({ dataEnvio: -1 });
  }

  static async buscarPropostasPrestador(prestadorId) {
    return Proposta.find({ prestador: prestadorId }).sort({ dataEnvio: -1 });
  }

  static async buscarPropostasCliente(clienteId) {
    const servicos = await Servico.find({ cliente: clienteId }).select('_id');
    const servicoIds = servicos.map(s => s._id);
    return Proposta.find({ servico: { $in: servicoIds } }).sort({ dataEnvio: -1 });
  }

  static async buscarPropostaPorId(id) {
    return Proposta.findById(id);
  }
}

module.exports = ReceberPropostaService;
