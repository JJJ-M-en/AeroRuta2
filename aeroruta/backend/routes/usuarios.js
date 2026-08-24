const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Obtener todos los usuarios (Admin)
router.get('/', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      'SELECT u.id_usuario, u.nombre, u.apellido, u.documento, u.correo, u.telefono, u.estado, u.fecha_registro, r.nombre as rol FROM usuarios u JOIN roles r ON u.id_rol = r.id_rol'
    );
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
});

// Crear usuario (Admin)
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { nombre, apellido, documento, correo, telefono, password, id_rol } = req.body;

    if (!nombre || !apellido || !documento || !correo || !password || !id_rol) {
      return res.status(400).json({ mensaje: 'Todos los campos obligatorios son requeridos' });
    }

    const [existe] = await pool.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nombre, apellido, documento, correo, telefono, password, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
      [nombre, apellido, documento, correo, telefono, hash, id_rol]
    );

    res.status(201).json({ mensaje: 'Usuario creado exitosamente', id_usuario: result.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear usuario', error: error.message });
  }
});

// Obtener un usuario
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const [usuarios] = await pool.execute(
      'SELECT id_usuario, nombre, apellido, documento, correo, telefono, estado, fecha_registro FROM usuarios WHERE id_usuario = ?',
      [req.params.id]
    );
    if (usuarios.length === 0) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuarios[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
});

// Actualizar usuario
router.put('/:id', verificarToken, async (req, res) => {
  try {
    const { nombre, apellido, telefono, id_rol, estado } = req.body;
    await pool.execute(
      'UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, id_rol = ?, estado = ? WHERE id_usuario = ?',
      [nombre, apellido, telefono, id_rol, estado, req.params.id]
    );
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
});

// Cambiar estado (activar/desactivar)
router.put('/:id/estado', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { estado } = req.body;
    await pool.execute('UPDATE usuarios SET estado = ? WHERE id_usuario = ?', [estado, req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
});

module.exports = router;
