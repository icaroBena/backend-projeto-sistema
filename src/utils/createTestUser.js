require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({ email: 'test@example.com' });

    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test@123456'
    });

    await user.save();

    console.log("Usuário de teste criado com sucesso!");
    console.log("E-mail:", user.email);
    console.log("Senha:", "Test@123456");
    process.exit(0);
  } catch (err) {
    console.error("Erro ao criar usuário de teste:", err);
    process.exit(1);
  }
})();
