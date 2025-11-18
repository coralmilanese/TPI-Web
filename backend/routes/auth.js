// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || "cambiame_este_secreto";
const jwtExpiry = process.env.JWT_EXPIRES_IN || "8h";

// =============================================
// ============ REGISTRO =======================
// =============================================
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    const [exists] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (exists.length > 0) {
      return res.status(409).json({ error: "El email ya está registrado" });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hash, rol === "admin" ? "admin" : "visitante"]
    );

    res.json({ mensaje: "Usuario registrado correctamente" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// =============================================
// ================== LOGIN ====================
// =============================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Faltan datos" });

    const [rows] = await pool.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0)
      return res.status(401).json({ error: "Credenciales inválidas" });

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(401).json({ error: "Contraseña incorrecta" });

    const payload = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiry });

    res.json({
      mensaje: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error("❌ Error login:", error);
    res.status(500).json({ error: "Error de servidor" });
  }
});

module.exports = router;
