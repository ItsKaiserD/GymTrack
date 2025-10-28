import express from "express";
import { connectDB } from "./lib/db.js";
import User from "./models/User.js";
import crypto from "crypto";
import { notifyAdminsByEmail } from "./lib/mailer.js";
import authRoutes from "./routes/authRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";

const app = express();
app.use(express.json());

async function seedAdmins() {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  if (!list.length) {
    console.log("[seedAdmins] no ADMIN_EMAILS set, skipping");
    return;
  }

  for (const email of list) {
    const exists = await User.findOne({ email });   // <- ya hay conexión
    if (!exists) {
      const tmpPass = crypto.randomBytes(8).toString("hex");
      const username = email.split("@")[0];

      const admin = new User({ email, username, password: tmpPass, role: "admin" });
      await admin.save();

      const body = `Admin creado: ${email}\nPassword temporal: ${tmpPass}`;
      await notifyAdminsByEmail?.("Cuenta Admin creada", body);
      console.log("[seedAdmins] created admin:", email);
    }
  }
}

app.use("/api/auth", authRoutes);
app.use("/api/machines", machineRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

(async () => {
  try {
    await connectDB();        // 1) conectar
    await seedAdmins();       // 2) sembrar admins (ya conectados)
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`API listening on ${PORT}`));
  } catch (err) {
    console.error("[bootstrap] Falló el arranque:", err.message);
    process.exit(1);
  }
})();
