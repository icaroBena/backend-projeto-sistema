const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const Notificacao = require('../../src/models/Notificacao');
const tokenService = require('../../src/services/tokenService');

describe('Notificacao Controller', () => {
  let userToken;
  let usuario;

  beforeEach(async () => {
    usuario = await User.create({
      nome: 'Usuário Teste',
      email: 'usuario@test.com',
      senha: 'Test@123',
      cpf: '12345678901',
      tipo: 'prestador'
    });

    userToken = tokenService.generateToken({ id: usuario._id });
  });

  describe('GET /api/notificacoes', () => {
    beforeEach(async () => {
      // Criar notificações de teste
      await Notificacao.create([
        {
          usuario: usuario._id,
          titulo: 'Notificação 1',
          mensagem: 'Mensagem da notificação 1',
          tipo: 'proposta',
          lida: false
        },
        {
          usuario: usuario._id,
          titulo: 'Notificação 2',
          mensagem: 'Mensagem da notificação 2',
          tipo: 'servico',
          lida: true
        }
      ]);
    });

    it('should list user notifications', async () => {
      const res = await request(app)
        .get('/api/notificacoes')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0]).toHaveProperty('usuario', usuario._id.toString());
    });

    it('should filter by read status', async () => {
      const res = await request(app)
        .get('/api/notificacoes?lida=false')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].lida).toBe(false);
    });
  });

  describe('PUT /api/notificacoes/:id/marcar-como-lida', () => {
    let notificacao;

    beforeEach(async () => {
      notificacao = await Notificacao.create({
        usuario: usuario._id,
        titulo: 'Notificação Teste',
        mensagem: 'Mensagem da notificação',
        tipo: 'proposta',
        lida: false
      });
    });

    it('should mark notification as read', async () => {
      const res = await request(app)
        .put(`/api/notificacoes/${notificacao._id}/marcar-como-lida`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('lida', true);
    });

    it('should not allow marking other user notification', async () => {
      const outroUsuario = await User.create({
        nome: 'Outro Usuário',
        email: 'outro@test.com',
        senha: 'Test@123',
        cpf: '98765432101',
        tipo: 'cliente'
      });
      const outroToken = tokenService.generateToken({ id: outroUsuario._id });

      const res = await request(app)
        .put(`/api/notificacoes/${notificacao._id}/marcar-como-lida`)
        .set('Authorization', `Bearer ${outroToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/notificacoes/marcar-todas-como-lidas', () => {
    beforeEach(async () => {
      // Criar várias notificações não lidas
      await Notificacao.create([
        {
          usuario: usuario._id,
          titulo: 'Notificação 1',
          mensagem: 'Mensagem 1',
          tipo: 'proposta',
          lida: false
        },
        {
          usuario: usuario._id,
          titulo: 'Notificação 2',
          mensagem: 'Mensagem 2',
          tipo: 'servico',
          lida: false
        }
      ]);
    });

    it('should mark all notifications as read', async () => {
      const res = await request(app)
        .put('/api/notificacoes/marcar-todas-como-lidas')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      // Verificar se todas as notificações foram marcadas como lidas
      const notificacoes = await Notificacao.find({ usuario: usuario._id });
      const todasLidas = notificacoes.every(n => n.lida === true);
      expect(todasLidas).toBe(true);
    });
  });

  describe('GET /api/notificacoes/nao-lidas', () => {
    beforeEach(async () => {
      await Notificacao.create([
        {
          usuario: usuario._id,
          titulo: 'Não Lida 1',
          mensagem: 'Mensagem 1',
          tipo: 'proposta',
          lida: false
        },
        {
          usuario: usuario._id,
          titulo: 'Lida',
          mensagem: 'Mensagem 2',
          tipo: 'servico',
          lida: true
        },
        {
          usuario: usuario._id,
          titulo: 'Não Lida 2',
          mensagem: 'Mensagem 3',
          tipo: 'verificacao',
          lida: false
        }
      ]);
    });

    it('should return count of unread notifications', async () => {
      const res = await request(app)
        .get('/api/notificacoes/nao-lidas')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('quantidade', 2);
    });
  });

  describe('DELETE /api/notificacoes/:id', () => {
    let notificacao;

    beforeEach(async () => {
      notificacao = await Notificacao.create({
        usuario: usuario._id,
        titulo: 'Notificação para Deletar',
        mensagem: 'Mensagem teste',
        tipo: 'proposta',
        lida: false
      });
    });

    it('should delete notification', async () => {
      const res = await request(app)
        .delete(`/api/notificacoes/${notificacao._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);

      // Verificar se a notificação foi realmente deletada
      const notificacaoDeletada = await Notificacao.findById(notificacao._id);
      expect(notificacaoDeletada).toBeNull();
    });

    it('should not allow deleting other user notification', async () => {
      const outroUsuario = await User.create({
        nome: 'Outro Usuário',
        email: 'outro@test.com',
        senha: 'Test@123',
        cpf: '11122233344',
        tipo: 'cliente'
      });
      const outroToken = tokenService.generateToken({ id: outroUsuario._id });

      const res = await request(app)
        .delete(`/api/notificacoes/${notificacao._id}`)
        .set('Authorization', `Bearer ${outroToken}`);

      expect(res.status).toBe(403);
    });
  });
});