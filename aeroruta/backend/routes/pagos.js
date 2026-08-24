const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Obtener pagos de una reserva
router.get('/reserva/:id_reserva', verificarToken, async (req, res) => {
  try {
    const [pagos] = await pool.execute(
      'SELECT * FROM pagos WHERE id_reserva = ?',
      [req.params.id_reserva]
    );
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener pagos' });
  }
});

// Crear pago
router.post('/', verificarToken, async (req, res) => {
  try {
    const { id_reserva, metodo_pago, valor, referencia } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO pagos (id_reserva, metodo_pago, valor, fecha_pago, referencia, estado) VALUES (?, ?, ?, NOW(), ?, "pendiente")',
      [id_reserva, metodo_pago, valor, referencia]
    );
    res.status(201).json({ mensaje: 'Pago registrado', id_pago: result.insertId });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar pago' });
  }
});

// Confirmar pago (Admin)
router.put('/:id/confirmar', verificarToken, verificarRol(['Administrador', 'Empleado']), async (req, res) => {
  try {
    await pool.execute('UPDATE pagos SET estado = "pagado" WHERE id_pago = ?', [req.params.id]);
    res.json({ mensaje: 'Pago confirmado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al confirmar pago' });
  }
});

// Rechazar pago
router.put('/:id/rechazar', verificarToken, verificarRol(['Administrador', 'Empleado']), async (req, res) => {
  try {
    await pool.execute('UPDATE pagos SET estado = "rechazado" WHERE id_pago = ?', [req.params.id]);
    res.json({ mensaje: 'Pago rechazado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al rechazar pago' });
  }
});

module.exports = router;
