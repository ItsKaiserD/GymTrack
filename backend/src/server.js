import express from 'express';
import "dotenv/config";
import cors from 'cors';
import job from './lib/cron.js';

import { connectDB } from './lib/db.js';

import authRoutes from './routes/authRoutes.js';
import machineRoutes from './routes/machineRoutes.js';

console.log("[server] BOOT v8");
const app = express();
const PORT = process.env.PORT || 3000;

job.start();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/machines", machineRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
}); 


// Hablar del flujo de marcar máquina (automatizar) 
// Perfil Admin // Perfil Entrenador 
// Serie de tiempo de gente en el gimnasio 