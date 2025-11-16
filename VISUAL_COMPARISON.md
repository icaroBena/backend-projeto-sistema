# 📊 Visualização da Refatoração

## Antes vs Depois

### Estrutura de Pastas

#### ❌ ANTES (Genérica)
```
src/
├── controllers/
│   ├── propostaController.js       (Genérico - vários casos de uso)
│   ├── servicoController.js        (Genérico - vários casos de uso)
│   ├── pagamentoController.js      (Genérico - vários casos de uso)
│   └── verificacaoController.js    (Genérico - vários casos de uso)
├── services/
│   ├── pagamentoService.js         (Genérico)
│   └── ... (vários outros)
└── routes/
    ├── propostaRoutes.js           (Importa de controllers/)
    ├── servicoRoutes.js            (Importa de controllers/)
    └── ... (etc)
```

**Problemas:**
- ❌ Nomes genéricos não refletem casos de uso específicos
- ❌ Controllers agrupam múltiplos casos de uso
- ❌ Difícil navegar para encontrar um caso de uso específico
- ❌ Sem separação clara entre responsabilidades

---

#### ✅ DEPOIS (Orientada a Casos de Uso)
```
src/
├── usecases/
│   ├── confirmarProposta/
│   │   └── confirmarPropostaController.js
│   ├── negociarProposta/
│   │   └── negociarPropostaController.js
│   ├── receberProposta/
│   │   └── receberPropostaController.js
│   ├── publicarServico/
│   │   └── publicarServicoController.js
│   ├── finalizarServico/
│   │   └── finalizarServicoController.js
│   ├── processarPagamento/
│   │   ├── processarPagamentoController.js
│   │   └── processarPagamentoService.js
│   ├── reembolso/
│   │   └── reembolsoController.js
│   ├── verificarPrestador/
│   │   └── verificarPrestadorController.js
│   ├── recuperarSenha/
│   │   └── recuperarSenhaController.js
│   └── index.js
├── controllers/ (DEPRECATED - mantém compatibilidade)
├── services/
│   ├── emailService.js
│   ├── notificacaoService.js
│   └── ... (serviços compartilhados)
└── routes/
    ├── propostaRoutes.js           (Importa de usecases/)
    ├── servicoRoutes.js            (Importa de usecases/)
    └── ... (etc)
```

**Benefícios:**
- ✅ Cada pasta = Um caso de uso específico
- ✅ Nomes deixam claro o que faz cada controller
- ✅ Fácil de navegar e encontrar funcionalidades
- ✅ Separação clara de responsabilidades
- ✅ Alinhado com documentação UML

---

## Mapeamento de Controllers

### Proposta

```
ANTES:
  propostaController.criarProposta()
  propostaController.aceitarProposta()
  propostaController.recusarProposta()
  propostaController.cancelarProposta()
  propostaController.buscarPropostasServico()
  ...

DEPOIS:
  receberPropostaController.receberPropostaServico()
  receberPropostaController.buscarPropostasServico()
  receberPropostaController.buscarPropostasPrestador()
  receberPropostaController.buscarPropostasCliente()
  receberPropostaController.buscarPropostaPorId()
  
  confirmarPropostaController.aceitarProposta()
  confirmarPropostaController.recusarProposta()
  confirmarPropostaController.cancelarProposta()
  
  negociarPropostaController.renegociarProposta()
  negociarPropostaController.finalizarNegociacao()
  negociarPropostaController.listarPropostasEmNegociacao()
```

---

### Serviço

```
ANTES:
  servicoController.criarServico()
  servicoController.buscarServicos()
  servicoController.buscarServicoPorId()
  servicoController.atualizarServico()
  servicoController.cancelarServico()

DEPOIS:
  publicarServicoController.publicarServico()
  publicarServicoController.buscarServicos()
  publicarServicoController.buscarServicoPorId()
  publicarServicoController.atualizarServico()
  
  finalizarServicoController.cancelarServico()
  finalizarServicoController.finalizarServico()
  finalizarServicoController.aprovarServicoFinalizacao()
```

---

### Pagamento

```
ANTES:
  pagamentoController.iniciarPagamento()
  pagamentoController.liberarPagamento()
  pagamentoController.solicitarReembolso()
  pagamentoController.listarPagamentos()

DEPOIS:
  processarPagamentoController.iniciarPagamento()
  processarPagamentoController.liberarPagamento()
  processarPagamentoController.listarPagamentos()
  processarPagamentoController.obterDetalhesPagamento()
  
  reembolsoController.solicitarReembolso()
  reembolsoController.obterReembolsosPagamento()
  reembolsoController.listarReembolsos()
  reembolsoController.aprovarReembolso()
  reembolsoController.rejeitarReembolso()
```

---

### Verificação

```
ANTES:
  verificacaoController.enviarDocumentos()
  verificacaoController.buscarDocumentos()
  verificacaoController.aprovarDocumento()
  verificacaoController.rejeitarDocumento()
  verificacaoController.verificarStatus()

DEPOIS:
  verificarPrestadorController.enviarDocumentosVerificacao()
  verificarPrestadorController.buscarDocumentosVerificacao()
  verificarPrestadorController.aprovarVerificacaoPrestador()
  verificarPrestadorController.rejeitarVerificacaoPrestador()
  verificarPrestadorController.verificarStatusPrestador()
  verificarPrestadorController.listarVerificacoes()
```

---

## Comparação: Enum Values

### Proposta

```javascript
// ANTES
StatusProposta = {
  PENDENTE: 'pendente',
  ACEITA: 'aceita',
  RECUSADA: 'recusada',
  CANCELADA: 'cancelada'
}

// DEPOIS
PropostaStatus = {
  PENDENTE: 'PENDENTE',
  ACEITA: 'ACEITA',
  RECUSADA: 'RECUSADA'
}
```

---

### Serviço

```javascript
// ANTES
StatusServico = {
  ABERTO: 'aberto',
  EM_NEGOCIACAO: 'em_negociacao',
  CONFIRMADO: 'confirmado',
  EM_ANDAMENTO: 'em_andamento',
  CONCLUIDO: 'concluido',
  CANCELADO: 'cancelado'
}

// DEPOIS
ServicoStatus = {
  PENDENTE: 'PENDENTE',
  EXECUÇÃO: 'EXECUÇÃO',
  CONCLUÍDO: 'CONCLUÍDO',
  APROVADO: 'APROVADO'
}

// Mapeamento:
'aberto' → PENDENTE
'em_negociacao' → EXECUÇÃO
'confirmado' → EXECUÇÃO
'em_andamento' → EXECUÇÃO
'concluido' → CONCLUÍDO
'cancelado' → CONCLUÍDO
```

---

### Pagamento

```javascript
// ANTES
StatusPagamento = {
  PENDENTE: 'pendente',
  PROCESSANDO: 'processando',
  CONCLUIDO: 'concluido',
  FALHOU: 'falhou',
  REEMBOLSADO: 'reembolsado'
}

// DEPOIS
PagamentoStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  CAPTURADO: 'CAPTURADO',
  REJEITADO: 'REJEITADO',
  REEMBOLSADO: 'REEMBOLSADO',
  EM_ANALISE: 'EM_ANALISE',
  ERRO_CONEXAO: 'ERRO_CONEXAO'
}

// Mapeamento:
'pendente' → PENDENTE
'processando' → EM_ANALISE
'concluido' → CAPTURADO
'falhou' → REJEITADO
'reembolsado' → REEMBOLSADO
```

---

### Verificação/Prestador

```javascript
// ANTES
(não tinha enum específico - usava strings)
'pendente'
'aprovado'
'rejeitado'

// DEPOIS
PrestadorStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  REPROVADO: 'REPROVADO'
}

// Mapeamento:
'pendente' → PENDENTE
'aprovado' → APROVADO
'rejeitado' → REPROVADO
```

---

## Fluxo de Requisição: Antes vs Depois

### Antes (Genérico)

```
POST /api/propostas
  ↓
propostaRoutes.js
  ↓
auth middleware
  ↓
validateInput middleware
  ↓
propostaController.criarProposta() 🔴 Nome genérico
  ├─ Não deixa claro se está criando, atualizando ou deletando
  ├─ Mistura múltiplos casos de uso em um só arquivo
  └─ Difícil encontrar a lógica específica
  ↓
Response
```

---

### Depois (Específico)

```
POST /api/propostas
  ↓
propostaRoutes.js
  ↓
auth middleware
  ↓
validateInput middleware
  ↓
receberPropostaController.receberPropostaServico() ✅ Nome específico
  ├─ Deixa claro: "Prestador está RECEBENDO (criando) uma proposta"
  ├─ Caso de uso definido e isolado
  └─ Fácil encontrar a lógica necessária
  ↓
Response
```

---

## Exemplo Completo: Aceitar Proposta

### Antes

```javascript
// routes/propostaRoutes.js
const propostaController = require('../controllers/propostaController');

router.put('/:id/aceitar',
  auth,
  propostaController.aceitarProposta  // 🔴 Não deixa claro que é confirmação
);

// controllers/propostaController.js
exports.aceitarProposta = async (req, res) => {
  // 200+ linhas misturando vários casos de uso
  // - criar proposta (criarProposta)
  // - aceitar proposta (aceitarProposta) ← estou aqui
  // - recusar proposta (recusarProposta)
  // - buscar propostas (buscarPropostas*)
  // - cancelar (cancelarProposta)
};
```

---

### Depois

```javascript
// routes/propostaRoutes.js
const confirmarPropostaController = require('../../usecases/confirmarProposta/confirmarPropostaController');

router.put('/:id/aceitar',
  auth,
  confirmarPropostaController.aceitarProposta  // ✅ Deixa claro: CONFIRMAR/ACEITAR
);

// usecases/confirmarProposta/confirmarPropostaController.js
/**
 * @desc    Aceitar proposta (Caso de Uso: Confirmar Proposta)
 * @route   PUT /api/propostas/:id/aceitar
 * @access  Private (Cliente dono do serviço)
 */
exports.aceitarProposta = async (req, res) => {
  // 50-100 linhas APENAS desta funcionalidade
  // - aceitar proposta
  // - atualizar status para ACEITA
  // - recusar outras propostas automaticamente
  // - notificar prestador
};
```

---

## Resumo Visual das Melhorias

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Nomenclatura** | Genérica (criarProposta) | Específica (receberPropostaServico) |
| **Organização** | Por tipo de arquivo (controllers/) | Por caso de uso (usecases/) |
| **Arquivo único** | 200+ linhas (múltiplos casos de uso) | 50-150 linhas (um caso de uso) |
| **Enums** | Valores minúsculos | Valores UPPERCASE |
| **Localização** | Difícil encontrar funcionalidade | Fácil - pasta com nome descritivo |
| **Manutenção** | Alto risco de quebrar outro caso de uso | Baixo risco - isolado |
| **Testes** | Complexo - múltiplas responsabilidades | Simples - uma responsabilidade |
| **Documentação** | Precisa ler todo arquivo | Arquivo pequeno e focused |
| **Alinhamento UML** | Não reflete casos de uso | 100% alinhado com UML |

---

## Números da Refatoração

```
📊 ESTATÍSTICAS

✅ Controllers Criados:        9
   - receberPropostaController.js
   - confirmarPropostaController.js
   - negociarPropostaController.js
   - publicarServicoController.js
   - finalizarServicoController.js
   - processarPagamentoController.js
   - reembolsoController.js
   - verificarPrestadorController.js
   - recuperarSenhaController.js

✅ Services Criados:           1 (processarPagamentoService.js)

✅ Rotas Atualizadas:          6

✅ Modelos Atualizados:        4

✅ Enums Centralizados:        4 (PropostaStatus, ServicoStatus, PagamentoStatus, PrestadorStatus)

✅ Arquivos de Documentação:   3
   - REFACTORING_SUMMARY.md
   - ARCHITECTURE.md
   - MIGRATION_GUIDE.md

⚡ Linhas de Código:           2,000+ (controllers novos)

🎯 Casos de Uso Implementados: 9

📚 Estados do Sistema:         13 (Centralizados em systemEnums.js)
```

---

## Próximas Fases (Optional)

### Fase 2: Repositories
```
src/repositories/
├── PropostaRepository.js
├── ServicoRepository.js
├── PagamentoRepository.js
└── VerificacaoRepository.js
```

### Fase 3: DTOs (Data Transfer Objects)
```
src/dtos/
├── CreatePropostaDTO.js
├── CreateServicoDTO.js
├── ProcessarPagamentoDTO.js
└── ...
```

### Fase 4: Middlewares Específicos
```
src/middlewares/
├── validatePropostaInput.js
├── validateServicoInput.js
├── validatePagamentoInput.js
└── ...
```

### Fase 5: Error Handling
```
src/errors/
├── PropostaError.js
├── ServicoError.js
├── PagamentoError.js
└── ...
```
