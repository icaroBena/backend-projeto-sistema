const mongoose = require('mongoose');
const { PropostaStatus } = require('../utils/systemEnums');

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
    type: Number,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(PropostaStatus),
    default: PropostaStatus.PENDENTE
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
  observacoes: String,
  // Campos para negociação
  emNegociacao: {
    type: Boolean,
    default: false
  },
  dataUltimaNegociacao: Date,
  observacoesNegociacao: String
});

const Proposta = mongoose.model('Proposta', propostaSchema);

module.exports = Proposta;