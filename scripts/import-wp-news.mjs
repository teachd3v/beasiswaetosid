#!/usr/bin/env node
/**
 * Migrasi berita WordPress (u245362858_wp113.sql + uploads/) ke Cloudflare D1 & R2.
 *
 * Penggunaan:
 *   node scripts/import-wp-news.mjs --backup="C:\...\backup-etos-2026-11-26" --out-sql="temp-wp-news.sql"
 *   node scripts/import-wp-news.mjs --backup="C:\...\backup-etos-2026-11-26" --upload-r2-remote --upload-r2-local --out-sql="temp-wp-news.sql"
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (prefix) => {
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : null;
};

const BACKUP_DIR =
  getArg('--backup=') ||
  'C:\\Users\\Asus VivoBook\\Documents\\GEN 2026\\WEBSITE\\ETOS ID\\backup-etos-2026-11-26';
const SQL_PATH = path.join(BACKUP_DIR, 'u245362858_wp113.sql');
const UPLOADS_DIR = path.join(BACKUP_DIR, 'uploads');
const OUT_SQL = getArg('--out-sql=');
const UPLOAD_R2_REMOTE = args.includes('--upload-r2-remote');
const UPLOAD_R2_LOCAL = args.includes('--upload-r2-local');
const BUCKET_NAME = 'etosid-media';

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const PROGRAM_CATS = new Set([
  'Program',
  'Lepas Juang',
  'Kuliah tak Gentar',
  'Community of Interest',
  'Social Project',
  'Pembinaan',
  'Pengumuman',
]);

function parseInsertRows(sql, tableName) {
  const rows = [];
  const headerRe = new RegExp(`INSERT INTO \`${tableName}\`(?:\\s*\\([^)]+\\))?\\s*VALUES\\s*`, 'g');
  let match;
  while ((match = headerRe.exec(sql)) !== null) {
    let i = match.index + match[0].length;
    const len = sql.length;
    while (i < len) {
      while (i < len && /[\s,]/.test(sql[i])) i++;
      if (sql[i] !== '(') break;
      i++;
      const fields = [];
      while (i < len) {
        while (i < len && /\s/.test(sql[i])) i++;
        if (sql[i] === "'") {
          i++;
          let val = '';
          while (i < len) {
            const ch = sql[i];
            if (ch === '\\') {
              const next = sql[i + 1];
              if (next === 'n') val += '\n';
              else if (next === 'r') val += '\r';
              else if (next === 't') val += '\t';
              else val += next ?? '';
              i += 2;
            } else if (ch === "'" && sql[i + 1] === "'") {
              val += "'";
              i += 2;
            } else if (ch === "'") {
              i++;
              break;
            } else {
              val += ch;
              i++;
            }
          }
          fields.push(val);
        } else {
          let token = '';
          while (i < len && sql[i] !== ',' && sql[i] !== ')') {
            token += sql[i++];
          }
          token = token.trim();
          fields.push(token === 'NULL' ? null : token);
        }
        while (i < len && /\s/.test(sql[i])) i++;
        if (sql[i] === ',') {
          i++;
          continue;
        }
        if (sql[i] === ')') {
          i++;
          break;
        }
      }
      rows.push(fields);
      while (i < len && /\s/.test(sql[i])) i++;
      if (sql[i] === ';') {
        i++;
        break;
      }
    }
    headerRe.lastIndex = i;
  }
  return rows;
}

const NAMED_ENTITIES = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  hellip: '…',
};

function decodeHtmlEntities(text) {
  return text
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (full, name) => NAMED_ENTITIES[name] ?? full);
}

function htmlToParagraphs(html) {
  const cleaned = String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/\[\/?[a-zA-Z0-9_-]+[^\]]*\]/g, '')
    .replace(/<\/?(?:p|div|h[1-6]|li|blockquote|figure|tr)[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '');

  return cleaned
    .split(/\n+/)
    .map((line) => decodeHtmlEntities(line).replace(/\s+/g, ' ').trim())
    .filter((line) => line.length > 0);
}

function formatDateLabel(mysqlDate) {
  const m = String(mysqlDate || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return '2026';
  const year = m[1];
  const monthIdx = Number.parseInt(m[2], 10) - 1;
  const day = Number.parseInt(m[3], 10);
  return `${day} ${MONTHS_ID[monthIdx] ?? ''} ${year}`.trim();
}

function extractLocation(firstParagraph) {
  if (!firstParagraph) return null;
  const m = firstParagraph.match(/^([A-Za-z][A-Za-z.\s,]{1,28}?)\s*[–—-]\s+/);
  if (!m) return null;
  const candidate = m[1].trim();
  // Hindari kalimat biasa yang kebetulan punya tanda hubung
  if (candidate.split(/\s+/).length > 4) return null;
  return candidate;
}

function mapCategory(wpCategories) {
  if (wpCategories.includes('Prestasi')) return 'Prestasi';
  if (wpCategories.some((c) => PROGRAM_CATS.has(c))) return 'Program';
  return 'Aktivitas & Monev';
}

function buildExcerpt(wpExcerpt, paragraphs) {
  const cleanExcerpt = htmlToParagraphs(wpExcerpt).join(' ').trim();
  const base = cleanExcerpt || paragraphs[0] || '';
  if (base.length <= 220) return base;
  const cut = base.slice(0, 217);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 120 ? cut.slice(0, lastSpace) : cut).trim()}...`;
}

function findInlineUploadImage(html) {
  const m = String(html || '').match(/wp-content\/uploads\/([^"'\s)]+\.(?:webp|jpe?g|png))/i);
  if (!m) return null;
  const rel = decodeURIComponent(m[1]).replace(/\//g, path.sep);
  const full = path.join(UPLOADS_DIR, rel);
  return fs.existsSync(full) ? m[1] : null;
}

function contentTypeFromExt(ext) {
  const lower = ext.toLowerCase();
  if (lower === '.webp') return 'image/webp';
  if (lower === '.png') return 'image/png';
  return 'image/jpeg';
}

function sanitizeFileName(fileName) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sqlEsc(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}

const raw = fs.readFileSync(SQL_PATH, 'utf8');
const posts = parseInsertRows(raw, 'wp_posts');
const postmeta = parseInsertRows(raw, 'wp_postmeta');
const terms = new Map(
  parseInsertRows(raw, 'wp_terms').map((r) => [r[0], { id: r[0], name: r[1], slug: r[2] }]),
);
const taxById = new Map(
  parseInsertRows(raw, 'wp_term_taxonomy').map((r) => [r[0], { termId: r[1], taxonomy: r[2] }]),
);

const thumbByPostId = new Map();
const attachedFileByAttachmentId = new Map();
for (const r of postmeta) {
  if (r[2] === '_thumbnail_id') thumbByPostId.set(r[1], r[3]);
  else if (r[2] === '_wp_attached_file') attachedFileByAttachmentId.set(r[1], r[3]);
}

const catsByPostId = new Map();
for (const r of parseInsertRows(raw, 'wp_term_relationships')) {
  const tax = taxById.get(r[1]);
  if (tax?.taxonomy === 'category') {
    const term = terms.get(tax.termId);
    if (term) {
      const arr = catsByPostId.get(r[0]) || [];
      arr.push(term.name);
      catsByPostId.set(r[0], arr);
    }
  }
}

const articles = [];
for (const row of posts) {
  if (row[20] !== 'post' || row[7] !== 'publish') continue;
  const wpId = row[0];
  const postDate = String(row[2] || '2026-01-01');
  const publishedAt = postDate.slice(0, 10);
  const title = decodeHtmlEntities(String(row[5] || '')).trim();
  const slug = String(row[11] || '')
    .trim()
    .toLowerCase();
  const paragraphs = htmlToParagraphs(row[4]);
  const wpCats = catsByPostId.get(wpId) || [];
  const category = mapCategory(wpCats);
  const location = extractLocation(paragraphs[0]);
  const excerpt = buildExcerpt(row[6], paragraphs);
  const dateLabel = formatDateLabel(postDate);

  const thumbId = thumbByPostId.get(wpId);
  let coverRel = thumbId ? attachedFileByAttachmentId.get(thumbId) : null;
  if (coverRel && !fs.existsSync(path.join(UPLOADS_DIR, coverRel))) {
    coverRel = null;
  }
  if (!coverRel) {
    coverRel = findInlineUploadImage(row[4]);
  }

  let coverLocalPath = null;
  let coverR2Key = null;
  if (coverRel) {
    coverLocalPath = path.join(UPLOADS_DIR, coverRel);
    const safeName = sanitizeFileName(path.basename(coverRel));
    coverR2Key = `news/wp-${wpId}-${safeName}`;
  }

  articles.push({
    id: `wp-${wpId}`,
    slug,
    title,
    category,
    wpCategories: wpCats,
    dateLabel,
    publishedAt,
    location,
    coverLocalPath,
    coverR2Key,
    excerpt,
    content: paragraphs.length > 0 ? paragraphs : [excerpt || title],
  });
}

articles.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

console.log(`Parsed ${articles.length} published WordPress articles:`);
for (const a of articles) {
  console.log(
    `  [${a.publishedAt}] (${a.category}) ${a.title.slice(0, 58)} | loc=${a.location ?? '-'} | cover=${a.coverR2Key ? 'YES' : 'NO'} | p=${a.content.length}`,
  );
}

const withCover = articles.filter((a) => a.coverLocalPath && a.coverR2Key);
console.log(`\nCovers ready to upload: ${withCover.length}/${articles.length}`);

function uploadToR2(modeFlag) {
  console.log(`\nUploading ${withCover.length} covers to R2 (${modeFlag})...`);
  const wranglerBin = path.resolve('node_modules/wrangler/bin/wrangler.js');
  for (let idx = 0; idx < withCover.length; idx++) {
    const a = withCover[idx];
    const ct = contentTypeFromExt(path.extname(a.coverLocalPath));
    console.log(`  [${idx + 1}/${withCover.length}] ${a.coverR2Key}`);
    execFileSync(
      process.execPath,
      [
        wranglerBin,
        'r2',
        'object',
        'put',
        `${BUCKET_NAME}/${a.coverR2Key}`,
        `--file=${a.coverLocalPath}`,
        `--content-type=${ct}`,
        modeFlag,
      ],
      { stdio: 'inherit' },
    );
  }
}

if (UPLOAD_R2_REMOTE) uploadToR2('--remote');
if (UPLOAD_R2_LOCAL) uploadToR2('--local');

if (OUT_SQL) {
  const lines = [
    '-- Migrasi 24 berita resmi WordPress + hapus 5 berita dummy awal',
    "DELETE FROM news WHERE id IN ('berita-01', 'berita-02', 'berita-03', 'berita-04', 'berita-05');",
    '',
  ];

  for (const a of articles) {
    lines.push(
      `INSERT INTO news (id, slug, title, category, date_label, published_at, location, cover_r2_key, excerpt, content_json, status) VALUES (${sqlEsc(a.id)}, ${sqlEsc(a.slug)}, ${sqlEsc(a.title)}, ${sqlEsc(a.category)}, ${sqlEsc(a.dateLabel)}, ${sqlEsc(a.publishedAt)}, ${sqlEsc(a.location)}, ${sqlEsc(a.coverR2Key)}, ${sqlEsc(a.excerpt)}, ${sqlEsc(JSON.stringify(a.content))}, 'published') ON CONFLICT(slug) DO UPDATE SET title = excluded.title, category = excluded.category, date_label = excluded.date_label, published_at = excluded.published_at, location = excluded.location, cover_r2_key = excluded.cover_r2_key, excerpt = excluded.excerpt, content_json = excluded.content_json, status = 'published', updated_at = datetime('now');`,
    );
  }

  fs.writeFileSync(OUT_SQL, `${lines.join('\n')}\n`, 'utf8');
  console.log(`\nSQL migration written to: ${OUT_SQL}`);
}
