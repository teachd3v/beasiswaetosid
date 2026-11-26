import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import { adminRoutes } from './routes/admin.ts';
import { authRoutes } from './routes/auth.ts';
import { mediaAdminRoutes, mediaPublicRoutes } from './routes/media.ts';
import { publicRoutes } from './routes/public.ts';
import type { AppEnv } from './types.ts';

const app = new Hono<AppEnv>().basePath('/api');

app.get('/health', (c) => c.json({ ok: true, service: 'beasiswaetosid-cms' }));

app.route('/public', publicRoutes);
app.route('/auth', authRoutes);
app.route('/media', mediaPublicRoutes);
app.route('/admin', mediaAdminRoutes);
app.route('/admin', adminRoutes);

app.notFound((c) => c.json({ error: 'Endpoint API tidak ditemukan' }, 404));

app.onError((err, c) => {
  console.error('CMS API error:', err);
  return c.json({ error: 'Terjadi kesalahan internal pada server' }, 500);
});

export const onRequest = handle(app);
