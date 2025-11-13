const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

(async () => {
  try {
    console.log("Conectando ao banco...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Removendo usuários cadastrados...");
    const result = await User.deleteMany({});

    console.log(`${result.deletedCount} usuários removidos.`);
    console.log("Sistema pronto para testes com cadastro limpo!");

    await mongoose.disconnect();
    console.log("Conexão encerrada.");
    
  } catch (err) {
    console.error("Erro ao limpar usuários:", err);
  }
})();

//Para resetar os usuários cadastrados, execute este script com o comando:
// node src/scripts/resetUsers.js
//Certifique-se de que a variável de ambiente MONGO_URI esteja configurada corretamente no arquivo .env.
//Para executar no mongo shell, use o comando: mongodb://127.0.0.1:27017 depois de add connection e deletar o cpf_1 dentro da pasta users caso dê o problema com o cpf de null