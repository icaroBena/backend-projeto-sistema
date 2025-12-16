const mongoose = require('mongoose');
const { ServicoStatus, TipoLocal } = require('../utils/systemEnums');

const servicoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  categoria: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  prestador: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestador'
  },
  status: {
    type: String,
    enum: Object.values(ServicoStatus),
    default: ServicoStatus.PENDENTE
  },
  orcamentoEstimado: {
    min: Number,
    max: Number
  },
  dataPublicacao: {
    type: Date,
    default: Date.now
  },
  dataConclusao: Date,
  dataAprovacao: Date,
  localServico: {
    tipo: {
      type: String,
      enum: Object.values(TipoLocal),
      required: true
    },
    endereco: {
      rua: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String
    }
  },
  propostas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposta'
  }],
  avaliacao: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avaliacao'
  },
  arquivos: [{
    nome: String,
    url: String,
    tipo: String
  }]
});

const Servico = mongoose.model('Servico', servicoSchema);

module.exports = Servico;