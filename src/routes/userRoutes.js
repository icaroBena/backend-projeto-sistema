const express = require("express");
const router = express.Router();
const { getUsers, register } = require("../controllers/userController");

// Rotas de usuários
router.get("/", getUsers);           // lista simples
router.post("/register", register);  // cadastro de novo usuário

module.exports = router;