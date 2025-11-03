// src/lib/mailer.js
import nodemailer from "nodemailer";

function makeTransport({ host, port, secure }) {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
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
  const transporter = makeTransport({ host, port, secure });

  await transporter.sendMail({
    from: `"GymTrack Notifier" <${process.env.SMTP_USER}>`,
    to, subject, text,
  });
}

export async function notifyAdminsByEmail(subject, text) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",").map(s => s.trim()).filter(Boolean);
  if (!list.length) return;
  await sendEmail(list.join(","), subject, text);
}
