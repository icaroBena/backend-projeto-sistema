const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const Servico = require('../../src/models/Servico');
const Proposta = require('../../src/models/Proposta');
const Pagamento = require('../../src/models/Pagamento');
const tokenService = require('../../src/services/tokenService');

describe('Pagamento Service', () => {
  let clienteToken, prestadorToken;
  let cliente, prestador, servico, proposta;

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
      status: 'aberto'
    });

    // Criar proposta aceita
    proposta = await Proposta.create({
      servico: servico._id,
      prestador: prestador._id,
      valor: 1000,
      prazoEntrega: 7,
      descricao: 'Proposta de teste',
      status: 'aceita'
    });
  });

  describe('POST /api/pagamentos', () => {
    it('should create a new payment successfully', async () => {
      const pagamentoData = {
        propostaId: proposta._id,
        valor: 1000,
        metodoPagamento: 'pix'
      };

      const res = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(pagamentoData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'pendente');
      expect(res.body.valor).toBe(1000);
    });

    it('should validate payment amount matches proposal', async () => {
      const pagamentoData = {
        propostaId: proposta._id,
        valor: 900, // Valor diferente da proposta
        metodoPagamento: 'pix'
      };

      const res = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(pagamentoData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Valor do pagamento não corresponde ao valor da proposta');
    });

    it('should not allow payment for non-accepted proposal', async () => {
      // Criar proposta não aceita
      const propostaPendente = await Proposta.create({
        servico: servico._id,
        prestador: prestador._id,
        valor: 1000,
        prazoEntrega: 7,
        descricao: 'Proposta pendente',
        status: 'pendente'
      });

      const pagamentoData = {
        propostaId: propostaPendente._id,
        valor: 1000,
        metodoPagamento: 'pix'
      };

      const res = await request(app)
        .post('/api/pagamentos')
        .set('Authorization', `Bearer ${clienteToken}`)
        .send(pagamentoData);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Pagamento só pode ser realizado para propostas aceitas');
    });
  });

  describe('POST /api/pagamentos/:id/liberar', () => {
    let pagamento;

    beforeEach(async () => {
      pagamento = await Pagamento.create({
        proposta: proposta._id,
        valor: 1000,
        status: 'pendente',
        metodoPagamento: 'pix'
      });

      // Atualizar serviço como finalizado
      await Servico.findByIdAndUpdate(servico._id, { status: 'finalizado' });

      // Adicionar avaliação à proposta
      await Proposta.findByIdAndUpdate(proposta._id, {
        avaliacao: {
          nota: 5,
          comentario: 'Ótimo serviço'
        }
      });
    });

    it('should release payment when conditions are met', async () => {
      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/liberar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'liberado');
    });

    it('should not release payment without service completion', async () => {
      // Reverter status do serviço para em andamento
      await Servico.findByIdAndUpdate(servico._id, { status: 'em_andamento' });

      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/liberar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Pagamento só pode ser liberado após conclusão do serviço');
    });

    it('should not release payment without evaluation', async () => {
      // Remover avaliação
      await Proposta.findByIdAndUpdate(proposta._id, { $unset: { avaliacao: 1 } });

      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/liberar`)
        .set('Authorization', `Bearer ${clienteToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Pagamento só pode ser liberado após avaliação do serviço');
    });
  });

  describe('POST /api/pagamentos/:id/estornar', () => {
    let pagamento;

    beforeEach(async () => {
      pagamento = await Pagamento.create({
        proposta: proposta._id,
        valor: 1000,
        status: 'pendente',
        metodoPagamento: 'pix'
      });
    });

    it('should refund payment successfully', async () => {
      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/estornar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo: 'Serviço não realizado conforme acordado' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'estornado');
      expect(res.body).toHaveProperty('motivoEstorno');
    });

    it('should not refund already released payment', async () => {
      await Pagamento.findByIdAndUpdate(pagamento._id, { status: 'liberado' });

      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/estornar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo: 'Tentativa de estorno' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Pagamento já foi liberado e não pode ser estornado');
    });

    it('should not refund already refunded payment', async () => {
      await Pagamento.findByIdAndUpdate(pagamento._id, { status: 'estornado' });

      const res = await request(app)
        .post(`/api/pagamentos/${pagamento._id}/estornar`)
        .set('Authorization', `Bearer ${clienteToken}`)
        .send({ motivo: 'Tentativa de estorno' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Pagamento já foi estornado');
    });
  });
});