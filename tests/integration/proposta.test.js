const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const Servico = require('../../src/models/Servico');
const Proposta = require('../../src/models/Proposta');
const tokenService = require('../../src/services/tokenService');

describe('Proposta Controller', () => {
  let clienteToken, prestadorToken;
  let cliente, prestador, servico;

  beforeEach(async () => {
    // Criar usuários de teste
    cliente = await User.create({
      nome: 'Cliente Teste',
      email: 'cliente@test.com',
      senha: 'Test@123',
      cpf: '12345678901',
      tipo: 'cliente'
    });

    prestador = await User.create({
      nome: 'Prestador Teste',
      email: 'prestador@test.com',
      senha: 'Test@123',
      cpf: '98765432101',
      tipo: 'prestador'
    });

    clienteToken = tokenService.generateToken({ id: cliente._id });
    prestadorToken = tokenService.generateToken({ id: prestador._id });

    // Criar serviço de teste
    servico = await Servico.create({
      titulo: 'Serviço Teste',
      descricao: 'Descrição do serviço teste',
      categoriaId: '5f7b5d76e25c5c2e8c25c8f1',
      cliente: cliente._id,
      status: 'aberto',
      localServico: { tipo: 'remoto' }
    });
  });

  describe('POST /api/propostas', () => {
    const propostaValida = {
      valor: 1000,
      prazoEntrega: 7,
      descricao: 'Proposta detalhada para o serviço'
    };

    beforeEach(() => {
      propostaValida.servicoId = servico._id;
    });

    it('should create a new proposal successfully', async () => {
      const res = await request(app)
        .post('/api/propostas')
        .set('Authorization', `Bearer ${prestadorToken}`)
        .send(propostaValida);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('valor', propostaValida.valor);
      expect(res.body).toHaveProperty('status', 'pendente');
      expect(res.body.prestador.toString()).toBe(prestador._id.toString());
    });

    it('should not allow client to create proposal', async () => {
      const res = await request(app)
        .post('/api/propostas')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(propostaValida);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Apenas prestadores podem criar propostas');
    });

    it('should validate required fields', async () => {
      const propostaInvalida = {
        servicoId: servico._id
      };

      const res = await request(app)
        .post('/api/propostas')
        .set('Authorization', `Bearer ${prestadorToken}`)
        .send(propostaInvalida);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toHaveLength(3); // valor, prazoEntrega, descricao
    });
  });

  describe('PUT /api/propostas/:id/aceitar', () => {
    let proposta;

    beforeEach(async () => {
      proposta = await Proposta.create({
        servico: servico._id,
        prestador: prestador._id,
        valor: 1000,
        prazoEntrega: 7,
        descricao: 'Proposta teste',
        status: 'pendente'
      });
    });

    it('should accept proposal successfully', async () => {
      const res = await request(app)
        .put(`/api/propostas/${proposta._id}/aceitar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'aceita');

      // Verificar se o serviço foi atualizado
      const servicoAtualizado = await Servico.findById(servico._id);
      expect(servicoAtualizado.status).toBe('em_andamento');
    });

    it('should not allow prestador to accept proposal', async () => {
      const res = await request(app)
        .put(`/api/propostas/${proposta._id}/aceitar`)
        .set('Authorization', `Bearer ${prestadorToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Apenas o cliente pode aceitar a proposta');
    });

    it('should not accept already accepted proposal', async () => {
      await Proposta.findByIdAndUpdate(proposta._id, { status: 'aceita' });

      const res = await request(app)
        .put(`/api/propostas/${proposta._id}/aceitar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Esta proposta não pode ser aceita');
    });
  });

  describe('PUT /api/propostas/:id/recusar', () => {
    let proposta;

    beforeEach(async () => {
      proposta = await Proposta.create({
        servico: servico._id,
        prestador: prestador._id,
        valor: 1000,
        prazoEntrega: 7,
        descricao: 'Proposta teste',
        status: 'pendente'
      });
    });

    it('should reject proposal successfully', async () => {
      const motivo = 'Valor muito alto';
      
      const res = await request(app)
        .put(`/api/propostas/${proposta._id}/recusar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'recusada');
      expect(res.body).toHaveProperty('motivoRecusa', motivo);
    });

    it('should require rejection reason', async () => {
      const res = await request(app)
        .put(`/api/propostas/${proposta._id}/recusar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Motivo da recusa é obrigatório');
    });
  });

  describe('GET /api/propostas/servico/:servicoId', () => {
    beforeEach(async () => {
      // Criar múltiplas propostas
      await Proposta.create([
        {
          servico: servico._id,
          prestador: prestador._id,
          valor: 1000,
          prazoEntrega: 7,
          descricao: 'Proposta 1',
          status: 'pendente'
        },
        {
          servico: servico._id,
          prestador: prestador._id,
          valor: 1200,
          prazoEntrega: 5,
          descricao: 'Proposta 2',
          status: 'pendente'
        }
      ]);
    });

    it('should list all proposals for a service', async () => {
      const res = await request(app)
        .get(`/api/propostas/servico/${servico._id}`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('should allow only client and prestador to view proposals', async () => {
      const outroUsuario = await User.create({
        nome: 'Outro Usuário',
        email: 'outro@test.com',
        senha: 'Test@123',
        cpf: '11122233344',
        tipo: 'cliente'
      });
      const outroToken = tokenService.generateToken({ id: outroUsuario._id });

      const res = await request(app)
        .get(`/api/propostas/servico/${servico._id}`)
        .set('Authorization', `Bearer ${outroToken}`);

      expect(res.status).toBe(403);
    });
  });
});