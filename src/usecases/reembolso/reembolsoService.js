/**
 * Service: Reembolso
 * Regras para solicitar, aprovar e rejeitar reembolsos
 */

const Reembolso = require('../../models/Reembolso');
const Pagamento = require('../../models/Pagamento');
const { ReembolsoStatus, PagamentoStatus } = require('../../utils/systemEnums');

class ReembolsoService {
  static async solicitarReembolso(pagamento, solicitanteId, motivo) {
    const reembolso = new Reembolso({
      pagamento: pagamento._id,
      servico: pagamento.servico,
      solicitante: solicitanteId,
      motivo,
      valor: pagamento.valor,
      status: ReembolsoStatus.PENDENTE
    });

    await reembolso.save();
    pagamento.status = PagamentoStatus.EM_ANALISE;
    await pagamento.save();

    return reembolso;
  }

  static async aprovarReembolso(reembolso) {
    if (reembolso.status !== ReembolsoStatus.PENDENTE) throw new Error('Reembolso já processado');
    reembolso.status = ReembolsoStatus.APROVADO;
    reembolso.dataAprovacao = new Date();
    await reembolso.save();

    const pagamento = await Pagamento.findById(reembolso.pagamento);
    pagamento.status = PagamentoStatus.REEMBOLSADO;
    await pagamento.save();

    return reembolso;
  }

  static async rejeitarReembolso(reembolso, motivo) {
    if (reembolso.status !== ReembolsoStatus.PENDENTE) throw new Error('Reembolso já processado');
    reembolso.status = ReembolsoStatus.REJEITADO;
    reembolso.dataRejeicao = new Date();
    reembolso.motivoRejeicao = motivo || 'Motivo não especificado';
    await reembolso.save();

    const pagamento = await Pagamento.findById(reembolso.pagamento);
    pagamento.status = PagamentoStatus.APROVADO;
    await pagamento.save();

    return reembolso;
  }
}

module.exports = ReembolsoService;
