import "server-only";
import { createHmac, createHash, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "sekibat-admin";
const TTL = 60 * 60 * 8;
export function configured() { return (process.env.SEKIBAT_ADMIN_PASSWORD?.length ?? 0) >= 12 && (process.env.SEKIBAT_ADMIN_SECRET?.length ?? 0) >= 32; }
function digest(value: string) { return createHash("sha256").update(value).digest(); }
function sign(value: string) { return createHmac("sha256", process.env.SEKIBAT_ADMIN_SECRET!).update(value).digest("base64url"); }
function fingerprint() { return digest(process.env.SEKIBAT_ADMIN_PASSWORD!).toString("base64url"); }
export function correctPassword(value: string) { return configured() && timingSafeEqual(digest(value), digest(process.env.SEKIBAT_ADMIN_PASSWORD!)); }
export async function signedIn(): Promise<boolean> {
  if (!configured()) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 1024) return false;
  const [payload, signature, extra] = token.split(".");
  if (extra || !payload || !signature || !timingSafeEqual(digest(sign(payload)), digest(signature))) return false;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString()); return typeof data.exp === "number" && data.exp > Date.now() && data.account === fingerprint(); } catch { return false; }
}
export async function requireAdmin() { if (!(await signedIn())) redirect("/admin/login"); }
export async function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + TTL * 1000, account: fingerprint(), nonce: randomBytes(16).toString("hex") })).toString("base64url");
  (await cookies()).set(COOKIE, `${payload}.${sign(payload)}`, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }
// Single administrator account: cap attempts across all IPs, without trusting forwarded headers.
const rateGlobal = globalThis as typeof globalThis & { sekibatLoginAttempts?: number[] };
export function allowLoginAttempt() {
  const now = Date.now();
  const attempts = (rateGlobal.sekibatLoginAttempts ?? []).filter((time) => time > now - 15 * 60 * 1000);
  rateGlobal.sekibatLoginAttempts = attempts;
  if (attempts.length >= 20) return false;
  attempts.push(now); return true;
}
