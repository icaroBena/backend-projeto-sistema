const mongoose = require('mongoose');
const { DiaSemana, PrestadorStatus } = require('../utils/systemEnums');

const prestadorSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categorias: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria'
  }],
  descricao: {
    type: String,
    required: true
  },
  experiencia: {
    type: String,
    required: true
  },
  portfolio: [{
    titulo: String,
    descricao: String,
    imagens: [String],
    link: String
  }],
  documentosVerificados: {
    type: Boolean,
    default: false
  },
  avaliacaoMedia: {
    type: Number,
    default: 0
  },
  numeroAvaliacoes: {
    type: Number,
    default: 0
  },
  servicosRealizados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico'
  }],
  disponibilidade: {
    diasSemana: [{
      type: String,
      enum: Object.values(DiaSemana)
    }],
    horarios: {
      inicio: String,
      fim: String
    }
  },
  statusVerificacao: {
    type: String,
    enum: Object.values(PrestadorStatus),
    default: PrestadorStatus.PENDENTE
  }
});

const Prestador = mongoose.model('Prestador', prestadorSchema);

module.exports = Prestador;