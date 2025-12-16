/**
 * Service: Publicar Serviço
 * Regras de negócio relacionadas à publicação e atualização de serviços
 */

const Servico = require('../../models/Servico');
const Categoria = require('../../models/Categoria');
const { ServicoStatus } = require('../../utils/systemEnums');

class PublicarServicoService {
  static async publicarServico(dados) {
    const servico = new Servico(dados);
    servico.status = ServicoStatus.PENDENTE;
    await servico.save();
    return servico;
  }

  static async buscarServicos(query, page = 1, limit = 10) {
    return Servico.find(query)
      .populate('categoria', 'nome')
      .populate('cliente', 'nome')
      .sort({ dataPublicacao: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
  }

  static async buscarServicoPorId(id) {
    return Servico.findById(id).populate('categoria cliente prestador propostas');
  }

  static async atualizarServico(id, dados) {
    const servico = await Servico.findById(id);
    if (!servico) throw new Error('Serviço não encontrado');

    Object.assign(servico, dados);
    await servico.save();
    return servico;
  }
}

module.exports = PublicarServicoService;
