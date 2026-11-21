# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Praktisi perkebunan:** Estate managers, kepala kebun, asisten agronom, dan mandor yang perlu memantau fase vegetatif/generatif kelapa sawit, mengevaluasi kesehatan blok tanaman, dan menentukan tindakan teknis (pemupukan, kastrasi, sanitasi, panen).
- **Manajer agritech & analis data:** Profesional teknologi pertanian yang menganalisis korelasi data telemetri lapangan (sensor tanah, kelembapan, cuaca) dengan model pertumbuhan tanaman.
- **Investor & stakeholder perkebunan:** Pemilik modal dan jajaran manajemen yang memerlukan visualisasi komprehensif atas portofolio dan estimasi produktivitas kebun secara intuitif.

## Product Purpose

Sawit 3D menyediakan visualisasi 3D interaktif dan dashboard operasional kelapa sawit (*Elaeis guineensis*). Produk ini menjembatani siklus biologis kelapa sawit (dari fase kecambah/pre-nursery hingga sawit tua/replanting) dengan integrasi telemetri lapangan dan analitik data agritech, memungkinkan evaluasi kondisi tanaman yang presisi, cepat, dan berbasis visual.

## Positioning

Platform agritech pertama yang memadukan simulasi 3D real-time morfologi kelapa sawit (mode voxel dan prosedural) dengan antarmuka operasional perkebunan. Berbeda dari sistem GIS statis atau sekadar lembar data spreadsheet, Sawit 3D menghadirkan pemahaman spasial-biologis tanaman yang dapat dihubungkan langsung dengan sensor lapangan IoT dan status blok kebun.

## Operating Context

- Digunakan pada desktop di kantor perkebunan (estate office), laptop di command center agritech, dan perangkat tablet di lapangan.
- Digunakan dalam rapat evaluasi operasional kebun mingguan/bulanan, perencanaan jadwal agronomi, serta presentasi status aset kebun kepada investor.
- Menghubungkan standar terminologi perkebunan kelapa sawit Indonesia (Pre-Nursery, Main Nursery, TBM, TM, TBS, pelepah) dengan data kondisi lapangan aktual.

## Capabilities and Constraints

- **Kapabilitas Utama:**
  - Simulasi visual siklus pertumbuhan kelapa sawit 0–25+ tahun dengan kendali timeline interaktif.
  - Dual rendering engine Three.js: mode Voxel Style dan Procedural Realistic 3D.
  - Inspeksi anatomi bagian tanaman (Akar, Batang, Pelepah, Tandan Buah Segar/TBS, Pucuk/Janur) dilengkapi istilah latin dan fungsi botani.
  - Simulasi pencahayaan harian (Pagi, Siang, Senja) serta preset sudut kamera fokus.
  - 4 paradigma antarmuka terintegrasi: Agritech Field Dashboard, Editorial Botani, Bento Grid, dan Exhibition Kiosk.
- **Batasan & Kendala Teknis:**
  - Aplikasi berbasis WebGL/Three.js di browser modern (Chrome, Edge, Firefox, Safari); harus menjaga frame rate stabil (target 60 FPS).
  - Tumpukan teknologi: React 19, TypeScript, Tailwind CSS v4, Motion, Vite.
  - Harus optimal digunakan di lingkungan perkebunan dengan bandwidth jaringan yang bervariasi.

## Brand Commitments

- **Identitas & Nama:** Sawit 3D — Siklus Pertumbuhan & Visualisasi Operasional Kelapa Sawit.
- **Tone & Voice:** Lugas, berbasis data teknis agronomis, kredibel, dan profesional.
- **Bahasa & Istilah:** Bahasa Indonesia baku dengan terminologi agronomi dan botani resmi industri kelapa sawit.

## Evidence on Hand

- Data fase botani dan agronomi terstruktur di `src/data/palmStages.ts` (6 tahapan siklus dengan umur, tinggi, jumlah daun, status buah, dan catatan agronomi).
- Implementasi 3D Three.js di `src/three/oilPalmModel.ts` dan `src/three/voxelPalmModel.ts`.
- Komponen UI fungsional: `src/components/PalmViewport.tsx`, `src/components/ModernUIOverlay.tsx`, `src/components/LandingPage.tsx`, `src/components/UIReferenceDrawer.tsx`.

## Product Principles

1. **Akurasi Agronomi Sebagai Prioritas:** Representasi visual tanaman dan data siklus harus selaras dengan prinsip botani kelapa sawit dan standar industri perkebunan nyata.
2. **Visualisasi yang Membantu Keputusan:** Model 3D bukan sekadar estetika, melainkan instrumen untuk memahami morfologi, mengidentifikasi anomali, dan memonitor data lapangan.
3. **Keringanan & Responsivitas Sistem:** Alur interaksi, manipulasi kamera, dan rendering 3D harus tetap ringan dan responsif tanpa lag pada perangkat kerja operasional.
4. **Kejelasan Metrik Lapangan:** Metrik agronomi, telemetri IoT, dan status vegetatif disajikan tanpa distorsi agar mudah dipahami secara cepat oleh tim operasional maupun pengambil kebijakan.

## Accessibility & Inclusion

- Dukungan pintasan keyboard: Space (Play/Pause siklus), H (Sembunyikan panel/Studio mode), Escape (Batal seleksi/Tutup panduan).
- Keterbacaan kontras tinggi pada tema gelap (Agritech/Exhibition) maupun tema terang (Editorial/Bento) untuk kenyamanan penggunaan di dalam ruangan maupun di lapangan.
