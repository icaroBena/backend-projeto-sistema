## 📋 Padronização Backend - Refatoração Completa

### 🎯 Objetivo
Alinhamento completo do backend com a documentação UML através de:
- Padronização de nomes de arquivos, classes, controllers e serviços
- Unificação de estados do sistema em um único arquivo de enums
- Reorganização da estrutura de pastas por casos de uso
- Normalização de nomenclatura para corresponder aos casos de uso UML

---

## ✨ Mudanças Implementadas

### 1️⃣ Sistema de Enums Unificado

**Arquivo Criado:** `src/utils/systemEnums.js`

Todos os estados do sistema agora estão centralizados com valores UPPERCASE:

#### **PropostaStatus**
- `PENDENTE` - Proposta aguardando resposta
- `ACEITA` - Proposta aceita pelo cliente  
- `RECUSADA` - Proposta recusada pelo cliente

#### **ServicoStatus**
- `PENDENTE` - Serviço aguardando propostas
- `EXECUÇÃO` - Serviço em execução
- `CONCLUÍDO` - Serviço finalizado/concluído
- `APROVADO` - Serviço aprovado pelo cliente

#### **PagamentoStatus**
- `PENDENTE` - Pagamento não iniciado
- `APROVADO` - Pagamento aprovado
- `CAPTURADO` - Pagamento capturado com sucesso
- `REJEITADO` - Pagamento rejeitado
- `REEMBOLSADO` - Pagamento reembolsado
- `EM_ANALISE` - Pagamento em análise
- `ERRO_CONEXAO` - Erro de conexão com gateway

#### **PrestadorStatus**
- `PENDENTE` - Verificação de prestador aguardando
- `APROVADO` - Prestador aprovado
- `REPROVADO` - Prestador reprovado

### 2️⃣ Reorganização da Estrutura de Pastas

Controllers e services foram reorganizados em **9 casos de uso específicos** dentro de `src/usecases/`:

```
src/usecases/
├── confirmarProposta/
│   └── confirmarPropostaController.js
├── negociarProposta/
│   └── negociarPropostaController.js
├── receberProposta/
│   └── receberPropostaController.js
├── publicarServico/
│   └── publicarServicoController.js
├── finalizarServico/
│   └── finalizarServicoController.js
├── processarPagamento/
│   ├── processarPagamentoController.js
│   └── processarPagamentoService.js
├── reembolso/
│   └── reembolsoController.js
├── verificarPrestador/
│   └── verificarPrestadorController.js
└── recuperarSenha/
    └── recuperarSenhaController.js
```

### 3️⃣ Renomeação de Controllers

| Antigo | Novo | Local |
|--------|------|-------|
| `propostaController.criarProposta` | `receberPropostaController.receberPropostaServico` | `receberProposta/` |
| `propostaController.aceitarProposta` | `confirmarPropostaController.aceitarProposta` | `confirmarProposta/` |
| `propostaController.recusarProposta` | `confirmarPropostaController.recusarProposta` | `confirmarProposta/` |
| Novo | `negociarPropostaController.renegociarProposta` | `negociarProposta/` |
| `servicoController.criarServico` | `publicarServicoController.publicarServico` | `publicarServico/` |
| `servicoController.cancelarServico` | `finalizarServicoController.cancelarServico` | `finalizarServico/` |
| Novo | `finalizarServicoController.finalizarServico` | `finalizarServico/` |
| `pagamentoController` | `processarPagamentoController` | `processarPagamento/` |
| Novo | `reembolsoController` | `reembolso/` |
| `verificacaoController` | `verificarPrestadorController` | `verificarPrestador/` |
| Novo | `recuperarSenhaController` | `recuperarSenha/` |

### 4️⃣ Atualização de Modelos

Todos os modelos foram atualizados para usar o arquivo `systemEnums.js`:

- ✅ `Proposta.js` - usa `PropostaStatus`
- ✅ `Servico.js` - usa `ServicoStatus`
- ✅ `Pagamento.js` - usa `PagamentoStatus`
- ✅ `Verificacao.js` - usa `PrestadorStatus`

**Novo Import em todos:**
```javascript
const { PropostaStatus } = require('../utils/systemEnums');
// ou
const { ServicoStatus } = require('../utils/systemEnums');
// etc...
```

### 5️⃣ Atualização de Rotas

Todas as rotas foram atualizadas para importar dos novos controllers:

- ✅ `routes/propostaRoutes.js` - importa de `usecases/*`
- ✅ `routes/servicoRoutes.js` - importa de `usecases/*`
- ✅ `routes/pagamentoRoutes.js` - importa de `usecases/*`
- ✅ `routes/verificacaoRoutes.js` - importa de `usecases/*`
- ✅ `routes/recuperarSenhaRoutes.js` - **novo arquivo criado**

### 6️⃣ Compatibilidade com Código Legado

Arquivo `src/utils/enums.js` foi preservado e agora:
- Faz mapeamento dos valores antigos (minúsculos) para os novos (UPPERCASE)
- Re-exporta `systemEnums.js` para facilitar migração gradual
- Garante que código existente continue funcionando

---

## 🔄 Mapeamento de Estados Antigos → Novos

### Proposta
```javascript
'pendente' → PropostaStatus.PENDENTE
'aceita' → PropostaStatus.ACEITA
'recusada' → PropostaStatus.RECUSADA
'cancelada' → PropostaStatus.RECUSADA (mapeado)
```

### Serviço
```javascript
'aberto' → ServicoStatus.PENDENTE
'em_negociacao' → ServicoStatus.EXECUÇÃO
'confirmado' → ServicoStatus.EXECUÇÃO
'em_andamento' → ServicoStatus.EXECUÇÃO
'concluido' → ServicoStatus.CONCLUÍDO
'cancelado' → ServicoStatus.CONCLUÍDO
```

### Pagamento
```javascript
'pendente' → PagamentoStatus.PENDENTE
'processando' → PagamentoStatus.EM_ANALISE
'concluido' → PagamentoStatus.CAPTURADO
'falhou' → PagamentoStatus.REJEITADO
'reembolsado' → PagamentoStatus.REEMBOLSADO
```

### Verificação/Prestador
```javascript
'pendente' → PrestadorStatus.PENDENTE
'aprovado' → PrestadorStatus.APROVADO
'rejeitado' → PrestadorStatus.REPROVADO
```

---

## 📝 Novos Endpoints

### Recuperar Senha
```
POST   /api/recuperar-senha/solicitar        - Solicitar reset
GET    /api/recuperar-senha/validar/:token   - Validar token
PUT    /api/recuperar-senha/resetar          - Resetar senha
```

### Negociar Proposta
```
PUT    /api/propostas/:id/renegociar         - Renegociar proposta
PUT    /api/propostas/:id/finalizarNegociacao - Finalizar negociação
GET    /api/propostas/negociacao             - Listar em negociação
```

### Finalizar Serviço
```
PUT    /api/servicos/:id/finalizar           - Finalizar execução
PUT    /api/servicos/:id/aprovar             - Aprovar conclusão
```

### Reembolso
```
GET    /api/pagamentos/reembolsos            - Listar todos
GET    /api/pagamentos/reembolsos/pagamento/:id - Por pagamento
PUT    /api/pagamentos/reembolsos/:id/aprovar   - Aprovar
PUT    /api/pagamentos/reembolsos/:id/rejeitar  - Rejeitar
```

---

## 🔑 Exemplos de Uso dos Enums

### Antes (Antigo)
```javascript
const { StatusProposta } = require('../utils/enums');
if (proposta.status === 'pendente') { }  // String literal
```

### Depois (Novo)
```javascript
const { PropostaStatus } = require('../utils/systemEnums');
if (proposta.status === PropostaStatus.PENDENTE) { }  // Constant
```

### Compatibilidade Mantida
```javascript
const { StatusProposta, PropostaStatus } = require('../utils/enums');
// Ambas formas continuam funcionando durante transição
```

---

## ✅ Checklist de Implementação

- ✅ Criado arquivo `systemEnums.js` com todos os estados
- ✅ Reorganizada estrutura de pastas por casos de uso
- ✅ Criados 9 controllers específicos para cada caso de uso
- ✅ Criado 1 service específico (`processarPagamentoService`)
- ✅ Atualizado todos os modelos (Proposta, Serviço, Pagamento, Verificação)
- ✅ Atualizado todos os imports em rotas
- ✅ Criada rota para `recuperarSenha`
- ✅ Atualizado `App.js` com novas rotas
- ✅ Mantida compatibilidade com `enums.js` legado
- ✅ Adicionados novos campos aos modelos (emNegociacao, dataAprovacao, etc)

---

## 🚀 Próximos Passos Recomendados

1. **Testes:** Execute testes para validar todas as rotas
2. **Migração Gradual:** Atualize imports legados para `systemEnums`
3. **Documentação Swagger:** Atualize a documentação com novos endpoints
4. **Limpeza:** Remova controllers antigos após validação completa
5. **Banco de Dados:** Considere migração de dados se houver dados existentes com estados antigos

---

## 📚 Estrutura Final

A nova estrutura segue exatamente os casos de uso do UML:

```
Casos de Uso Implementados:
├── ConfirmarProposta (aceitar/recusar)
├── NegociarProposta (renegociar)
├── ReceberProposta (criar proposta)
├── PublicarServico (criar serviço)
├── FinalizarServico (concluir/aprovar)
├── ProcessarPagamento (pagamento escrow)
├── Reembolso (solicitar reembolso)
├── VerificarPrestador (verificação docs)
└── RecuperarSenha (reset password)
```

Cada caso de uso é **completamente autônomo** e possui sua própria pasta com controller e services necessários.

---

## 🎓 Documentação UML Alinhada

A refatoração garante que todo o código backend está **100% alinhado** com a documentação UML através de:

1. ✅ Nomes de controllers que refletem casos de uso explicitamente
2. ✅ Estados do sistema padronizados e centralizados
3. ✅ Estrutura de pastas que espelha a arquitetura UML
4. ✅ Sem nomes genéricos - tudo é específico e descritivo
