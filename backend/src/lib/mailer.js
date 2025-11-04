// src/lib/mailer.js — MailerSend API
let _fetch = globalThis.fetch;
async function getFetch() {
  if (_fetch) return _fetch;
  // Para entornos donde no exista fetch nativo
  const mod = await import("node-fetch");
  _fetch = mod.default;
  return _fetch;
}

async function mailerSendRequest(to, subject, text) {
  const apiKey = process.env.MAILERSEND_API_KEY;
  const apiUrl = process.env.MAILERSEND_API_URL || "https://api.mailersend.com/v1/email";
  const fromEmail = process.env.SENDER_EMAIL;
  const fromName = process.env.SENDER_NAME || "GymTrack Notifier";

  if (!apiKey) throw new Error("MAILERSEND_API_KEY no configurado");
  if (!fromEmail) throw new Error("SENDER_EMAIL no configurado");

  const payload = {
    from: { email: fromEmail, name: fromName },
    to: String(to)
      .split(/[,\s;]+/)
      .map((email) => ({ email: email.trim() }))
      .filter((e) => e.email),
    subject,
    text,
  };

  const fetch = await getFetch();
  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`MailerSend ${res.status}: ${raw}`);
  console.log("[mailer] MailerSend OK:", raw);
  return raw;
}

export async function sendEmail(to, subject, text) {
  return mailerSendRequest(to, subject, text);
}

export async function notifyAdminsByEmail(subject, text) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(/[,\s;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!list.length) {
    console.log("[mailer] ADMIN_EMAILS vacío; no hay destinatarios");
    return;
  }
  return sendEmail(list.join(","), subject, text);
}
