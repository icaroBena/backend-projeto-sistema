const express = require("express");
const cors = require("cors");
const { swaggerSpec, swaggerUi } = require("./config/swagger");

// Importa as rotas
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const categoriaRoutes = require("./routes/categoriaRoutes");

// Importa rotas de casos de uso - Propostas
const receberPropostaRoutes = require("./routes/receberPropostaRoutes");
const confirmarPropostaRoutes = require("./routes/confirmarPropostaRoutes");
const negociarPropostaRoutes = require("./routes/negociarPropostaRoutes");

// Importa rotas de casos de uso - Serviços
const publicarServicoRoutes = require("./routes/publicarServicoRoutes");
const finalizarServicoRoutes = require("./routes/finalizarServicoRoutes");

// Importa rotas de casos de uso - Pagamentos
const processarPagamentoRoutes = require("./routes/processarPagamentoRoutes");
const reembolsoRoutes = require("./routes/reembolsoRoutes");

// Importa rotas de casos de uso - Verificação e Recuperação
const verificarPrestadorRoutes = require("./routes/verificarPrestadorRoutes");
const recuperarSenhaRoutes = require("./routes/recuperarSenhaRoutes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Documentação Swagger
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "WorkMatch API Documentation"
}));

// Rotas principais da API
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/categorias", categoriaRoutes);

// Rotas de casos de uso - Propostas
app.use("/api/propostas/receber", receberPropostaRoutes);
app.use("/api/propostas/confirmar", confirmarPropostaRoutes);
app.use("/api/propostas/negociar", negociarPropostaRoutes);

// Rotas de casos de uso - Serviços
app.use("/api/servicos/publicar", publicarServicoRoutes);
app.use("/api/servicos/finalizar", finalizarServicoRoutes);

// Rotas de casos de uso - Pagamentos
app.use("/api/pagamentos/processar", processarPagamentoRoutes);
app.use("/api/reembolsos", reembolsoRoutes);

// Rotas de casos de uso - Verificação e Recuperação
app.use("/api/verificacao", verificarPrestadorRoutes);
app.use("/api/recuperar-senha", recuperarSenhaRoutes);

// Rota raiz — aparece quando acessa http://localhost:5000/
app.get("/api", (req, res) => {
  res.json({
    message: "API do WorkMatch rodando com Node.js",
    author: "Alex & Bena",
    endpoints: {
      users: "/api/users",
      auth: "/api/auth",
      categorias: "/api/categorias",
      propostas: {
        receber: "/api/propostas/receber",
        confirmar: "/api/propostas/confirmar",
        negociar: "/api/propostas/negociar"
      },
      servicos: {
        publicar: "/api/servicos/publicar",
        finalizar: "/api/servicos/finalizar"
      },
      pagamentos: {
        processar: "/api/pagamentos/processar",
        reembolsos: "/api/reembolsos"
      },
      verificacao: "/api/verificacao",
      recuperarSenha: "/api/recuperar-senha"
    },
    hint: "Acesse /api/docs para documentação completa!"
  });
});

module.exports = app;
