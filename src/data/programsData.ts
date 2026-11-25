export type ProgramCategory = 'Semua' | 'Pembinaan' | 'Pemberdayaan' | 'Karier & Alumni';

export interface EtosProgram {
  readonly id: string;
  readonly title: string;
  readonly category: Exclude<ProgramCategory, 'Semua'>;
  readonly imageSrc: string;
  readonly imageAlt: string;
  readonly shortDesc: string;
}

export const PROGRAM_CATEGORIES: readonly ProgramCategory[] = [
  'Semua',
  'Pembinaan',
  'Pemberdayaan',
  'Karier & Alumni',
];

export const ETOS_PROGRAMS: readonly EtosProgram[] = [
  {
    id: 'compass-building-camp',
    title: 'Compass Building Camp',
    category: 'Pembinaan',
    imageSrc: encodeURI('/program/CBC/CBC (Compass Building Camp).png'),
    imageAlt: 'Dokumentasi agenda Compass Building Camp ETOS ID',
    shortDesc:
      'Membangun arah dan semangat juang pemuda bersama tokoh strategis serta coach.',
  },
  {
    id: 'youth-inspiration-camp',
    title: 'Youth Inspiration Camp',
    category: 'Pembinaan',
    imageSrc: encodeURI('/program/YIC/YIC (Youth Inspiraction Camp).JPG'),
    imageAlt: 'Dokumentasi agenda Youth Inspiration Camp ETOS ID',
    shortDesc:
      'Penguatan kapasitas spiritual, kepemimpinan, dan tata kelola pemberdayaan sosial.',
  },
  {
    id: 'kuliah-tak-gentar',
    title: 'Kuliah Tak Gentar (KTG)',
    category: 'Pemberdayaan',
    imageSrc: encodeURI('/program/KTG/KTG (Kuliah Tak Gentar).jpg'),
    imageAlt: 'Dokumentasi agenda Kuliah Tak Gentar ETOS ID',
    shortDesc:
      'Pendampingan siswa SMA/sederajat agar siap menembus perguruan tinggi negeri impian.',
  },
  {
    id: 'community-of-interest',
    title: 'Community of Interest',
    category: 'Pemberdayaan',
    imageSrc: encodeURI('/program/COI/COI (Community of Interest).JPG'),
    imageAlt: 'Dokumentasi agenda Community of Interest ETOS ID',
    shortDesc:
      'Kelas minat bakat kolaboratif untuk mengasah potensi spesifik setiap Etoser.',
  },
  {
    id: 'career-project',
    title: 'Career Project',
    category: 'Karier & Alumni',
    imageSrc: encodeURI('/program/CP/CP (Career Project).JPG'),
    imageAlt: 'Dokumentasi agenda Career Project ETOS ID',
    shortDesc:
      'Persiapan karier dan penguatan life skill bagi Etoser tingkat akhir menuju dunia kerja.',
  },
  {
    id: 'lepas-juang',
    title: 'Lepas Juang',
    category: 'Karier & Alumni',
    imageSrc: encodeURI('/program/LJ/LP (Lepas Juang).jpeg'),
    imageAlt: 'Dokumentasi agenda Lepas Juang ETOS ID',
    shortDesc:
      'Prosesi kelulusan dan pelepasan Etoser untuk berkiprah langsung di tengah masyarakat.',
  },
];
