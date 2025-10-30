const mongoose = require('mongoose');

const categoriaSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    unique: true
  },
  descricao: {
    type: String,
    required: true
  },
  icone: String,
  status: {
    type: String,
    enum: ['ativa', 'inativa'],
    default: 'ativa'
  },
  subCategorias: [{
    nome: String,
    descricao: String,
    status: {
      type: String,
      enum: ['ativa', 'inativa'],
      default: 'ativa'
    }
  }]
});

const Categoria = mongoose.model('Categoria', categoriaSchema);

module.exports = Categoria;