const mongoose = require('mongoose');

const notificacaoSchema = new mongoose.Schema({
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: [
      'nova_proposta',
      'proposta_aceita',
      'proposta_recusada',
      'servico_iniciado',
      'servico_concluido',
      'nova_avaliacao',
      'pagamento_recebido',
      'documento_verificado',
      'mensagem_recebida'
    ],
    required: true
  },
  titulo: {
    type: String,
    required: true
  },
  mensagem: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  },
  lida: {
    type: Boolean,
    default: false
  },
  dataLeitura: Date,
  link: String,
  dadosAdicionais: {
    servicoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Servico'
    },
    propostaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposta'
    },
    pagamentoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pagamento'
    }
  }
});

// Índices para consultas frequentes
notificacaoSchema.index({ destinatario: 1, lida: 1 });
notificacaoSchema.index({ data: -1 });

const Notificacao = mongoose.model('Notificacao', notificacaoSchema);

module.exports = Notificacao;