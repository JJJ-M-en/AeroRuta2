const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const { generarCodigoReserva } = require('../utils/helpers');
const router = express.Router();

// Obtener reservas del usuario logueado
router.get('/mis-reservas', verificarToken, async (req, res) => {
  try {
    const [reservas] = await pool.execute(`
      SELECT r.*, s.fecha, s.hora_salida, s.hora_llegada, o.ciudad as origen, d.ciudad as destino
      FROM reservas r
      JOIN servicios s ON r.id_servicio = s.id_servicio
      JOIN rutas ru ON s.id_ruta = ru.id_ruta
      JOIN destinos o ON ru.origen = o.id_destino
      JOIN destinos d ON ru.destino = d.id_destino
      WHERE r.id_usuario = ?
      ORDER BY r.fecha_reserva DESC
    `, [req.usuario.id]);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
});

// Obtener todas las reservas (Admin/Empleado)
router.get('/', verificarToken, verificarRol(['Administrador', 'Empleado']), async (req, res) => {
  try {
    const { codigo, cliente } = req.query;
    let sql = `
      SELECT r.*, u.nombre, u.apellido, u.correo, s.fecha, o.ciudad as origen, d.ciudad as destino
      FROM reservas r
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      JOIN servicios s ON r.id_servicio = s.id_servicio
      JOIN rutas ru ON s.id_ruta = ru.id_ruta
      JOIN destinos o ON ru.origen = o.id_destino
      JOIN destinos d ON ru.destino = d.id_destino
      WHERE 1=1
    `;
    const params = [];
    if (codigo) { sql += ' AND r.codigo_reserva LIKE ?'; params.push(`%${codigo}%`); }
    if (cliente) { sql += ' AND (u.nombre LIKE ? OR u.apellido LIKE ?)'; params.push(`%${cliente}%`, `%${cliente}%`); }
    sql += ' ORDER BY r.fecha_reserva DESC';

    const [reservas] = await pool.execute(sql, params);
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reservas' });
  }
});

// Obtener detalle de una reserva
router.get('/:id', verificarToken, async (req, res) => {
  try {
    const [reservas] = await pool.execute(`
      SELECT r.*, s.fecha, s.hora_salida, s.hora_llegada, s.precio as precio_unitario,
      o.ciudad as origen, d.ciudad as destino, u.nombre, u.apellido, u.correo, u.telefono
      FROM reservas r
      JOIN servicios s ON r.id_servicio = s.id_servicio
      JOIN rutas ru ON s.id_ruta = ru.id_ruta
      JOIN destinos o ON ru.origen = o.id_destino
      JOIN destinos d ON ru.destino = d.id_destino
      JOIN usuarios u ON r.id_usuario = u.id_usuario
      WHERE r.id_reserva = ?
    `, [req.params.id]);

    if (reservas.length === 0) return res.status(404).json({ mensaje: 'Reserva no encontrada' });

    const [pasajeros] = await pool.execute(
      'SELECT * FROM pasajeros WHERE id_reserva = ?',
      [req.params.id]
    );

    const [detalles] = await pool.execute(`
      SELECT dr.*, a.numero as asiento_numero
      FROM detalle_reserva dr
      JOIN asientos a ON dr.id_asiento = a.id_asiento
      WHERE dr.id_reserva = ?
    `, [req.params.id]);

    const [pagos] = await pool.execute(
      'SELECT * FROM pagos WHERE id_reserva = ?',
      [req.params.id]
    );

    res.json({ ...reservas[0], pasajeros, detalles, pagos });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener reserva' });
  }
});

// Crear reserva
router.post('/', verificarToken, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id_servicio, cantidad_pasajeros, pasajeros, asientos_seleccionados } = req.body;
    const id_usuario = req.usuario.id;

    await conn.beginTransaction();

    // Verificar disponibilidad
    const [servicio] = await conn.execute('SELECT precio FROM servicios WHERE id_servicio = ?', [id_servicio]);
    if (servicio.length === 0) throw new Error('Servicio no encontrado');

    const precio_unitario = servicio[0].precio;
    const valor_total = precio_unitario * cantidad_pasajeros;
    const codigo = generarCodigoReserva();

    // Crear reserva
    const [reservaResult] = await conn.execute(
      'INSERT INTO reservas (id_usuario, id_servicio, fecha_reserva, cantidad_pasajeros, valor_total, estado, codigo_reserva) VALUES (?, ?, NOW(), ?, ?, "pendiente", ?)',
      [id_usuario, id_servicio, cantidad_pasajeros, valor_total, codigo]
    );

    const id_reserva = reservaResult.insertId;

    // Guardar pasajeros y detalle de asientos
    for (let i = 0; i < pasajeros.length; i++) {
      const p = pasajeros[i];
      const [pasResult] = await conn.execute(
        'INSERT INTO pasajeros (id_reserva, nombre, apellido, documento, fecha_nacimiento, telefono) VALUES (?, ?, ?, ?, ?, ?)',
        [id_reserva, p.nombre, p.apellido, p.documento, p.fecha_nacimiento, p.telefono]
      );

      // Ocupar asiento
      await conn.execute(
        'UPDATE asientos SET estado = "ocupado" WHERE id_asiento = ?',
        [asientos_seleccionados[i]]
      );

      await conn.execute(
        'INSERT INTO detalle_reserva (id_reserva, id_asiento, id_pasajero, precio) VALUES (?, ?, ?, ?)',
        [id_reserva, asientos_seleccionados[i], pasResult.insertId, precio_unitario]
      );
    }

    await conn.commit();
    res.status(201).json({ mensaje: 'Reserva creada exitosamente', id_reserva, codigo_reserva: codigo, valor_total });
  } catch (error) {
    await conn.rollback();
    res.status(500).json({ mensaje: 'Error al crear reserva', error: error.message });
  } finally {
    conn.release();
  }
});

// Cambiar estado de reserva
router.put('/:id/estado', verificarToken, verificarRol(['Administrador', 'Empleado']), async (req, res) => {
  try {
    const { estado } = req.body;
    await pool.execute('UPDATE reservas SET estado = ? WHERE id_reserva = ?', [estado, req.params.id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado' });
  }
});

module.exports = router;
