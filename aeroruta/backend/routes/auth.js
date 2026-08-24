const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
  try {
    const { nombre, apellido, documento, correo, telefono, password } = req.body;

    if (!nombre || !apellido || !documento || !correo || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos obligatorios son requeridos' });
    }

    const [existe] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, documento, correo, telefono, password, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, 3, 1)',
      [nombre, apellido, documento, correo, telefono, hash]
    );

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', id_usuario: result.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const [usuarios] = await pool.execute(
      'SELECT u.*, r.nombre as rol_nombre FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol WHERE u.correo = ? AND u.estado = 1',
      [correo]
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const usuario = usuarios[0];
    const valido = await bcrypt.compare(password, usuario.password);

    if (!valido) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, correo: usuario.correo, rol: usuario.rol_nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol_nombre
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
