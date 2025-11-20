// backend/routes/imagenes.js
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const pool = require("../db/db");
const fs = require("fs");
const path = require("path");

// =========================================================
// ================ SUBIR IMAGEN (POST) =====================
// =========================================================
router.post("/", (req, res) => {
  upload.single("imagen")(req, res, async (err) => {
    if (err) {
      console.error(" Error procesando archivo:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: "No se recibió archivo" });
      }

      const { titulo, categoria_id, autor, descripcion, palabras_clave } =
        req.body;

      const sql = `
        INSERT INTO imagenes
        (titulo, categoria_id, autor, descripcion, palabras_clave, filename, tipo, tama_bytes)
        VALUES (?, ?, ?, ?, ?, ?, 'imagen', ?)
      `;

      const params = [
        titulo,
        categoria_id || null,
        autor || null,
        descripcion || null,
        palabras_clave || null,
        req.file.filename,
        req.file.size,
      ];

      await pool.query(sql, params);

      res.json({ mensaje: "Imagen subida correctamente" });
    } catch (error) {
      console.error("Error SQL:", error);
      res.status(500).json({ error: "Error en servidor" });
    }
  });
});

// =========================================================
// ================= EDITAR IMAGEN (PUT) ====================
// =========================================================

router.put("/:id", (req, res) => {
  upload.single("imagen")(req, res, async (err) => {
    if (err) {
      console.error("Error procesando archivo:", err);
      return res.status(500).json({ error: "Error al procesar archivo" });
    }

    const { id } = req.params;
    const { titulo, categoria_id, autor, descripcion, palabras_clave } =
      req.body;

    try {
      // buscar imagen previa
      const [rows] = await pool.query(
        "SELECT filename FROM imagenes WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: "Imagen no encontrada" });
      }

      let filename = rows[0].filename;

      // si sube nueva imagen, borrar la anterior
      if (req.file) {
        const oldPath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

        filename = req.file.filename;
      }

      const sql = `
        UPDATE imagenes SET
          titulo = ?,
          categoria_id = ?,
          autor = ?,
          descripcion = ?,
          palabras_clave = ?,
          filename = ?
        WHERE id = ?
      `;

      await pool.query(sql, [
        titulo,
        categoria_id || null,
        autor,
        descripcion,
        palabras_clave,
        filename,
        id,
      ]);

      res.json({ mensaje: "Imagen actualizada correctamente" });
    } catch (error) {
      console.error(" Error SQL:", error);
      res.status(500).json({ error: "Error editando imagen" });
    }
  });
});

// =========================================================
// ================ LISTAR IMÁGENES (GET) ===================
// =========================================================
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.*, 
        c.nombre AS categoria
      FROM imagenes i
      LEFT JOIN categorias c ON i.categoria_id = c.id
      ORDER BY i.creado_en DESC
    `);

    const imagenes = rows.map((img) => ({
      ...img,
      url: `http://localhost:4000/uploads/${img.filename}`,
    }));

    res.json(imagenes);
  } catch (err) {
    console.error("Error listando imágenes:", err);
    res.status(500).json({ error: "Error al listar imágenes" });
  }
});

// =========================================================
// ================ ELIMINAR IMAGEN (DELETE) ===============
// =========================================================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT filename FROM imagenes WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }

    const filename = rows[0].filename;
    const filePath = path.join(__dirname, "..", "uploads", filename);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query("DELETE FROM imagenes WHERE id = ?", [id]);

    res.json({ mensaje: "Imagen eliminada correctamente" });
  } catch (err) {
    console.error("Error eliminando imagen:", err);
    res.status(500).json({ error: "Error al eliminar imagen" });
  }
});

module.exports = router;
