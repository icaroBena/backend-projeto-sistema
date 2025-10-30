const logger = require('../utils/logger');
const Pagamento = require('../models/Pagamento');
const Proposta = require('../models/Proposta');
const emailService = require('./emailService');
const notificacaoService = require('./notificacaoService');

class PagamentoService {
  static async criarPagamento(propostaId, dadosPagamento) {
    try {
      const proposta = await Proposta.findById(propostaId)
        .populate('servico')
        .populate('prestador')
        .populate('cliente');

      if (!proposta) {
        throw new Error('Proposta não encontrada');
      }

      // RN09: Verificar status da proposta
      if (proposta.status !== 'aceita') {
        throw new Error('Pagamento só pode ser realizado para propostas aceitas');
      }

      // RN10: Verificar valor do pagamento
      if (dadosPagamento.valor !== proposta.valor) {
        throw new Error('Valor do pagamento não corresponde ao valor da proposta');
      }

      // Processar pagamento (integração com gateway de pagamento)
      const pagamentoProcessado = await this.processarPagamento(dadosPagamento);

      const pagamento = await Pagamento.create({
        proposta: propostaId,
        valor: dadosPagamento.valor,
        status: 'pendente',
        metodoPagamento: dadosPagamento.metodoPagamento,
        transacaoId: pagamentoProcessado.transacaoId
      });

      // Atualizar status da proposta
      await Proposta.findByIdAndUpdate(propostaId, {
        status: 'em_andamento',
        pagamento: pagamento._id
      });

      // Enviar confirmação por e-mail
      await emailService.enviarConfirmacaoPagamento(
        proposta.cliente.email,
        pagamento
      );

      // Criar notificação para o prestador
      await notificacaoService.criarNotificacao(
        proposta.prestador._id,
        'PAGAMENTO_RECEBIDO',
        `Pagamento de R$ ${pagamento.valor.toFixed(2)} recebido para o serviço "${proposta.servico.titulo}"`,
        pagamento._id
      );

      logger.info('Pagamento criado com sucesso', {
        pagamentoId: pagamento._id,
        propostaId,
        valor: pagamento.valor
      });

      return pagamento;
    } catch (error) {
      logger.error('Erro ao criar pagamento', {
        error: error.message,
        propostaId
      });
      throw error;
    }
  }

  static async processarPagamento(dadosPagamento) {
    // Simulação de processamento de pagamento
    // Aqui seria integrado com um gateway de pagamento real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sucesso: true,
          transacaoId: 'txn_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1000);
    });
  }

  static async liberarPagamento(pagamentoId) {
    try {
      const pagamento = await Pagamento.findById(pagamentoId)
        .populate({
          path: 'proposta',
          populate: {
            path: 'servico prestador'
          }
        });

      if (!pagamento) {
        throw new Error('Pagamento não encontrado');
      }

      // RN11: Verificar status do serviço
      if (pagamento.proposta.servico.status !== 'finalizado') {
        throw new Error('Pagamento só pode ser liberado após conclusão do serviço');
      }

      // RN12: Verificar avaliação
      if (!pagamento.proposta.avaliacao) {
        throw new Error('Pagamento só pode ser liberado após avaliação do serviço');
      }

      // Processar liberação do pagamento
      await this.processarLiberacaoPagamento(pagamento);

      pagamento.status = 'liberado';
      pagamento.dataLiberacao = new Date();
      await pagamento.save();

      // Criar notificação para o prestador
      await notificacaoService.criarNotificacao(
        pagamento.proposta.prestador._id,
        'PAGAMENTO_LIBERADO',
        `Pagamento de R$ ${pagamento.valor.toFixed(2)} foi liberado para sua conta`,
        pagamento._id
      );

      logger.info('Pagamento liberado com sucesso', {
        pagamentoId,
        valor: pagamento.valor
      });

      return pagamento;
    } catch (error) {
      logger.error('Erro ao liberar pagamento', {
        error: error.message,
        pagamentoId
      });
      throw error;
    }
  }

  static async processarLiberacaoPagamento(pagamento) {
    // Simulação de liberação de pagamento
    // Aqui seria integrado com um gateway de pagamento real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sucesso: true,
          transacaoId: 'transfer_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1000);
    });
  }

  static async estornarPagamento(pagamentoId, motivo) {
    try {
      const pagamento = await Pagamento.findById(pagamentoId)
        .populate({
          path: 'proposta',
          populate: {
            path: 'servico cliente prestador'
          }
        });

      if (!pagamento) {
        throw new Error('Pagamento não encontrado');
      }

      // RN13: Verificar se o pagamento pode ser estornado
      if (pagamento.status === 'estornado') {
        throw new Error('Pagamento já foi estornado');
      }

      if (pagamento.status === 'liberado') {
        throw new Error('Pagamento já foi liberado e não pode ser estornado');
      }

      // Processar estorno
      await this.processarEstorno(pagamento);

      pagamento.status = 'estornado';
      pagamento.motivoEstorno = motivo;
      pagamento.dataEstorno = new Date();
      await pagamento.save();

      // Atualizar status da proposta
      await Proposta.findByIdAndUpdate(pagamento.proposta._id, {
        status: 'cancelada'
      });

      // Notificar usuários
      await notificacaoService.criarNotificacao(
        pagamento.proposta.cliente._id,
        'PAGAMENTO_ESTORNADO',
        `O pagamento de R$ ${pagamento.valor.toFixed(2)} foi estornado`,
        pagamento._id
      );

      await notificacaoService.criarNotificacao(
        pagamento.proposta.prestador._id,
        'PAGAMENTO_ESTORNADO',
        `O pagamento de R$ ${pagamento.valor.toFixed(2)} foi estornado`,
        pagamento._id
      );

      logger.info('Pagamento estornado com sucesso', {
        pagamentoId,
        motivo
      });

      return pagamento;
    } catch (error) {
      logger.error('Erro ao estornar pagamento', {
        error: error.message,
        pagamentoId
      });
      throw error;
    }
  }

  static async processarEstorno(pagamento) {
    // Simulação de estorno
    // Aqui seria integrado com um gateway de pagamento real
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          sucesso: true,
          transacaoId: 'refund_' + Math.random().toString(36).substr(2, 9)
        });
      }, 1000);
    });
  }

  static async buscarPagamento(pagamentoId) {
    try {
      const pagamento = await Pagamento.findById(pagamentoId)
        .populate({
          path: 'proposta',
          populate: {
            path: 'servico cliente prestador'
          }
        });

      if (!pagamento) {
        throw new Error('Pagamento não encontrado');
      }

      return pagamento;
    } catch (error) {
      logger.error('Erro ao buscar pagamento', {
        error: error.message,
        pagamentoId
      });
      throw error;
    }
  }
}

module.exports = PagamentoService;