const mongoose = require('mongoose');

const VerificacaoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  documentos: {
    identidade: { type: String, required: true },
    comprovante: { type: String, required: true }
  },
  status: { type: String, enum: ['pendente', 'aprovado', 'rejeitado'], default: 'pendente' },
  motivoRejeicao: { type: String },
  dataEnvio: { type: Date, default: Date.now },
  dataVerificacao: { type: Date }
});

module.exports = mongoose.model('Verificacao', VerificacaoSchema);
