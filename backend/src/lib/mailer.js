// src/lib/mailer.js
import nodemailer from "nodemailer";

function buildTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port,
    secure, // true: 465 (SSL), false: 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER, // tu_correo@gmail.com
      pass: process.env.SMTP_PASS, // App Password 16 chars
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    tls: { rejectUnauthorized: false },
  });
}

export async function sendEmail(to, subject, text) {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = port === 465;
  const transporter = buildTransport({ host, port, secure });

  return transporter.sendMail({
    from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
}

export async function notifyAdminsByEmail(subject, text) {
  const toList = (process.env.ADMIN_EMAILS || "")
    .split(/[,\s;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  if (!toList.length) return;
  return sendEmail(toList.join(","), subject, text);
}
