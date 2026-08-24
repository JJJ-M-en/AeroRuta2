const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Obtener todas las rutas
router.get('/', async (req, res) => {
  try {
    const [rutas] = await pool.execute(`
      SELECT r.*, o.ciudad as origen_ciudad, d.ciudad as destino_ciudad 
      FROM rutas r 
      JOIN destinos o ON r.origen = o.id_destino 
      JOIN destinos d ON r.destino = d.id_destino 
      WHERE r.estado = 1
    `);
    res.json(rutas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener rutas' });
  }
});

// Crear ruta (Admin)
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { origen, destino, duracion, distancia } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO rutas (origen, destino, duracion, distancia, estado) VALUES (?, ?, ?, ?, 1)',
      [origen, destino, duracion, distancia]
    );
    res.status(201).json({ mensaje: 'Ruta creada', id_ruta: result.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear ruta' });
  }
});

// Actualizar ruta
router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { origen, destino, duracion, distancia, estado } = req.body;
    await pool.execute(
      'UPDATE rutas SET origen = ?, destino = ?, duracion = ?, distancia = ?, estado = ? WHERE id_ruta = ?',
      [origen, destino, duracion, distancia, estado, req.params.id]
    );
    res.json({ mensaje: 'Ruta actualizada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar ruta' });
  }
});

// Eliminar ruta
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    await pool.execute('DELETE FROM rutas WHERE id_ruta = ?', [req.params.id]);
    res.json({ mensaje: 'Ruta eliminada' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar ruta' });
  }
});

module.exports = router;
