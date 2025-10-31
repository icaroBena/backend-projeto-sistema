const Avaliacao = require('../models/Avaliacao');
const Servico = require('../models/Servico');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

class AvaliacaoController {
  async criar(req, res) {
    try {
      const { servicoId, nota, comentario } = req.body;
      const avaliadorId = req.userId;

      // Verificar se o serviço existe e está concluído
      const servico = await Servico.findById(servicoId);
      if (!servico) {
        return errorResponse(res, 404, 'Serviço não encontrado');
      }
      if (servico.status !== 'concluido') {
        return errorResponse(res, 400, 'Só é possível avaliar serviços concluídos');
      }

      // Verificar se o usuário é parte do serviço
      if (!servico.cliente.equals(avaliadorId) && !servico.prestador.equals(avaliadorId)) {
        return errorResponse(res, 403, 'Você não tem permissão para avaliar este serviço');
      }

      // Determinar quem está sendo avaliado
      const avaliadorEhCliente = servico.cliente.equals(avaliadorId);
      const avaliadoId = avaliadorEhCliente ? servico.prestador : servico.cliente;

      // Verificar se já existe avaliação
      const avaliacaoExistente = await Avaliacao.findOne({
        servico: servicoId,
        avaliador: avaliadorId
      });

      if (avaliacaoExistente) {
        return errorResponse(res, 400, 'Você já avaliou este serviço');
      }

      // Criar avaliação
      const avaliacao = await Avaliacao.create({
        servico: servicoId,
        avaliador: avaliadorId,
        avaliado: avaliadoId,
        nota,
        comentario
      });

      // Atualizar média do usuário avaliado
      await this.atualizarMediaAvaliacoes(avaliadoId);

      return successResponse(res, 201, avaliacao);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao criar avaliação', error);
    }
  }

  async listarPorServico(req, res) {
    try {
      const { servicoId } = req.params;

      const avaliacoes = await Avaliacao.find({ servico: servicoId })
        .populate('avaliador', 'nome')
        .populate('avaliado', 'nome')
        .sort({ dataCriacao: -1 });

      return successResponse(res, 200, avaliacoes);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao listar avaliações', error);
    }
  }

  async listarPorUsuario(req, res) {
    try {
      const { userId } = req.params;
      const { tipo = 'recebidas' } = req.query;

      const query = tipo === 'recebidas' 
        ? { avaliado: userId }
        : { avaliador: userId };

      const avaliacoes = await Avaliacao.find(query)
        .populate('avaliador', 'nome')
        .populate('avaliado', 'nome')
        .populate('servico', 'titulo')
        .sort({ dataCriacao: -1 });

      return successResponse(res, 200, avaliacoes);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao listar avaliações', error);
    }
  }

  async editar(req, res) {
    try {
      const { id } = req.params;
      const { nota, comentario } = req.body;
      const userId = req.userId;

      const avaliacao = await Avaliacao.findById(id);
      if (!avaliacao) {
        return errorResponse(res, 404, 'Avaliação não encontrada');
      }

      // Verificar se o usuário é o autor da avaliação
      if (!avaliacao.avaliador.equals(userId)) {
        return errorResponse(res, 403, 'Você não tem permissão para editar esta avaliação');
      }

      // Verificar tempo limite para edição (24 horas)
      const horasDesdeAvaliacao = (Date.now() - avaliacao.dataCriacao) / (1000 * 60 * 60);
      if (horasDesdeAvaliacao > 24) {
        return errorResponse(res, 400, 'Período de edição expirado (24 horas)');
      }

      avaliacao.nota = nota;
      avaliacao.comentario = comentario;
      await avaliacao.save();

      // Atualizar média do usuário avaliado
      await this.atualizarMediaAvaliacoes(avaliacao.avaliado);

      return successResponse(res, 200, avaliacao);
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao editar avaliação', error);
    }
  }

  async excluir(req, res) {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const avaliacao = await Avaliacao.findById(id);
      if (!avaliacao) {
        return errorResponse(res, 404, 'Avaliação não encontrada');
      }

      // Verificar se o usuário é o autor da avaliação
      if (!avaliacao.avaliador.equals(userId)) {
        return errorResponse(res, 403, 'Você não tem permissão para excluir esta avaliação');
      }

      // Verificar tempo limite para exclusão (24 horas)
      const horasDesdeAvaliacao = (Date.now() - avaliacao.dataCriacao) / (1000 * 60 * 60);
      if (horasDesdeAvaliacao > 24) {
        return errorResponse(res, 400, 'Período de exclusão expirado (24 horas)');
      }

      await avaliacao.remove();

      // Atualizar média do usuário avaliado
      await this.atualizarMediaAvaliacoes(avaliacao.avaliado);

      return successResponse(res, 200, { message: 'Avaliação excluída com sucesso' });
    } catch (error) {
      return errorResponse(res, 500, 'Erro ao excluir avaliação', error);
    }
  }

  // Método auxiliar para atualizar média de avaliações do usuário
  async atualizarMediaAvaliacoes(userId) {
    const avaliacoes = await Avaliacao.find({ avaliado: userId });
    
    if (avaliacoes.length > 0) {
      const somaNotas = avaliacoes.reduce((sum, av) => sum + av.nota, 0);
      const media = somaNotas / avaliacoes.length;
      
      await User.findByIdAndUpdate(userId, {
        mediaAvaliacoes: Number(media.toFixed(1)),
        totalAvaliacoes: avaliacoes.length
      });
    }
  }
}

module.exports = new AvaliacaoController();