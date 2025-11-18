// backend/routes/comentarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middlewares/auth');

// =============================
// 1. Crear comentario (público)
// =============================
router.post('/', async (req, res) => {
  try {
    const { imagen_id, contenido, usuario_id } = req.body;

    if (!imagen_id || !contenido) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    if (contenido.length > 250) {
      return res.status(400).json({ error: "Comentario demasiado largo (250 máx)" });
    }

    await pool.query(
      `INSERT INTO comentarios (imagen_id, usuario_id, contenido, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [imagen_id, usuario_id || null, contenido]
    );

    res.json({ mensaje: "Comentario enviado y pendiente de aprobación" });

  } catch (error) {
    console.error("❌ Error creando comentario:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// ===============================================
// 2. Obtener comentarios aprobados (público)
// ===============================================
router.get('/imagen/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT c.*, u.nombre AS usuario
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       WHERE c.imagen_id = ? AND c.estado = 'aprobado'
       ORDER BY c.creado_en DESC`,
      [id]
    );

    res.json(rows);

  } catch (error) {
    console.error("❌ Error obteniendo comentarios:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// ===============================================
// 3. Comentarios pendientes (solo admin)
// ===============================================
router.get('/pendientes', auth, async (req, res) => {
  if (req.user.rol !== "admin")
    return res.status(403).json({ error: "Solo administradores" });

  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.nombre AS usuario, i.titulo AS imagen
       FROM comentarios c
       LEFT JOIN usuarios u ON c.usuario_id = u.id
       LEFT JOIN imagenes i ON c.imagen_id = i.id
       WHERE c.estado = 'pendiente'
       ORDER BY c.creado_en ASC`
    );

    res.json(rows);

  } catch (error) {
    console.error("❌ Error pendientes:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

// ===============================================
// 4. Aprobar / Rechazar comentario (solo admin)
// ===============================================
router.put('/:id', auth, async (req, res) => {
  if (req.user.rol !== "admin")
    return res.status(403).json({ error: "Solo administradores" });

  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!["aprobado", "rechazado"].includes(estado)) {
      return res.status(400).json({ error: "Estado inválido" });
    }

    await pool.query(
      `UPDATE comentarios SET estado = ? WHERE id = ?`,
      [estado, id]
    );

    res.json({ mensaje: "Comentario actualizado correctamente" });

  } catch (error) {
    console.error("❌ Error moderando:", error);
    res.status(500).json({ error: "Error en servidor" });
  }
});

module.exports = router;
