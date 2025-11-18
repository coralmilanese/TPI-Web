// backend/routes/usuarios.js
const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const auth = require('../middlewares/auth');

// obtener usuario logueado
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
