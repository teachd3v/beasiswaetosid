import { Hono } from 'hono';
import { resolveMediaUrl } from '../lib/media.ts';
import type { AppEnv } from '../types.ts';

const PUBLIC_CACHE_HEADER = 'public, max-age=60, stale-while-revalidate=300';

export const publicRoutes = new Hono<AppEnv>();

publicRoutes.use('*', async (c, next) => {
  await next();
  if (c.req.method === 'GET' && c.res.status === 200) {
    c.header('Cache-Control', PUBLIC_CACHE_HEADER);
  }
});

// GET /api/public/campuses
publicRoutes.get('/campuses', async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT id, short_name, full_name, logo_url, sort_order FROM campuses ORDER BY sort_order ASC, short_name ASC',
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

// GET /api/public/media (maksimal 25 foto aktif untuk Hero 3D Showcase)
publicRoutes.get('/media', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, title, timestamp_label, alt, r2_key, width, height, sort_order
     FROM media_items
     WHERE is_published = 1
     ORDER BY sort_order ASC, created_at ASC
     LIMIT 25`,
  ).all<{
    id: string;
    title: string;
    timestamp_label: string;
    alt: string;
    r2_key: string;
    width: number;
    height: number;
    sort_order: number;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((row, idx) => {
      const src = resolveMediaUrl(row.r2_key, base);
      return {
        id: row.id,
        index: idx,
        thumbSrc: src,
        fullSrc: src,
        width: row.width,
        height: row.height,
        title: row.title,
        timestampLabel: row.timestamp_label,
        alt: row.alt,
      };
    }),
  );
});

// GET /api/public/etosers
publicRoutes.get('/etosers', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT e.id, e.name, e.major, e.batch, e.photo_r2_key, e.interest, e.project_title,
            e.bio, e.achievements_json, c.short_name AS campus_short,
            c.full_name AS campus_full, c.logo_url AS campus_logo_src
     FROM etosers e
     INNER JOIN campuses c ON c.id = e.campus_id
     WHERE e.is_published = 1
     ORDER BY e.sort_order ASC, e.created_at ASC`,
  ).all<{
    id: string;
    name: string;
    major: string;
    batch: string;
    photo_r2_key: string;
    interest: string;
    project_title: string;
    bio: string;
    achievements_json: string;
    campus_short: string;
    campus_full: string;
    campus_logo_src: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((row) => ({
      id: row.id,
      name: row.name,
      campusShort: row.campus_short,
      campusFull: row.campus_full,
      campusLogoSrc: row.campus_logo_src,
      major: row.major,
      batch: row.batch,
      photoSrc: resolveMediaUrl(row.photo_r2_key, base),
      interest: row.interest,
      projectTitle: row.project_title,
      bio: row.bio,
      achievements: safeJsonStringArray(row.achievements_json),
    })),
  );
});

// GET /api/public/news
publicRoutes.get('/news', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, slug, title, category, date_label, location, cover_r2_key, excerpt, content_json
     FROM news
     WHERE status = 'published'
     ORDER BY published_at DESC, created_at DESC`,
  ).all<{
    id: string;
    slug: string;
    title: string;
    category: 'Prestasi' | 'Aktivitas & Monev' | 'Program';
    date_label: string;
    location: string | null;
    cover_r2_key: string | null;
    excerpt: string;
    content_json: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      category: row.category,
      dateLabel: row.date_label,
      location: row.location ?? undefined,
      coverSrc: row.cover_r2_key ? resolveMediaUrl(row.cover_r2_key, base) : undefined,
      excerpt: row.excerpt,
      content: safeJsonStringArray(row.content_json),
    })),
  );
});

// GET /api/public/news/:slug
publicRoutes.get('/news/:slug', async (c) => {
  const slug = c.req.param('slug');
  const row = await c.env.DB.prepare(
    `SELECT id, slug, title, category, date_label, location, cover_r2_key, excerpt, content_json
     FROM news
     WHERE slug = ? AND status = 'published'`,
  )
    .bind(slug)
    .first<{
      id: string;
      slug: string;
      title: string;
      category: 'Prestasi' | 'Aktivitas & Monev' | 'Program';
      date_label: string;
      location: string | null;
      cover_r2_key: string | null;
      excerpt: string;
      content_json: string;
    }>();

  if (!row) {
    return c.json({ error: 'Berita tidak ditemukan' }, 404);
  }

  const base = c.env.R2_PUBLIC_URL;
  return c.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    dateLabel: row.date_label,
    location: row.location ?? undefined,
    coverSrc: row.cover_r2_key ? resolveMediaUrl(row.cover_r2_key, base) : undefined,
    excerpt: row.excerpt,
    content: safeJsonStringArray(row.content_json),
  });
});

// GET /api/public/testimonials
publicRoutes.get('/testimonials', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT id, name, campus, batch, photo_r2_key, testimonial, impact
     FROM testimonials
     WHERE is_published = 1
     ORDER BY sort_order ASC, created_at ASC`,
  ).all<{
    id: string;
    name: string;
    campus: string;
    batch: string;
    photo_r2_key: string;
    testimonial: string;
    impact: string;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  return c.json(
    results.map((row) => ({
      id: row.id,
      name: row.name,
      campus: row.campus,
      batch: row.batch,
      photoSrc: resolveMediaUrl(row.photo_r2_key, base),
      testimonial: row.testimonial,
      impact: row.impact,
    })),
  );
});

// GET /api/public/team
publicRoutes.get('/team', async (c) => {
  const { results } = await c.env.DB.prepare(
    `SELECT t.id, t.group_type, t.name, t.role, t.photo_r2_key, t.sort_order,
            c.id AS campus_id, c.short_name AS campus_short,
            c.full_name AS campus_full, c.logo_url AS campus_logo_src,
            c.sort_order AS campus_sort
     FROM team_members t
     LEFT JOIN campuses c ON c.id = t.campus_id
     WHERE t.is_published = 1
     ORDER BY COALESCE(c.sort_order, 0) ASC, t.sort_order ASC, t.created_at ASC`,
  ).all<{
    id: string;
    group_type: 'department_head' | 'core_program' | 'regional_facilitator';
    name: string;
    role: string;
    photo_r2_key: string;
    sort_order: number;
    campus_id: string | null;
    campus_short: string | null;
    campus_full: string | null;
    campus_logo_src: string | null;
    campus_sort: number | null;
  }>();

  const base = c.env.R2_PUBLIC_URL;
  let departmentHead: { id: string; name: string; role: string; photoSrc: string } | null = null;
  const coreProgramTeam: { id: string; name: string; role: string; photoSrc: string }[] = [];
  const campusMap = new Map<
    string,
    {
      campusShort: string;
      campusFull: string;
      campusLogoSrc: string;
      facilitators: { id: string; name: string; role: string; photoSrc: string }[];
    }
  >();

  for (const row of results) {
    const member = {
      id: row.id,
      name: row.name,
      role: row.role,
      photoSrc: resolveMediaUrl(row.photo_r2_key, base),
    };

    if (row.group_type === 'department_head') {
      if (!departmentHead) departmentHead = member;
    } else if (row.group_type === 'core_program') {
      coreProgramTeam.push(member);
    } else if (row.group_type === 'regional_facilitator' && row.campus_id && row.campus_short) {
      let group = campusMap.get(row.campus_id);
      if (!group) {
        group = {
          campusShort: row.campus_short,
          campusFull: row.campus_full ?? row.campus_short,
          campusLogoSrc: row.campus_logo_src ?? '',
          facilitators: [],
        };
        campusMap.set(row.campus_id, group);
      }
      group.facilitators.push(member);
    }
  }

  return c.json({
    departmentHead,
    coreProgramTeam,
    regionalFacilitators: Array.from(campusMap.values()),
  });
});

function safeJsonStringArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // ignore malformed JSON
  }
  return [];
}
