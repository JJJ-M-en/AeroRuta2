# AeroRuta 2.0

Sistema web completo para la gestión, consulta y reserva de servicios de transporte turístico.

## Estructura del Proyecto

```
aeroruta/
├── backend/           # API REST con Node.js + Express
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── helpers.js
│   └── routes/
│       ├── auth.js
│       ├── usuarios.js
│       ├── destinos.js
│       ├── rutas.js
│       ├── servicios.js
│       ├── reservas.js
│       ├── pagos.js
│       └── dashboard.js
├── frontend/          # Interfaz web
│   ├── index.html
│   ├── login.html
│   ├── registro.html
│   ├── cliente.html
│   ├── dashboard.html
│   ├── reserva.html
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── main.js
│       └── admin.js
└── database/
    └── aeroruta.sql   # Script de base de datos MySQL
```

## Requisitos

- Node.js 16+
- MySQL 8.0+ o MariaDB
- Navegador moderno

## Instalación

### 1. Base de Datos

```bash
mysql -u root -p < database/aeroruta.sql
```

### 2. Backend

```bash
cd backend
npm install
```

Edita el archivo `.env` con tus credenciales:

```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=aeroruta
JWT_SECRET=tu_clave_secreta
```

Inicia el servidor:

```bash
npm start
```

El backend estará disponible en `http://localhost:3000`

### 3. Crear el usuario Administrador

Por seguridad, la base de datos ya no trae un admin con contraseña fija. Créalo tú mismo, desde `backend/`:

```bash
node crear-admin.js tu_correo@ejemplo.com tu_password_segura
```

Puedes volver a ejecutar este comando cuando quieras para resetear la contraseña del admin.

### 4. Frontend

Abre los archivos HTML directamente en el navegador o usa Live Server en VS Code.

## Credenciales

- **Administrador**: la que hayas creado con `crear-admin.js`
- **Cliente**: Regístrate desde el formulario de registro

## Funcionalidades Implementadas

- ✅ Registro de usuarios con hash de contraseñas
- ✅ Login con JWT y roles (Admin, Empleado, Cliente)
- ✅ Gestión de destinos, rutas y servicios
- ✅ Buscador de servicios con filtros
- ✅ Mapa de asientos interactivo
- ✅ Sistema de reservas con pasajeros
- ✅ Cálculo automático de totales
- ✅ Códigos de reserva únicos (AR-YYYY-######)
- ✅ Panel administrativo con estadísticas
- ✅ Panel de cliente (perfil y reservas)
- ✅ Gestión de usuarios, reservas y pagos
- ✅ Diseño responsive
- ✅ Modales para crear destinos, rutas, servicios y usuarios desde el panel admin
- ✅ Vista de detalle de reserva con cambio de estado (pagada/confirmada/cancelada)

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/registro | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión |
| GET | /api/usuarios | Listar usuarios |
| GET | /api/destinos | Listar destinos |
| GET | /api/rutas | Listar rutas |
| GET | /api/servicios | Buscar servicios |
| POST | /api/usuarios | Crear usuario (Admin) |
| POST | /api/reservas | Crear reserva |
| GET | /api/reservas/mis-reservas | Mis reservas |
| PUT | /api/reservas/:id/estado | Cambiar estado de reserva (Admin/Empleado) |
| GET | /api/dashboard/estadisticas | Estadísticas |

## Subir a GitHub

```bash
cd aeroruta
git init
git add .
git commit -m "AeroRuta 2.0 - proyecto final"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git push -u origin main
```

`backend/.env` no se sube (está en `.gitignore`) porque contiene tu contraseña de base de datos y tu clave JWT. Usa `backend/.env.example` como referencia para quien clone el repo.

## Autor

Proyecto productivo - Técnico en Programación de Software
