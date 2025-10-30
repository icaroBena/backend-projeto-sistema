const express = require("express");
const cors = require("cors");

// Importa as rotas
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const servicoRoutes = require("./routes/servicoRoutes");
const propostaRoutes = require("./routes/propostaRoutes");
const pagamentoRoutes = require("./routes/pagamentoRoutes");
const verificacaoRoutes = require("./routes/verificacaoRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais da API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/servicos", servicoRoutes);
app.use("/api/propostas", propostaRoutes);
app.use("/api/pagamentos", pagamentoRoutes);
app.use("/api/verificacao", verificacaoRoutes);
app.use("/api/categorias", categoriaRoutes);

// Rota raiz — aparece quando acessa http://localhost:5000/
app.get("/", (req, res) => {
  res.json({
    message: "API do WorkMatch rodando com Node.js",
    author: "Alex & Bena",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      servicos: "/api/servicos",
      propostas: "/api/propostas",
      pagamentos: "/api/pagamentos",
      verificacao: "/api/verificacao",
      categorias: "/api/categorias"
    },
    hint: "Acesse /api/users para ver os dados!"
  });
});

module.exports = app;
