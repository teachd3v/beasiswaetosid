import { Hono } from 'hono';
import {
  createSession,
  destroySession,
  resolveSessionUser,
  verifyPassword,
} from '../lib/auth.ts';
import { loginSchema } from '../lib/validation.ts';
import type { AppEnv } from '../types.ts';

export const authRoutes = new Hono<AppEnv>();

// POST /api/auth/login
authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Input tidak valid' }, 400);
  }

  const email = parsed.data.email.toLowerCase();
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, password_hash, role, is_active FROM admin_users WHERE email = ?',
  )
    .bind(email)
    .first<{
      id: string;
      email: string;
      name: string;
      password_hash: string;
      role: 'superadmin' | 'editor';
      is_active: number;
    }>();

  if (!user || user.is_active !== 1) {
    return c.json({ error: 'Email atau password salah.' }, 401);
  }

  const valid = await verifyPassword(parsed.data.password, user.password_hash);
  if (!valid) {
    return c.json({ error: 'Email atau password salah.' }, 401);
  }

  await createSession(c, user.id);

  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
});

// POST /api/auth/logout
authRoutes.post('/logout', async (c) => {
  await destroySession(c);
  return c.json({ ok: true });
});

// GET /api/auth/me
authRoutes.get('/me', async (c) => {
  const user = await resolveSessionUser(c);
  if (!user) {
    return c.json({ user: null }, 401);
  }
  return c.json({ user });
});
