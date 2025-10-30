const mongoose = require('mongoose');

const reembolsoSchema = new mongoose.Schema({
  pagamento: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pagamento',
    required: true
  },
  servico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Servico',
    required: true
  },
  solicitante: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'processando', 'concluido'],
    default: 'pendente'
  },
  dataSolicitacao: {
    type: Date,
    default: Date.now
  },
  dataProcessamento: Date,
  dataConlusao: Date,
  comprovantes: [{
    tipo: String,
    url: String,
    dataEnvio: Date
  }],
  observacoes: String,
  analisadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  motivoRejeicao: String
});

const Reembolso = mongoose.model('Reembolso', reembolsoSchema);

module.exports = Reembolso;