// backend/routes/categorias.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');

// Obtener todas las categorías
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre FROM categorias ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
});

module.exports = router;
