require("dotenv").config(); 
const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ===========================================
  Servidor rodando com sucesso!
  URL: http://localhost:${PORT}
  Pressione CTRL+C para encerrar.
  ===========================================
  `);
});
