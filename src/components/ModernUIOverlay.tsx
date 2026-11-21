import React from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Eye,
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
  UI_REFERENCES,
  UIReferenceId,
} from '../data/palmStages';

interface ModernUIOverlayProps {
  uiRefId: UIReferenceId;
  onSelectUIRef: (id: UIReferenceId) => void;
  renderStyle: PalmRenderStyle;
  onSelectRenderStyle: (style: PalmRenderStyle) => void;
  growth: number;
  onChangeGrowth: (val: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  cameraPreset: CameraPresetId;
  onSelectCamera: (preset: CameraPresetId) => void;
  lightingPreset: LightingPresetId;
  onSelectLighting: (preset: LightingPresetId) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  selectedPart: PalmPartId | null;
  hoveredPart: PalmPartId | null;
  onSelectPart: (part: PalmPartId | null) => void;
  dockCollapsed: boolean;
  onToggleDock: () => void;
  onOpenGuide: () => void;
  onBackToLanding?: () => void;
}

interface ThemeStyle {
  topBarBg: string;
  dockBg: string;
  cardBg: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentBg: string;
  accentText: string;
  accentHex: string;
  segmentTrack: string;
  segmentActive: string;
  buttonHover: string;
}

function getThemeStyle(id: UIReferenceId): ThemeStyle {
  switch (id) {
    case 'editorial':
      return {
        topBarBg: 'rgba(250, 250, 247, 0.92)',
        dockBg: 'rgba(250, 250, 247, 0.94)',
        cardBg: 'rgba(250, 250, 247, 0.95)',
        border: 'rgba(24, 36, 28, 0.13)',
        textPrimary: '#18241C',
        textSecondary: '#3E4F44',
        textMuted: '#637368',
        accentBg: '#2D6A4F',
        accentText: '#FFFFFF',
        accentHex: '#2D6A4F',
        segmentTrack: 'rgba(24, 36, 28, 0.06)',
        segmentActive: '#FFFFFF',
        buttonHover: 'rgba(24, 36, 28, 0.06)',
      };
    case 'agritech':
      return {
        topBarBg: 'rgba(13, 19, 16, 0.90)',
        dockBg: 'rgba(16, 24, 20, 0.93)',
        cardBg: 'rgba(16, 24, 20, 0.94)',
        border: 'rgba(167, 243, 208, 0.14)',
        textPrimary: '#ECFDF5',
        textSecondary: '#B5D1C4',
        textMuted: '#7EA192',
        accentBg: '#10B981',
        accentText: '#06281E',
        accentHex: '#34D399',
        segmentTrack: 'rgba(255, 255, 255, 0.06)',
        segmentActive: '#1E2D26',
        buttonHover: 'rgba(255, 255, 255, 0.08)',
      };
    case 'bento':
      return {
        topBarBg: 'rgba(255, 255, 255, 0.94)',
        dockBg: 'rgba(255, 255, 255, 0.95)',
        cardBg: 'rgba(255, 255, 255, 0.96)',
        border: 'rgba(15, 23, 42, 0.11)',
        textPrimary: '#0F172A',
        textSecondary: '#334155',
        textMuted: '#64748B',
        accentBg: '#D95D24',
        accentText: '#FFFFFF',
        accentHex: '#D95D24',
        segmentTrack: '#F1F5F9',
        segmentActive: '#FFFFFF',
        buttonHover: 'rgba(15, 23, 42, 0.05)',
      };
    case 'exhibition':
      return {
        topBarBg: 'rgba(20, 20, 19, 0.90)',
        dockBg: 'rgba(24, 23, 21, 0.94)',
        cardBg: 'rgba(24, 23, 21, 0.95)',
        border: 'rgba(244, 239, 230, 0.14)',
        textPrimary: '#F4EFE6',
        textSecondary: '#D4CEC3',
        textMuted: '#9B9488',
        accentBg: '#E09F3E',
        accentText: '#1A150E',
        accentHex: '#E09F3E',
        segmentTrack: 'rgba(244, 239, 230, 0.07)',
        segmentActive: '#2D2B27',
        buttonHover: 'rgba(244, 239, 230, 0.08)',
      };
  }
}

const CAMERA_OPTIONS: { id: CameraPresetId; label: string }[] = [
  { id: 'full', label: 'Utuh' },
  { id: 'fruit', label: 'Buah TBS' },
  { id: 'trunk', label: 'Batang' },
  { id: 'crown', label: 'Pucuk' },
];

const LIGHTING_OPTIONS: { id: LightingPresetId; label: string }[] = [
  { id: 'pagi', label: 'Pagi' },
  { id: 'siang', label: 'Siang' },
  { id: 'senja', label: 'Senja' },
];

export const ModernUIOverlay: React.FC<ModernUIOverlayProps> = ({
  uiRefId,
  onSelectUIRef,
  renderStyle,
  onSelectRenderStyle,
  growth,
  onChangeGrowth,
  isPlaying,
  onTogglePlay,
  cameraPreset,
  onSelectCamera,
  lightingPreset,
  onSelectLighting,
  autoRotate,
  onToggleAutoRotate,
  selectedPart,
  hoveredPart,
  onSelectPart,
  dockCollapsed,
  onToggleDock,
  onOpenGuide,
  onBackToLanding,
}) => {
  const activeSpec = UI_REFERENCES.find((r) => r.id === uiRefId) ?? UI_REFERENCES[0];
  const theme = getThemeStyle(uiRefId);
  const stage = getStageForGrowth(growth);
  const metrics = computeLiveMetrics(growth);
  const activePartInfo = selectedPart ? PALM_PARTS[selectedPart] : null;
  const hoverPartInfo = hoveredPart && hoveredPart !== selectedPart ? PALM_PARTS[hoveredPart] : null;

  const isMaturePhase = growth >= 0.56;

  const goPrevStage = () => {
    const prevIdx = Math.max(0, stage.index - 2);
    onChangeGrowth(PALM_STAGES[prevIdx].growthValue);
  };

  const goNextStage = () => {
    const nextIdx = Math.min(PALM_STAGES.length - 1, stage.index);
    onChangeGrowth(PALM_STAGES[nextIdx].growthValue);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between"
      style={{ fontFamily: activeSpec.bodyFont }}
    >
      {/* TOP BAR CONTRACT: 3 clean zones (Wordmark | 4 UI Reference Modes | 1 Action) */}
      <header className="pointer-events-auto flex items-center justify-center px-4 pt-4">
        <div
          className="flex w-full max-w-[960px] items-center justify-between gap-4 rounded-xl border px-4 py-2.5 shadow-sm transition-colors duration-200"
          style={{
            backgroundColor: theme.topBarBg,
            borderColor: theme.border,
            color: theme.textPrimary,
          }}
        >
          {/* Zone 1: Single-line Brand Title / Back to Landing */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              className="text-base font-semibold tracking-tight whitespace-nowrap shrink-0"
              style={{ fontFamily: activeSpec.displayFont }}
            >
              Elaeis Explorer
            </div>
            {onBackToLanding && (
              <button
                type="button"
                onClick={onBackToLanding}
                className="rounded-md border px-2 py-1 text-[11px] font-medium transition-colors whitespace-nowrap"
                style={{
                  borderColor: theme.border,
                  color: theme.textSecondary,
                }}
              >
                ← Landing Page
              </button>
            )}
          </div>

          {/* Zone 2: Live UI Reference Switcher (4 Modern UI Paradigms) */}
          <nav
            aria-label="Pilih Referensi UI Modern"
            className="hidden md:flex items-center gap-1 rounded-lg p-1"
            style={{ backgroundColor: theme.segmentTrack }}
          >
            {UI_REFERENCES.map((ref) => {
              const active = ref.id === uiRefId;
              return (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => onSelectUIRef(ref.id)}
                  className="rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    backgroundColor: active ? theme.segmentActive : 'transparent',
                    color: active ? theme.textPrimary : theme.textMuted,
                    boxShadow: active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {ref.shortName}
                </button>
              );
            })}
          </nav>

          {/* Mobile compact selector */}
          <div className="flex md:hidden items-center gap-1 overflow-x-auto">
            {UI_REFERENCES.map((ref) => {
              const active = ref.id === uiRefId;
              return (
                <button
                  key={ref.id}
                  type="button"
                  onClick={() => onSelectUIRef(ref.id)}
                  className="rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap shrink-0"
                  style={{
                    backgroundColor: active ? theme.accentBg : theme.segmentTrack,
                    color: active ? theme.accentText : theme.textSecondary,
                  }}
                >
                  {ref.code}
                </button>
              );
            })}
          </div>

          {/* Zone 3: 1 Primary Action */}
          <button
            type="button"
            onClick={onOpenGuide}
            className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              backgroundColor: theme.accentBg,
              color: theme.accentText,
            }}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Panduan UI</span>
          </button>
        </div>
      </header>

      {/* FLOATING SUBTLE HOVER TOOLTIP OR CLICKED PART INSPECTOR (Top-Left, never blocks center) */}
      <div className="pointer-events-none flex-1 px-4 pt-3">
        <div className="mx-auto max-w-[960px]">
          {activePartInfo ? (
            <aside
              className="pointer-events-auto max-w-xs rounded-xl border p-4 shadow-md transition-all duration-150"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className="text-[11px] font-medium"
                    style={{ color: theme.accentHex, fontFamily: activeSpec.monoFont }}
                  >
                    Anatomi Sawit · {activePartInfo.latinTerm}
                  </div>
                  <h3
                    className="mt-0.5 text-base font-semibold leading-snug"
                    style={{ fontFamily: activeSpec.displayFont }}
                  >
                    {activePartInfo.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPart(null)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors"
                  style={{ color: theme.textMuted }}
                  aria-label="Tutup detail organ"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs leading-relaxed" style={{ color: theme.textSecondary }}>
                {activePartInfo.detail}
              </p>
              <div
                className="mt-2.5 border-t pt-2 text-[11px]"
                style={{ borderColor: theme.border, color: theme.textMuted }}
              >
                Fungsi utama: <span style={{ color: theme.textPrimary }}>{activePartInfo.role}</span>
              </div>
            </aside>
          ) : hoverPartInfo ? (
            <div
              className="inline-block rounded-lg border px-3 py-1.5 text-xs shadow-sm"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.textPrimary,
              }}
            >
              <span className="font-medium">{hoverPartInfo.name}</span>
              <span className="mx-1.5" style={{ color: theme.textMuted }}>
                ·
              </span>
              <span style={{ color: theme.textMuted }}>Klik untuk detail</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Zero Viewport Occlusion) */}
      <div className="pointer-events-none flex flex-col items-center px-3 pb-4 sm:pb-5">
        {/* Collapse / Expand Toggle Handle */}
        <button
          type="button"
          onClick={onToggleDock}
          className="pointer-events-auto mb-1.5 inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-[11px] font-medium shadow-sm transition-colors whitespace-nowrap"
          style={{
            backgroundColor: theme.dockBg,
            borderColor: theme.border,
            color: theme.textSecondary,
          }}
          title="Tekan tombol H untuk menyembunyikan atau menampilkan panel"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              <span>Tampilkan Kontrol (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              <span>Mode Penuh (H)</span>
            </>
          )}
        </button>

        {/* Main Dock Surface */}
        <div
          className="pointer-events-auto w-full max-w-[940px] rounded-2xl border shadow-lg transition-transform duration-200"
          style={{
            backgroundColor: theme.dockBg,
            borderColor: theme.border,
            color: theme.textPrimary,
            transform: dockCollapsed ? 'translateY(calc(100% + 28px))' : 'translateY(0)',
            pointerEvents: dockCollapsed ? 'none' : 'auto',
          }}
        >
          <div className="p-3.5 sm:px-5 sm:py-4 space-y-3">
            {/* Row 1: Stage Title + Unboxed Tabular Metrics (No Pills!) */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span
                    className="text-xs font-medium"
                    style={{ color: theme.accentHex, fontFamily: activeSpec.monoFont }}
                  >
                    Tahap 0{stage.index}/05
                  </span>
                  <h1
                    className="text-base sm:text-lg font-semibold tracking-tight"
                    style={{ fontFamily: activeSpec.displayFont }}
                  >
                    {stage.name}
                  </h1>
                </div>
                <p
                  className="mt-0.5 text-xs leading-relaxed line-clamp-2"
                  style={{ color: theme.textSecondary }}
                >
                  {stage.summary}
                </p>
              </div>

              {/* Clean Unboxed Metrics with Tabular Numerals */}
              <div
                className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs shrink-0 tabular-nums"
                style={{ fontFamily: activeSpec.monoFont, color: theme.textSecondary }}
              >
                <span>
                  <strong style={{ color: theme.textPrimary }}>{metrics.ageLabel}</strong>
                </span>
                <span aria-hidden="true" style={{ color: theme.textMuted }}>
                  ·
                </span>
                <span>{metrics.heightLabel}</span>
                <span aria-hidden="true" style={{ color: theme.textMuted }}>
                  ·
                </span>
                <span>{metrics.frondsLabel}</span>
                <span aria-hidden="true" style={{ color: theme.textMuted }}>
                  ·
                </span>
                <span style={{ color: isMaturePhase ? theme.accentHex : theme.textSecondary }}>
                  {metrics.tbsLabel}
                </span>
              </div>
            </div>

            {/* Row 2: Growth Timeline Scrubber + Play/Pause */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onTogglePlay}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-2"
                style={{
                  backgroundColor: theme.accentBg,
                  color: theme.accentText,
                }}
                aria-label={isPlaying ? 'Jeda simulasi pertumbuhan' : 'Putar simulasi pertumbuhan'}
                title={isPlaying ? 'Jeda Siklus' : 'Putar Siklus'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.002}
                  value={growth}
                  onChange={(e) => onChangeGrowth(parseFloat(e.target.value))}
                  aria-label="Linimasa siklus pertumbuhan kelapa sawit"
                  className="sawit-slider w-full"
                  style={{
                    color: theme.accentHex,
                    background: `linear-gradient(to right, ${theme.accentHex} ${growth * 100}%, ${theme.segmentTrack} ${growth * 100}%)`,
                    borderRadius: '9999px',
                    height: '4px',
                  }}
                />
                {/* Stage Quick-Jump Tabs directly under slider */}
                <div className="mt-2 grid grid-cols-5 gap-1">
                  {PALM_STAGES.map((s) => {
                    const isCurrent = s.id === stage.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onChangeGrowth(s.growthValue)}
                        className="truncate rounded-md px-1.5 py-1 text-[11px] font-medium transition-colors text-center whitespace-nowrap"
                        style={{
                          backgroundColor: isCurrent ? theme.segmentActive : 'transparent',
                          color: isCurrent ? theme.textPrimary : theme.textMuted,
                          border: isCurrent ? `1px solid ${theme.border}` : '1px solid transparent',
                        }}
                      >
                        <span className="hidden sm:inline">{s.index}. </span>
                        {s.shortLabel}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Exhibition Story Mode adds Prev/Next Chapter Buttons */}
              {uiRefId === 'exhibition' && (
                <div className="hidden sm:flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={goPrevStage}
                    disabled={stage.index === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border disabled:opacity-35"
                    style={{ borderColor: theme.border, color: theme.textPrimary }}
                    aria-label="Tahap sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNextStage}
                    disabled={stage.index === PALM_STAGES.length}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border disabled:opacity-35"
                    style={{ borderColor: theme.border, color: theme.textPrimary }}
                    aria-label="Tahap berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Row 3: Camera Presets + Lighting + Organ Quick Inspection */}
            <div
              className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5 text-[11px]"
              style={{ borderColor: theme.border }}
            >
              {/* Camera Viewpoints + Model Style Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium"
                  style={{ backgroundColor: theme.segmentTrack, color: theme.textPrimary }}
                  title="Model visual: 3D Pixel / Micro-Voxel Diorama"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>3D Pixel Diorama</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 shrink-0" style={{ color: theme.textMuted }} />
                  <div
                    className="flex items-center gap-0.5 rounded-lg p-0.5"
                    style={{ backgroundColor: theme.segmentTrack }}
                  >
                    {CAMERA_OPTIONS.map((cam) => {
                      const active = cameraPreset === cam.id;
                      return (
                        <button
                          key={cam.id}
                          type="button"
                          onClick={() => onSelectCamera(cam.id)}
                          className="rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap"
                          style={{
                            backgroundColor: active ? theme.segmentActive : 'transparent',
                            color: active ? theme.textPrimary : theme.textMuted,
                          }}
                        >
                          {cam.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Organ Inspection Buttons */}
              <div className="hidden lg:flex items-center gap-1">
                <span style={{ color: theme.textMuted }}>Inspeksi:</span>
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
                        onClick={() => onSelectPart(active ? null : partKey)}
                        className="rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap disabled:opacity-35"
                        style={{
                          backgroundColor: active ? theme.accentBg : 'transparent',
                          color: active ? theme.accentText : theme.textSecondary,
                        }}
                      >
                        {partKey === 'tandan_buah'
                          ? 'Buah TBS'
                          : partKey.charAt(0).toUpperCase() + partKey.slice(1)}
                      </button>
                    );
                  }
                )}
              </div>

              {/* Lighting + Orbit Auto-Rotate */}
              <div className="flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 shrink-0" style={{ color: theme.textMuted }} />
                <div
                  className="flex items-center gap-0.5 rounded-lg p-0.5"
                  style={{ backgroundColor: theme.segmentTrack }}
                >
                  {LIGHTING_OPTIONS.map((l) => {
                    const active = lightingPreset === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => onSelectLighting(l.id)}
                        className="rounded-md px-2 py-1 font-medium transition-colors whitespace-nowrap"
                        style={{
                          backgroundColor: active ? theme.segmentActive : 'transparent',
                          color: active ? theme.textPrimary : theme.textMuted,
                        }}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={onToggleAutoRotate}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 font-medium transition-colors whitespace-nowrap"
                  style={{
                    borderColor: autoRotate ? theme.accentHex : theme.border,
                    color: autoRotate ? theme.accentHex : theme.textMuted,
                  }}
                  title="Putar kamera perlahan mengelilingi sawit"
                >
                  <RotateCw className="h-3 w-3" />
                  <span className="hidden sm:inline">Putar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
