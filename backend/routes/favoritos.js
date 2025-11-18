const express = require("express");
const router = express.Router();
const pool = require("../db/db");
const auth = require("../middlewares/auth");

// POST /api/favoritos  -> marcar favorito (body: imagen_id)
router.post("/", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { imagen_id } = req.body;
    if (!imagen_id) return res.status(400).json({ error: "Falta imagen_id" });

    await pool.query(
      "INSERT INTO favoritos (usuario_id, imagen_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE creado_en = CURRENT_TIMESTAMP",
      [usuario_id, imagen_id]
    );

    res.json({ mensaje: "Favorito guardado" });
  } catch (err) {
    console.error("Error guardando favorito", err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// DELETE /api/favoritos/:id  -> quitar favorito por id de favorito
router.delete("/:id", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { id } = req.params;

    // asegurarse que el favorito pertenece al usuario
    await pool.query("DELETE FROM favoritos WHERE id = ? AND usuario_id = ?", [
      id,
      usuario_id,
    ]);
    res.json({ mensaje: "Favorito eliminado" });
  } catch (err) {
    console.error("Error eliminando favorito", err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// DELETE by imagen: DELETE /api/favoritos/imagen/:imagenId -> quitar favorito por imagen para el usuario actual
router.delete("/imagen/:imagenId", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const { imagenId } = req.params;
    await pool.query(
      "DELETE FROM favoritos WHERE imagen_id = ? AND usuario_id = ?",
      [imagenId, usuario_id]
    );
    res.json({ mensaje: "Favorito eliminado" });
  } catch (err) {
    console.error("Error eliminando favorito por imagen", err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// GET /api/favoritos -> obtener favoritos del usuario
router.get("/", auth, async (req, res) => {
  try {
    const usuario_id = req.user.id;
    const [rows] = await pool.query(
      `SELECT f.id, f.imagen_id, f.creado_en, i.titulo, CONCAT('/uploads/', i.filename) AS url
       FROM favoritos f
       LEFT JOIN imagenes i ON f.imagen_id = i.id
       WHERE f.usuario_id = ?
       ORDER BY f.creado_en DESC`,
      [usuario_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error obteniendo favoritos", err);
    res.status(500).json({ error: "Error en servidor" });
  }
});

module.exports = router;
