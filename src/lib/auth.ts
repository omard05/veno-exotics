/**
 * Minimal admin session: a signed, expiring cookie. Works in both the Edge
 * middleware and Node server actions (Web Crypto only).
 */
export const ADMIN_COOKIE = "veno_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env.SESSION_SECRET || `veno:${process.env.ADMIN_PASSWORD || ""}`;
}

async function hmac(data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export async function createSessionToken(): Promise<{ token: string; maxAge: number }> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  return { token: `${exp}.${await hmac(`admin.${exp}`)}`, maxAge: MAX_AGE_SECONDS };
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const [expStr, sig] = token.split(".");
  const exp = Number(expStr);
  if (!exp || exp < Date.now() / 1000 || !sig) return false;
  return safeEqual(sig, await hmac(`admin.${exp}`));
}

export async function checkPassword(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Compare HMACs so timing doesn't reveal the password length/content.
  return safeEqual(await hmac(`pw.${input}`), await hmac(`pw.${expected}`));
}
