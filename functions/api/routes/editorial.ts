import { Hono } from 'hono';
import {
  formatDateLabel,
  htmlToParagraphs,
  hubNewsId,
  mapCategory,
  verifyEditorialSignature,
  type EditorialSyncPayload,
} from '../lib/editorial.ts';
import { deleteManagedR2Object } from '../lib/media.ts';
import type { AppEnv } from '../types.ts';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const editorialRoutes = new Hono<AppEnv>();

// POST /api/editorial/sync — dipanggil Editorial Hub saat artikel dipublikasikan atau ditarik
editorialRoutes.post('/sync', async (c) => {
  const rawBody = await c.req.text();
  const verification = await verifyEditorialSignature(
    c.env.EDITORIAL_SYNC_SECRET,
    rawBody,
    c.req.header('X-Editorial-Timestamp') ?? null,
    c.req.header('X-Editorial-Signature') ?? null,
  );
  if (!verification.valid) {
    return c.json({ ok: false, error: verification.reason }, 401);
  }

  let payload: EditorialSyncPayload;
  try {
    payload = JSON.parse(rawBody) as EditorialSyncPayload;
  } catch {
    return c.json({ ok: false, error: 'Payload JSON tidak valid' }, 400);
  }

  if (!payload.external_uuid || (payload.action !== 'upsert' && payload.action !== 'delete')) {
    return c.json({ ok: false, error: 'external_uuid atau action tidak valid' }, 400);
  }

  const id = hubNewsId(payload.external_uuid);

  if (payload.action === 'delete') {
    const existing = await c.env.DB.prepare('SELECT cover_r2_key, og_r2_key FROM news WHERE id = ?')
      .bind(id)
      .first<{ cover_r2_key: string | null; og_r2_key: string | null }>();
    await c.env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
    if (existing) {
      await deleteManagedR2Object(c.env, existing.cover_r2_key);
      await deleteManagedR2Object(c.env, existing.og_r2_key);
    }
    return c.json({ ok: true, action: 'delete', external_uuid: payload.external_uuid });
  }

  const slug = (payload.slug ?? '').trim();
  const title = (payload.title ?? '').trim();
  if (!SLUG_PATTERN.test(slug) || slug.length > 180) {
    return c.json({ ok: false, error: `Slug "${slug}" tidak sesuai format ETOS ID` }, 400);
  }
  if (!title) {
    return c.json({ ok: false, error: 'Judul kosong' }, 400);
  }

  const paragraphs = htmlToParagraphs(payload.content_html ?? '');
  if (paragraphs.length === 0) {
    return c.json({ ok: false, error: 'Isi artikel kosong setelah dikonversi' }, 400);
  }

  const slugOwner = await c.env.DB.prepare('SELECT id FROM news WHERE slug = ? AND id != ?')
    .bind(slug, id)
    .first<{ id: string }>();
  if (slugOwner) {
    return c.json(
      { ok: false, error: `Slug "${slug}" sudah dipakai berita lain di ETOS ID (${slugOwner.id})` },
      409,
    );
  }

  const publishedAt = payload.published_at || new Date().toISOString();
  const excerpt = (payload.excerpt?.trim() || paragraphs[0]).slice(0, 600);
  const coverUrl = payload.cover_image_url?.trim() || null;

  // location dan og_r2_key diisi dari CMS ETOS ID, jadi tidak ditimpa saat sinkron ulang
  await c.env.DB.prepare(
    `INSERT INTO news (id, slug, title, category, date_label, published_at, location, cover_r2_key, og_r2_key, excerpt, content_json, status)
     VALUES (?, ?, ?, ?, ?, ?, NULL, ?, NULL, ?, ?, 'published')
     ON CONFLICT(id) DO UPDATE SET
       slug = excluded.slug,
       title = excluded.title,
       category = excluded.category,
       date_label = excluded.date_label,
       published_at = excluded.published_at,
       cover_r2_key = excluded.cover_r2_key,
       excerpt = excluded.excerpt,
       content_json = excluded.content_json,
       status = 'published',
       updated_at = datetime('now')`,
  )
    .bind(
      id,
      slug,
      title.slice(0, 220),
      mapCategory(payload.category),
      formatDateLabel(publishedAt),
      publishedAt,
      coverUrl,
      excerpt,
      JSON.stringify(paragraphs),
    )
    .run();

  return c.json({ ok: true, action: 'upsert', external_uuid: payload.external_uuid, slug });
});
