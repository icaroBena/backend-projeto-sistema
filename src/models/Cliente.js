const mongoose = require('mongoose');

const clienteSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  servicosSolicitados: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico'
  }],
  avaliacoesFeitas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Avaliacao'
  }],
  propostasRecebidas: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposta'
  }],
  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prestador'
  }]
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;