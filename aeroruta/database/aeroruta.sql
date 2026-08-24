-- AeroRuta 2.0 - Base de Datos
-- Sistema de gestión de transporte turístico

CREATE DATABASE IF NOT EXISTS aeroruta CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aeroruta;

-- Tabla: roles
CREATE TABLE roles (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT
);

INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Control total del sistema'),
('Empleado', 'Gestión operativa'),
('Cliente', 'Usuario final del sistema');

-- Tabla: usuarios
CREATE TABLE usuarios (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  documento VARCHAR(50) NOT NULL UNIQUE,
  correo VARCHAR(100) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL DEFAULT 3,
  estado TINYINT DEFAULT 1,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol)
);

-- Tabla: aeropuertos
CREATE TABLE aeropuertos (
  id_aeropuerto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo VARCHAR(10) NOT NULL UNIQUE,
  ciudad VARCHAR(100) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  estado TINYINT DEFAULT 1
);

-- Tabla: destinos
CREATE TABLE destinos (
  id_destino INT AUTO_INCREMENT PRIMARY KEY,
  ciudad VARCHAR(100) NOT NULL,
  pais VARCHAR(100) NOT NULL,
  descripcion TEXT,
  imagen VARCHAR(255),
  estado TINYINT DEFAULT 1
);

-- Tabla: rutas
CREATE TABLE rutas (
  id_ruta INT AUTO_INCREMENT PRIMARY KEY,
  origen INT NOT NULL,
  destino INT NOT NULL,
  duracion VARCHAR(20),
  distancia VARCHAR(20),
  estado TINYINT DEFAULT 1,
  FOREIGN KEY (origen) REFERENCES destinos(id_destino),
  FOREIGN KEY (destino) REFERENCES destinos(id_destino)
);

-- Tabla: servicios
CREATE TABLE servicios (
  id_servicio INT AUTO_INCREMENT PRIMARY KEY,
  id_ruta INT NOT NULL,
  fecha DATE NOT NULL,
  hora_salida TIME NOT NULL,
  hora_llegada TIME NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  capacidad INT NOT NULL,
  estado TINYINT DEFAULT 1,
  FOREIGN KEY (id_ruta) REFERENCES rutas(id_ruta)
);

-- Tabla: asientos
CREATE TABLE asientos (
  id_asiento INT AUTO_INCREMENT PRIMARY KEY,
  id_servicio INT NOT NULL,
  numero VARCHAR(10) NOT NULL,
  tipo VARCHAR(20) DEFAULT 'economico',
  estado ENUM('disponible', 'ocupado') DEFAULT 'disponible',
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

-- Tabla: reservas
CREATE TABLE reservas (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_servicio INT NOT NULL,
  fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cantidad_pasajeros INT NOT NULL,
  valor_total DECIMAL(12,2) NOT NULL,
  estado ENUM('pendiente', 'confirmada', 'pagada', 'cancelada', 'completada') DEFAULT 'pendiente',
  codigo_reserva VARCHAR(50) NOT NULL UNIQUE,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
  FOREIGN KEY (id_servicio) REFERENCES servicios(id_servicio)
);

-- Tabla: pasajeros
CREATE TABLE pasajeros (
  id_pasajero INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  fecha_nacimiento DATE,
  telefono VARCHAR(20),
  FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- Tabla: pagos
CREATE TABLE pagos (
  id_pago INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  metodo_pago ENUM('tarjeta', 'pse', 'transferencia', 'efectivo') NOT NULL,
  valor DECIMAL(12,2) NOT NULL,
  fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  referencia VARCHAR(100),
  estado ENUM('pendiente', 'pagado', 'rechazado') DEFAULT 'pendiente',
  FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva)
);

-- Tabla: detalle_reserva
CREATE TABLE detalle_reserva (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_asiento INT NOT NULL,
  id_pasajero INT NOT NULL,
  precio DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (id_reserva) REFERENCES reservas(id_reserva),
  FOREIGN KEY (id_asiento) REFERENCES asientos(id_asiento),
  FOREIGN KEY (id_pasajero) REFERENCES pasajeros(id_pasajero)
);

-- NOTA: El usuario Administrador ya NO se crea aquí con una contraseña fija.
-- Después de importar esta base de datos, crea tu admin ejecutando desde /backend:
--   node crear-admin.js tu_correo@ejemplo.com tu_password_segura
-- Esto genera el hash bcrypt correctamente en tu propio entorno.

-- Datos de ejemplo: Destinos
INSERT INTO destinos (ciudad, pais, descripcion, imagen) VALUES
('Bogotá', 'Colombia', 'Capital de Colombia, centro cultural y financiero', 'bogota.jpg'),
('Cartagena', 'Colombia', 'Ciudad histórica en la costa caribeña', 'cartagena.jpg'),
('Medellín', 'Colombia', 'Ciudad de la eterna primavera', 'medellin.jpg'),
('Sincelejo', 'Colombia', 'Capital del departamento de Sucre', 'sincelejo.jpg'),
('Cali', 'Colombia', 'Capital de la salsa', 'cali.jpg'),
('Santa Marta', 'Colombia', 'Ciudad turística en el Caribe', 'santamarta.jpg');

-- Datos de ejemplo: Rutas
INSERT INTO rutas (origen, destino, duracion, distancia) VALUES
(1, 2, '1h 30m', '650 km'),
(1, 3, '1h 00m', '240 km'),
(4, 1, '1h 15m', '520 km'),
(2, 3, '1h 10m', '460 km'),
(1, 5, '1h 00m', '300 km'),
(1, 6, '1h 25m', '720 km');

-- Datos de ejemplo: Aeropuertos
INSERT INTO aeropuertos (nombre, codigo, ciudad, pais) VALUES
('Aeropuerto El Dorado', 'BOG', 'Bogotá', 'Colombia'),
('Aeropuerto Rafael Núñez', 'CTG', 'Cartagena', 'Colombia'),
('Aeropuerto José María Córdova', 'MDE', 'Medellín', 'Colombia'),
('Aeropuerto Las Brujas', 'CZU', 'Sincelejo', 'Colombia');
