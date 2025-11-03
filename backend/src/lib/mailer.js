import nodemailer from "nodemailer";

function makeTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port,               // 587 (STARTTLS) o 465 (SSL)
    secure,             // true si 465
    auth: {
      user: process.env.SMTP_USER, // tu_correo@gmail.com
      pass: process.env.SMTP_PASS, // App Password sin espacios
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });
}

async function sendCore(to, subject, text, host, port, secure) {
  const transporter = makeTransport({ host, port, secure });
  const info = await transporter.sendMail({
    from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
  console.log(`[mailer] OK host=${host} port=${port} id=${info.messageId} accepted=${info.accepted} rejected=${info.rejected}`);
  return info;
}

export async function sendEmail(to, subject, text) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const forcedPort = Number(process.env.SMTP_PORT || 0);

  const attempts = forcedPort
    ? [{ host, port: forcedPort, secure: forcedPort === 465 }]
    : [{ host, port: 587, secure: false }, { host, port: 465, secure: true }];

  let lastErr;
  for (const a of attempts) {
    try { return await sendCore(to, subject, text, a.host, a.port, a.secure); }
    catch (e) { console.error(`[mailer] fallo host=${a.host} port=${a.port}: ${e.message}`); lastErr = e; }
  }
  throw lastErr;
}

export async function notifyAdminsByEmail(subject, text) {
  const toList = (process.env.ADMIN_EMAILS || "")
    .split(/[,\s;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!toList.length) {
    console.log("[mailer] ADMIN_EMAILS vacío; no hay destinatarios");
    return;
  }
  return sendEmail(toList.join(","), subject, text);
}
