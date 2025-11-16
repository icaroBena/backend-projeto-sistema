# 🔄 GUIA DE MIGRAÇÃO DE DADOS - Enums em Maiúscula

## ⚠️ ATENÇÃO: Mudança de Valores de Enums

Os valores dos enums foram **alterados de minúscula para MAIÚSCULA**:

### Valores Antigos vs Novos

#### Propostas
```
ANTIGO → NOVO
'pendente' → 'PENDENTE'
'aceita' → 'ACEITA'
'recusada' → 'RECUSADA'
```

#### Serviços
```
ANTIGO → NOVO
'pendente' → 'PENDENTE'
'execução' → 'EXECUÇÃO'
'concluído' → 'CONCLUÍDO'
'aprovado' → 'APROVADO'
```

#### Pagamentos
```
ANTIGO → NOVO
'pendente' → 'PENDENTE'
'aprovado' → 'APROVADO'
'capturado' → 'CAPTURADO'
'rejeitado' → 'REJEITADO'
'reembolsado' → 'REEMBOLSADO'
'em_analise' → 'EM_ANALISE'
'erro_conexao' → 'ERRO_CONEXAO'
```

#### Prestadores/Verificação
```
ANTIGO → NOVO
'pendente' → 'PENDENTE'
'aprovado' → 'APROVADO'
'reprovado' → 'REPROVADO'
```

#### Reembolsos
```
ANTIGO → NOVO
'pendente' → 'PENDENTE'
'em_analise' → 'EM_ANALISE'
'aprovado' → 'APROVADO'
'rejeitado' → 'REJEITADO'
'processando' → 'PROCESSANDO'
'concluido' → 'CONCLUIDO'
```

---

## 🔧 Scripts de Migração MongoDB

Execute estes comandos em seu MongoDB para migrar os dados:

### 1. Tabela Propostas
```javascript
// Migrar status de propostas
db.propostas.updateMany(
  { status: 'pendente' },
  { $set: { status: 'PENDENTE' } }
);

db.propostas.updateMany(
  { status: 'aceita' },
  { $set: { status: 'ACEITA' } }
);

db.propostas.updateMany(
  { status: 'recusada' },
  { $set: { status: 'RECUSADA' } }
);
```

### 2. Tabela Serviços
```javascript
// Migrar status de serviços
db.servicos.updateMany(
  { status: 'pendente' },
  { $set: { status: 'PENDENTE' } }
);

db.servicos.updateMany(
  { status: 'execução' },
  { $set: { status: 'EXECUÇÃO' } }
);

db.servicos.updateMany(
  { status: 'concluído' },
  { $set: { status: 'CONCLUÍDO' } }
);

db.servicos.updateMany(
  { status: 'aprovado' },
  { $set: { status: 'APROVADO' } }
);
```

### 3. Tabela Pagamentos
```javascript
// Migrar status de pagamentos
db.pagamentos.updateMany(
  { status: 'pendente' },
  { $set: { status: 'PENDENTE' } }
);

db.pagamentos.updateMany(
  { status: 'aprovado' },
  { $set: { status: 'APROVADO' } }
);

db.pagamentos.updateMany(
  { status: 'capturado' },
  { $set: { status: 'CAPTURADO' } }
);

db.pagamentos.updateMany(
  { status: 'rejeitado' },
  { $set: { status: 'REJEITADO' } }
);

db.pagamentos.updateMany(
  { status: 'reembolsado' },
  { $set: { status: 'REEMBOLSADO' } }
);

db.pagamentos.updateMany(
  { status: 'em_analise' },
  { $set: { status: 'EM_ANALISE' } }
);

db.pagamentos.updateMany(
  { status: 'erro_conexao' },
  { $set: { status: 'ERRO_CONEXAO' } }
);
```

### 4. Tabela Verificações (Prestadores)
```javascript
// Migrar status de verificações
db.verificacaos.updateMany(
  { status: 'pendente' },
  { $set: { status: 'PENDENTE' } }
);

db.verificacaos.updateMany(
  { status: 'aprovado' },
  { $set: { status: 'APROVADO' } }
);

db.verificacaos.updateMany(
  { status: 'reprovado' },
  { $set: { status: 'REPROVADO' } }
);
```

### 5. Tabela Reembolsos
```javascript
// Migrar status de reembolsos
db.reembolsos.updateMany(
  { status: 'pendente' },
  { $set: { status: 'PENDENTE' } }
);

db.reembolsos.updateMany(
  { status: 'em_analise' },
  { $set: { status: 'EM_ANALISE' } }
);

db.reembolsos.updateMany(
  { status: 'aprovado' },
  { $set: { status: 'APROVADO' } }
);

db.reembolsos.updateMany(
  { status: 'rejeitado' },
  { $set: { status: 'REJEITADO' } }
);

db.reembolsos.updateMany(
  { status: 'processando' },
  { $set: { status: 'PROCESSANDO' } }
);

db.reembolsos.updateMany(
  { status: 'concluido' },
  { $set: { status: 'CONCLUIDO' } }
);
```

### 6. Tabela Prestadores
```javascript
// Migrar status de verificação em prestadores
db.prestadors.updateMany(
  { statusVerificacao: 'pendente' },
  { $set: { statusVerificacao: 'PENDENTE' } }
);

db.prestadors.updateMany(
  { statusVerificacao: 'aprovado' },
  { $set: { statusVerificacao: 'APROVADO' } }
);

db.prestadors.updateMany(
  { statusVerificacao: 'reprovado' },
  { $set: { statusVerificacao: 'REPROVADO' } }
);
```

---

## 🛠️ Migração via Node.js Script

Se preferir fazer a migração via Node.js:

```javascript
const mongoose = require('mongoose');
const Proposta = require('./src/models/Proposta');
const Servico = require('./src/models/Servico');
const Pagamento = require('./src/models/Pagamento');
const Verificacao = require('./src/models/Verificacao');
const Reembolso = require('./src/models/Reembolso');
const Prestador = require('./src/models/Prestador');

async function migrateEnums() {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('🔄 Iniciando migração de enums...');
    
    // Propostas
    await Proposta.updateMany({ status: 'pendente' }, { status: 'PENDENTE' });
    await Proposta.updateMany({ status: 'aceita' }, { status: 'ACEITA' });
    await Proposta.updateMany({ status: 'recusada' }, { status: 'RECUSADA' });
    console.log('✅ Propostas migradas');
    
    // Serviços
    await Servico.updateMany({ status: 'pendente' }, { status: 'PENDENTE' });
    await Servico.updateMany({ status: 'execução' }, { status: 'EXECUÇÃO' });
    await Servico.updateMany({ status: 'concluído' }, { status: 'CONCLUÍDO' });
    await Servico.updateMany({ status: 'aprovado' }, { status: 'APROVADO' });
    console.log('✅ Serviços migrados');
    
    // Pagamentos
    await Pagamento.updateMany({ status: 'pendente' }, { status: 'PENDENTE' });
    await Pagamento.updateMany({ status: 'aprovado' }, { status: 'APROVADO' });
    await Pagamento.updateMany({ status: 'capturado' }, { status: 'CAPTURADO' });
    await Pagamento.updateMany({ status: 'rejeitado' }, { status: 'REJEITADO' });
    await Pagamento.updateMany({ status: 'reembolsado' }, { status: 'REEMBOLSADO' });
    await Pagamento.updateMany({ status: 'em_analise' }, { status: 'EM_ANALISE' });
    await Pagamento.updateMany({ status: 'erro_conexao' }, { status: 'ERRO_CONEXAO' });
    console.log('✅ Pagamentos migrados');
    
    // Verificações
    await Verificacao.updateMany({ status: 'pendente' }, { status: 'PENDENTE' });
    await Verificacao.updateMany({ status: 'aprovado' }, { status: 'APROVADO' });
    await Verificacao.updateMany({ status: 'reprovado' }, { status: 'REPROVADO' });
    console.log('✅ Verificações migradas');
    
    // Reembolsos
    await Reembolso.updateMany({ status: 'pendente' }, { status: 'PENDENTE' });
    await Reembolso.updateMany({ status: 'em_analise' }, { status: 'EM_ANALISE' });
    await Reembolso.updateMany({ status: 'aprovado' }, { status: 'APROVADO' });
    await Reembolso.updateMany({ status: 'rejeitado' }, { status: 'REJEITADO' });
    await Reembolso.updateMany({ status: 'processando' }, { status: 'PROCESSANDO' });
    await Reembolso.updateMany({ status: 'concluido' }, { status: 'CONCLUIDO' });
    console.log('✅ Reembolsos migrados');
    
    // Prestadores
    await Prestador.updateMany({ statusVerificacao: 'pendente' }, { statusVerificacao: 'PENDENTE' });
    await Prestador.updateMany({ statusVerificacao: 'aprovado' }, { statusVerificacao: 'APROVADO' });
    await Prestador.updateMany({ statusVerificacao: 'reprovado' }, { statusVerificacao: 'REPROVADO' });
    console.log('✅ Prestadores migrados');
    
    console.log('✨ Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    process.exit(1);
  }
}

migrateEnums();
```

---

## ✅ Checklist Pós-Migração

- [ ] Backup do banco de dados feito
- [ ] Scripts de migração testados em staging
- [ ] Migração executada em produção
- [ ] Dados verificados (amostras)
- [ ] Testes de API executados
- [ ] Frontend testado com novos valores
- [ ] Logs verificados para erros

---

## 🆘 Rollback (Se Necessário)

Se algo der errado, você pode reverter com os comandos inversos:

```javascript
// Exemplo: Reverter Propostas
db.propostas.updateMany(
  { status: 'PENDENTE' },
  { $set: { status: 'pendente' } }
);
```

---

## 📝 Notas Importantes

1. **Backup Primeiro**: Sempre faça backup do banco de dados antes
2. **Teste em Staging**: Execute a migração em environment de teste primeiro
3. **Downtime**: Considere fazer a migração fora do horário de pico
4. **Validação**: Após migração, valide alguns registros
5. **Frontend**: Certifique-se de que o frontend está atualizado

---

**Data de Migração Recomendada**: Assim que todos os testes passarem
