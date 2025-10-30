const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const Servico = require('../../src/models/Servico');
const Categoria = require('../../src/models/Categoria');
const tokenService = require('../../src/services/tokenService');

describe('Serviço Controller', () => {
  let clienteToken, prestadorToken;
  let cliente, prestador, categoria;

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

    categoria = await Categoria.create({
      nome: 'Categoria Teste',
      descricao: 'Descrição da categoria teste'
    });

    clienteToken = tokenService.generateToken({ id: cliente._id });
    prestadorToken = tokenService.generateToken({ id: prestador._id });
  });

  describe('POST /api/servicos', () => {
    const servicoValido = {
      titulo: 'Serviço de Teste',
      descricao: 'Descrição detalhada do serviço de teste',
      categoriaId: null, // será preenchido no beforeEach
      localServico: {
        tipo: 'presencial',
        endereco: 'Rua Teste, 123'
      },
      prazoEstimado: 7
    };

    beforeEach(() => {
      servicoValido.categoriaId = categoria._id;
    });

    it('should create a new service successfully', async () => {
      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(servicoValido);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('titulo', servicoValido.titulo);
      expect(res.body).toHaveProperty('status', 'aberto');
      expect(res.body.cliente.toString()).toBe(cliente._id.toString());
    });

    it('should validate required fields', async () => {
      const servicoInvalido = {
        titulo: '',
        descricao: '',
        categoriaId: categoria._id
      };

      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(servicoInvalido);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('errors');
      expect(res.body.errors).toHaveLength(3); // titulo, descricao, localServico
    });

    it('should not allow prestador to create service', async () => {
      const res = await request(app)
        .post('/api/servicos')
        .set('Authorization', `Bearer ${prestadorToken}`)
        .send(servicoValido);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Apenas clientes podem criar serviços');
    });
  });

  describe('GET /api/servicos', () => {
    beforeEach(async () => {
      // Criar alguns serviços para testar
      await Servico.create([
        {
          titulo: 'Serviço 1',
          descricao: 'Descrição 1',
          categoria: categoria._id,
          cliente: cliente._id,
          status: 'aberto',
          localServico: { tipo: 'remoto' }
        },
        {
          titulo: 'Serviço 2',
          descricao: 'Descrição 2',
          categoria: categoria._id,
          cliente: cliente._id,
          status: 'aberto',
          localServico: { tipo: 'presencial', endereco: 'Rua Test' }
        }
      ]);
    });

    it('should list all services', async () => {
      const res = await request(app)
        .get('/api/servicos');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('should filter services by category', async () => {
      const res = await request(app)
        .get(`/api/servicos?categoria=${categoria._id}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every(s => s.categoria._id.toString() === categoria._id.toString())).toBe(true);
    });

    it('should filter services by status', async () => {
      const res = await request(app)
        .get('/api/servicos?status=aberto');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.every(s => s.status === 'aberto')).toBe(true);
    });
  });

  describe('PUT /api/servicos/:id', () => {
    let servico;

    beforeEach(async () => {
      servico = await Servico.create({
        titulo: 'Serviço Original',
        descricao: 'Descrição original',
        categoria: categoria._id,
        cliente: cliente._id,
        status: 'aberto',
        localServico: { tipo: 'remoto' }
      });
    });

    it('should update service successfully', async () => {
      const atualizacao = {
        titulo: 'Serviço Atualizado',
        descricao: 'Descrição atualizada'
      };

      const res = await request(app)
        .put(`/api/servicos/${servico._id}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(atualizacao);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('titulo', atualizacao.titulo);
      expect(res.body).toHaveProperty('descricao', atualizacao.descricao);
    });

    it('should not allow other users to update service', async () => {
      const res = await request(app)
        .put(`/api/servicos/${servico._id}`)
        .set('Authorization', `Bearer ${prestadorToken}`)
        .send({ titulo: 'Tentativa de alteração' });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Não autorizado a modificar este serviço');
    });

    it('should not update service with invalid status', async () => {
      const res = await request(app)
        .put(`/api/servicos/${servico._id}`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ status: 'status_invalido' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Status inválido');
    });
  });

  describe('PUT /api/servicos/:id/cancelar', () => {
    let servico;

    beforeEach(async () => {
      servico = await Servico.create({
        titulo: 'Serviço para Cancelar',
        descricao: 'Descrição do serviço',
        categoria: categoria._id,
        cliente: cliente._id,
        status: 'aberto',
        localServico: { tipo: 'remoto' }
      });
    });

    it('should cancel service successfully', async () => {
      const res = await request(app)
        .put(`/api/servicos/${servico._id}/cancelar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo: 'Motivo do cancelamento' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'cancelado');
      expect(res.body).toHaveProperty('motivoCancelamento', 'Motivo do cancelamento');
    });

    it('should not cancel service without motivo', async () => {
      const res = await request(app)
        .put(`/api/servicos/${servico._id}/cancelar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Motivo do cancelamento é obrigatório');
    });

    it('should not cancel service that is already finished', async () => {
      await Servico.findByIdAndUpdate(servico._id, { status: 'finalizado' });

      const res = await request(app)
        .put(`/api/servicos/${servico._id}/cancelar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo: 'Tentativa de cancelamento' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Não é possível cancelar um serviço finalizado');
    });
  });
});