const express = require('express');
const pool = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/auth');
const router = express.Router();

// Estadísticas generales
router.get('/estadisticas', verificarToken, verificarRol(['Administrador']), async (req, res) => {
  try {
    const [[clientes]] = await pool.execute('SELECT COUNT(*) as total FROM usuarios WHERE id_rol = 3');
    const [[reservas]] = await pool.execute('SELECT COUNT(*) as total FROM reservas');
    const [[ventas]] = await pool.execute('SELECT COALESCE(SUM(valor_total), 0) as total FROM reservas WHERE estado = "pagada"');
    const [[servicios]] = await pool.execute('SELECT COUNT(*) as total FROM servicios');

    // Reservas por mes
    const [reservasMes] = await pool.execute(`
      SELECT DATE_FORMAT(fecha_reserva, '%Y-%m') as mes, COUNT(*) as total
      FROM reservas GROUP BY mes ORDER BY mes DESC LIMIT 12
    `);

    // Ventas por mes
    const [ventasMes] = await pool.execute(`
      SELECT DATE_FORMAT(fecha_reserva, '%Y-%m') as mes, COALESCE(SUM(valor_total), 0) as total
      FROM reservas WHERE estado = 'pagada' GROUP BY mes ORDER BY mes DESC LIMIT 12
    `);

    // Destinos más solicitados
    const [destinosTop] = await pool.execute(`
      SELECT d.ciudad, COUNT(*) as total
      FROM reservas r
      JOIN servicios s ON r.id_servicio = s.id_servicio
      JOIN rutas ru ON s.id_ruta = ru.id_ruta
      JOIN destinos d ON ru.destino = d.id_destino
      GROUP BY d.ciudad ORDER BY total DESC LIMIT 5
    `);

    res.json({
      totales: { clientes: clientes.total, reservas: reservas.total, ventas: ventas.total, servicios: servicios.total },
      reservasPorMes: reservasMes,
      ventasPorMes: ventasMes,
      destinosTop
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener estadísticas' });
  }
});

module.exports = router;
