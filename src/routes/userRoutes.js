const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { getUsers, register, me } = require("../controllers/userController");

// Perfil do usuário autenticado
router.get("/me", auth, me);

// Rotas padrão
router.get("/", getUsers);
router.post("/register", register);

module.exports = router;
