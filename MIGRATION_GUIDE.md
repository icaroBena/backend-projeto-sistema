# 📖 Guia de Migração - Código Legado para Nova Arquitetura

## ⚠️ Aviso Importante

Se você tem código existente que importa de `controllers/`, `services/`, ou usa enums antigos, este guia o ajudará a migrar para a nova arquitetura.

---

## 🔄 Migrações Necessárias

### 1️⃣ Importação de Controllers

#### ❌ Antes (Deprecated)
```javascript
const propostaController = require('../controllers/propostaController');
const servicoController = require('../controllers/servicoController');
const pagamentoController = require('../controllers/pagamentoController');
const verificacaoController = require('../controllers/verificacaoController');
```

#### ✅ Depois (Novo)
```javascript
const receberPropostaController = require('../../usecases/receberProposta/receberPropostaController');
const confirmarPropostaController = require('../../usecases/confirmarProposta/confirmarPropostaController');
const publicarServicoController = require('../../usecases/publicarServico/publicarServicoController');
const processarPagamentoController = require('../../usecases/processarPagamento/processarPagamentoController');
const verificarPrestadorController = require('../../usecases/verificarPrestador/verificarPrestadorController');
```

#### ⚡ Quick Import (Índice)
```javascript
const { 
  receberPropostaController,
  confirmarPropostaController,
  publicarServicoController,
  processarPagamentoController,
  verificarPrestadorController 
} = require('../../usecases');
```

---

### 2️⃣ Importação de Enums

#### ❌ Antes (Deprecated)
```javascript
const { StatusProposta, StatusServico, StatusPagamento } = require('../utils/enums');

if (proposta.status === 'pendente') { }
if (servico.status === 'aberto') { }
if (pagamento.status === 'processando') { }
```

#### ✅ Depois (Novo)
```javascript
const { PropostaStatus, ServicoStatus, PagamentoStatus } = require('../utils/systemEnums');

if (proposta.status === PropostaStatus.PENDENTE) { }
if (servico.status === ServicoStatus.PENDENTE) { }
if (pagamento.status === PagamentoStatus.EM_ANALISE) { }
```

#### ✓ Compatibilidade (Ainda funciona)
```javascript
const { StatusProposta, PropostaStatus } = require('../utils/enums');
// Ambas as formas funcionam durante migração
```

---

### 3️⃣ Métodos de Controllers

#### Proposta

| Antigo | Novo | Location |
|--------|------|----------|
| `criarProposta()` | `receberPropostaController.receberPropostaServico()` | receberProposta/ |
| `aceitarProposta()` | `confirmarPropostaController.aceitarProposta()` | confirmarProposta/ |
| `recusarProposta()` | `confirmarPropostaController.recusarProposta()` | confirmarProposta/ |
| `buscarPropostasServico()` | `receberPropostaController.buscarPropostasServico()` | receberProposta/ |
| `buscarPropostasPrestador()` | `receberPropostaController.buscarPropostasPrestador()` | receberProposta/ |
| `buscarPropostasCliente()` | `receberPropostaController.buscarPropostasCliente()` | receberProposta/ |
| `cancelarProposta()` | `confirmarPropostaController.cancelarProposta()` | confirmarProposta/ |

#### Serviço

| Antigo | Novo | Location |
|--------|------|----------|
| `criarServico()` | `publicarServicoController.publicarServico()` | publicarServico/ |
| `buscarServicos()` | `publicarServicoController.buscarServicos()` | publicarServico/ |
| `buscarServicoPorId()` | `publicarServicoController.buscarServicoPorId()` | publicarServico/ |
| `atualizarServico()` | `publicarServicoController.atualizarServico()` | publicarServico/ |
| `cancelarServico()` | `finalizarServicoController.cancelarServico()` | finalizarServico/ |
| (novo) | `finalizarServicoController.finalizarServico()` | finalizarServico/ |

#### Pagamento

| Antigo | Novo | Location |
|--------|------|----------|
| `iniciarPagamento()` | `processarPagamentoController.iniciarPagamento()` | processarPagamento/ |
| `liberarPagamento()` | `processarPagamentoController.liberarPagamento()` | processarPagamento/ |
| `listarPagamentos()` | `processarPagamentoController.listarPagamentos()` | processarPagamento/ |
| `solicitarReembolso()` | `reembolsoController.solicitarReembolso()` | reembolso/ |

#### Verificação

| Antigo | Novo | Location |
|--------|------|----------|
| `enviarDocumentos()` | `verificarPrestadorController.enviarDocumentosVerificacao()` | verificarPrestador/ |
| `buscarDocumentos()` | `verificarPrestadorController.buscarDocumentosVerificacao()` | verificarPrestador/ |
| `aprovarDocumento()` | `verificarPrestadorController.aprovarVerificacaoPrestador()` | verificarPrestador/ |
| `rejeitarDocumento()` | `verificarPrestadorController.rejeitarVerificacaoPrestador()` | verificarPrestador/ |
| `verificarStatus()` | `verificarPrestadorController.verificarStatusPrestador()` | verificarPrestador/ |

---

### 4️⃣ Exemplos Práticos de Migração

#### Exemplo 1: Criar Proposta

**❌ Antigo:**
```javascript
// routes/propostaRoutes.js
const propostaController = require('../controllers/propostaController');

router.post('/',
  auth,
  propostaValidation,
  validateInput,
  propostaController.criarProposta  // ❌ Nome genérico
);
```

**✅ Novo:**
```javascript
// routes/propostaRoutes.js
const receberPropostaController = require('../../usecases/receberProposta/receberPropostaController');

router.post('/',
  auth,
  propostaValidation,
  validateInput,
  receberPropostaController.receberPropostaServico  // ✅ Nome específico
);
```

---

#### Exemplo 2: Verificar Status de Proposta

**❌ Antigo:**
```javascript
const { StatusProposta } = require('../utils/enums');

// Em algum controller...
if (proposta.status === 'aceita') {
  // Fazer algo
}

// Atualizar status
proposta.status = 'pendente';
```

**✅ Novo:**
```javascript
const { PropostaStatus } = require('../utils/systemEnums');

// Em algum controller...
if (proposta.status === PropostaStatus.ACEITA) {
  // Fazer algo
}

// Atualizar status
proposta.status = PropostaStatus.PENDENTE;
```

---

#### Exemplo 3: Verificar Status de Serviço

**❌ Antigo:**
```javascript
const { StatusServico } = require('../utils/enums');

if (servico.status === 'aberto') {
  // ...
} else if (servico.status === 'em_andamento') {
  // ...
}
```

**✅ Novo:**
```javascript
const { ServicoStatus } = require('../utils/systemEnums');

if (servico.status === ServicoStatus.PENDENTE) {
  // ...
} else if (servico.status === ServicoStatus.EXECUÇÃO) {
  // ...
}
```

---

#### Exemplo 4: Mapear Estados Antigos

Se você tem dados no banco com estados antigos (strings minúsculas), faça a migração:

**❌ Dados Antigos:**
```javascript
// No MongoDB
{ status: 'aberto' }
{ status: 'em_andamento' }
{ status: 'concluido' }
```

**✅ Migrate com Script:**
```javascript
// scripts/migrateEnums.js
const Servico = require('../models/Servico');
const { ServicoStatus } = require('../utils/systemEnums');

const migrateServicos = async () => {
  // PENDENTE (antes: aberto, em_negociacao, confirmado, em_andamento)
  await Servico.updateMany(
    { status: { $in: ['aberto', 'em_negociacao', 'confirmado', 'em_andamento'] } },
    { status: ServicoStatus.PENDENTE }
  );

  // CONCLUÍDO (antes: concluido, cancelado)
  await Servico.updateMany(
    { status: { $in: ['concluido', 'cancelado'] } },
    { status: ServicoStatus.CONCLUÍDO }
  );
};

migrateServicos();
```

---

## 📝 Roteiro de Migração Gradual

### Fase 1: Preparação (Hoje)
- [x] Sistema de enums novo implementado
- [x] Controllers novos criados
- [x] Compatibilidade legada mantida
- [x] Documentação criada

### Fase 2: Atualizar Rotas (Próxima semana)
```
- [ ] Atualizar src/routes/propostaRoutes.js
- [ ] Atualizar src/routes/servicoRoutes.js
- [ ] Atualizar src/routes/pagamentoRoutes.js
- [ ] Atualizar src/routes/verificacaoRoutes.js
- [ ] Testar cada rota
```

### Fase 3: Atualizar Models (2ª semana)
```
- [x] Proposta.js
- [x] Servico.js
- [x] Pagamento.js
- [x] Verificacao.js
- [ ] Outros models que referenciam status
```

### Fase 4: Remover Código Legado (3ª semana)
```
- [ ] Deletar src/controllers/propostaController.js
- [ ] Deletar src/controllers/servicoController.js
- [ ] Deletar src/controllers/pagamentoController.js
- [ ] Deletar src/controllers/verificacaoController.js
- [ ] Manter compatibilidade em enums.js por enquanto
```

### Fase 5: Limpeza Final (Mês que vem)
```
- [ ] Migrar todos os imports para systemEnums
- [ ] Remover compatibilidade de enums.js
- [ ] Atualizar documentação Swagger
- [ ] Executar testes completos
```

---

## ✅ Checklist de Migração por Arquivo

### routes/
- [ ] propostaRoutes.js
- [ ] servicoRoutes.js
- [ ] pagamentoRoutes.js
- [ ] verificacaoRoutes.js
- [ ] recuperarSenhaRoutes.js (novo)

### models/
- [x] Proposta.js
- [x] Servico.js
- [x] Pagamento.js
- [x] Verificacao.js
- [ ] Outros models (se houver referência a status)

### services/
- [ ] Revisar se há referências a enums antigos
- [x] processarPagamentoService.js (novo)

### middleware/
- [ ] Revisar se há validações com enums antigos

### tests/
- [ ] Atualizar testes com novos imports
- [ ] Atualizar testes com novos enum values

---

## 🔍 Checando Código Legado

Use estes comandos para encontrar código que precisa migração:

```bash
# Encontrar imports de controllers antigos
grep -r "require.*controllers/" src/ --include="*.js" | grep -v "usecases"

# Encontrar uso de enums antigos
grep -r "StatusProposta\|StatusServico\|StatusPagamento" src/ --include="*.js" | grep "enums.js"

# Encontrar strings hardcoded de status
grep -r "'pendente'\|'aceita'\|'recusada'\|'aberto'\|'em_andamento'" src/ --include="*.js"
```

---

## 🎓 Convenções de Nomenclatura

### Controllers

```javascript
// Nome do arquivo: <CasoDeUso>Controller.js
// Exemplos:
- receberPropostaController.js
- confirmarPropostaController.js
- publicarServicoController.js
- processarPagamentoController.js

// Métodos devem começar com verbo descritivo
exports.receberPropostaServico() {}
exports.confirmarProposta() {}
exports.publicarServico() {}
```

### Services

```javascript
// Nome do arquivo: <CasoDeUso>Service.js
// Exemplo:
- processarPagamentoService.js

// Classes ou exports nomeados claramente
class ProcessarPagamentoService {
  static async processarPagamento() {}
  static async liberarPagamento() {}
}
```

### Enums

```javascript
// Valores SEMPRE em UPPERCASE
PropostaStatus.PENDENTE     // ✅
PropostaStatus.pendente     // ❌
PropostaStatus.Pendente     // ❌

// Nomes descritivos
PrestadorStatus.PENDENTE    // ✅
PrestadorStatus.VERIFICACAO // ❌ (confuso)
```

---

## 🆘 Troubleshooting

### Erro: "Cannot find module"
```javascript
// Cheque se está usando o caminho correto
const Controller = require('../../usecases/nomeCase/nomeController');
                    // ↑ dois níveis acima da route
```

### Erro: "undefined status"
```javascript
// Certifique-se de importar do systemEnums
const { PropostaStatus } = require('../utils/systemEnums'); // ✅
const { StatusProposta } = require('../utils/enums');        // ⚠️ compatibilidade
```

### Erro: "enum validation failed"
```javascript
// Se receber erro como "PENDENTE" is not a valid status
// Verifique que o modelo está usando o enum correto
const { PropostaStatus } = require('../utils/systemEnums');

propostaSchema = {
  status: {
    enum: Object.values(PropostaStatus),  // ✅ Correto
    default: PropostaStatus.PENDENTE      // ✅ Correto
  }
};
```

---

## 📞 Suporte

Se encontrar problemas durante a migração:

1. Verifique este arquivo novamente
2. Confira os exemplos em `ARCHITECTURE.md`
3. Revise os controllers novos para ver a implementação
4. Consulte `REFACTORING_SUMMARY.md` para visão geral das mudanças
