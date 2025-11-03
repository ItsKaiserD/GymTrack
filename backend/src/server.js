import express from "express";
import { connectDB } from "./lib/db.js";
import User from "./models/User.js";
import crypto from "crypto";
import { notifyAdminsByEmail } from "./lib/mailer.js";
import authRoutes from "./routes/authRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import dns from "dns";
import net from "net";

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

app.get("/api/smtp-diagnose", async (_req, res) => {
  const results = {};
  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    results.host = host;

    // DNS
    const addrs = await new Promise((resolve, reject) => {
      dns.resolve4(host, (err, addresses) => (err ? reject(err) : resolve(addresses)));
    });
    results.dnsA = addrs;

    // TCP 587
    results.tcp587 = await new Promise((resolve) => {
      const s = net.createConnection(587, host);
      const timer = setTimeout(() => { s.destroy(); resolve("timeout"); }, 7000);
      s.on("connect", () => { clearTimeout(timer); s.destroy(); resolve("ok"); });
      s.on("error", (e) => { clearTimeout(timer); resolve(`error: ${e.code || e.message}`); });
    });

    // TCP 465
    results.tcp465 = await new Promise((resolve) => {
      const s = net.createConnection(465, host);
      const timer = setTimeout(() => { s.destroy(); resolve("timeout"); }, 7000);
      s.on("connect", () => { clearTimeout(timer); s.destroy(); resolve("ok"); });
      s.on("error", (e) => { clearTimeout(timer); resolve(`error: ${e.code || e.message}`); });
    });

    // Intento de envío real (usa notify que ya tiene fallbacks)
    try {
      await notifyAdminsByEmail("Diagnóstico GymTrack", "Test SMTP desde Render");
      results.send = "ok (notifyAdminsByEmail)";
    } catch (e) {
      results.send = `error: ${e.message}`;
    }

    res.json(results);
  } catch (e) {
    res.status(500).json({ error: e.message, results });
  }
});

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
