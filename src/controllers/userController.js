const User = require('../models/User');

// Cadastro de novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password, cpf, phone } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Campos obrigatórios não preenchidos." });
    }

    // Verifica duplicidade de e-mail (RN01)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "E-mail já cadastrado." });
    }

    // Cria e salva novo usuário
    const newUser = new User({ name, email, password, cpf, phone });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso!",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    res.status(500).json({ success: false, message: "Erro interno no servidor." });
  }
};

// Rota de teste
exports.getUsers = (req, res) => {
  res.json([
    { id: 1, name: "Alex" },
    { id: 2, name: "Bena" }
  ]);
};
