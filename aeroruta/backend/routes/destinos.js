const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Obtener todos los destinos
router.get('/', async (req, res) => {
  try {
    const [destinos] = await pool.execute('SELECT * FROM destinos WHERE estado = 1');
    res.json(destinos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener destinos' });
  }
});

// Crear destino (Admin)
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { ciudad, pais, descripcion, imagen } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO destinos (ciudad, pais, descripcion, imagen, estado) VALUES (?, ?, ?, ?, 1)',
      [ciudad, pais, descripcion, imagen]
    );
    res.status(201).json({ mensaje: 'Destino creado', id_destino: result.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear destino' });
  }
});

// Actualizar destino
router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { ciudad, pais, descripcion, imagen, estado } = req.body;
    await pool.execute(
      'UPDATE destinos SET ciudad = ?, pais = ?, descripcion = ?, imagen = ?, estado = ? WHERE id_destino = ?',
      [ciudad, pais, descripcion, imagen, estado, req.params.id]
    );
    res.json({ mensaje: 'Destino actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar destino' });
  }
});

// Eliminar destino
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    await pool.execute('DELETE FROM destinos WHERE id_destino = ?', [req.params.id]);
    res.json({ mensaje: 'Destino eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar destino' });
  }
});

module.exports = router;
