export interface AlumniTestimonial {
  readonly id: string;
  readonly name: string;
  readonly campus: string;
  readonly batch: string;
  readonly photoSrc: string;
  readonly testimonial: string;
  readonly impact: string;
}

/**
 * Data testimoni Alumni dummy sementara — ganti `photoSrc`, nama, dan cerita
 * dengan dokumentasi resmi alumni ETOS ID kapan saja.
 */
export const ALUMNI_TESTIMONIALS: readonly AlumniTestimonial[] = [
  {
    id: 'alumni-01',
    name: 'Nadia Rahmawati',
    campus: 'UNAND',
    batch: 'Angkatan 2020',
    photoSrc: '/media/YIC_ETOS_ID_2026_001.webp',
    testimonial:
      'Selama 4 tahun pembinaan di ETOS ID, saya tidak hanya terbantu secara finansial, tetapi juga ditempa lewat mentoring dan proyek sosial hingga berani pulang membangun ruang literasi di daerah asal.',
    impact: 'Inisiator Rumah Baca Pemuda Sumatra Barat',
  },
  {
    id: 'alumni-02',
    name: 'Fajar Pratama',
    campus: 'UNHAS',
    batch: 'Angkatan 2019',
    photoSrc: '/media/YIC_ETOS_ID_2026_007.webp',
    testimonial:
      'Pembinaan di ETOS ID membuat saya paham bahwa kepemimpinan selalu dimulai dari kebermanfaatan terdekat. Jejaring alumni lintas kampus pun terus menjadi ruang kolaborasi hingga hari ini.',
    impact: 'Penggerak Pendidikan Pesisir Sulawesi Selatan',
  },
  {
    id: 'alumni-03',
    name: 'Aulia Azzahra',
    campus: 'UGM',
    batch: 'Angkatan 2021',
    photoSrc: '/media/YIC_ETOS_ID_2026_008.webp',
    testimonial:
      'Career Project benar-benar menjembatani saya dari bangku kuliah menuju dunia profesional. Sesi career coaching membantu memetakan kekuatan diri dan menyiapkan portofolio sejak dini.',
    impact: 'Analis Riset Pembangunan Daerah',
  },
  {
    id: 'alumni-04',
    name: 'Rizky Ramadhan',
    campus: 'USU',
    batch: 'Angkatan 2018',
    photoSrc: '/media/YIC_ETOS_ID_2026_011.webp',
    testimonial:
      'Community of Interest menjadi ruang aman untuk bereksperimen, belajar dari kegagalan, hingga akhirnya mampu berkarya dan membawa inovasi sosial bersama rekan-rekan daerah.',
    impact: 'Co-Founder Inisiatif Inovasi Sosial Medan',
  },
  {
    id: 'alumni-05',
    name: 'Siti Maulida',
    campus: 'UNMUL',
    batch: 'Angkatan 2019',
    photoSrc: '/media/YIC_ETOS_ID_2026_014.webp',
    testimonial:
      'Lingkungan yang saling menguatkan membuat saya tumbuh tangguh meski jauh dari keluarga. Nilai integritas dan kerelawanan selama pembinaan masih terus saya pegang dalam karier saat ini.',
    impact: 'Pendamping Pemberdayaan UMKM Kalimantan Timur',
  },
  {
    id: 'alumni-06',
    name: 'Hendra Saputra',
    campus: 'UNPATTI',
    batch: 'Angkatan 2020',
    photoSrc: '/media/YIC_ETOS_ID_2026_028.webp',
    testimonial:
      'Bertemu dan bertumbuh bersama pemuda dari berbagai PTN mitra membuka cakrawala bahwa mahasiswa dari timur Indonesia punya ruang kontribusi yang sama besar bagi kemajuan bangsa.',
    impact: 'Penggerak Kelas Inspirasi Pelajar Maluku',
  },
];
