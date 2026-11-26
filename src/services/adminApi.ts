export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'editor';
}

export interface CampusOption {
  id: string;
  shortName: string;
  fullName: string;
  logoUrl: string;
  sortOrder: number;
}

export interface AdminMediaItem {
  id: string;
  title: string;
  timestampLabel: string;
  alt: string;
  r2Key: string;
  url: string;
  width: number;
  height: number;
  sortOrder: number;
  isPublished: boolean;
  updatedAt?: string;
}

export interface AdminEtoserItem {
  id: string;
  name: string;
  campusId: string;
  campusShort: string;
  major: string;
  batch: string;
  photoR2Key: string;
  photoUrl: string;
  interest: string;
  projectTitle: string;
  bio: string;
  achievements: string[];
  sortOrder: number;
  isPublished: boolean;
}

export interface AdminNewsItem {
  id: string;
  slug: string;
  title: string;
  category: 'Prestasi' | 'Aktivitas & Monev' | 'Program';
  dateLabel: string;
  publishedAt: string;
  location: string;
  coverR2Key: string;
  coverUrl: string;
  ogR2Key: string;
  ogUrl: string;
  excerpt: string;
  content: string[];
  status: 'draft' | 'published';
}

export interface AdminTestimonialItem {
  id: string;
  name: string;
  campus: string;
  batch: string;
  photoR2Key: string;
  photoUrl: string;
  testimonial: string;
  impact: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface AdminTeamMemberItem {
  id: string;
  groupType: 'department_head' | 'core_program' | 'regional_facilitator';
  campusId: string;
  campusShort: string;
  name: string;
  role: string;
  photoR2Key: string;
  photoUrl: string;
  sortOrder: number;
  isPublished: boolean;
}

export type MediaFolder = 'showcase' | 'etoser' | 'news' | 'testimonials' | 'team' | 'og';

export interface MediaLibraryItem {
  key: string;
  url: string;
  label: string;
  source: 'r2' | 'showcase';
  folder: string;
  width?: number;
  height?: number;
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      'Endpoint API CMS belum aktif. Jalankan dengan `npm run pages:dev` atau deploy ke Cloudflare Pages.',
    );
  }

  const data = (await res.json()) as { error?: string } & T;
  if (!res.ok) {
    throw new Error(data.error || `Request gagal (${res.status})`);
  }
  return data;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const res = await apiRequest<{ user: AdminUser | null }>('/api/auth/me');
    return res.user;
  } catch {
    return null;
  }
}

export async function loginAdmin(email: string, password: string): Promise<AdminUser> {
  const res = await apiRequest<{ user: AdminUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res.user;
}

export async function logoutAdmin(): Promise<void> {
  await apiRequest('/api/auth/logout', { method: 'POST' });
}

export async function listCampuses(): Promise<CampusOption[]> {
  return apiRequest<CampusOption[]>('/api/admin/campuses');
}

export async function listMediaLibrary(): Promise<MediaLibraryItem[]> {
  return apiRequest<MediaLibraryItem[]>('/api/admin/media-library');
}

export async function deleteMediaLibraryObject(key: string): Promise<void> {
  await apiRequest<{ ok: boolean }>(`/api/admin/media-library?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  });
}

/**
 * Resize & konversi gambar ke WebP di browser sebelum diunggah ke Cloudflare R2.
 */
async function compressImageToWebP(
  file: File,
  maxWidth = 1600,
): Promise<{ file: File; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return { file, width: bitmap.width, height: bitmap.height };
  }

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', 0.82),
  );
  if (!blob) {
    return { file, width, height };
  }

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'upload';
  return {
    file: new File([blob], `${baseName}.webp`, { type: 'image/webp' }),
    width,
    height,
  };
}

export async function uploadAdminImage(
  rawFile: File,
  folder: MediaFolder,
): Promise<{ key: string; url: string; width: number; height: number }> {
  const { file, width, height } = await compressImageToWebP(rawFile);
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);

  const res = await apiRequest<{ key: string; url: string }>('/api/admin/upload', {
    method: 'POST',
    body: form,
  });

  return { key: res.key, url: res.url, width, height };
}

/**
 * Unggah file JPEG OG Card (1200x630) langsung ke folder R2 `og/` tanpa ubah format ke WebP,
 * agar 100% kompatibel dengan preview link WhatsApp, Telegram, LinkedIn, dan X.
 */
export async function uploadOgCardJpeg(
  file: File,
): Promise<{ key: string; url: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', 'og');
  return apiRequest<{ key: string; url: string }>('/api/admin/upload', {
    method: 'POST',
    body: form,
  });
}

export function createResourceApi<TItem, TPayload>(resource: string) {
  return {
    list: () => apiRequest<TItem[]>(`/api/admin/${resource}`),
    create: (payload: TPayload) =>
      apiRequest<{ id: string }>(`/api/admin/${resource}`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: TPayload) =>
      apiRequest<{ ok: boolean }>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    remove: (id: string) =>
      apiRequest<{ ok: boolean }>(`/api/admin/${resource}/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      }),
  };
}

export const mediaApi = createResourceApi<
  AdminMediaItem,
  {
    title: string;
    timestampLabel: string;
    alt: string;
    r2Key: string;
    width: number;
    height: number;
    sortOrder: number;
    isPublished: boolean;
  }
>('media');

export const etoserApi = createResourceApi<
  AdminEtoserItem,
  {
    name: string;
    campusId: string;
    major: string;
    batch: string;
    photoR2Key: string;
    interest: string;
    projectTitle: string;
    bio: string;
    achievements: string[];
    sortOrder: number;
    isPublished: boolean;
  }
>('etosers');

export const adminNewsApi = createResourceApi<
  AdminNewsItem,
  {
    slug: string;
    title: string;
    category: 'Prestasi' | 'Aktivitas & Monev' | 'Program';
    dateLabel: string;
    publishedAt: string;
    location: string;
    coverR2Key: string;
    ogR2Key?: string;
    excerpt: string;
    content: string[];
    status: 'draft' | 'published';
  }
>('news');

export const testimonialApi = createResourceApi<
  AdminTestimonialItem,
  {
    name: string;
    campus: string;
    batch: string;
    photoR2Key: string;
    testimonial: string;
    impact: string;
    sortOrder: number;
    isPublished: boolean;
  }
>('testimonials');

export const teamApi = createResourceApi<
  AdminTeamMemberItem,
  {
    groupType: 'department_head' | 'core_program' | 'regional_facilitator';
    campusId: string | null;
    name: string;
    role: string;
    photoR2Key: string;
    sortOrder: number;
    isPublished: boolean;
  }
>('team');
