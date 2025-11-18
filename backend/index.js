// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas
app.get("/", (req, res) => {
  res.json({ msg: "API funcionando" });
});

app.use("/api/imagenes", require("./routes/imagenes"));
app.use("/api/categorias", require("./routes/categorias"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/comentarios", require("./routes/comentarios")); // ← SOLO AQUÍ
app.use("/api/favoritos", require("./routes/favoritos"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("Backend corriendo en puerto", PORT));
