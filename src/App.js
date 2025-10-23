const express = require("express");
const cors = require("cors");

// Importa as rotas
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais da API
app.use("/api/users", userRoutes);

// Rota raiz — aparece quando acessa http://localhost:5000/
app.get("/", (req, res) => {
  res.json({
    message: "API do WorkMatch rodando com Node.js",
    author: "Alex & Bena",
    endpoints: {
      users: "/api/users",
    },
    hint: "Acesse /api/users para ver os dados!"
  });
});

module.exports = app;
