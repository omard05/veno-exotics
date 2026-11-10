import "server-only";
import nodemailer from "nodemailer";

export const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "kareemdarwish001@gmail.com";
export const SITE_URL = (process.env.SITE_URL || "https://venoexotics.com").replace(/\/$/, "");

type Mail = { to: string; subject: string; text: string; html?: string; replyTo?: string };

let transporter: ReturnType<typeof nodemailer.createTransport> | null | undefined;

function getTransporter() {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    transporter = null;
    return null;
  }
  const port = Number(SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

/** Sends an email. Never throws: a mail failure must not lose a customer's submission. */
export async function sendMail(mail: Mail): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.info(`[mail:not-configured] to=${mail.to} subject="${mail.subject}"\n${mail.text}`);
    return false;
  }
  try {
    await t.sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      ...mail,
    });
    return true;
  } catch (err) {
    console.error("[mail:error]", err);
    return false;
  }
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Renders a simple label/value email body in both text and HTML. */
export function renderRows(title: string, rows: [string, string][], footer = "") {
  const text = [title, "", ...rows.map(([k, v]) => `${k}: ${v}`), footer && `\n${footer}`]
    .filter(Boolean)
    .join("\n");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;color:#111">
<h2 style="letter-spacing:.2em;font-weight:600;margin:0 0 4px">VENO</h2>
<p style="margin:0 0 20px;color:#666;font-size:13px;letter-spacing:.1em">${escapeHtml(title)}</p>
<table style="border-collapse:collapse;width:100%;font-size:14px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px 8px 0;color:#666;vertical-align:top;white-space:nowrap;border-bottom:1px solid #eee">${escapeHtml(k)}</td><td style="padding:8px 0;border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
${footer ? `<p style="margin-top:20px;font-size:13px;color:#444">${escapeHtml(footer)}</p>` : ""}
</div>`;
  return { text, html };
}
