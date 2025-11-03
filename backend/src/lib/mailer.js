// src/lib/mailer.js
import nodemailer from "nodemailer";

function buildTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port,
    secure, // true => 465 SSL; false => 587 STARTTLS
    auth: {
      user: process.env.SMTP_USER, // tu_correo@gmail.com
      pass: process.env.SMTP_PASS, // App Password 16 chars (sin espacios)
    },
    // timeouts más permisivos
    connectionTimeout: 15000, // 15s para conectar socket
    greetingTimeout: 10000,   // 10s para banner SMTP
    socketTimeout: 20000,     // 20s para I/O
    tls: {
      // en entornos como Render puede faltar CA chain;
      // esto evita que el handshake falle por eso, sin desactivar TLS.
      rejectUnauthorized: false,
    },
  });
}

// Transport “service”: nodemailer resuelve host/puerto correctos de Gmail.
// Lo usamos como primer intento; si hay políticas o problemas con service,
// probamos manualmente con hosts y puertos.
const transportService = process.env.SMTP_HOST
  ? null
  : nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      connectionTimeout: 15000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
      tls: { rejectUnauthorized: false },
    });

export async function notifyAdminsByEmail(subject, text) {
  const toList = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (!toList.length) return;

  // 1) Si definiste SMTP_HOST/PORT en .env, respétalos.
  // 2) Si NO hay SMTP_HOST/PORT, usamos service 'gmail'.
  // 3) Si falla, probamos fallback manual (587 y luego 465).
  let lastError = null;

  // Ruta A: usar variables explícitas si las diste (útil si no quieres 'service')
  if (process.env.SMTP_HOST) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = port === 465;
    const transporter = buildTransport({ host, port, secure });

    try {
      await transporter.sendMail({
        from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
        to: toList.join(","),
        subject,
        text,
      });
      console.log(`[mailer] Email enviado (env host=${host} port=${port})`);
      return;
    } catch (err) {
      console.error(`[mailer] fallo con host=${host} port=${port}:`, err.message);
      lastError = err;
    }
  }

  // Ruta B: service 'gmail'
  if (transportService) {
    try {
      await transportService.sendMail({
        from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
        to: toList.join(","),
        subject,
        text,
      });
      console.log("[mailer] Email enviado usando service=gmail");
      return;
    } catch (err) {
      console.error("[mailer] fallo service=gmail:", err.message);
      lastError = err;
    }
  }

  // Ruta C: Fallback manual 587 → 465
  const attempts = [
    { host: "smtp.gmail.com", port: 587, secure: false },
    { host: "smtp.gmail.com", port: 465, secure: true },
  ];

  for (const a of attempts) {
    const transporter = buildTransport(a);
    try {
      await transporter.sendMail({
        from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
        to: toList.join(","),
        subject,
        text,
      });
      console.log(`[mailer] Email enviado (fallback host=${a.host} port=${a.port})`);
      return;
    } catch (err) {
      console.error(`[mailer] fallo fallback host=${a.host} port=${a.port}:`, err.message);
      lastError = err;
      continue;
    }
  }

  // Si nada funcionó, no rompas el app: log y sigue.
  console.error("[mailer] error final enviando email:", lastError?.stack || lastError?.message || lastError);
}
