# 🏗️ Arquitetura Backend - Alinhado com UML

## Visão Geral

O backend foi completamente refatorado para alinhar com a documentação UML através de uma **arquitetura orientada a casos de uso**.

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES (API Endpoints)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              CONTROLLERS (Casos de Uso)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Confirmar  │  │  Negociar    │  │  Receber     │       │
│  │   Proposta   │  │  Proposta    │  │  Proposta    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Publicar    │  │   Finalizar  │  │  Processar   │       │
│  │  Serviço     │  │   Serviço    │  │  Pagamento   │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │  Reembolso   │  │  Verificar   │  │ Recuperar    │       │
│  │              │  │  Prestador   │  │  Senha       │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVICES (Lógica)                           │
│         ProcessarPagamentoService, EmailService, etc        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    MODELS (Dados)                            │
│    Proposta, Serviço, Pagamento, Verificação, etc          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Pastas

### Casos de Uso (usecases)

```
src/usecases/
│
├── 📦 confirmarProposta/
│   └── confirmarPropostaController.js
│       ├── aceitarProposta()
│       ├── recusarProposta()
│       └── cancelarProposta()
│
├── 📦 negociarProposta/
│   └── negociarPropostaController.js
│       ├── renegociarProposta()
│       ├── finalizarNegociacao()
│       └── listarPropostasEmNegociacao()
│
├── 📦 receberProposta/
│   └── receberPropostaController.js
│       ├── receberPropostaServico()
│       ├── listarPropostasServico()
│       ├── buscarPropostasServico()
│       ├── buscarPropostasPrestador()
│       ├── buscarPropostasCliente()
│       └── buscarPropostaPorId()
│
├── 📦 publicarServico/
│   └── publicarServicoController.js
│       ├── publicarServico()
│       ├── buscarServicos()
│       ├── buscarServicoPorId()
│       └── atualizarServico()
│
├── 📦 finalizarServico/
│   └── finalizarServicoController.js
│       ├── cancelarServico()
│       ├── finalizarServico()
│       └── aprovarServicoFinalizacao()
│
├── 📦 processarPagamento/
│   ├── processarPagamentoController.js
│   │   ├── iniciarPagamento()
│   │   ├── liberarPagamento()
│   │   ├── listarPagamentos()
│   │   └── obterDetalhesPagamento()
│   └── processarPagamentoService.js
│       ├── processarPagamento()
│       ├── liberarPagamento()
│       └── estornarPagamento()
│
├── 📦 reembolso/
│   └── reembolsoController.js
│       ├── solicitarReembolso()
│       ├── obterReembolsosPagamento()
│       ├── listarReembolsos()
│       ├── aprovarReembolso()
│       └── rejeitarReembolso()
│
├── 📦 verificarPrestador/
│   └── verificarPrestadorController.js
│       ├── enviarDocumentosVerificacao()
│       ├── buscarDocumentosVerificacao()
│       ├── aprovarVerificacaoPrestador()
│       ├── rejeitarVerificacaoPrestador()
│       ├── verificarStatusPrestador()
│       └── listarVerificacoes()
│
├── 📦 recuperarSenha/
│   └── recuperarSenhaController.js
│       ├── solicitarRecuperacao()
│       ├── validarTokenRecuperacao()
│       └── resetarSenhaComToken()
│
└── index.js (exporta todos os controllers)
```

---

## 🔄 Fluxos de Casos de Uso

### 1️⃣ Receber Proposta → Confirmar Proposta

```
Prestador cria proposta
    ↓
receberPropostaController.receberPropostaServico()
    ↓
Serviço notifica Cliente
    ↓
Cliente recebe propostas
    ↓
confirmarPropostaController.aceitarProposta()
    ou
confirmarPropostaController.recusarProposta()
    ↓
Prestador é notificado do resultado
```

### 2️⃣ Publicar Serviço → Finalizar Serviço

```
Cliente publica serviço
    ↓
publicarServicoController.publicarServico()
    ↓
Prestadores recebem notificação
    ↓
Proposta aceita → Serviço entra em EXECUÇÃO
    ↓
finalizarServicoController.finalizarServico() (Prestador)
    ↓
finalizarServicoController.aprovarServicoFinalizacao() (Cliente)
    ↓
Serviço → APROVADO
```

### 3️⃣ Processar Pagamento → Reembolso

```
Cliente inicia pagamento
    ↓
processarPagamentoController.iniciarPagamento()
    ↓
Pagamento em ESCROW (EM_ANALISE)
    ↓
Serviço finalizado e aprovado
    ↓
processarPagamentoController.liberarPagamento()
    ↓
Pagamento → CAPTURADO
    ↓
OU
    ↓
reembolsoController.solicitarReembolso() (Cliente)
    ↓
Admin aprova/rejeita
    ↓
reembolsoController.aprovarReembolso()
    ou
reembolsoController.rejeitarReembolso()
```

### 4️⃣ Verificar Prestador

```
Usuário se cadastra como prestador
    ↓
verificarPrestadorController.enviarDocumentosVerificacao()
    ↓
Admin recebe notificação
    ↓
verificarPrestadorController.aprovarVerificacaoPrestador()
    ou
verificarPrestadorController.rejeitarVerificacaoPrestador()
    ↓
Prestador recebe notificação
    ↓
Status → APROVADO ou REPROVADO
```

---

## 🎯 Mapeamento UML → Código

| Caso de Uso UML | Controller | Arquivos | Métodos Principais |
|---|---|---|---|
| Receber Proposta | receberPropostaController | receberProposta/ | receberPropostaServico() |
| Confirmar Proposta | confirmarPropostaController | confirmarProposta/ | aceitarProposta(), recusarProposta() |
| Negociar Proposta | negociarPropostaController | negociarProposta/ | renegociarProposta() |
| Publicar Serviço | publicarServicoController | publicarServico/ | publicarServico() |
| Finalizar Serviço | finalizarServicoController | finalizarServico/ | finalizarServico(), aprovarServicoFinalizacao() |
| Processar Pagamento | processarPagamentoController | processarPagamento/ | iniciarPagamento(), liberarPagamento() |
| Reembolso | reembolsoController | reembolso/ | solicitarReembolso(), aprovarReembolso() |
| Verificar Prestador | verificarPrestadorController | verificarPrestador/ | enviarDocumentosVerificacao(), aprovarVerificacaoPrestador() |
| Recuperar Senha | recuperarSenhaController | recuperarSenha/ | solicitarRecuperacao(), resetarSenhaComToken() |

---

## 🔑 Estados do Sistema (Unified Enums)

**Localização:** `src/utils/systemEnums.js`

### Proposta
- ✅ PENDENTE
- ✅ ACEITA
- ✅ RECUSADA

### Serviço
- ✅ PENDENTE
- ✅ EXECUÇÃO
- ✅ CONCLUÍDO
- ✅ APROVADO

### Pagamento
- ✅ PENDENTE
- ✅ APROVADO
- ✅ CAPTURADO
- ✅ REJEITADO
- ✅ REEMBOLSADO
- ✅ EM_ANALISE
- ✅ ERRO_CONEXAO

### Prestador (Verificação)
- ✅ PENDENTE
- ✅ APROVADO
- ✅ REPROVADO

---

## 🔀 Fluxo de Requisição

```
HTTP Request
    ↓
Router (routes/*)
    ↓
Middleware (auth, validateInput, etc)
    ↓
Controller (usecases/*/*Controller)
    ↓
Service (usecases/*/*Service ou services/*)
    ↓
Model (models/*)
    ↓
MongoDB
    ↓
Response JSON
```

### Exemplo: POST /api/propostas

```javascript
// Route: routes/propostaRoutes.js
router.post('/', 
  auth,                                      // Middleware
  propostaValidation,                        // Validação
  validateInput,                             // Validação
  receberPropostaController.receberPropostaServico  // Controller
);

// Controller: usecases/receberProposta/receberPropostaController.js
exports.receberPropostaServico = async (req, res) => {
  const prestador = await Prestador.findOne({ usuario: req.user.id });
  // ... validações ...
  const proposta = new Proposta({...});
  await proposta.save();
  // ... notificações ...
  res.status(201).json(proposta);
};

// Model: models/Proposta.js
const propostaSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: Object.values(PropostaStatus),
    default: PropostaStatus.PENDENTE
  },
  // ... outros campos ...
});
```

---

## 📋 Checklist de Boas Práticas

- ✅ **Nomenclatura Clara:** Controllers e folders refletem exatamente o caso de uso
- ✅ **Estados Centralizados:** Todos os status em `systemEnums.js`
- ✅ **Modularidade:** Cada caso de uso é independente e reutilizável
- ✅ **Compatibilidade:** Código legado continua funcionando com `enums.js`
- ✅ **Documentação:** Cada controller tem JSDoc com @desc, @route, @access
- ✅ **Erros Claros:** Mensagens de erro descritivas
- ✅ **Notificações:** Cada ação relevante notifica usuários interessados

---

## 🚀 Próximas Melhorias

1. **Validação:** Adicionar Zod/Joi para validação mais robusta
2. **Logs:** Integrar com service de logging centralizado
3. **Testes:** Criar testes unitários para cada controller
4. **Cache:** Implementar cache para operações custosas
5. **Rate Limiting:** Implementar rate limiting específico por endpoint
6. **Documentação:** Gerar documentação Swagger automática

---

## 📚 Referências

- Modelos UML: Verificar arquivo `UML.md` ou documentação do projeto
- API Spec: `/api/docs` (Swagger)
- Exemplos: Ver testes em `tests/`
