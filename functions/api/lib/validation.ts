import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const mediaItemSchema = z.object({
  title: z.string().trim().min(1, 'Judul wajib diisi').max(200),
  timestampLabel: z.string().trim().min(1, 'Label kegiatan wajib diisi').max(200),
  alt: z.string().trim().min(1, 'Alt text wajib diisi').max(300),
  r2Key: z.string().trim().min(1, 'Gambar wajib diunggah'),
  width: z.number().int().min(100).max(8000).default(1600),
  height: z.number().int().min(100).max(8000).default(900),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const etoserSchema = z.object({
  name: z.string().trim().min(1, 'Nama wajib diisi').max(150),
  campusId: z.string().trim().min(1, 'Kampus wajib dipilih'),
  major: z.string().trim().min(1, 'Jurusan wajib diisi').max(150),
  batch: z.string().trim().min(1, 'Angkatan wajib diisi').max(60),
  photoR2Key: z.string().trim().min(1, 'Foto wajib diunggah'),
  interest: z.string().trim().min(1, 'Minat wajib diisi').max(120),
  projectTitle: z.string().trim().min(1, 'Judul proyek wajib diisi').max(250),
  bio: z.string().trim().min(1, 'Bio wajib diisi').max(1000),
  achievements: z.array(z.string().trim().min(1)).default([]),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const newsSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug minimal 2 karakter')
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung'),
  title: z.string().trim().min(1, 'Judul berita wajib diisi').max(220),
  category: z.enum(['Prestasi', 'Aktivitas & Monev', 'Program']),
  dateLabel: z.string().trim().min(1, 'Label tanggal wajib diisi').max(80),
  publishedAt: z.string().trim().min(4, 'Tanggal publikasi wajib diisi').max(40),
  location: z.string().trim().max(120).optional().nullable(),
  coverR2Key: z.string().trim().optional().nullable(),
  ogR2Key: z.string().trim().optional().nullable(),
  excerpt: z.string().trim().min(1, 'Ringkasan wajib diisi').max(600),
  content: z.array(z.string().trim().min(1)).min(1, 'Isi berita minimal 1 paragraf'),
  status: z.enum(['draft', 'published']).default('draft'),
});

export const testimonialSchema = z.object({
  name: z.string().trim().min(1, 'Nama alumni wajib diisi').max(150),
  campus: z.string().trim().min(1, 'Kampus wajib diisi').max(120),
  batch: z.string().trim().min(1, 'Angkatan wajib diisi').max(60),
  photoR2Key: z.string().trim().min(1, 'Foto wajib diunggah'),
  testimonial: z.string().trim().min(1, 'Testimoni wajib diisi').max(1500),
  impact: z.string().trim().min(1, 'Kontribusi/dampak wajib diisi').max(220),
  sortOrder: z.number().int().default(0),
  isPublished: z.boolean().default(true),
});

export const teamMemberSchema = z
  .object({
    groupType: z.enum(['department_head', 'core_program', 'regional_facilitator']),
    campusId: z.string().trim().optional().nullable(),
    name: z.string().trim().min(1, 'Nama wajib diisi').max(150),
    role: z.string().trim().min(1, 'Jabatan wajib diisi').max(150),
    photoR2Key: z.string().trim().min(1, 'Foto wajib diunggah'),
    sortOrder: z.number().int().default(0),
    isPublished: z.boolean().default(true),
  })
  .refine(
    (data) => data.groupType !== 'regional_facilitator' || Boolean(data.campusId),
    {
      message: 'Fasilitator Daerah wajib memilih kampus mitra',
      path: ['campusId'],
    },
  );
