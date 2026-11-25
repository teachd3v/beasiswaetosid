export interface AboutMetric {
  readonly value: string;
  readonly label: string;
}

export interface CoreValueItem {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
}

export interface PartnerCampus {
  readonly shortName: string;
  readonly fullName: string;
  readonly logoSrc: string;
}

export const ABOUT_METRICS: readonly AboutMetric[] = [
  {
    value: '4 Tahun',
    label: 'Pembinaan 8 Semester',
  },
  {
    value: 'Sejak 2003',
    label: 'Beastudi Etos → ETOS ID',
  },
  {
    value: '15 PTN',
    label: 'Kampus Mitra se-Indonesia',
  },
  {
    value: '4 Dukungan',
    label: 'UKT, Uang Saku, Pembinaan & Karier',
  },
];

export const VISION_TEXT =
  'Mewujudkan Sumber Daya Manusia (SDM) strategis daerah yang berintegritas, profesional, dan transformatif dalam rangka mendukung percepatan pembangunan daerah.';

export const MISSION_LIST: readonly string[] = [
  'Mewujudkan SDM daerah yang memiliki integritas dan karakter berlandaskan nilai-nilai keislaman dan kebangsaan.',
  'Mewujudkan SDM daerah yang mampu berkarya dan berkontribusi langsung untuk kemajuan daerah sesuai bidang keahlian dan profesi.',
  'Melahirkan Social Leader (Local Hero) yang menjadi penggerak perubahan nyata di tengah masyarakat.',
];

export const CORE_VALUES: readonly CoreValueItem[] = [
  {
    id: 'integritas',
    title: 'Integritas',
    summary: 'Jujur, amanah, dan teguh memegang nilai dalam setiap peran kepemimpinan.',
  },
  {
    id: 'profesional',
    title: 'Profesional',
    summary: 'Unggul dalam kompetensi akademik, keahlian profesi, dan kesiapan karier.',
  },
  {
    id: 'transformatif',
    title: 'Transformatif',
    summary: 'Mendorong perubahan positif dan menumbuhkan semangat mustahik menjadi muzaki.',
  },
  {
    id: 'kontributif',
    title: 'Kontributif',
    summary: 'Hadir memberi manfaat nyata lewat karya, pengabdian, dan kolaborasi sosial.',
  },
];

export const PARTNER_CAMPUSES: readonly PartnerCampus[] = [
  {
    shortName: 'USK',
    fullName: 'Universitas Syiah Kuala',
    logoSrc: encodeURI('/kampus/USK (UNIVERSITAS SYIAH KUALA).png'),
  },
  {
    shortName: 'USU',
    fullName: 'Universitas Sumatera Utara',
    logoSrc: encodeURI('/kampus/USU (UNIVERSITAS SUMATERA UTARA).png'),
  },
  {
    shortName: 'UNAND',
    fullName: 'Universitas Andalas',
    logoSrc: encodeURI('/kampus/UNAND (UNIVERSITAS ANDALAS).png'),
  },
  {
    shortName: 'UNJA',
    fullName: 'Universitas Jambi',
    logoSrc: encodeURI('/kampus/UNJA (UNIVERSITAS JAMBI).png'),
  },
  {
    shortName: 'UNILA',
    fullName: 'Universitas Lampung',
    logoSrc: encodeURI('/kampus/UNILA (UNIVERSITAS LAMPUNG).png'),
  },
  {
    shortName: 'UIN Jakarta',
    fullName: 'UIN Syarif Hidayatullah Jakarta',
    logoSrc: encodeURI('/kampus/UIN JAKARTA (UIN SYARIF HIDAYATULLAH).png'),
  },
  {
    shortName: 'UGM',
    fullName: 'Universitas Gadjah Mada',
    logoSrc: encodeURI('/kampus/UGM (UNIVERSITAS GADJAH MADA).png'),
  },
  {
    shortName: 'UNRAM',
    fullName: 'Universitas Mataram',
    logoSrc: encodeURI('/kampus/UNRAM (UNIVERSITAS MATARAM).png'),
  },
  {
    shortName: 'UPR',
    fullName: 'Universitas Palangka Raya',
    logoSrc: encodeURI('/kampus/UPR (UNIVERSITAS PALANGKARAYA).png'),
  },
  {
    shortName: 'UNLAM',
    fullName: 'Universitas Lambung Mangkurat',
    logoSrc: encodeURI('/kampus/UNLAM (UNIVERSITAS LAMBUNG MANGKURAT).png'),
  },
  {
    shortName: 'UNMUL',
    fullName: 'Universitas Mulawarman',
    logoSrc: encodeURI('/kampus/UNMUL (UNIVERSITAS MULAWARMAN).png'),
  },
  {
    shortName: 'UNTAD',
    fullName: 'Universitas Tadulako',
    logoSrc: encodeURI('/kampus/UNTAD (UNIVERSITAS TADULAKO).png'),
  },
  {
    shortName: 'UNHAS',
    fullName: 'Universitas Hasanuddin',
    logoSrc: encodeURI('/kampus/UNHAS (UNIVERSITAS HASANUDDIN).png'),
  },
  {
    shortName: 'UHO',
    fullName: 'Universitas Halu Oleo',
    logoSrc: encodeURI('/kampus/UHO (UNIVERSITAS HALU ULEO).png'),
  },
  {
    shortName: 'UNPATTI',
    fullName: 'Universitas Pattimura',
    logoSrc: encodeURI('/kampus/UNPATTI (UNIVERSITAS PATTIMURA).png'),
  },
];
