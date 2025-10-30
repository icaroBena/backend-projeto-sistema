const mongoose = require('mongoose');

const propostaSchema = new mongoose.Schema({
  servico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico',
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
  prazoEstimado: {
    type: Number, // em dias
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'aceita', 'recusada', 'cancelada'],
    default: 'pendente'
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  },
  dataResposta: Date,
  condicoesEspeciais: String,
  formaPagamento: {
    type: String,
    enum: ['integral', 'parcelado'],
    required: true
  },
  garantia: String,
  observacoes: String
});

const Proposta = mongoose.model('Proposta', propostaSchema);

module.exports = Proposta;