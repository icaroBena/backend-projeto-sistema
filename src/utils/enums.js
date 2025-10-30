// Status de serviço
const StatusServico = {
  ABERTO: 'aberto',
  EM_NEGOCIACAO: 'em_negociacao',
  CONFIRMADO: 'confirmado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
};

// Status de proposta
const StatusProposta = {
  PENDENTE: 'pendente',
  ACEITA: 'aceita',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada'
};

// Status de pagamento
const StatusPagamento = {
  PENDENTE: 'pendente',
  PROCESSANDO: 'processando',
  CONCLUIDO: 'concluido',
  FALHOU: 'falhou',
  REEMBOLSADO: 'reembolsado'
};

// Tipos de usuário
const TipoUsuario = {
  CLIENTE: 'cliente',
  PRESTADOR: 'prestador',
  ADMIN: 'admin'
};

// Status de usuário
const StatusUsuario = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  PENDENTE: 'pendente',
  BLOQUEADO: 'bloqueado'
};

// Tipos de documento
const TipoDocumento = {
  RG: 'rg',
  CPF: 'cpf',
  CNH: 'cnh',
  COMPROVANTE_RESIDENCIA: 'comprovante_residencia',
  DIPLOMA: 'diploma',
  CERTIFICADO: 'certificado',
  OUTRO: 'outro'
};

// Status de documento
const StatusDocumento = {
  PENDENTE: 'pendente',
  EM_ANALISE: 'em_analise',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado'
};

// Métodos de pagamento
const MetodoPagamento = {
  CARTAO: 'cartao',
  PIX: 'pix',
  BOLETO: 'boleto'
};

// Tipos de local de serviço
const TipoLocal = {
  PRESENCIAL: 'presencial',
  REMOTO: 'remoto',
  HIBRIDO: 'hibrido'
};

module.exports = {
  StatusServico,
  StatusProposta,
  StatusPagamento,
  TipoUsuario,
  StatusUsuario,
  TipoDocumento,
  StatusDocumento,
  MetodoPagamento,
  TipoLocal
};