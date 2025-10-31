# WorkMatch API

Backend do sistema WorkMatch - Plataforma de conexão entre prestadores de serviço e clientes.

##  Tecnologias

- Node.js
- Express
- MongoDB
- JWT
- Jest
- Swagger

##  Pré-requisitos

- Node.js 16+
- MongoDB
- NPM ou Yarn

##  Instalação

1. Clone o repositório:
```bash
git clone https://github.com/icaroBena/backend-projeto-sistema.git
cd backend-projeto-sistema
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```
Edite o arquivo `.env` com suas configurações

##  Configuração

O projeto usa as seguintes variáveis de ambiente:

- `PORT`: Porta do servidor (padrão: 3000)
- `MONGODB_URI`: URI de conexão com MongoDB
- `JWT_SECRET`: Chave secreta para tokens JWT
- `EMAIL_HOST`: Servidor SMTP para envio de emails
- `EMAIL_USER`: Usuário SMTP
- `EMAIL_PASS`: Senha SMTP
- `UPLOAD_DIR`: Diretório para upload de arquivos
- `FRONTEND_URL`: URL do frontend para CORS

##  Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

### Testes
```bash
# Testes unitários e de integração
npm test

# Coverage
npm run test:coverage
```

##  Documentação

A documentação da API está disponível em:

```
http://localhost:3000/api/docs
```

### Principais endpoints:

- **Auth**
  - POST /api/auth/register
  - POST /api/auth/login
  
- **Usuários**
  - GET /api/users
  - GET /api/users/:id
  - PUT /api/users/:id
  
- **Serviços**
  - GET /api/servicos
  - POST /api/servicos
  - GET /api/servicos/:id
  - PUT /api/servicos/:id
  
- **Propostas**
  - POST /api/propostas
  - GET /api/propostas/servico/:servicoId
  - PUT /api/propostas/:id/aceitar
  - PUT /api/propostas/:id/recusar
  
- **Pagamentos**
  - POST /api/pagamentos
  - GET /api/pagamentos/:id
  - POST /api/pagamentos/:id/confirmar
  
- **Verificação**
  - POST /api/verificacao/solicitar
  - PUT /api/verificacao/:id/aprovar
  - PUT /api/verificacao/:id/rejeitar
  
- **Notificações**
  - GET /api/notificacoes
  - PUT /api/notificacoes/:id/marcar-como-lida
  - PUT /api/notificacoes/marcar-todas-como-lidas
  - GET /api/notificacoes/nao-lidas

##  Scripts

- `npm start`: Inicia em produção
- `npm run dev`: Inicia em desenvolvimento com hot-reload
- `npm test`: Executa testes
- `npm run test:coverage`: Relatório de cobertura de testes
- `npm run lint`: Verifica estilo de código
- `npm run lint:fix`: Corrige problemas de estilo
- `npm run seed`: Popula banco com dados iniciais
- `npm run docs`: Gera documentação Swagger

##  Segurança

- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Validação de entrada com express-validator
- Proteção contra XSS e CSRF
- Rate limiting
- Helmet para headers de segurança
- CORS configurado

##  Licença

Este projeto está sob a licença MIT.

##  Contribuição

1. Faça o fork
2. Crie sua branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Crie um Pull Request
