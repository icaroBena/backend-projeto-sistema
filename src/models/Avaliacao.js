const mongoose = require('mongoose');

const avaliacaoSchema = new mongoose.Schema({
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
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comentario: {
    type: String,
    required: true
  },
  aspectosAvaliados: {
    qualidade: {
      type: Number,
      min: 1,
      max: 5
    },
    pontualidade: {
      type: Number,
      min: 1,
      max: 5
    },
    comunicacao: {
      type: Number,
      min: 1,
      max: 5
    },
    profissionalismo: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  data: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pendente', 'publicada', 'removida'],
    default: 'pendente'
  },
  respostaPrestador: {
    comentario: String,
    data: Date
  }
});

const Avaliacao = mongoose.model('Avaliacao', avaliacaoSchema);

module.exports = Avaliacao;