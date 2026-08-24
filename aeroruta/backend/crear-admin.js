/**
 * Script para crear o resetear el usuario Administrador de AeroRuta.
 *
 * Uso:
 *   node crear-admin.js correo@ejemplo.com miPasswordSegura
 *
 * Si el correo ya existe, actualiza su contraseña y lo asegura como Administrador (id_rol = 1).
 * Si no existe, lo crea.
 */

const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function main() {
  const [, , correo, password] = process.argv;

  if (!correo || !password) {
    console.log('Uso: node crear-admin.js correo@ejemplo.com miPasswordSegura');
    process.exit(1);
  }

  if (password.length < 6) {
    console.log('La contraseña debe tener al menos 6 caracteres.');
    process.exit(1);
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [existentes] = await pool.execute(
      'SELECT id_usuario FROM usuarios WHERE correo = ?',
      [correo]
    );

    if (existentes.length > 0) {
      await pool.execute(
        'UPDATE usuarios SET password = ?, id_rol = 1, estado = 1 WHERE correo = ?',
        [hash, correo]
      );
      console.log(`✅ Usuario existente actualizado como Administrador: ${correo}`);
    } else {
      await pool.execute(
        `INSERT INTO usuarios (nombre, apellido, documento, correo, telefono, password, id_rol, estado)
         VALUES ('Admin', 'AeroRuta', '0000000000', ?, '3000000000', ?, 1, 1)`,
        [correo, hash]
      );
      console.log(`✅ Usuario Administrador creado: ${correo}`);
    }

    console.log('Ya puedes iniciar sesión en login.html con este correo y contraseña.');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

main();
