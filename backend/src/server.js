import express from 'express';
import "dotenv/config";
import cors from 'cors';
import job from './lib/cron.js';
import "./lib/db.js";
import User from "./models/User.js";
import crypto from "crypto";
import { notifyAdminsByEmail } from "./lib/mailer.js";

import { connectDB } from './lib/db.js';

import authRoutes from './routes/authRoutes.js';
import machineRoutes from './routes/machineRoutes.js';

console.log("[server] BOOT v8");
const app = express();

job.start();
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cors());

// --- Seed de Admins ---
async function seedAdmins() {
  try {
    const list = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (!list.length) {
      console.log("[seedAdmins] no ADMIN_EMAILS set, skipping");
      return;
    }

    for (const email of list) {
      const exists = await User.findOne({ email });
      if (!exists) {
        const tmpPass = crypto.randomBytes(8).toString("hex"); // contraseña temporal
        const username = email.split("@")[0];

        const admin = new User({
          email,
          username,
          password: tmpPass,
          role: "admin",
        });
        await admin.save();

        // Aviso por correo con la contraseña temporal
        const body = `Se creó la cuenta Admin: ${email}\nContraseña temporal: ${tmpPass}\nPor seguridad, cambia la contraseña al ingresar.`;
        await notifyAdminsByEmail("Cuenta Admin creada", body);
        console.log("[seedAdmins] created admin:", email);
      }
    }
  } catch (err) {
    console.error("[seedAdmins] error:", err.message);
  }
}

await seedAdmins();

app.use("/api/auth", authRoutes);
app.use("/api/machines", machineRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
}); 


// Hablar del flujo de marcar máquina (automatizar) 
// Perfil Admin // Perfil Entrenador 
// Serie de tiempo de gente en el gimnasio 