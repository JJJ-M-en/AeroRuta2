// Configuración de la URL del backend.
//
// En local (abriendo los HTML directo o con Live Server) usa localhost:3000.
// Cuando despliegues el backend (Render, Railway, etc.), cambia la línea
// de PRODUCCIÓN por la URL real de tu API.

const BACKEND_URL_LOCAL = 'http://localhost:3000';
const BACKEND_URL_PRODUCCION = 'https://aeroruta-backend.onrender.com'; // <-- cámbiala cuando despliegues

const esLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const API_URL = (esLocal ? BACKEND_URL_LOCAL : BACKEND_URL_PRODUCCION) + '/api';
