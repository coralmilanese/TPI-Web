// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const app = express();

// -----------------------------
// Middlewares globales
// -----------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // logs en consola de cada request
app.disable("x-powered-by"); // seguridad básica


// -----------------------------
// Archivos estáticos (uploads)
// -----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// -----------------------------
// Ruta principal test
// -----------------------------
app.get("/", (req, res) => {
  res.json({ msg: "API funcionando correctamente" });
});


// -----------------------------
// Rutas API (todas funcionando)
// -----------------------------
app.use("/api/imagenes", require("./routes/imagenes"));
app.use("/api/categorias", require("./routes/categorias"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/usuarios", require("./routes/usuarios"));
app.use("/api/comentarios", require("./routes/comentarios"));
app.use("/api/favoritos", require("./routes/favoritos"));

// Preparado para futuros módulos:
app.use("/api/videos", require("./routes/videos") ?? ((req,res,next)=>next()));
app.use("/api/modelos3d", require("./routes/modelos3d") ?? ((req,res,next)=>next()));


// -----------------------------
// Manejo global de errores
// -----------------------------
app.use((err, req, res, next) => {
  console.error("🔥 ERROR GLOBAL:", err);
  res.status(500).json({ error: "Error interno del servidor" });
});


// -----------------------------
// Servidor
// -----------------------------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("=====================================");
  console.log(" Backend corriendo en puerto", PORT);
  console.log("=====================================");
});
