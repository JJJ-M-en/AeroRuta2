const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Obtener todos los servicios (con filtros)
router.get('/', async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;
    let sql = `
      SELECT s.*, r.duracion, r.distancia, o.ciudad as origen_ciudad, d.ciudad as destino_ciudad,
      (SELECT COUNT(*) FROM asientos WHERE id_servicio = s.id_servicio AND estado = 'disponible') as asientos_disponibles
      FROM servicios s
      JOIN rutas r ON s.id_ruta = r.id_ruta
      JOIN destinos o ON r.origen = o.id_destino
      JOIN destinos d ON r.destino = d.id_destino
      WHERE s.estado = 1
    `;
    const params = [];

    if (origen) { sql += ' AND r.origen = ?'; params.push(origen); }
    if (destino) { sql += ' AND r.destino = ?'; params.push(destino); }
    if (fecha) { sql += ' AND s.fecha = ?'; params.push(fecha); }

    sql += ' ORDER BY s.fecha, s.hora_salida';

    const [servicios] = await pool.execute(sql, params);
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicios' });
  }
});

// Obtener un servicio con sus asientos
router.get('/:id', async (req, res) => {
  try {
    const [servicios] = await pool.execute(`
      SELECT s.*, r.duracion, r.distancia, o.ciudad as origen_ciudad, d.ciudad as destino_ciudad
      FROM servicios s
      JOIN rutas r ON s.id_ruta = r.id_ruta
      JOIN destinos o ON r.origen = o.id_destino
      JOIN destinos d ON r.destino = d.id_destino
      WHERE s.id_servicio = ?
    `, [req.params.id]);

    if (servicios.length === 0) return res.status(404).json({ mensaje: 'Servicio no encontrado' });

    const [asientos] = await pool.execute(
      'SELECT * FROM asientos WHERE id_servicio = ? ORDER BY numero',
      [req.params.id]
    );

    res.json({ ...servicios[0], asientos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicio' });
  }
});

// Crear servicio (Admin)
router.post('/', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_ruta, fecha, hora_salida, hora_llegada, precio, capacidad } = req.body;

    await conn.beginTransaction();

    const [result] = await conn.execute(
      'INSERT INTO servicios (id_ruta, fecha, hora_salida, hora_llegada, precio, capacidad, estado) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [id_ruta, fecha, hora_salida, hora_llegada, precio, capacidad]
    );

    // Crear asientos automáticamente
    const id_servicio = result.insertId;
    const filas = Math.ceil(capacidad / 4);
    for (let f = 1; f <= filas; f++) {
      for (let c of ['A', 'B', 'C', 'D']) {
        const num = `${f}${c}`;
        await conn.execute(
          'INSERT INTO asientos (id_servicio, numero, tipo, estado) VALUES (?, ?, "economico", "disponible")',
          [id_servicio, num]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Servicio creado con asientos', id_servicio });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ mensaje: 'Error al crear servicio' });
  } finally {
    conn.release();
  }
});

// Actualizar servicio
router.put('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const { fecha, hora_salida, hora_llegada, precio, capacidad, estado } = req.body;
    await pool.execute(
      'UPDATE servicios SET fecha = ?, hora_salida = ?, hora_llegada = ?, precio = ?, capacidad = ?, estado = ? WHERE id_servicio = ?',
      [fecha, hora_salida, hora_llegada, precio, capacidad, estado, req.params.id]
    );
    res.json({ mensaje: 'Servicio actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio' });
  }
});

// Eliminar servicio
router.delete('/:id', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    await pool.execute('DELETE FROM servicios WHERE id_servicio = ?', [req.params.id]);
    res.json({ mensaje: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar servicio' });
  }
});

module.exports = router;
