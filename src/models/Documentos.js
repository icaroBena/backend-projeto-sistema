const mongoose = require('mongoose');

const documentoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['rg', 'cpf', 'cnh', 'comprovante_residencia', 'diploma', 'certificado', 'outro'],
    required: true
  },
  arquivo: {
    nome: String,
    url: String,
    mimetype: String,
    tamanho: Number
  },
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'aprovado', 'rejeitado'],
    default: 'pendente'
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  },
  dataVerificacao: Date,
  verificadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  observacoes: String,
  validade: {
    inicio: Date,
    fim: Date
  },
  metadata: {
    numeroDocumento: String,
    orgaoEmissor: String,
    dataEmissao: Date
  }
});

const Documento = mongoose.model('Documento', documentoSchema);

module.exports = Documento;