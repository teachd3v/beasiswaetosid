export type FaqCategory = 'Semua' | 'Pendaftaran' | 'Administrasi' | 'Pembinaan';

export interface FaqItem {
  readonly id: string;
  readonly category: Exclude<FaqCategory, 'Semua'>;
  readonly question: string;
  readonly answer: string;
}

export const FAQ_CATEGORIES: readonly FaqCategory[] = [
  'Semua',
  'Pendaftaran',
  'Administrasi',
  'Pembinaan',
];

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'faq-syarat-pendaftar',
    category: 'Pendaftaran',
    question: 'Siapa saja yang dapat mendaftar Beasiswa ETOS ID?',
    answer:
      'Calon mahasiswa baru yang telah diterima di salah satu Perguruan Tinggi Negeri (PTN) mitra ETOS ID pada tahun seleksi berjalan, beragama Islam, memiliki prestasi akademik maupun organisasi, mendapat izin orang tua/wali, serta berkomitmen mengikuti pembinaan selama 8 semester.',
  },
  {
    id: 'faq-kip-kuliah',
    category: 'Pendaftaran',
    question: 'Apakah penerima KIP Kuliah dapat mendaftar ETOS ID?',
    answer:
      'Tidak. Pendaftar yang sudah atau sedang menjadi penerima beasiswa KIP Kuliah tidak dapat mendaftar Beasiswa ETOS ID agar manfaat beasiswa dapat menjangkau lebih banyak mahasiswa yang membutuhkan.',
  },
  {
    id: 'faq-slip-gaji',
    category: 'Administrasi',
    question: 'Bagaimana jika orang tua tidak memiliki slip gaji resmi?',
    answer:
      'Jika orang tua bekerja di sektor non-formal atau tidak memiliki slip gaji resmi, berkas tersebut dapat diganti dengan Surat Keterangan Penghasilan dari RT/RW atau kelurahan/desa setempat yang mencantumkan perkiraan nominal penghasilan.',
  },
  {
    id: 'faq-wali',
    category: 'Administrasi',
    question: 'Bagaimana jika biaya pendidikan ditanggung oleh wali?',
    answer:
      'Apabila biaya hidup dan pendidikan ditanggung oleh wali (bukan orang tua kandung), maka dokumen penghasilan yang dilampirkan disesuaikan dengan pihak wali yang menjadi penanggung jawab finansial.',
  },
  {
    id: 'faq-dokumen',
    category: 'Administrasi',
    question: 'Dokumen administrasi apa saja yang umumnya perlu disiapkan?',
    answer:
      'Secara umum pendaftar menyiapkan identitas diri (KTP/Kartu Pelajar), Kartu Keluarga, bukti diterima di PTN mitra, ijazah atau SKL, slip gaji/surat keterangan penghasilan, foto rumah, serta sertifikat prestasi atau keaktifan organisasi jika ada.',
  },
  {
    id: 'faq-fasilitas',
    category: 'Pembinaan',
    question: 'Apa saja fasilitas yang didapatkan penerima manfaat ETOS ID?',
    answer:
      'Penerima manfaat (Etoser) mendapatkan dukungan biaya pendidikan (UKT) selama 8 semester, tunjangan aktivitas, program pengembangan kapasitas (capacity building), pendampingan mentor, persiapan karier, dan jejaring nasional lintas kampus mitra.',
  },
  {
    id: 'faq-komitmen',
    category: 'Pembinaan',
    question: 'Apakah Etoser wajib mengikuti seluruh rangkaian program pembinaan?',
    answer:
      'Ya. Setiap mahasiswa yang dinyatakan lolos sebagai Etoser wajib berkomitmen mengikuti seluruh aktivitas dan kurikulum pembinaan ETOS ID selama 8 semester dari awal hingga prosesi kelulusan.',
  },
];
