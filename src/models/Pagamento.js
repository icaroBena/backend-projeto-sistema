const mongoose = require('mongoose');

const pagamentoSchema = new mongoose.Schema({
  servico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico',
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  prestador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestador',
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'processando', 'concluido', 'falhou', 'reembolsado'],
    default: 'pendente'
  },
  metodoPagamento: {
    tipo: {
      type: String,
      enum: ['cartao', 'pix', 'boleto'],
      required: true
    },
    detalhes: {
      ultimosDigitos: String,
      bandeira: String,
      codigoPix: String,
      codigoBoleto: String
    }
  },
  dataPagamento: Date,
  dataProcessamento: Date,
  comprovante: String,
  transacaoId: String,
  parcelamento: {
    numeroParcelas: Number,
    valorParcela: Number
  },
  taxaServico: Number,
  observacoes: String
});

// Índices para consultas frequentes
pagamentoSchema.index({ servico: 1, status: 1 });
pagamentoSchema.index({ cliente: 1, status: 1 });
pagamentoSchema.index({ prestador: 1, status: 1 });

const Pagamento = mongoose.model('Pagamento', pagamentoSchema);

module.exports = Pagamento;