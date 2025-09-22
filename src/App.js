const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rotas principais
app.use("/api/users", userRoutes);

module.exports = app;