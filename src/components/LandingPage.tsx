import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Compass,
  Cpu,
  Droplets,
  Layers,
  Maximize2,
  Pause,
  Play,
  RotateCw,
  Sun,
  X,
} from 'lucide-react';
import {
  CameraPresetId,
  computeLiveMetrics,
  getStageForGrowth,
  LightingPresetId,
  PALM_PARTS,
  PALM_STAGES,
  PalmPartId,
  PalmRenderStyle,
} from '../data/palmStages';
import { PalmViewport } from './PalmViewport';

interface LandingPageProps {
  growth: number;
  onChangeGrowth: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  cameraPreset: CameraPresetId;
  cameraTrigger: number;
  onSelectCamera: (preset: CameraPresetId) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedPart: PalmPartId | null;
  hoveredPart: PalmPartId | null;
  onSelectPart: (part: PalmPartId | null) => void;
  onHoverPart: (part: PalmPartId | null) => void;
  onEnterStudioMode: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  growth,
  onChangeGrowth,
  isPlaying,
  onTogglePlay,
  cameraPreset,
  cameraTrigger,
  onSelectCamera,
  autoRotate,
  onToggleAutoRotate,
  selectedPart,
  hoveredPart,
  onSelectPart,
  onHoverPart,
  onEnterStudioMode,
}) => {
  const renderStyle: PalmRenderStyle = 'voxel';
  const [lightingPreset, setLightingPreset] = useState<LightingPresetId>('pagi');

  const stage = getStageForGrowth(growth);
  const metrics = computeLiveMetrics(growth);
  const activePartInfo = selectedPart ? PALM_PARTS[selectedPart] : null;
  const hoverPartInfo =
    hoveredPart && hoveredPart !== selectedPart ? PALM_PARTS[hoveredPart] : null;

  const scrollToHero = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen w-full text-[#E3ECE6] selection:bg-[#10B981]/25 selection:text-[#34D399]"
      style={{
        fontFamily: '"Plus Jakarta Sans", sans-serif',
        backgroundColor: '#060E09',
      }}
    >
      {/* ATMOSPHERIC BACKGROUND RADIAL ACCENTS */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden z-0"
      >
        <div
          className="absolute -top-32 -left-20 h-[680px] w-[680px] rounded-full opacity-35"
          style={{
            background:
              'radial-gradient(circle, rgba(16,185,129,0.18) 0%, rgba(6,14,9,0) 70%)',
          }}
        />
        <div
          className="absolute top-1/3 -right-24 h-[720px] w-[720px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(circle, rgba(52,211,153,0.15) 0%, rgba(6,14,9,0) 65%)',
          }}
        />
        <div
          className="absolute bottom-10 left-1/4 h-[500px] w-[500px] rounded-full opacity-20"
          style={{
            background:
              'radial-gradient(circle, rgba(163,230,53,0.12) 0%, rgba(6,14,9,0) 70%)',
          }}
        />
      </div>

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-30 mx-auto flex w-full max-w-[1360px] items-center justify-between gap-6 px-6 py-5 lg:px-10 border-b border-emerald-950/60 backdrop-blur-md bg-[#060E09]/75">
        {/* Left: Brand Identity with Live Telemetry Pulse */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-white hover:text-[#34D399] transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-[#34D399]">
              <Compass className="h-4 w-4" />
            </span>
            <span className="leading-none">
              Sawit <span className="text-[#34D399]">3D</span>
            </span>
          </a>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
              Elaeis guineensis Twin
            </span>
          </div>
        </div>

        {/* Center: Clean Navigation Links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#94A89C]"
        >
          <a
            href="#siklus"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Siklus Biologis
          </a>
          <a
            href="#anatomi"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Anatomi Organ
          </a>
          <a
            href="#telemetri"
            className="hover:text-white transition-colors whitespace-nowrap"
          >
            Telemetri Lapangan
          </a>
        </nav>

        {/* Right: Primary Command Action */}
        <button
          type="button"
          onClick={onEnterStudioMode}
          className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-5 py-2.5 text-xs font-semibold text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-all hover:bg-emerald-500/25 hover:border-emerald-400/70 hover:text-white whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Studio 3D Penuh</span>
          <kbd className="hidden lg:inline-block rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] text-emerald-300/80 border border-emerald-500/30">
            H
          </kbd>
        </button>
      </header>

      {/* HERO SECTION: COMMAND CENTER 3D STAGE */}
      <section className="relative z-10 mx-auto grid w-full max-w-[1360px] min-h-[calc(100svh-80px)] grid-cols-1 items-center gap-8 px-6 pb-12 pt-6 lg:grid-cols-12 lg:gap-10 lg:px-10">
        {/* Left Column: Proposition & Real-Time Agronomic HUD */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div className="space-y-3.5">
            {/* Dynamic Stage Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-300">
              <Activity className="h-3.5 w-3.5 text-[#10B981]" />
              <span
                className="font-medium tabular-nums"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                Fase 0{stage.index}/05 · {stage.ageRange}
              </span>
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold tracking-tight text-white leading-[1.12]"
              style={{ textWrap: 'balance' }}
            >
              Kembar Digital 3D untuk Siklus & Morfologi Kelapa Sawit
            </h1>

            <p className="text-sm sm:text-base leading-relaxed text-[#9EB2A5] max-w-lg">
              Simulasi interaktif morfologi <span className="italic text-white">Elaeis guineensis</span> dari
              kecambah polybag hingga puncak produksi TBS. Dirancang untuk agronom, praktisi kebun, dan manajer agritech.
            </p>
          </div>

          {/* Primary Simulation Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={onTogglePlay}
              className="group inline-flex items-center gap-2.5 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-semibold text-black shadow-[0_0_24px_rgba(16,185,129,0.35)] transition-all hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPlaying ? (
                <>
                  <Pause className="h-3.5 w-3.5 fill-current" />
                  <span>Jeda Simulasi Siklus</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Mulai Simulasi Siklus</span>
                </>
              )}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={onToggleAutoRotate}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition-colors ${
                autoRotate
                  ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                  : 'border-emerald-950/80 bg-[#0B1811] text-[#8EA295] hover:text-white hover:border-emerald-800'
              }`}
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${autoRotate ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
              />
              <span>{autoRotate ? 'Hentikan Rotasi' : 'Rotasi 360°'}</span>
            </button>

            {/* Model Badge: 3D Pixel / Micro-Voxel Diorama */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-[#0B1811] px-3.5 py-2 text-xs font-semibold text-emerald-300 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <Layers className="h-3.5 w-3.5 text-emerald-400" />
              <span>3D Pixel Diorama</span>
            </div>
          </div>

          {/* Interactive Agronomic Scrubber & Telemetry HUD Card */}
          <div className="rounded-2xl border border-emerald-500/20 bg-[#0B1811]/90 backdrop-blur-md p-5 space-y-4 shadow-xl">
            {/* Header Stage & Live Telemetry Readout */}
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-emerald-950/70 pb-3">
              <div>
                <span className="text-base font-bold text-white">{stage.name}</span>
                <span className="ml-2 text-xs text-emerald-400 font-medium">
                  ({stage.shortLabel})
                </span>
              </div>
              <div
                className="flex flex-wrap items-center gap-x-2 text-xs text-emerald-300 tabular-nums"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                <span className="text-white font-semibold">{metrics.ageLabel}</span>
                <span className="text-emerald-700">·</span>
                <span>{metrics.heightLabel}</span>
                <span className="text-emerald-700">·</span>
                <span className="text-[#A3E635]">{metrics.tbsLabel}</span>
              </div>
            </div>

            {/* Custom Glowing Slider Scrubber */}
            <div className="space-y-3">
              <div className="relative pt-1">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.002}
                  value={growth}
                  onChange={(e) => onChangeGrowth(parseFloat(e.target.value))}
                  aria-label="Linimasa pertumbuhan kelapa sawit"
                  className="sawit-slider w-full"
                  style={{
                    color: '#10B981',
                    background: `linear-gradient(to right, #10B981 ${growth * 100}%, rgba(16,185,129,0.15) ${growth * 100}%)`,
                    borderRadius: '9999px',
                    height: '5px',
                  }}
                />
              </div>

              {/* 5 Quick Phase Selectors */}
              <div className="grid grid-cols-5 gap-1.5">
                {PALM_STAGES.map((s) => {
                  const active = s.id === stage.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onChangeGrowth(s.growthValue)}
                      className={`truncate rounded-lg px-2 py-1.5 text-[11px] font-medium transition-all text-center whitespace-nowrap ${
                        active
                          ? 'bg-emerald-500 text-black font-semibold shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                          : 'bg-[#0E2218]/60 text-[#869C8F] hover:bg-emerald-950/80 hover:text-white'
                      }`}
                    >
                      {s.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agronomic Summary Quote */}
            <div className="rounded-xl border border-emerald-950/80 bg-[#07130C]/80 p-3 text-xs leading-relaxed text-[#96ABA0]">
              <span className="font-semibold text-emerald-300">Rekomendasi Agronomi: </span>
              {stage.agronomyNote}
            </div>
          </div>
        </div>

        {/* Right Column: 3D Palm Viewport Floating over Luminous Emerald Aura */}
        <div className="relative lg:col-span-7 h-[460px] sm:h-[540px] lg:h-[640px] w-full flex flex-col justify-center">
          {/* Subtle Concentric Rings & Luminous Core */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <div className="h-[480px] w-[480px] rounded-full border border-emerald-500/10 opacity-60" />
            <div className="h-[360px] w-[360px] rounded-full border border-emerald-500/15 opacity-80" />
            <div
              className="absolute h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(6,14,9,0) 70%)',
              }}
            />
          </div>

          <div className="relative h-full w-full">
            <PalmViewport
              growth={growth}
              renderStyle={renderStyle}
              transparentBg={true}
              cameraPreset={cameraPreset}
              cameraTrigger={cameraTrigger}
              lightingPreset={lightingPreset}
              selectedPart={selectedPart}
              autoRotate={autoRotate}
              onSelectPart={onSelectPart}
              onHoverPart={onHoverPart}
            />

            {/* Active Organ Inspection Card */}
            {activePartInfo && (
              <aside
                className="absolute right-3 top-3 z-20 max-w-xs rounded-xl border border-emerald-400/30 bg-[#0A1A12]/95 p-4 shadow-2xl backdrop-blur-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div
                      className="text-[11px] font-semibold text-emerald-400"
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      {activePartInfo.latinTerm}
                    </div>
                    <h3 className="mt-0.5 text-sm font-bold text-white">
                      {activePartInfo.name}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectPart(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[#7D9487] hover:bg-emerald-950 hover:text-white"
                    aria-label="Tutup detail organ"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 text-xs font-medium text-emerald-300/90">
                  {activePartInfo.role}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-[#94AAA0]">
                  {activePartInfo.detail}
                </p>
              </aside>
            )}

            {/* Floating Camera & Lighting Bar at Bottom */}
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2">
              {hoverPartInfo && (
                <div
                  className="rounded-full border border-emerald-500/30 bg-[#0A1A12]/90 px-3.5 py-1 text-xs text-white shadow-lg backdrop-blur-sm"
                >
                  <span className="font-semibold text-emerald-300">
                    {hoverPartInfo.name}
                  </span>{' '}
                  · Klik organ untuk inspeksi mendalam
                </div>
              )}

              <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-emerald-500/20 bg-[#0A1A12]/85 px-3 py-1.5 text-xs backdrop-blur-md shadow-lg">
                <span className="px-1 text-[11px] font-medium text-[#7D9487]">
                  Kamera:
                </span>
                {(
                  [
                    { id: 'full', label: 'Pohon Utuh' },
                    { id: 'fruit', label: 'Buah TBS' },
                    { id: 'trunk', label: 'Batang' },
                    { id: 'crown', label: 'Pucuk' },
                  ] as { id: CameraPresetId; label: string }[]
                ).map((cam) => (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => onSelectCamera(cam.id)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-all ${
                      cameraPreset === cam.id
                        ? 'bg-emerald-500 text-black font-semibold'
                        : 'text-[#9EB2A6] hover:text-white hover:bg-emerald-950/60'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}

                <span className="ml-1 pl-2 border-l border-emerald-950/80 text-[11px] font-medium text-[#7D9487]">
                  Waktu:
                </span>
                {(
                  [
                    { id: 'pagi', label: 'Pagi' },
                    { id: 'siang', label: 'Siang' },
                    { id: 'senja', label: 'Senja' },
                  ] as { id: LightingPresetId; label: string }[]
                ).map((light) => (
                  <button
                    key={light.id}
                    type="button"
                    onClick={() => setLightingPreset(light.id)}
                    className={`rounded-full px-2 py-0.5 text-xs font-medium transition-all ${
                      lightingPreset === light.id
                        ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/30'
                        : 'text-[#7D9487] hover:text-white'
                    }`}
                  >
                    {light.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: 5 FASE SIKLUS PERTUMBUHAN BIOLOGIS */}
      <section id="siklus" className="relative z-10 border-t border-emerald-950/70 bg-[#08140D] py-20">
        <div className="mx-auto max-w-[1360px] px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-4 border-b border-emerald-950/80 pb-6 md:flex-row md:items-end">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                Lima Fase Pertumbuhan dari Bibit hingga Peremajaan
              </h2>
              <p className="mt-2 text-sm text-[#8EA396] max-w-2xl leading-relaxed">
                Pilih kartu fase di bawah untuk langsung menggerakkan kembar digital 3D ke tahap fisiologis yang bersangkutan.
              </p>
            </div>
            <div className="text-xs text-emerald-400 font-medium whitespace-nowrap">
              Interaksi responsif · 0 – 25+ Tahun Siklus
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {PALM_STAGES.map((s) => {
              const active = s.id === stage.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    onChangeGrowth(s.growthValue);
                    scrollToHero();
                  }}
                  className={`group flex flex-col justify-between rounded-xl border p-5 text-left transition-all ${
                    active
                      ? 'border-emerald-500 bg-emerald-950/40 shadow-[0_0_24px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50'
                      : 'border-emerald-950/80 bg-[#0B1A12]/70 hover:border-emerald-500/40 hover:bg-[#0D2016]'
                  }`}
                >
                  <div>
                    <div
                      className={`text-xs tabular-nums font-semibold ${
                        active ? 'text-emerald-400' : 'text-[#6E887B]'
                      }`}
                      style={{ fontFamily: '"IBM Plex Mono", monospace' }}
                    >
                      0{s.index} · {s.ageRange}
                    </div>
                    <h3 className="mt-2 text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {s.shortLabel}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#8FA599]">
                      {s.summary}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-emerald-950/70 pt-3 flex items-center justify-between text-[11px] tabular-nums text-emerald-400/90 font-medium">
                    <span style={{ fontFamily: '"IBM Plex Mono", monospace' }}>
                      {s.heightMeters}
                    </span>
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-emerald-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION: EKSPLORASI ANATOMI ORGAN & MORFOLOGI */}
      <section id="anatomi" className="relative z-10 border-t border-emerald-950/70 bg-[#060E09] py-20">
        <div className="mx-auto max-w-[1360px] px-6 lg:px-10">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{ textWrap: 'balance' }}
            >
              Inspeksi Presisi Anatomi Organ Vegetatif & Generatif
            </h2>
            <p className="mt-2 text-sm text-[#8EA396] leading-relaxed">
              Setiap organ kelapa sawit memiliki fungsi fisiologis yang krusial bagi serapan hara, fotosintesis, dan pembentukan rendemen minyak kelapa sawit.
            </p>
          </div>

          {/* Quick Clickable Organ Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#7A9385] font-medium mr-1">
              Sorot Organ di 3D:
            </span>
            {(['akar', 'batang', 'pelepah', 'tandan_buah', 'pucuk'] as PalmPartId[]).map(
              (partKey) => {
                const part = PALM_PARTS[partKey];
                const available = growth >= part.minGrowthToVisible;
                const active = selectedPart === partKey;
                return (
                  <button
                    key={partKey}
                    type="button"
                    disabled={!available}
                    onClick={() => {
                      onSelectPart(active ? null : partKey);
                      scrollToHero();
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all disabled:opacity-30 ${
                      active
                        ? 'border-emerald-400 bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                        : 'border-emerald-950/80 bg-[#0B1A12] text-emerald-300 hover:border-emerald-500/50 hover:bg-emerald-950/60'
                    }`}
                  >
                    {part.name}
                  </button>
                );
              }
            )}
          </div>

          {/* 4 Architectural Botanical Feature Cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-950/80 bg-[#0B1A12]/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Sun className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  Filotaksis Spiral 137.5°
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8FA599]">
                  Susunan pelepah mengikuti sudut emas (golden angle) Fibonacci untuk meminimalkan saling ternaungi (*self-shading*) dan memaksimalkan intersepsi radiasi fotosintesis kanopi.
                </p>
              </div>
              <div
                className="mt-4 pt-3 border-t border-emerald-950/70 text-[11px] text-emerald-400 font-semibold"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                40–48 Pelepah Aktif
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-950/80 bg-[#0B1A12]/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Droplets className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  Sistem Perakaran Kuartet
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8FA599]">
                  Akar primer berfungsi sebagai jangkar mekanis pohon tinggi, sementara serabut akar tersier dan kuaterner di kedalaman 0–30 cm menyerap unsur hara N-P-K dan air tanah.
                </p>
              </div>
              <div
                className="mt-4 pt-3 border-t border-emerald-950/70 text-[11px] text-emerald-400 font-semibold"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                Radius 4.0 – 5.5 Meter
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-950/80 bg-[#0B1A12]/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  Tandan Buah Segar (TBS)
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8FA599]">
                  Dari pembungaan betina hingga kematangan panen 5–6 bulan. Tandan matang optimal memiliki kandungan asam lemak bebas (FFA) rendah dan rendemen CPO mencapai 22–24%.
                </p>
              </div>
              <div
                className="mt-4 pt-3 border-t border-emerald-950/70 text-[11px] text-[#A3E635] font-semibold"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                18 – 28 kg Bobot Optimal
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-950/80 bg-[#0B1A12]/80 p-6 flex flex-col justify-between">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">
                  Pupus & Titik Tumbuh
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#8FA599]">
                  Meristem apikal terlindungi di pusat tajuk (*spear leaf*). Menjadi barometer visual pertama agronom terhadap cekaman kekeringan air atau defisiensi mikronutrien boron.
                </p>
              </div>
              <div
                className="mt-4 pt-3 border-t border-emerald-950/70 text-[11px] text-emerald-400 font-semibold"
                style={{ fontFamily: '"IBM Plex Mono", monospace' }}
              >
                Laju 2–3 Daun / Bulan
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: INTEGRASI TELEMETRI LAPANGAN & AGRITECH IOT */}
      <section id="telemetri" className="relative z-10 border-t border-emerald-950/70 bg-[#08140D] py-20">
        <div className="mx-auto max-w-[1360px] px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5 space-y-4">
              <h2
                className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
                style={{ textWrap: 'balance' }}
              >
                Kesiapan Telemetri Lapangan untuk Presisi Perkebunan
              </h2>
              <p className="text-sm leading-relaxed text-[#8FA599]">
                Model 3D Sawit dirancang untuk dapat dihubungkan dengan data streaming sensor IoT, pemetaan drone NDVI, dan sistem manajemen blok kebun.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onEnterStudioMode}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500 hover:text-black transition-all"
                >
                  <span>Buka Mode Dashboard Agritech di Studio</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-950/80 bg-[#0B1A12] p-5 space-y-2">
                <div className="text-xs text-emerald-400 font-semibold">Sensor Tanah & Cuaca</div>
                <h4 className="text-sm font-bold text-white">Monitoring Cekaman Air</h4>
                <p className="text-xs text-[#8EA295] leading-relaxed">
                  Menghubungkan defisit air harian (mm) dengan laju transpirasi dan pembukaan daun tombak secara spasial.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-950/80 bg-[#0B1A12] p-5 space-y-2">
                <div className="text-xs text-emerald-400 font-semibold">Fotogrametri Drone</div>
                <h4 className="text-sm font-bold text-white">Analisis Kerapatan Kanopi</h4>
                <p className="text-xs text-[#8EA295] leading-relaxed">
                  Validasi jumlah pelepah aktif dan indeks luas daun (LAI) pohon individual berbasis citra multispektral.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-950/80 bg-[#0B1A12] p-5 space-y-2">
                <div className="text-xs text-emerald-400 font-semibold">Prediksi Hasil TBS</div>
                <h4 className="text-sm font-bold text-white">Peramalan Siklus Panen</h4>
                <p className="text-xs text-[#8EA295] leading-relaxed">
                  Estimasi tonase TBS per hektar berdasarkan umur tegakan pohon dan histori dinamika pembungaan betina.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUIET MODERN COMMAND FOOTER */}
      <footer className="relative z-10 border-t border-emerald-950/80 bg-[#050C07] py-12">
        <div className="mx-auto flex max-w-[1360px] flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center lg:px-10">
          <div>
            <div className="flex items-center gap-2 text-base font-bold text-white">
              <Compass className="h-4 w-4 text-[#10B981]" />
              <span>Sawit 3D</span>
              <span className="text-xs text-[#6B8577] font-normal">
                · Kembar Digital & Siklus Pertumbuhan Kelapa Sawit
              </span>
            </div>
            <p className="mt-1 text-xs text-[#6B8577]">
              Morfologi presisi <span className="italic">Elaeis guineensis</span> dengan Three.js & Tailwind CSS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              type="button"
              onClick={onEnterStudioMode}
              className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-emerald-300 transition-all hover:bg-emerald-500 hover:text-black font-semibold"
            >
              Buka Studio 3D Penuh
            </button>
            <button
              type="button"
              onClick={scrollToHero}
              className="text-[#8EA295] hover:text-white transition-colors"
            >
              Kembali ke Atas ↑
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
