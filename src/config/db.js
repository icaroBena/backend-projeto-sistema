const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });S

const connectDB = async () => {
  try {
    console.log('Iniciando conexão com o MongoDB...');
    console.log('URI recebida:', process.env.MONGO_URI);

    if (!process.env.MONGO_URI) {
      throw new Error('Variável MONGO_URI não encontrada no .env');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB conectado com sucesso: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error.message);
    throw error;
  }
};

module.exports = connectDB;
