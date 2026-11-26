import { Hono } from 'hono';
import { requireAuth } from '../lib/auth.ts';
import {
  ALLOWED_MEDIA_FOLDERS,
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  buildR2Key,
  isManagedR2Key,
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

// GET /api/admin/media-library -> Gabungan foto dari R2 + Media Showcase D1 untuk picker
mediaAdminRoutes.get('/media-library', async (c) => {
  const base = c.env.R2_PUBLIC_URL;
  const seen = new Map<
    string,
    {
      key: string;
      url: string;
      label: string;
      source: 'r2' | 'showcase';
      folder: string;
      width?: number;
      height?: number;
    }
  >();

  // 1. Objek yang sudah diunggah ke bucket R2
  try {
    const listed = await c.env.MEDIA_BUCKET.list({ limit: 200 });
    const sortedObjects = [...listed.objects].sort(
      (a, b) => b.uploaded.getTime() - a.uploaded.getTime(),
    );
    for (const obj of sortedObjects) {
      const folder = obj.key.includes('/') ? obj.key.split('/')[0] : 'r2';
      seen.set(obj.key, {
        key: obj.key,
        url: resolveMediaUrl(obj.key, base),
        label: obj.key.split('/').pop() ?? obj.key,
        source: 'r2',
        folder,
      });
    }
  } catch {
    // Tetap lanjutkan dengan data dari D1 jika listing R2 gagal
  }

  // 2. Foto dari tabel media_items (Media Showcase)
  const { results } = await c.env.DB.prepare(
    'SELECT title, r2_key, width, height FROM media_items ORDER BY sort_order ASC, created_at DESC',
  ).all<{ title: string; r2_key: string; width: number; height: number }>();

  for (const row of results) {
    const existing = seen.get(row.r2_key);
    if (existing) {
      existing.label = row.title;
      existing.width = row.width;
      existing.height = row.height;
    } else {
      seen.set(row.r2_key, {
        key: row.r2_key,
        url: resolveMediaUrl(row.r2_key, base),
        label: row.title,
        source: 'showcase',
        folder: 'showcase',
        width: row.width,
        height: row.height,
      });
    }
  }

  return c.json(Array.from(seen.values()));
});

// DELETE /api/admin/media-library?key=<r2_key> -> Hapus objek R2 jika tidak sedang dipakai di D1
mediaAdminRoutes.delete('/media-library', async (c) => {
  const key = c.req.query('key')?.trim();
  if (!key || !isManagedR2Key(key)) {
    return c.json({ error: 'Hanya file yang tersimpan di R2 yang dapat dihapus dari galeri.' }, 400);
  }

  const refCheck = await c.env.DB.prepare(
    `SELECT
      (SELECT COUNT(*) FROM media_items WHERE r2_key = ?) +
      (SELECT COUNT(*) FROM etosers WHERE photo_r2_key = ?) +
      (SELECT COUNT(*) FROM news WHERE cover_r2_key = ?) +
      (SELECT COUNT(*) FROM testimonials WHERE photo_r2_key = ?) +
      (SELECT COUNT(*) FROM team_members WHERE photo_r2_key = ?) AS total_refs`,
  )
    .bind(key, key, key, key, key)
    .first<{ total_refs: number }>();

  if ((refCheck?.total_refs ?? 0) > 0) {
    return c.json(
      { error: 'Foto masih dipakai di konten aktif (Hero/Berita/Etoser/Testimoni/Tim). Lepas dulu sebelum menghapus.' },
      409,
    );
  }

  await c.env.MEDIA_BUCKET.delete(key);
  return c.json({ ok: true });
});

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
