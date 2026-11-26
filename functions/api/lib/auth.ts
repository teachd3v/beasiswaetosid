import type { Context, MiddlewareHandler } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { AdminUser, AppEnv } from '../types.ts';

export const SESSION_COOKIE_NAME = 'etos_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_KEY_BITS = 256;

const encoder = new TextEncoder();

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    PBKDF2_KEY_BITS,
  );
  return `pbkdf2$${PBKDF2_ITERATIONS}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derivedBits))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;

  const iterations = Number.parseInt(parts[1], 10);
  const salt = hexToBytes(parts[2]);
  const expected = hexToBytes(parts[3]);
  if (!Number.isFinite(iterations) || iterations < 10_000 || !salt || !expected) {
    return false;
  }

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    expected.length * 8,
  );

  return constantTimeEqual(new Uint8Array(derivedBits), expected);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function createSession(
  c: Context<AppEnv>,
  userId: string,
): Promise<void> {
  const rawToken = generateSessionToken();
  const tokenHash = await sha256Hex(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000).toISOString();

  await c.env.DB.prepare(
    'INSERT INTO admin_sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
  )
    .bind(tokenHash, userId, expiresAt)
    .run();

  const isHttps = new URL(c.req.url).protocol === 'https:';
  setCookie(c, SESSION_COOKIE_NAME, rawToken, {
    path: '/',
    httpOnly: true,
    secure: isHttps,
    sameSite: 'Lax',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession(c: Context<AppEnv>): Promise<void> {
  const rawToken = getCookie(c, SESSION_COOKIE_NAME);
  if (rawToken) {
    const tokenHash = await sha256Hex(rawToken);
    await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
      .bind(tokenHash)
      .run();
  }
  deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
}

export async function resolveSessionUser(c: Context<AppEnv>): Promise<AdminUser | null> {
  const rawToken = getCookie(c, SESSION_COOKIE_NAME);
  if (!rawToken) return null;

  const tokenHash = await sha256Hex(rawToken);
  const row = await c.env.DB.prepare(
    `SELECT u.id, u.email, u.name, u.role, s.expires_at
     FROM admin_sessions s
     INNER JOIN admin_users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND u.is_active = 1`,
  )
    .bind(tokenHash)
    .first<{
      id: string;
      email: string;
      name: string;
      role: 'superadmin' | 'editor';
      expires_at: string;
    }>();

  if (!row) return null;

  if (Date.parse(row.expires_at) <= Date.now()) {
    await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token_hash = ?')
      .bind(tokenHash)
      .run();
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const user = await resolveSessionUser(c);
  if (!user) {
    return c.json({ error: 'Unauthorized. Silakan login terlebih dahulu.' }, 401);
  }
  c.set('adminUser', user);
  await next();
};
