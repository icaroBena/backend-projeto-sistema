const mongoose = require('mongoose');

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
    enum: ['aberto', 'em_negociacao', 'confirmado', 'em_andamento', 'concluido', 'cancelado'],
    default: 'aberto'
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
  localServico: {
    tipo: {
      type: String,
      enum: ['presencial', 'remoto', 'hibrido'],
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