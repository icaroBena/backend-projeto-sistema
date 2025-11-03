const request = require('supertest');
const app = require('../../src/App');
const User = require('../../src/models/User');
const tokenService = require('../../src/services/tokenService');

describe('Auth Controller', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'Test@123456',
    cpf: '12345678901',
    tipo: 'cliente'
  };

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
      expect(res.body.user).not.toHaveProperty('senha');
    });

    it('should not register user with existing email', async () => {
      await User.create(testUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('message', 'E-mail já cadastrado');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors).toHaveLength(4); // nome, email, senha, tipo
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          senha: testUser.senha
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', testUser.email);
    });

    it('should not login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          senha: 'wrongpassword'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          senha: testUser.senha
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Credenciais inválidas');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let refreshToken;

    beforeEach(async () => {
      const user = await User.create(testUser);
      refreshToken = tokenService.generateRefreshToken(user._id);
    });

    it('should generate new token with valid refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('refreshToken');
    });

    it('should not refresh with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token inválido');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await User.create(testUser);
    });

    it('should send reset password email for existing user', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: testUser.email });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'E-mail de recuperação enviado');
    });

    it('should handle non-existent email gracefully', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('message', 'Usuário não encontrado');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken;

    beforeEach(async () => {
      const user = await User.create(testUser);
      resetToken = tokenService.generateToken({ id: user._id });
    });

    it('should reset password with valid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          senha: 'NewTest@123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Senha alterada com sucesso');
    });

    it('should not reset password with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          senha: 'NewTest@123'
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message', 'Token inválido');
    });
  });
});