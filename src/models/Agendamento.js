const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
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
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['agendado', 'em_andamento', 'concluido', 'cancelado'],
    default: 'agendado'
  },
  local: {
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
    },
    linkReuniao: String
  },
  observacoes: String,
  lembretes: [{
    tipo: String,
    dataEnvio: Date,
    status: String
  }]
});

const Agendamento = mongoose.model('Agendamento', agendamentoSchema);

module.exports = Agendamento;