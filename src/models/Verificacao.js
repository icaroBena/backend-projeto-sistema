const mongoose = require('mongoose');
const { PrestadorStatus } = require('../utils/systemEnums');

const VerificacaoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  documentos: {
    identidade: { type: String, required: true },
    comprovante: { type: String, required: true }
  },
  status: { type: String, enum: Object.values(PrestadorStatus), default: PrestadorStatus.PENDENTE },
  motivoRejeicao: { type: String },
  dataEnvio: { type: Date, default: Date.now },
  dataVerificacao: { type: Date }
});

module.exports = mongoose.model('Verificacao', VerificacaoSchema);
