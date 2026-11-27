export interface TeamMember {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly photoSrc: string;
}

export interface RegionalFacilitator {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly photoSrc: string;
}

export interface CampusFacilitatorGroup {
  readonly campusShort: string;
  readonly campusFull: string;
  readonly campusLogoSrc: string;
  readonly facilitators: readonly RegionalFacilitator[];
}

export const DEPARTMENT_HEAD: TeamMember = {
  id: 'tim-ketua-departemen',
  name: 'Bayu Candra Winata',
  role: 'Ketua Departemen Beastudi Indonesia',
  photoSrc: '/media/YIC_ETOS_ID_2026_001.webp',
};

export const CORE_PROGRAM_TEAM: readonly TeamMember[] = [
  {
    id: 'tim-ketua-program',
    name: 'Dwi Nurfitriani',
    role: 'Ketua Program Etos ID',
    photoSrc: '/media/YIC_ETOS_ID_2026_007.webp',
  },
  {
    id: 'tim-korbin-1',
    name: 'Muhammad Akbar Alghifary',
    role: 'Koordinator Pembinaan 1',
    photoSrc: '/media/YIC_ETOS_ID_2026_008.webp',
  },
  {
    id: 'tim-korbin-2',
    name: 'Rista Damayanti Anggraini',
    role: 'Koordinator Pembinaan 2',
    photoSrc: '/media/YIC_ETOS_ID_2026_011.webp',
  },
];

/**
 * Data dummy Tim Fasilitator Daerah (maksimal 2 PIC per kampus mitra).
 * Ganti foto dan nama dengan data resmi Fasilitator Daerah kapan saja.
 */
export const REGIONAL_FACILITATORS: readonly CampusFacilitatorGroup[] = [
  {
    campusShort: 'USK',
    campusFull: 'Universitas Syiah Kuala',
    campusLogoSrc: encodeURI('/kampus/USK (UNIVERSITAS SYIAH KUALA).png'),
    facilitators: [
      {
        id: 'fasil-usk-1',
        name: 'Teuku Arif Munandar',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_002.webp',
      },
      {
        id: 'fasil-usk-2',
        name: 'Cut Meutia Rahma',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_003.webp',
      },
    ],
  },
  {
    campusShort: 'USU',
    campusFull: 'Universitas Sumatera Utara',
    campusLogoSrc: encodeURI('/kampus/USU (UNIVERSITAS SUMATERA UTARA).png'),
    facilitators: [
      {
        id: 'fasil-usu-1',
        name: 'Ilham Nasution',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_004.webp',
      },
      {
        id: 'fasil-usu-2',
        name: 'Dina Syahputri',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_005.webp',
      },
    ],
  },
  {
    campusShort: 'UNAND',
    campusFull: 'Universitas Andalas',
    campusLogoSrc: encodeURI('/kampus/UNAND (UNIVERSITAS ANDALAS).png'),
    facilitators: [
      {
        id: 'fasil-unand-1',
        name: 'Fikri Hidayatullah',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_006.webp',
      },
      {
        id: 'fasil-unand-2',
        name: 'Annisa Fitriani',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_009.webp',
      },
    ],
  },
  {
    campusShort: 'UNJA',
    campusFull: 'Universitas Jambi',
    campusLogoSrc: encodeURI('/kampus/UNJA (UNIVERSITAS JAMBI).png'),
    facilitators: [
      {
        id: 'fasil-unja-1',
        name: 'Randi Kurniawan',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_010.webp',
      },
      {
        id: 'fasil-unja-2',
        name: 'Siti Rahayu',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_012.webp',
      },
    ],
  },
  {
    campusShort: 'UNILA',
    campusFull: 'Universitas Lampung',
    campusLogoSrc: encodeURI('/kampus/UNILA (UNIVERSITAS LAMPUNG).png'),
    facilitators: [
      {
        id: 'fasil-unila-1',
        name: 'Dimas Saputra',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_013.webp',
      },
      {
        id: 'fasil-unila-2',
        name: 'Laila Nurhaliza',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_014.webp',
      },
    ],
  },
  {
    campusShort: 'UIN Jakarta',
    campusFull: 'UIN Syarif Hidayatullah Jakarta',
    campusLogoSrc: encodeURI('/kampus/UIN JAKARTA (UIN SYARIF HIDAYATULLAH).png'),
    facilitators: [
      {
        id: 'fasil-uin-1',
        name: 'Fauzan Hakim',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_015.webp',
      },
      {
        id: 'fasil-uin-2',
        name: 'Nadia Safitri',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_016.webp',
      },
    ],
  },
  {
    campusShort: 'IPB',
    campusFull: 'Institut Pertanian Bogor',
    campusLogoSrc: encodeURI('/kampus/IPB (INSTITUT PERTANIAN BOGOR).png'),
    facilitators: [
      {
        id: 'fasil-ipb-1',
        name: 'Hendra Wijaya',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_036.webp',
      },
      {
        id: 'fasil-ipb-2',
        name: 'Aulia Rahmawati',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_037.webp',
      },
    ],
  },
  {
    campusShort: 'UGM',
    campusFull: 'Universitas Gadjah Mada',
    campusLogoSrc: encodeURI('/kampus/UGM (UNIVERSITAS GADJAH MADA).png'),
    facilitators: [
      {
        id: 'fasil-ugm-1',
        name: 'Bagas Prakoso',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_017.webp',
      },
      {
        id: 'fasil-ugm-2',
        name: 'Sekar Ayuningtyas',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_018.webp',
      },
    ],
  },
  {
    campusShort: 'UNRAM',
    campusFull: 'Universitas Mataram',
    campusLogoSrc: encodeURI('/kampus/UNRAM (UNIVERSITAS MATARAM).png'),
    facilitators: [
      {
        id: 'fasil-unram-1',
        name: 'Lalu Rizki Pratama',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_019.webp',
      },
      {
        id: 'fasil-unram-2',
        name: 'Baiq Kartika Sari',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_020.webp',
      },
    ],
  },
  {
    campusShort: 'UPR',
    campusFull: 'Universitas Palangka Raya',
    campusLogoSrc: encodeURI('/kampus/UPR (UNIVERSITAS PALANGKARAYA).png'),
    facilitators: [
      {
        id: 'fasil-upr-1',
        name: 'Aditya Nugroho',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_021.webp',
      },
      {
        id: 'fasil-upr-2',
        name: 'Fitria Wulandari',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_022.webp',
      },
    ],
  },
  {
    campusShort: 'UNLAM',
    campusFull: 'Universitas Lambung Mangkurat',
    campusLogoSrc: encodeURI('/kampus/UNLAM (UNIVERSITAS LAMBUNG MANGKURAT).png'),
    facilitators: [
      {
        id: 'fasil-unlam-1',
        name: 'Muhammad Noor',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_023.webp',
      },
      {
        id: 'fasil-unlam-2',
        name: 'Hidayatul Husna',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_024.webp',
      },
    ],
  },
  {
    campusShort: 'UNMUL',
    campusFull: 'Universitas Mulawarman',
    campusLogoSrc: encodeURI('/kampus/UNMUL (UNIVERSITAS MULAWARMAN).png'),
    facilitators: [
      {
        id: 'fasil-unmul-1',
        name: 'Rizal Effendi',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_025.webp',
      },
      {
        id: 'fasil-unmul-2',
        name: 'Aisyah Permata',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_026.webp',
      },
    ],
  },
  {
    campusShort: 'UNTAD',
    campusFull: 'Universitas Tadulako',
    campusLogoSrc: encodeURI('/kampus/UNTAD (UNIVERSITAS TADULAKO).png'),
    facilitators: [
      {
        id: 'fasil-untad-1',
        name: 'Zulfikar Rahman',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_027.webp',
      },
      {
        id: 'fasil-untad-2',
        name: 'Nurul Fajriani',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_028.webp',
      },
    ],
  },
  {
    campusShort: 'UNHAS',
    campusFull: 'Universitas Hasanuddin',
    campusLogoSrc: encodeURI('/kampus/UNHAS (UNIVERSITAS HASANUDDIN).png'),
    facilitators: [
      {
        id: 'fasil-unhas-1',
        name: 'Andi Muh. Irfan',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_029.webp',
      },
      {
        id: 'fasil-unhas-2',
        name: 'St. Rahmawati',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_030.webp',
      },
    ],
  },
  {
    campusShort: 'UHO',
    campusFull: 'Universitas Halu Oleo',
    campusLogoSrc: encodeURI('/kampus/UHO (UNIVERSITAS HALU ULEO).png'),
    facilitators: [
      {
        id: 'fasil-uho-1',
        name: 'La Ode Syahrul',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_031.webp',
      },
      {
        id: 'fasil-uho-2',
        name: 'Wa Ode Amelia',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_032.webp',
      },
    ],
  },
  {
    campusShort: 'UNPATTI',
    campusFull: 'Universitas Pattimura',
    campusLogoSrc: encodeURI('/kampus/UNPATTI (UNIVERSITAS PATTIMURA).png'),
    facilitators: [
      {
        id: 'fasil-unpatti-1',
        name: 'Salman Latuconsina',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_033.webp',
      },
      {
        id: 'fasil-unpatti-2',
        name: 'Siti Amina Ohorella',
        role: 'PIC Fasilitator Daerah',
        photoSrc: '/media/YIC_ETOS_ID_2026_034.webp',
      },
    ],
  },
];
