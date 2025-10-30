const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const Verificacao = require('../../src/models/Verificacao');
const tokenService = require('../../src/services/tokenService');

describe('Verificacao Controller', () => {
  let userToken, adminToken;
  let usuario, admin;

  beforeEach(async () => {
    // Criar usuário comum
    usuario = await User.create({
      nome: 'Usuário Teste',
      email: 'usuario@test.com',
      senha: 'Test@123',
      cpf: '12345678901',
      tipo: 'prestador'
    });

    // Criar admin
    admin = await User.create({
      nome: 'Admin',
      email: 'admin@test.com',
      senha: 'Admin@123',
      cpf: '98765432101',
      tipo: 'admin',
      isAdmin: true
    });

    userToken = tokenService.generateToken({ id: usuario._id });
    adminToken = tokenService.generateToken({ id: admin._id });
  });

  describe('POST /api/verificacao/solicitar', () => {
    const dadosVerificacao = {
      documentos: {
        identidade: 'url-documento-identidade',
        comprovanteResidencia: 'url-comprovante-residencia',
        antecedentes: 'url-antecedentes'
      },
      telefone: '11999999999'
    };

    it('should create verification request successfully', async () => {
      const res = await request(app)
        .post('/api/verificacao/solicitar')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dadosVerificacao);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('status', 'pendente');
      expect(res.body.usuario.toString()).toBe(usuario._id.toString());
    });

    it('should not allow duplicate verification requests', async () => {
      // Criar solicitação inicial
      await Verificacao.create({
        usuario: usuario._id,
        documentos: dadosVerificacao.documentos,
        telefone: dadosVerificacao.telefone,
        status: 'pendente'
      });

      const res = await request(app)
        .post('/api/verificacao/solicitar')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dadosVerificacao);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Já existe uma solicitação de verificação para este usuário');
    });

    it('should validate required fields', async () => {
      const dadosIncompletos = {
        telefone: '11999999999'
      };

      const res = await request(app)
        .post('/api/verificacao/solicitar')
        .set('Authorization', `Bearer ${userToken}`)
        .send(dadosIncompletos);

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toContainEqual(
        expect.objectContaining({ msg: 'Documentos são obrigatórios' })
      );
    });
  });

  describe('PUT /api/verificacao/:id/aprovar', () => {
    let verificacao;

    beforeEach(async () => {
      verificacao = await Verificacao.create({
        usuario: usuario._id,
        documentos: {
          identidade: 'url-documento-identidade',
          comprovanteResidencia: 'url-comprovante-residencia',
          antecedentes: 'url-antecedentes'
        },
        telefone: '11999999999',
        status: 'pendente'
      });
    });

    it('should approve verification request successfully', async () => {
      const res = await request(app)
        .put(`/api/verificacao/${verificacao._id}/aprovar`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'aprovada');

      // Verificar se o usuário foi marcado como verificado
      const usuarioAtualizado = await User.findById(usuario._id);
      expect(usuarioAtualizado.verificado).toBe(true);
    });

    it('should not allow non-admin to approve', async () => {
      const res = await request(app)
        .put(`/api/verificacao/${verificacao._id}/aprovar`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty('message', 'Acesso negado');
    });
  });

  describe('PUT /api/verificacao/:id/rejeitar', () => {
    let verificacao;

    beforeEach(async () => {
      verificacao = await Verificacao.create({
        usuario: usuario._id,
        documentos: {
          identidade: 'url-documento-identidade',
          comprovanteResidencia: 'url-comprovante-residencia',
          antecedentes: 'url-antecedentes'
        },
        telefone: '11999999999',
        status: 'pendente'
      });
    });

    it('should reject verification request successfully', async () => {
      const motivo = 'Documentos ilegíveis';

      const res = await request(app)
        .put(`/api/verificacao/${verificacao._id}/rejeitar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ motivo });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status', 'rejeitada');
      expect(res.body).toHaveProperty('motivoRejeicao', motivo);

      // Verificar se o usuário continua não verificado
      const usuarioAtualizado = await User.findById(usuario._id);
      expect(usuarioAtualizado.verificado).toBe(false);
    });

    it('should require rejection reason', async () => {
      const res = await request(app)
        .put(`/api/verificacao/${verificacao._id}/rejeitar`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'Motivo da rejeição é obrigatório');
    });
  });

  describe('GET /api/verificacao', () => {
    beforeEach(async () => {
      // Criar múltiplas solicitações de verificação
      await Verificacao.create([
        {
          usuario: usuario._id,
          documentos: {
            identidade: 'url-1',
            comprovanteResidencia: 'url-1',
            antecedentes: 'url-1'
          },
          telefone: '11999999999',
          status: 'pendente'
        },
        {
          usuario: admin._id,
          documentos: {
            identidade: 'url-2',
            comprovanteResidencia: 'url-2',
            antecedentes: 'url-2'
          },
          telefone: '11888888888',
          status: 'aprovada'
        }
      ]);
    });

    it('should list all verification requests for admin', async () => {
      const res = await request(app)
        .get('/api/verificacao')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
    });

    it('should return only user own verification for non-admin', async () => {
      const res = await request(app)
        .get('/api/verificacao')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].usuario.toString()).toBe(usuario._id.toString());
    });
  });
});