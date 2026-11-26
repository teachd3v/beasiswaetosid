import { Hono } from 'hono';
import { requireAuth } from '../lib/auth.ts';
import {
  ALLOWED_MEDIA_FOLDERS,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  buildR2Key,
  resolveMediaUrl,
} from '../lib/media.ts';
import type { AppEnv } from '../types.ts';

export const mediaPublicRoutes = new Hono<AppEnv>();

// GET /api/media/:folder/:filename -> Stream file dari R2 dengan header cache immutable
mediaPublicRoutes.get('/*', async (c) => {
  const key = c.req.path.replace(/^\/api\/media\//, '');
  if (!key || key.includes('..')) {
    return c.json({ error: 'Invalid media key' }, 400);
  }

  const object = await c.env.MEDIA_BUCKET.get(key);
  if (!object) {
    return c.json({ error: 'Media tidak ditemukan' }, 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  if (!headers.has('content-type')) {
    headers.set('content-type', 'image/webp');
  }

  return new Response(object.body, { headers });
});

export const mediaAdminRoutes = new Hono<AppEnv>();
mediaAdminRoutes.use('*', requireAuth);

// POST /api/admin/upload (multipart/form-data: file, folder)
mediaAdminRoutes.post('/upload', async (c) => {
  const formData = await c.req.formData().catch(() => null);
  if (!formData) {
    return c.json({ error: 'Body harus berupa multipart/form-data' }, 400);
  }

  const file = formData.get('file');
  const folderRaw = String(formData.get('folder') ?? 'showcase').trim();

  if (!(file instanceof File)) {
    return c.json({ error: 'Field file wajib disertakan' }, 400);
  }

  if (!ALLOWED_MEDIA_FOLDERS.has(folderRaw)) {
    return c.json({ error: 'Folder tujuan tidak valid' }, 400);
  }

  const ext = ALLOWED_MIME_TYPES.get(file.type);
  if (!ext) {
    return c.json({ error: 'Format gambar harus WebP, JPEG, atau PNG' }, 400);
  }

  if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
    return c.json({ error: 'Ukuran gambar maksimal 5 MB' }, 400);
  }

  const key = buildR2Key(folderRaw, ext);
  const arrayBuffer = await file.arrayBuffer();

  await c.env.MEDIA_BUCKET.put(key, arrayBuffer, {
    httpMetadata: {
      contentType: file.type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  return c.json(
    {
      key,
      url: resolveMediaUrl(key, c.env.R2_PUBLIC_URL),
      size: file.size,
      contentType: file.type,
    },
    201,
  );
});
