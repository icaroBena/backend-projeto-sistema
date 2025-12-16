/**
 * Service: Finalizar Serviço
 * Regras para finalizar, cancelar e aprovar serviços
 */

const Servico = require('../../models/Servico');
const { ServicoStatus } = require('../../utils/systemEnums');

class FinalizarServicoService {
  static async cancelarServico(servicoId) {
    const servico = await Servico.findById(servicoId);
    if (!servico) throw new Error('Serviço não encontrado');

    if (![ServicoStatus.PENDENTE, ServicoStatus.EXECUÇÃO].includes(servico.status)) throw new Error('Não é possível cancelar este serviço');

    servico.status = ServicoStatus.CONCLUÍDO;
    await servico.save();
    return servico;
  }

  static async finalizarServico(servicoId, prestadorId) {
    const servico = await Servico.findById(servicoId);
    if (!servico) throw new Error('Serviço não encontrado');

    if (servico.status !== ServicoStatus.EXECUÇÃO) throw new Error('Apenas serviços em execução podem ser finalizados');

    servico.status = ServicoStatus.CONCLUÍDO;
    servico.dataConclusao = new Date();
    await servico.save();

    return servico;
  }

  static async aprovarServicoFinalizacao(servicoId) {
    const servico = await Servico.findById(servicoId);
    if (!servico) throw new Error('Serviço não encontrado');

    if (servico.status !== ServicoStatus.CONCLUÍDO) throw new Error('Apenas serviços concluídos podem ser aprovados');

    servico.status = ServicoStatus.APROVADO;
    servico.dataAprovacao = new Date();
    await servico.save();

    return servico;
  }
}

module.exports = FinalizarServicoService;
