export type NewsCategory = 'Semua' | 'Prestasi' | 'Aktivitas & Monev' | 'Program';

export interface NewsItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly category: Exclude<NewsCategory, 'Semua'>;
  readonly dateLabel: string;
  readonly location?: string;
  readonly coverSrc?: string;
  readonly excerpt: string;
  readonly content: readonly string[];
}

export const NEWS_CATEGORIES: readonly NewsCategory[] = [
  'Semua',
  'Prestasi',
  'Aktivitas & Monev',
  'Program',
];

/**
 * 5 berita dummy ETOS ID — siap diganti dengan artikel resmi kapan saja.
 */
export const NEWS_ITEMS: readonly NewsItem[] = [
  {
    id: 'berita-01',
    slug: 'youth-inspiration-camp-2026-perkuat-kepemimpinan-etoser',
    title: 'Youth Inspiration Camp 2026 Perkuat Karakter Kepemimpinan Etoser',
    category: 'Program',
    dateLabel: '18 Oktober 2026',
    location: 'Bogor',
    coverSrc: '/media/YIC_ETOS_ID_2026_001.webp',
    excerpt:
      'Ratusan Etoser dari 15 PTN mitra berkumpul dalam Youth Inspiration Camp untuk mengasah kepemimpinan kolaboratif dan rancangan proyek sosial daerah.',
    content: [
      'Youth Inspiration Camp (YIC) 2026 resmi digelar sebagai ruang konsolidasi nasional bagi para penerima manfaat Beasiswa ETOS ID dari berbagai Perguruan Tinggi Negeri mitra di Indonesia.',
      'Selama tiga hari pelaksanaan, peserta mengikuti sesi penguatan spiritual, lokakarya kepemimpinan, serta perancangan inisiatif pemberdayaan yang menjawab persoalan nyata di daerah asal masing-masing.',
      'Melalui forum ini, ETOS ID berharap lahir semakin banyak pemimpin muda tangguh yang tidak hanya unggul di ruang akademik, tetapi juga hadir memberi solusi di tengah masyarakat.',
    ],
  },
  {
    id: 'berita-02',
    slug: 'etoser-raih-juara-karya-tulis-ilmiah-nasional',
    title: 'Tim Etoser Raih Juara Karya Tulis Ilmiah Nasional Bidang Inovasi Sosial',
    category: 'Prestasi',
    dateLabel: '5 Oktober 2026',
    location: 'Yogyakarta',
    coverSrc: '/media/YIC_ETOS_ID_2026_014.webp',
    excerpt:
      'Gagasan pemberdayaan ekonomi pesisir berbasis digital mengantarkan delegasi Etoser meraih podium utama di ajang kompetisi ilmiah tingkat nasional.',
    content: [
      'Delegasi mahasiswa penerima manfaat ETOS ID kembali menorehkan prestasi di kancah nasional melalui gagasan pemberdayaan ekonomi masyarakat pesisir yang aplikatif dan berkelanjutan.',
      'Karya ilmiah tersebut lahir dari diskusi intensif di kelas Community of Interest, tempat para Etoser rutin mengasah kemampuan riset dan kepenulisan bersama mentor serta alumni.',
      'Capaian ini menjadi bukti bahwa pendampingan terstruktur mampu mendorong mahasiswa daerah tampil percaya diri dan berdaya saing tinggi.',
    ],
  },
  {
    id: 'berita-03',
    slug: 'monitoring-evaluasi-pembinaan-wilayah-sumatra-sulawesi',
    title: 'Monitoring & Evaluasi Pembinaan Wilayah Perkuat Sinergi Kampus Mitra',
    category: 'Aktivitas & Monev',
    dateLabel: '22 September 2026',
    location: 'Padang & Palu',
    coverSrc: '/media/YIC_ETOS_ID_2026_028.webp',
    excerpt:
      'Tim pengelola ETOS ID melaksanakan kunjungan monitoring dan evaluasi langsung guna memastikan kualitas pendampingan di berbagai wilayah mitra.',
    content: [
      'Sebagai bagian dari penjagaan mutu pembinaan 8 semester, tim ETOS ID menyelenggarakan rangkaian Monitoring dan Evaluasi (Monev) di sejumlah wilayah mitra kampus.',
      'Agenda ini mencakup dialog perkembangan akademik Etoser, refleksi capaian proyek sosial, serta koordinasi bersama pihak kemahasiswaan kampus mitra setempat.',
      'Hasil evaluasi menjadi pijakan penting untuk menyempurnakan kurikulum pembinaan agar semakin relevan dengan kebutuhan pengembangan SDM daerah.',
    ],
  },
  {
    id: 'berita-04',
    slug: 'kuliah-tak-gentar-dampingi-pelajar-daerah-tembus-ptn',
    title: 'Gerakan Kuliah Tak Gentar Dampingi Ratusan Pelajar Daerah Tembus PTN',
    category: 'Program',
    dateLabel: '9 September 2026',
    location: 'Makassar',
    coverSrc: '/media/YIC_ETOS_ID_2026_039.webp',
    excerpt:
      'Etoser turun langsung membimbing siswa kelas 12 dari sekolah daerah lewat kelas motivasi, tryout, dan strategi seleksi masuk perguruan tinggi negeri.',
    content: [
      'Program Kuliah Tak Gentar (KTG) kembali membuka ruang pendampingan intensif bagi pelajar kelas 12 di berbagai wilayah mitra ETOS ID.',
      'Para Etoser berperan langsung sebagai kakak mentor yang membagikan pengalaman kuliah, kiat menghadapi seleksi masuk PTN, serta informasi peluang beasiswa pendidikan tinggi.',
      'Semangat kerelawanan ini diharapkan memutus batas akses informasi sehingga semakin banyak pelajar daerah berani melanjutkan pendidikan ke jenjang sarjana.',
    ],
  },
  {
    id: 'berita-05',
    slug: 'career-project-bekali-etoser-tingkat-akhir-siap-berkarya',
    title: 'Career Project Bekali Etoser Tingkat Akhir Masuk Dunia Profesional',
    category: 'Aktivitas & Monev',
    dateLabel: '27 Agustus 2026',
    location: 'Medan',
    coverSrc: '/media/YIC_ETOS_ID_2026_043.webp',
    excerpt:
      'Melalui sesi career coaching dan Meet the Expert, Etoser tahun keempat menyiapkan langkah pascakampus bersama praktisi lintas industri.',
    content: [
      'Memasuki fase akhir masa studi, Etoser tingkat keempat mengikuti rangkaian Career Project yang berfokus pada kesiapan karier, penyusunan portofolio, dan simulasi wawancara profesional.',
      'Hadir pula sejumlah alumni ETOS ID dari berbagai sektor yang berbagi pengalaman meniti karier sekaligus menjaga komitmen kontribusi sosial selepas lulus.',
      'Pembekalan ini menjadi jembatan strategis menuju prosesi Lepas Juang dan kiprah nyata para alumni di tengah masyarakat.',
    ],
  },
];
