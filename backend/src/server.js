import express from "express";
import { connectDB } from "./lib/db.js";
import User from "./models/User.js";
import crypto from "crypto";
import { sendEmail, notifyAdminsByEmail } from "./lib/mailer.js";
import authRoutes from "./routes/authRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import dns from "dns";
import net from "net";
import { swaggerSpec } from "./lib/swagger.js";
import swaggerUi from "swagger-ui-express";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PATCH","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger JSON
app.get("/openapi.json", (_req, res) => res.json(swaggerSpec));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
}));

function parseAdminEmails(envValue) {
  if (!envValue) return [];
  return envValue
    .split(/[,\s;]+/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
}

async function seedAdmins() {
  const raw = process.env.ADMIN_EMAILS || "";
  const list = parseAdminEmails(raw);

  console.log("[seedAdmins] RAW:", JSON.stringify(raw));
  console.log("[seedAdmins] PARSED:", list);

  if (!list.length) {
    console.log("[seedAdmins] ADMIN_EMAILS vacío: no se siembran admins");
    return;
  }

  for (const email of list) {
    try {
      const existing = await User.findOne({ email }); // esquema con lowercase recomendado

      if (!existing) {
        const tmpPass = crypto.randomBytes(8).toString("hex");
        const username = email.split("@")[0];

        const admin = new User({ email, username, password: tmpPass, role: "admin" });
        await admin.save();

        const body =
          `Hola, se creó tu cuenta de Administrador en GymTrack.\n\n` +
          `Usuario: ${email}\n` +
          `Contraseña temporal: ${tmpPass}\n\n` +
          `Por seguridad, cámbiala al iniciar sesión.`;

        try { await sendEmail(email, "Tu cuenta Admin en GymTrack", body); }
        catch (e) { console.error("[seedAdmins] error enviando email a nuevo admin:", e.message); }

        try { await notifyAdminsByEmail("Admin creado", `Se creó el admin: ${email}`); }
        catch (e) { console.error("[seedAdmins] error avisando a admins:", e.message); }

        console.log("[seedAdmins] created admin:", email);
        continue;
      }

      if (existing.role !== "admin") {
        existing.role = "admin";
        await existing.save();

        try { await sendEmail(email, "Promoción a Admin", "Tu cuenta fue promovida a Administrador en GymTrack."); }
        catch (e) { console.error("[seedAdmins] error email de promoción:", e.message); }

        try { await notifyAdminsByEmail("Rol promovido a Admin", `Usuario ${existing.username} (${email}) ahora es admin.`); }
        catch (e) { console.error("[seedAdmins] error avisando promoción:", e.message); }

        console.log("[seedAdmins] promoted to admin:", email);
        continue;
      }

      console.log("[seedAdmins] already admin:", email);
    } catch (err) {
      console.error(`[seedAdmins] error con ${email}:`, err.message);
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

app.get("/api/test-send", async (req, res) => {
  const to = String(req.query.to || process.env.SMTP_USER);
  try {
    const info = await sendEmail(to, "Prueba GymTrack (SMTP)", "Si lees esto, el SMTP está funcionando.");
    res.json({ ok: true, to, messageId: info.messageId, accepted: info.accepted, rejected: info.rejected });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
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
