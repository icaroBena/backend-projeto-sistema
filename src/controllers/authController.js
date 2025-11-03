const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Gerar Token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION
  });
};

// ============================
// Registro de novo usuário
// ============================
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Email já cadastrado' });
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password
    });

    await user.save();

    // Gerar token
    const token = generateToken(user._id);

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
    res.status(500).json({ success: false, message: 'Erro no servidor' });
  }
};

// ============================
// Login do usuário
// ============================
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Verificar se o usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
    }

    // Gerar token
    const token = generateToken(user._id);

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
