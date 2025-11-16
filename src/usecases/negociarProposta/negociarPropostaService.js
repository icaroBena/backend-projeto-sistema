/**
 * Service: Negociar Proposta
 * Regras de negociação entre cliente e prestador
 */

const Proposta = require('../../models/Proposta');
const { PropostaStatus } = require('../../utils/systemEnums');

class NegociarPropostaService {
  static async renegociarProposta(propostaId, dados) {
    const proposta = await Proposta.findById(propostaId);
    if (!proposta) throw new Error('Proposta não encontrada');

    if (proposta.status !== PropostaStatus.PENDENTE) throw new Error('Apenas propostas pendentes podem ser renegociadas');

    if (dados.novoValor) proposta.valor = dados.novoValor;
    if (dados.novosPrazo) proposta.prazoEstimado = dados.novosPrazo;
    if (dados.observacoes) proposta.observacoesNegociacao = dados.observacoes;

    proposta.emNegociacao = true;
    proposta.dataUltimaNegociacao = new Date();
    await proposta.save();

    return proposta;
  }

  static async finalizarNegociacao(propostaId) {
    const proposta = await Proposta.findById(propostaId);
    if (!proposta) throw new Error('Proposta não encontrada');

    proposta.emNegociacao = false;
    await proposta.save();

    return proposta;
  }

  static async listarPropostasEmNegociacao(query) {
    return Proposta.find(query);
  }
}

module.exports = NegociarPropostaService;
