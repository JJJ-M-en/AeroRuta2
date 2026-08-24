const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// CORS: en producción, define FRONTEND_URL en el .env con el dominio de tu frontend
// (varios separados por coma). Si no se define, se permite cualquier origen (solo para desarrollo).
const origenesPermitidos = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(u => u.trim())
  : '*';

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/destinos', require('./routes/destinos'));
app.use('/api/rutas', require('./routes/rutas'));
app.use('/api/servicios', require('./routes/servicios'));
app.use('/api/reservas', require('./routes/reservas'));
app.use('/api/pagos', require('./routes/pagos'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    mensaje: 'AeroRuta 2.0 API - Sistema de gestión de transporte turístico',
    version: '2.0.0',
    estado: 'Activo'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 AeroRuta 2.0 Backend corriendo en http://localhost:${PORT}`);
});
