# 🏋️‍♂️ GymTrack

**GymTrack** es una aplicación móvil para la gestión de máquinas de entrenamiento en gimnasios.
Permite reservar máquinas, reportar problemas, visualizar su estado y facilitar la administración en tiempo real mediante control centralizado.

Construida con **React Native (Expo)** y un backend **Node.js + Express + MongoDB**, con despliegue en **Render**, entrega una experiencia moderna, rápida y escalable.

---

## 🚀 Características Principales

### 🔐 Autenticación y Roles
- Registro, login y protección con JWT

### Roles:
- Administrador: visualiza todas las máquinas, gestiona reportes y disponibilidad
- Entrenador: reserva máquinas y reporta problemas

### 🏋️ Gestión de Máquinas
- Crear máquina con imagen (subida a Cloudinary)
- Estado dinámico: Disponible / Reservada / Mantenimiento
- Temporizador de reservas en tiempo real
- Listado paginado desde el backend

### 📆 Reservas
- Botón Reservar en cada tarjeta de máquina
- Modal para seleccionar fecha, hora y duración
- Actualización automática del estado

### ⚠️ Reportes de mantenimiento
- Botón Reportar
- Modal para escribir mensaje del problema
- Para admin: vista de máquinas en mantenimiento con mensaje + quién reportó

### ☁️ Despliegue
- Backend desplegado en Render
- Base de datos en MongoDB Atlas

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar el repositorio
`git clone https://github.com/ItsKaiserD/GymTrack.git`

`cd GymTrack`

### 2️⃣ Configurar el Backend
Variables de entorno (.env)

`MONGO_URI=mongodb+srv://<usuario>:<contraseña>@cluster.mongodb.net/gymtrack`

`CLOUDINARY_CLOUD_NAME=<cloud_name>`

`CLOUDINARY_API_KEY=<api_key>`

`CLOUDINARY_API_SECRET=<api_secret>`

`JWT_SECRET=<jwt_secret>`

`PORT=5000`

### Instalar dependencias

`cd backend`

`npm install`

### Ejecutar el servidor local

`npm run dev`


El backend se puede desplegar fácilmente en Render.

### 3️⃣ Configurar la App Móvil
Instalar dependencias

`cd mobile`

`npm install`

Configurar el archivo `/mobile/constants/api.js`

`export const API_URL = "https://api-gymtrack-z1ja.onrender.com/api";`

### Ejecutar en modo desarrollo

`npx expo start`

###🗄️ Endpoints Principales
`Auth`
| Método | Ruta	| Descripción |
|--------|------|-------------|
|POST|	/api/auth/register|	Crea un nuevo usuario (admin o trainer)|
|POST|	/api/auth/login|	Inicia sesión|
|GET|	/api/auth/check|	Verifica autenticación|
|POST|	/api/auth/logout|	Cierra sesión (frontend)|

`Machines`
|Método|	Ruta|	Descripción|
|--------|------|-------------|
|GET|	/api/machines|	Lista máquinas paginadas|
|POST|	/api/machines|	Crea una nueva máquina con imagen (requiere token)|
|PATCH|	/api/machines/:id/status | Cambia estado + mensaje de reporte|
|POST| /api/machines/:id/reserve | Reservar máquina|
|GET| /api/machines/maintenance | Máquinas Reportadas (Admin)|

### ☁️ Despliegue en Render

1) Crea un nuevo servicio Web en Render.

2) Selecciona el repo GymTrack.

3) En “Root Directory” selecciona `backend/`.

4) En “Build Command” escribe:

`npm install`


5) En “Start Command”:

`node src/server.js`


6) Agrega las variables de entorno listadas antes.

7) Deploy 🚀

### 🧰 Tecnologías Utilizadas

- Frontend (Expo / React Native)
- Expo SDK 51+
- Zustand
- AsyncStorage
- Expo Router
- Ionicons
- Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Multer + Cloudinary
- Render (Hosting)

🧑‍💻 Desarrollado por

Luis Cabrera
Estudiante de Ingenieria en Computación e Informática

"Gestiona tu gimnasio, mide tu progreso, y lleva tu entrenamiento al siguiente nivel con GymTrack." 💪
