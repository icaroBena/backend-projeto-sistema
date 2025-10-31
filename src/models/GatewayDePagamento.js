const mongoose = require('mongoose');

const gatewayDePagamentoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    enum: ['stripe', 'mercadopago', 'pagseguro']
  },
  chavePublica: {
    type: String,
    required: true
  },
  chavePrivada: {
    type: String,
    required: true
  },
  webhookSecret: {
    type: String,
    required: true
  },
  ambiente: {
    type: String,
    required: true,
    enum: ['sandbox', 'producao'],
    default: 'sandbox'
  },
  status: {
    type: String,
    required: true,
    enum: ['ativo', 'inativo'],
    default: 'ativo'
  },
  taxas: {
    percentual: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    fixa: {
      type: Number,
      required: true,
      min: 0
    }
  },
  configuracoes: {
    tempoExpiracaoPagamento: {
      type: Number,
      default: 48 // horas
    },
    tentativasMaximas: {
      type: Number,
      default: 3
    },
    limiteMinimo: {
      type: Number,
      default: 5 // valor mínimo em reais
    },
    limiteMaximo: {
      type: Number,
      default: 10000 // valor máximo em reais
    }
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Middleware para atualizar ultimaAtualizacao
gatewayDePagamentoSchema.pre('save', function(next) {
  this.ultimaAtualizacao = new Date();
  next();
});

// Métodos do modelo
gatewayDePagamentoSchema.methods.processarPagamento = async function(pagamento) {
  // Implementação específica para cada gateway
  switch(this.nome) {
    case 'stripe':
      return await this.processarPagamentoStripe(pagamento);
    case 'mercadopago':
      return await this.processarPagamentoMercadoPago(pagamento);
    case 'pagseguro':
      return await this.processarPagamentoPagSeguro(pagamento);
    default:
      throw new Error('Gateway de pagamento não suportado');
  }
};

gatewayDePagamentoSchema.methods.calcularTaxas = function(valor) {
  const taxaPercentual = (valor * this.taxas.percentual) / 100;
  const taxaTotal = taxaPercentual + this.taxas.fixa;
  return {
    taxaPercentual,
    taxaFixa: this.taxas.fixa,
    taxaTotal,
    valorFinal: valor + taxaTotal
  };
};

gatewayDePagamentoSchema.methods.validarTransacao = function(valor) {
  if (valor < this.configuracoes.limiteMinimo) {
    throw new Error(`Valor mínimo para transação é R$ ${this.configuracoes.limiteMinimo}`);
  }
  if (valor > this.configuracoes.limiteMaximo) {
    throw new Error(`Valor máximo para transação é R$ ${this.configuracoes.limiteMaximo}`);
  }
  return true;
};

module.exports = mongoose.model('GatewayDePagamento', gatewayDePagamentoSchema);