# 🏋️‍♂️ GymTrack

**GymTrack** es una aplicación móvil desarrollada con **React Native (Expo)** y un backend en **Node.js + Express + MongoDB**, diseñada para la gestión de gimnasios.  
Permite registrar máquinas de entrenamiento, subir imágenes a Cloudinary, autenticar usuarios con JWT y diferenciar entre **roles de administrador y entrenador**.

---

## 🚀 Características

- **Autenticación JWT** (registro, login y logout)
- **Roles de usuario:** Administrador 🧠 y Entrenador 💪
- **Gestión de máquinas:** creación con imagen, listado paginado y eliminación
- **Subida de imágenes** a Cloudinary mediante `multer` y `upload_stream`
- **Almacenamiento local** con AsyncStorage
- **API REST** protegida con middleware `protectRoute`
- **Interfaz moderna** con Expo, `react-native-vector-icons`, `zustand` y `expo-router`

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
cd mobile
npm install

Configurar el archivo `/mobile/constants/api.js`

`export const API_URL = "https://api-gymtrack-z1ja.onrender.com/api";`

### Ejecutar en modo desarrollo

`npx expo start`

### 🧠 Roles de Usuario

Durante el registro, el usuario puede elegir:

Administrador (admin): gestiona y visualiza todas las máquinas.

Entrenador (trainer): registra sus propias máquinas.

El rol se guarda automáticamente en MongoDB y se puede usar más adelante para redirigir a distintas pantallas según el tipo de cuenta.

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
|DELETE|	/api/machines/:id |	Elimina una máquina propia|

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
