require("dotenv").config();
const app = require("./App");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

// Conectar ao banco de dados
connectDB()
  .then(() => {
    // Iniciar o servidor após conectar ao banco
    app.listen(PORT, () => {
      console.log(`
===========================================
Servidor rodando com sucesso!
URL: http://localhost:${PORT}
Banco de dados: Conectado
Ambiente: ${process.env.NODE_ENV}
Pressione CTRL+C para encerrar.
===========================================
`);
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados:", error);
    process.exit(1);
  });
