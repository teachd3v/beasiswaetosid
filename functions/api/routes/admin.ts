import { Hono } from 'hono';
import { requireAuth } from '../lib/auth.ts';
import { deleteManagedR2Object, resolveMediaUrl } from '../lib/media.ts';
import {
  etoserSchema,
  mediaItemSchema,
  newsSchema,
  teamMemberSchema,
  testimonialSchema,
} from '../lib/validation.ts';
import type { AppEnv } from '../types.ts';

export const adminRoutes = new Hono<AppEnv>();
adminRoutes.use('*', requireAuth);

function newId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function safeJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === 'string')
      : [];
  } catch {
    return [];
  }
}

// ---------- CAMPUSES (Read-only master for dropdowns) ----------
adminRoutes.get('/campuses', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, short_name, full_name, logo_url, sort_order FROM campuses ORDER BY sort_order ASC',
  ).all<{
    id: string;
    short_name: string;
    full_name: string;
    logo_url: string;
    sort_order: number;
  }>();

  return c.json(
    results.map((r) => ({
      id: r.id,
      shortName: r.short_name,
      fullName: r.full_name,
      logoUrl: r.logo_url,
      sortOrder: r.sort_order,
    })),
  );
});

// ---------- 1. MEDIA ITEMS ----------
adminRoutes.get('/media', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, timestamp_label, alt, r2_key, width, height, sort_order, is_published, created_at, updated_at
     FROM media_items ORDER BY sort_order ASC, created_at DESC`,
  ).all<{
    id: string;
    title: string;
    timestamp_label: string;
    alt: string;
    r2_key: string;
    width: number;
    height: number;
    sort_order: number;
    is_published: number;
    created_at: string;
    updated_at: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((r) => ({
      id: r.id,
      title: r.title,
      timestampLabel: r.timestamp_label,
      alt: r.alt,
      r2Key: r.r2_key,
      url: resolveMediaUrl(r.r2_key, base),
      width: r.width,
      height: r.height,
      sortOrder: r.sort_order,
      isPublished: r.is_published === 1,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })),
  );
});

adminRoutes.post('/media', async (c) => {
  const parsed = mediaItemSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const id = newId('media');
  const d = parsed.data;
  await c.env.DB.prepare(
    `INSERT INTO media_items (id, title, timestamp_label, alt, r2_key, width, height, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, d.title, d.timestampLabel, d.alt, d.r2Key, d.width, d.height, d.sortOrder, d.isPublished ? 1 : 0)
    .run();

  return c.json({ id }, 201);
});

adminRoutes.put('/media/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = mediaItemSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const existing = await c.env.DB.prepare('SELECT r2_key FROM media_items WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  const d = parsed.data;
  await c.env.DB.prepare(
    `UPDATE media_items
     SET title = ?, timestamp_label = ?, alt = ?, r2_key = ?, width = ?, height = ?,
         sort_order = ?, is_published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(d.title, d.timestampLabel, d.alt, d.r2Key, d.width, d.height, d.sortOrder, d.isPublished ? 1 : 0, id)
    .run();

  await deleteManagedR2Object(c.env, existing.r2_key, d.r2Key);
  return c.json({ ok: true });
});

adminRoutes.delete('/media/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT r2_key FROM media_items WHERE id = ?')
    .bind(id)
    .first<{ r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  await c.env.DB.prepare('DELETE FROM media_items WHERE id = ?').bind(id).run();
  await deleteManagedR2Object(c.env, existing.r2_key);
  return c.json({ ok: true });
});

// ---------- 2. ETOSERS ----------
adminRoutes.get('/etosers', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT e.id, e.name, e.campus_id, c.short_name AS campus_short, e.major, e.batch,
            e.photo_r2_key, e.interest, e.project_title, e.bio, e.achievements_json,
            e.sort_order, e.is_published, e.updated_at
     FROM etosers e
     LEFT JOIN campuses c ON c.id = e.campus_id
     ORDER BY e.sort_order ASC, e.created_at DESC`,
  ).all<{
    id: string;
    name: string;
    campus_id: string;
    campus_short: string | null;
    major: string;
    batch: string;
    photo_r2_key: string;
    interest: string;
    project_title: string;
    bio: string;
    achievements_json: string;
    sort_order: number;
    is_published: number;
    updated_at: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((r) => ({
      id: r.id,
      name: r.name,
      campusId: r.campus_id,
      campusShort: r.campus_short ?? r.campus_id,
      major: r.major,
      batch: r.batch,
      photoR2Key: r.photo_r2_key,
      photoUrl: resolveMediaUrl(r.photo_r2_key, base),
      interest: r.interest,
      projectTitle: r.project_title,
      bio: r.bio,
      achievements: safeJsonArray(r.achievements_json),
      sortOrder: r.sort_order,
      isPublished: r.is_published === 1,
      updatedAt: r.updated_at,
    })),
  );
});

adminRoutes.post('/etosers', async (c) => {
  const parsed = etoserSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const id = newId('etoser');
  const d = parsed.data;
  await c.env.DB.prepare(
    `INSERT INTO etosers (id, name, campus_id, major, batch, photo_r2_key, interest, project_title, bio, achievements_json, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      d.name,
      d.campusId,
      d.major,
      d.batch,
      d.photoR2Key,
      d.interest,
      d.projectTitle,
      d.bio,
      JSON.stringify(d.achievements),
      d.sortOrder,
      d.isPublished ? 1 : 0,
    )
    .run();

  return c.json({ id }, 201);
});

adminRoutes.put('/etosers/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = etoserSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM etosers WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  const d = parsed.data;
  await c.env.DB.prepare(
    `UPDATE etosers
     SET name = ?, campus_id = ?, major = ?, batch = ?, photo_r2_key = ?, interest = ?,
         project_title = ?, bio = ?, achievements_json = ?, sort_order = ?, is_published = ?,
         updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      d.name,
      d.campusId,
      d.major,
      d.batch,
      d.photoR2Key,
      d.interest,
      d.projectTitle,
      d.bio,
      JSON.stringify(d.achievements),
      d.sortOrder,
      d.isPublished ? 1 : 0,
      id,
    )
    .run();

  await deleteManagedR2Object(c.env, existing.photo_r2_key, d.photoR2Key);
  return c.json({ ok: true });
});

adminRoutes.delete('/etosers/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM etosers WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  await c.env.DB.prepare('DELETE FROM etosers WHERE id = ?').bind(id).run();
  await deleteManagedR2Object(c.env, existing.photo_r2_key);
  return c.json({ ok: true });
});

// ---------- 3. NEWS ----------
adminRoutes.get('/news', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, category, date_label, published_at, location, cover_r2_key,
            excerpt, content_json, status, updated_at
     FROM news ORDER BY published_at DESC, created_at DESC`,
  ).all<{
    id: string;
    slug: string;
    title: string;
    category: 'Prestasi' | 'Aktivitas & Monev' | 'Program';
    date_label: string;
    published_at: string;
    location: string | null;
    cover_r2_key: string | null;
    excerpt: string;
    content_json: string;
    status: 'draft' | 'published';
    updated_at: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      category: r.category,
      dateLabel: r.date_label,
      publishedAt: r.published_at,
      location: r.location ?? '',
      coverR2Key: r.cover_r2_key ?? '',
      coverUrl: r.cover_r2_key ? resolveMediaUrl(r.cover_r2_key, base) : '',
      excerpt: r.excerpt,
      content: safeJsonArray(r.content_json),
      status: r.status,
      updatedAt: r.updated_at,
    })),
  );
});

adminRoutes.post('/news', async (c) => {
  const parsed = newsSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const d = parsed.data;
  const dup = await c.env.DB.prepare('SELECT id FROM news WHERE slug = ?').bind(d.slug).first();
  if (dup) return c.json({ error: 'Slug berita sudah digunakan.' }, 409);

  const id = newId('berita');
  await c.env.DB.prepare(
    `INSERT INTO news (id, slug, title, category, date_label, published_at, location, cover_r2_key, excerpt, content_json, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      d.slug,
      d.title,
      d.category,
      d.dateLabel,
      d.publishedAt,
      d.location || null,
      d.coverR2Key || null,
      d.excerpt,
      JSON.stringify(d.content),
      d.status,
    )
    .run();

  return c.json({ id }, 201);
});

adminRoutes.put('/news/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = newsSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const existing = await c.env.DB.prepare('SELECT cover_r2_key FROM news WHERE id = ?')
    .bind(id)
    .first<{ cover_r2_key: string | null }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  const d = parsed.data;
  const dup = await c.env.DB.prepare('SELECT id FROM news WHERE slug = ? AND id != ?')
    .bind(d.slug, id)
    .first();
  if (dup) return c.json({ error: 'Slug berita sudah digunakan artikel lain.' }, 409);

  await c.env.DB.prepare(
    `UPDATE news
     SET slug = ?, title = ?, category = ?, date_label = ?, published_at = ?, location = ?,
         cover_r2_key = ?, excerpt = ?, content_json = ?, status = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      d.slug,
      d.title,
      d.category,
      d.dateLabel,
      d.publishedAt,
      d.location || null,
      d.coverR2Key || null,
      d.excerpt,
      JSON.stringify(d.content),
      d.status,
      id,
    )
    .run();

  await deleteManagedR2Object(c.env, existing.cover_r2_key, d.coverR2Key || null);
  return c.json({ ok: true });
});

adminRoutes.delete('/news/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT cover_r2_key FROM news WHERE id = ?')
    .bind(id)
    .first<{ cover_r2_key: string | null }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  await c.env.DB.prepare('DELETE FROM news WHERE id = ?').bind(id).run();
  await deleteManagedR2Object(c.env, existing.cover_r2_key);
  return c.json({ ok: true });
});

// ---------- 4. TESTIMONIALS ----------
adminRoutes.get('/testimonials', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, campus, batch, photo_r2_key, testimonial, impact, sort_order, is_published, updated_at
     FROM testimonials ORDER BY sort_order ASC, created_at DESC`,
  ).all<{
    id: string;
    name: string;
    campus: string;
    batch: string;
    photo_r2_key: string;
    testimonial: string;
    impact: string;
    sort_order: number;
    is_published: number;
    updated_at: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((r) => ({
      id: r.id,
      name: r.name,
      campus: r.campus,
      batch: r.batch,
      photoR2Key: r.photo_r2_key,
      photoUrl: resolveMediaUrl(r.photo_r2_key, base),
      testimonial: r.testimonial,
      impact: r.impact,
      sortOrder: r.sort_order,
      isPublished: r.is_published === 1,
      updatedAt: r.updated_at,
    })),
  );
});

adminRoutes.post('/testimonials', async (c) => {
  const parsed = testimonialSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const id = newId('alumni');
  const d = parsed.data;
  await c.env.DB.prepare(
    `INSERT INTO testimonials (id, name, campus, batch, photo_r2_key, testimonial, impact, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, d.name, d.campus, d.batch, d.photoR2Key, d.testimonial, d.impact, d.sortOrder, d.isPublished ? 1 : 0)
    .run();

  return c.json({ id }, 201);
});

adminRoutes.put('/testimonials/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = testimonialSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM testimonials WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  const d = parsed.data;
  await c.env.DB.prepare(
    `UPDATE testimonials
     SET name = ?, campus = ?, batch = ?, photo_r2_key = ?, testimonial = ?, impact = ?,
         sort_order = ?, is_published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(d.name, d.campus, d.batch, d.photoR2Key, d.testimonial, d.impact, d.sortOrder, d.isPublished ? 1 : 0, id)
    .run();

  await deleteManagedR2Object(c.env, existing.photo_r2_key, d.photoR2Key);
  return c.json({ ok: true });
});

adminRoutes.delete('/testimonials/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM testimonials WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  await c.env.DB.prepare('DELETE FROM testimonials WHERE id = ?').bind(id).run();
  await deleteManagedR2Object(c.env, existing.photo_r2_key);
  return c.json({ ok: true });
});

// ---------- 5. TEAM MEMBERS ----------
adminRoutes.get('/team', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.id, t.group_type, t.campus_id, c.short_name AS campus_short,
            t.name, t.role, t.photo_r2_key, t.sort_order, t.is_published, t.updated_at
     FROM team_members t
     LEFT JOIN campuses c ON c.id = t.campus_id
     ORDER BY t.group_type ASC, COALESCE(c.sort_order, 0) ASC, t.sort_order ASC`,
  ).all<{
    id: string;
    group_type: 'department_head' | 'core_program' | 'regional_facilitator';
    campus_id: string | null;
    campus_short: string | null;
    name: string;
    role: string;
    photo_r2_key: string;
    sort_order: number;
    is_published: number;
    updated_at: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((r) => ({
      id: r.id,
      groupType: r.group_type,
      campusId: r.campus_id ?? '',
      campusShort: r.campus_short ?? '',
      name: r.name,
      role: r.role,
      photoR2Key: r.photo_r2_key,
      photoUrl: resolveMediaUrl(r.photo_r2_key, base),
      sortOrder: r.sort_order,
      isPublished: r.is_published === 1,
      updatedAt: r.updated_at,
    })),
  );
});

adminRoutes.post('/team', async (c) => {
  const parsed = teamMemberSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const id = newId('tim');
  const d = parsed.data;
  const campusId = d.groupType === 'regional_facilitator' ? d.campusId || null : null;

  await c.env.DB.prepare(
    `INSERT INTO team_members (id, group_type, campus_id, name, role, photo_r2_key, sort_order, is_published)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, d.groupType, campusId, d.name, d.role, d.photoR2Key, d.sortOrder, d.isPublished ? 1 : 0)
    .run();

  return c.json({ id }, 201);
});

adminRoutes.put('/team/:id', async (c) => {
  const id = c.req.param('id');
  const parsed = teamMemberSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Payload tidak valid' }, 400);
  }
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM team_members WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  const d = parsed.data;
  const campusId = d.groupType === 'regional_facilitator' ? d.campusId || null : null;

  await c.env.DB.prepare(
    `UPDATE team_members
     SET group_type = ?, campus_id = ?, name = ?, role = ?, photo_r2_key = ?,
         sort_order = ?, is_published = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(d.groupType, campusId, d.name, d.role, d.photoR2Key, d.sortOrder, d.isPublished ? 1 : 0, id)
    .run();

  await deleteManagedR2Object(c.env, existing.photo_r2_key, d.photoR2Key);
  return c.json({ ok: true });
});

adminRoutes.delete('/team/:id', async (c) => {
  const id = c.req.param('id');
  const existing = await c.env.DB.prepare('SELECT photo_r2_key FROM team_members WHERE id = ?')
    .bind(id)
    .first<{ photo_r2_key: string }>();
  if (!existing) return c.json({ error: 'Data tidak ditemukan' }, 404);

  await c.env.DB.prepare('DELETE FROM team_members WHERE id = ?').bind(id).run();
  await deleteManagedR2Object(c.env, existing.photo_r2_key);
  return c.json({ ok: true });
});
