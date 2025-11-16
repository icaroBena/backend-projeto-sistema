/**
 * 🔧 System Enums - Estados Centralizados do Sistema
 * Arquivo centralizado contendo todos os estados do sistema
 * para manter consistência e facilitar manutenção
 */

// ============================================
// Estados de PROPOSTA
// ============================================
const PropostaStatus = {
  PENDENTE: 'PENDENTE',
  ACEITA: 'ACEITA',
  RECUSADA: 'RECUSADA'
};

// ============================================
// Estados de SERVIÇO
// ============================================
const ServicoStatus = {
  PENDENTE: 'PENDENTE',
  EXECUÇÃO: 'EXECUÇÃO',
  CONCLUÍDO: 'CONCLUÍDO',
  APROVADO: 'APROVADO'
};

// ============================================
// Estados de PAGAMENTO
// ============================================
const PagamentoStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  CAPTURADO: 'CAPTURADO',
  REJEITADO: 'REJEITADO',
  REEMBOLSADO: 'REEMBOLSADO',
  EM_ANALISE: 'EM_ANALISE',
  ERRO_CONEXAO: 'ERRO_CONEXAO'
};

// ============================================
// Estados de PRESTADOR (Verificação)
// ============================================
const PrestadorStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO'
};

// ============================================
// Estados de REEMBOLSO
// ============================================
const ReembolsoStatus = {
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO',
  PROCESSANDO: 'PROCESSANDO',
  CONCLUIDO: 'CONCLUIDO'
};

// ============================================
// Estados de DOCUMENTOS
// ============================================
const DocumentosStatus = {
  PENDENTE: 'PENDENTE',
  EM_ANALISE: 'EM_ANALISE',
  APROVADO: 'APROVADO',
  REJEITADO: 'REJEITADO'
};

// ============================================
// Estados de AVALIAÇÃO
// ============================================
const AvaliacaoStatus = {
  PENDENTE: 'PENDENTE',
  PUBLICADA: 'PUBLICADA',
  REMOVIDA: 'REMOVIDA'
};

// ============================================
// Outros Enums - Métodos de Pagamento
// ============================================
const MetodoPagamento = {
  CARTAO: 'cartao',
  PIX: 'pix',
  BOLETO: 'boleto'
};

// ============================================
// Outros Enums - Dias da Semana
// ============================================
const DiaSemana = {
  DOMINGO: 'domingo',
  SEGUNDA: 'segunda',
  TERCA: 'terca',
  QUARTA: 'quarta',
  QUINTA: 'quinta',
  SEXTA: 'sexta',
  SABADO: 'sabado'
};

// ============================================
// Outros Enums - Tipo de Local
// ============================================
const TipoLocal = {
  PRESENCIAL: 'presencial',
  REMOTO: 'remoto',
  HIBRIDO: 'hibrido'
};

// ============================================
// Exportações
// ============================================
module.exports = {
  PropostaStatus,
  ServicoStatus,
  PagamentoStatus,
  PrestadorStatus,
  ReembolsoStatus,
  DocumentosStatus,
  AvaliacaoStatus,
  MetodoPagamento,
  DiaSemana,
  TipoLocal
};
