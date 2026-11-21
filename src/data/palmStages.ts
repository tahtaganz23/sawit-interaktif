export type UIReferenceId = 'editorial' | 'agritech' | 'bento' | 'exhibition';

export type PalmRenderStyle = 'voxel' | 'realistic';

export type PalmPartId = 'akar' | 'batang' | 'pelepah' | 'tandan_buah' | 'pucuk';

export type CameraPresetId = 'full' | 'fruit' | 'trunk' | 'crown';

export type LightingPresetId = 'pagi' | 'siang' | 'senja';

export interface PalmStage {
  id: string;
  index: number;
  name: string;
  shortLabel: string;
  ageRange: string;
  growthValue: number; // 0..1 target position on timeline
  rangeMin: number;
  rangeMax: number;
  heightMeters: string;
  frondCount: string;
  fruitStatus: string;
  summary: string;
  agronomyNote: string;
}

export interface PalmPartInfo {
  id: PalmPartId;
  name: string;
  latinTerm: string;
  role: string;
  detail: string;
  minGrowthToVisible: number;
}

export interface UIReferenceSpec {
  id: UIReferenceId;
  code: string;
  name: string;
  shortName: string;
  tagline: string;
  aesthetic: string;
  bestFor: string;
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  isDark: boolean;
  palette: {
    label: string;
    hex: string;
  }[];
  layoutNotes: string[];
  interactionPattern: string;
}

export const PALM_STAGES: PalmStage[] = [
  {
    id: 'pre-nursery',
    index: 1,
    name: 'Kecambah & Bibit Awal',
    shortLabel: 'Bibit Awal',
    ageRange: '0 – 3 Bulan',
    growthValue: 0.08,
    rangeMin: 0.0,
    rangeMax: 0.18,
    heightMeters: '0.15 – 0.35 m',
    frondCount: '3 – 5 daun lanset',
    fruitStatus: 'Belum berbuah',
    summary:
      'Fase Pre-Nursery di polybag kecil. Plumula tumbuh ke atas membentuk helai daun tunggal berbentuk lanset (bifid) sementara radikula membentuk perakaran awal.',
    agronomyNote:
      'Memerlukan naungan 50% dan penyiraman rutin dua kali sehari agar kelembapan media tanah tetap stabil.',
  },
  {
    id: 'main-nursery',
    index: 2,
    name: 'Pembibitan Utama',
    shortLabel: 'Pembibitan',
    ageRange: '4 – 12 Bulan',
    growthValue: 0.27,
    rangeMin: 0.18,
    rangeMax: 0.37,
    heightMeters: '0.6 – 1.2 m',
    frondCount: '10 – 14 pelepah muda',
    fruitStatus: 'Belum berbuah',
    summary:
      'Dipindahkan ke polybag besar. Daun mulai membelah menjadi anak daun menyirip (pinnate) dan bonggol batang mulai menebal di pangkal.',
    agronomyNote:
      'Seleksi bibit abnormal dilakukan ketat pada umur 6 dan 9 bulan sebelum siap tanam ke lahan terbuka.',
  },
  {
    id: 'tbm',
    index: 3,
    name: 'Tanaman Belum Menghasilkan',
    shortLabel: 'TBM Muda',
    ageRange: '1 – 3 Tahun',
    growthValue: 0.47,
    rangeMin: 0.37,
    rangeMax: 0.57,
    heightMeters: '1.5 – 2.8 m',
    frondCount: '20 – 26 pelepah',
    fruitStatus: 'Inisiasi bunga awal',
    summary:
      'Fase vegetatif di lapangan terbuka. Kanopi melebar membentuk roset pelepah spiral untuk memaksimalkan fotosintesis dan memperkokoh sistem akar serabut.',
    agronomyNote:
      'Pemupukan N-P-K-Mg difokuskan untuk ekspansi luas daun serta pembentukan diameter batang yang kuat.',
  },
  {
    id: 'tm-awal',
    index: 4,
    name: 'Berbuah Muda (TM Awal)',
    shortLabel: 'TM Awal',
    ageRange: '3.5 – 7 Tahun',
    growthValue: 0.67,
    rangeMin: 0.57,
    rangeMax: 0.78,
    heightMeters: '3.2 – 5.5 m',
    frondCount: '32 – 38 pelepah',
    fruitStatus: 'Tandan muda (5–12 kg/TBS)',
    summary:
      'Mulai memasuki fase generatif produktif. Bunga betina terserbuki oleh kumbang Elaeidobius kamerunicus dan membentuk tandan buah di ketiak pelepah.',
    agronomyNote:
      'Kastrasi bunga awal dilakukan hingga umur 24 bulan agar energi terfokus ke pertumbuhan batang sebelum panen perdana.',
  },
  {
    id: 'dewasa',
    index: 5,
    name: 'Sawit Dewasa & Panen Optimal',
    shortLabel: 'Dewasa Panen',
    ageRange: '8 – 25 Tahun',
    growthValue: 0.94,
    rangeMin: 0.78,
    rangeMax: 1.0,
    heightMeters: '7.5 – 14.0 m',
    frondCount: '40 – 48 pelepah aktif',
    fruitStatus: 'TBS Matang (18–28 kg/TBS)',
    summary:
      'Batang kokoh berpola spiral bekas pangkasan pelepah. Tandan Buah Segar (TBS) matang berwarna jingga-merah menyala kaya minyak sawit (CPO) pada mesokarp.',
    agronomyNote:
      'Siklus panen dilakukan setiap 7–10 hari saat fraksi matang menunjukkan minimal 1–2 brondolan jatuh alami di piringan.',
  },
];

export const PALM_PARTS: Record<PalmPartId, PalmPartInfo> = {
  akar: {
    id: 'akar',
    name: 'Sistem Akar & Piringan',
    latinTerm: 'Radix Adventitia',
    role: 'Penyerapan Hara & Penopang',
    detail:
      'Kelapa sawit memiliki sistem akar serabut masif (primer, sekunder, tersier, dan kuarter) yang menyebar radial hingga radius 4–6 meter di lapisan tanah atas.',
    minGrowthToVisible: 0,
  },
  batang: {
    id: 'batang',
    name: 'Batang & Susunan Spiral',
    latinTerm: 'Stipes (Phyllotaxis 137.5°)',
    role: 'Struktur Tegak & Transportasi',
    detail:
      'Batang tunggal tanpa cabang yang tersusun atas jaringan pembuluh dan dilindungi pangkal pelepah berbentuk belah ketupat mengikuti sudut emas Fibonacci.',
    minGrowthToVisible: 0.25,
  },
  pelepah: {
    id: 'pelepah',
    name: 'Pelepah & Anak Daun',
    latinTerm: 'Frons Pinnata',
    role: 'Pabrik Fotosintesis Utama',
    detail:
      'Setiap pelepah dewasa memiliki panjang 5–7 meter dengan 250–350 helai anak daun berujung runcing dan duri pelindung di bagian pangkal rakis.',
    minGrowthToVisible: 0,
  },
  tandan_buah: {
    id: 'tandan_buah',
    name: 'Tandan Buah Segar (TBS)',
    latinTerm: 'Fructus Drupa',
    role: 'Hasil Panen Utama (CPO & PKO)',
    detail:
      'Satu tandan matang memuat 1.000–2.500 buah. Warna kulit berubah dari ungu kehitaman menjadi jingga-merah saat kandungan karotenoid & minyak mencapai puncak.',
    minGrowthToVisible: 0.54,
  },
  pucuk: {
    id: 'pucuk',
    name: 'Titik Tumbuh & Daun Tombak',
    latinTerm: 'Meristem Apikal (Janur)',
    role: 'Pusat Pertumbuhan Tunggal',
    detail:
      'Kelapa sawit hanya memiliki satu titik tumbuh di puncak mahkota. Daun muda muncul tegak vertikal sebagai daun tombak sebelum membuka perlahan.',
    minGrowthToVisible: 0,
  },
};

export const UI_REFERENCES: UIReferenceSpec[] = [
  {
    id: 'editorial',
    code: '01',
    name: 'Editorial Botanical',
    shortName: '01 Editorial',
    tagline: 'Museum herbarium modern dengan tipografi serif hangat dan bidang kanvas bersih.',
    aesthetic: 'Light Studio · Alabaster & Forest Ink',
    bestFor: 'Website edukasi publik, laporan keberlanjutan, dan profil perkebunan modern.',
    displayFont: '"Fraunces", Georgia, serif',
    bodyFont: '"Plus Jakarta Sans", sans-serif',
    monoFont: '"IBM Plex Mono", monospace',
    isDark: false,
    palette: [
      { label: 'Canvas Light', hex: '#F6F5F0' },
      { label: 'Surface Card', hex: '#FAFAF7' },
      { label: 'Botanical Ink', hex: '#18241C' },
      { label: 'Palm Olive', hex: '#2D6A4F' },
    ],
    layoutNotes: [
      'Kanvas 3D penuh 100vw x 100vh tanpa kartu samping yang menutupi tajuk sawit.',
      'Tipografi Fraunces memberi kesan kuratorial botani yang elegan dan tidak kaku.',
      'Metadata fase pertumbuhan ditampilkan sebagai teks rapi tanpa kapsul pill.',
    ],
    interactionPattern: 'Timeline scrubber di dock bawah yang dapat dilipat (Zen Mode).',
  },
  {
    id: 'agritech',
    code: '02',
    name: 'Spatial Agri-Tech',
    shortName: '02 Agri-Tech',
    tagline: 'Antarmuka gelap presisi tinggi berfokus pada metrik agronomi dan angka tabular.',
    aesthetic: 'Obsidian Dark · Emerald & Amber Signal',
    bestFor: 'Dashboard agronomi, simulasi riset sawit, dan platform smart plantation.',
    displayFont: '"Outfit", sans-serif',
    bodyFont: '"DM Sans", sans-serif',
    monoFont: '"JetBrains Mono", monospace',
    isDark: true,
    palette: [
      { label: 'Deep Canopy', hex: '#0D1310' },
      { label: 'HUD Surface', hex: '#141D18' },
      { label: 'Chlorophyll', hex: '#34D399' },
      { label: 'Ripe TBS', hex: '#F59E0B' },
    ],
    layoutNotes: [
      'Latar HUD obsidian solid-transparan kontras tinggi agar buah sawit dan pelepah menonjol.',
      'Angka umur, tinggi, dan bobot TBS memakai tabular-nums agar tidak bergeser saat animasi berjalan.',
      'Pemisahan status vegetatif (emerald) dan fase panen matang (amber) disertai label teks eksplisit.',
    ],
    interactionPattern: 'Kontrol play/pause simulasi siklus dengan preset kamera fokus organ.',
  },
  {
    id: 'bento',
    code: '03',
    name: 'Tactile Clean Studio',
    shortName: '03 Tactile Studio',
    tagline: 'Gaya produk digital kontemporer ala Apple/Linear dengan kontrol tersegmen yang tajam.',
    aesthetic: 'Crisp Neutral · Slate & Terracotta Palm',
    bestFor: 'Aplikasi interaktif web, katalog varietas bibit, dan modul e-learning modern.',
    displayFont: '"Bricolage Grotesque", sans-serif',
    bodyFont: '"Plus Jakarta Sans", sans-serif',
    monoFont: '"IBM Plex Mono", monospace',
    isDark: false,
    palette: [
      { label: 'Studio Mist', hex: '#EEF1F4' },
      { label: 'Pure Surface', hex: '#FFFFFF' },
      { label: 'Deep Slate', hex: '#0F172A' },
      { label: 'Carotenoid', hex: '#D95D24' },
    ],
    layoutNotes: [
      'Menggunakan permukaan putih bersih berbatas 1px hairline (tanpa backdrop-blur yang memberatkan WebGL).',
      'Kontrol tahap pertumbuhan berupa segmented control taktil satu baris yang responsif.',
      'Aksen oranye karotenoid terinspirasi langsung dari warna minyak sawit segar.',
    ],
    interactionPattern: 'Inspeksi klik langsung di objek 3D (raycasting) + segmented stage jump.',
  },
  {
    id: 'exhibition',
    code: '04',
    name: 'Museum Exhibition',
    shortName: '04 Story Mode',
    tagline: 'Pengalaman bertutur per bab (chapter-driven) ala pameran interaktif dan scrollytelling.',
    aesthetic: 'Gallery Charcoal · Warm Ivory & Gold',
    bestFor: 'Microsite kampanye visual, pameran virtual, dan dokumenter interaktif.',
    displayFont: '"Cormorant Garamond", Georgia, serif',
    bodyFont: '"Manrope", sans-serif',
    monoFont: '"IBM Plex Mono", monospace',
    isDark: true,
    palette: [
      { label: 'Gallery Slate', hex: '#141413' },
      { label: 'Warm Charcoal', hex: '#1E1D1B' },
      { label: 'Ivory Text', hex: '#F4EFE6' },
      { label: 'Harvest Gold', hex: '#E09F3E' },
    ],
    layoutNotes: [
      'Navigasi berbasis bab (Sebelumnya / Berikutnya) membimbing pengguna menelusuri umur sawit.',
      'Judul pameran menggunakan serif klasik berkarakter dengan kompensasi kontras tinggi.',
      'Ruang tengah layar dibiarkan lapang seperti instalasi galeri.',
    ],
    interactionPattern: 'Langkah naratif bertahap (Chapter Prev/Next) yang menggerakkan kamera & pertumbuhan.',
  },
];

export function getStageForGrowth(growth: number): PalmStage {
  const clamped = Math.max(0, Math.min(1, growth));
  for (let i = PALM_STAGES.length - 1; i >= 0; i--) {
    if (clamped >= PALM_STAGES[i].rangeMin - 0.0001) {
      return PALM_STAGES[i];
    }
  }
  return PALM_STAGES[0];
}

export function computeLiveMetrics(growth: number) {
  const g = Math.max(0, Math.min(1, growth));

  // Map 0..1 to age in months/years realistically
  let ageLabel = '';
  if (g < 0.18) {
    const months = Math.max(0.5, (g / 0.18) * 3);
    ageLabel = `${months.toFixed(1)} Bulan`;
  } else if (g < 0.37) {
    const months = 3 + ((g - 0.18) / 0.19) * 9;
    ageLabel = `${Math.round(months)} Bulan`;
  } else if (g < 0.57) {
    const years = 1 + ((g - 0.37) / 0.2) * 2.2;
    ageLabel = `${years.toFixed(1)} Tahun`;
  } else {
    const years = 3.2 + ((g - 0.57) / 0.43) * 21.8;
    ageLabel = `${years.toFixed(1)} Tahun`;
  }

  // Height in meters
  const heightMeters =
    g < 0.37
      ? 0.15 + (g / 0.37) * 1.05
      : 1.2 + Math.pow((g - 0.37) / 0.63, 1.15) * 12.3;

  // Fronds
  const fronds = Math.round(3 + g * 43);

  // TBS weight (0 before 0.52)
  const tbsWeight =
    g < 0.52 ? 0 : Math.round(((g - 0.52) / 0.48) * 26 * 10) / 10;

  return {
    ageLabel,
    heightLabel: `${heightMeters.toFixed(2)} m`,
    frondsLabel: `${fronds} pelepah`,
    tbsLabel: tbsWeight > 0 ? `${tbsWeight.toFixed(1)} kg/tandan` : 'Fase Vegetatif',
    ripenessPct: g < 0.55 ? 0 : Math.min(100, Math.round(((g - 0.55) / 0.4) * 100)),
  };
}
