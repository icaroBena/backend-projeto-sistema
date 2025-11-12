const User = require('../models/User');
const { validationResult } = require('express-validator');
const TokenService = require('../services/tokenService'); 

// ============================
// Registro de novo usuário
// ============================
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, cpf, tipo, phone } = req.body;

    // Validação adicional para CPF e tipo de usuário
    if (cpf && !/^\d{3}\.\d{3}\.\d{3}\-\d{2}$/.test(cpf)) {
      return res.status(400).json({ success: false, message: 'CPF inválido. Use o formato 000.000.000-00.' });
    }

    if (tipo && !['cliente', 'prestador'].includes(tipo)) {
      return res.status(400).json({ success: false, message: 'Tipo de usuário inválido. Use cliente ou prestador.' });
    }

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    // ✅ Cria o objeto apenas com os campos preenchidos (sem cpf: null)
    const userData = {
      name,
      email,
      password,
      role: tipo || 'user'
    };

    if (cpf) userData.cpf = cpf;
    if (phone) userData.phone = phone;

    const user = new User(userData);
    await user.save();

    // Gerar token JWT via TokenService 
    const token = TokenService.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Erro ao registrar:", error);
    // Se for erro de índice duplicado (CPF já existente)
    if (error.code === 11000 && error.keyPattern?.cpf) {
      return res.status(400).json({ success: false, message: 'CPF já cadastrado.' });
    }
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// ============================
// Login do usuário
// ============================
exports.login = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log("Iniciando processo de login");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      console.log("Usuário não encontrado durante o login");
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Senha inválida durante o login");
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    // Gerar token JWT via TokenService 
    const token = TokenService.generateToken({
      id: user._id,
      email: user.email,
      role: user.role
    });

    res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// ============================
// Perfil do usuário autenticado
// ============================
exports.getProfile = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// ============================
// Atualizar perfil do usuário
// ============================
exports.updateProfile = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ success: false, message: 'Atualizações inválidas' });
    }

    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();

    res.json({
      success: true,
      message: "Perfil atualizado com sucesso",
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};
