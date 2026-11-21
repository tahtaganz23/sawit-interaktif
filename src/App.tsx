import { useCallback, useEffect, useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { ModernUIOverlay } from './components/ModernUIOverlay';
import { PalmViewport } from './components/PalmViewport';
import { UIReferenceDrawer } from './components/UIReferenceDrawer';
import {
  CameraPresetId,
  LightingPresetId,
  PalmPartId,
  PalmRenderStyle,
  UIReferenceId,
} from './data/palmStages';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'studio'>('landing');
  const [uiRefId, setUiRefId] = useState<UIReferenceId>('editorial');
  const [renderStyle, setRenderStyle] = useState<PalmRenderStyle>('voxel');
  const [growth, setGrowth] = useState<number>(0.92);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('full');
  const [cameraTrigger, setCameraTrigger] = useState<number>(0);
  const [lightingPreset, setLightingPreset] = useState<LightingPresetId>('pagi');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [selectedPart, setSelectedPart] = useState<PalmPartId | null>(null);
  const [hoveredPart, setHoveredPart] = useState<PalmPartId | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);

  // Smooth playback loop when "Play Siklus" is active
  useEffect(() => {
    if (!isPlaying) return;
    let lastTime = performance.now();
    let rafId = 0;

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      setGrowth((prev) => {
        const next = prev + dt * 0.065;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  // Keyboard shortcuts: H = Zen Mode (Studio), Space = Play/Pause, Escape = Close drawer/selection
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'BUTTON';

      if ((e.key === 'h' || e.key === 'H') && viewMode === 'studio') {
        setDockCollapsed((c) => !c);
      } else if (e.key === 'Escape') {
        if (guideOpen) setGuideOpen(false);
        else if (selectedPart) setSelectedPart(null);
      } else if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        setIsPlaying((playing) => {
          if (!playing && growth >= 0.97) {
            setGrowth(0.02);
          }
          return !playing;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [guideOpen, selectedPart, growth, viewMode]);

  const handleSelectUIRef = useCallback((id: UIReferenceId) => {
    setUiRefId(id);
    if (id === 'agritech' || id === 'exhibition') {
      setLightingPreset('senja');
    } else if (id === 'editorial') {
      setLightingPreset('pagi');
    } else {
      setLightingPreset('siang');
    }
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((playing) => {
      if (!playing && growth >= 0.96) {
        setGrowth(0.02);
        setCameraPreset('full');
        setCameraTrigger((t) => t + 1);
      }
      return !playing;
    });
  }, [growth]);

  const handleChangeGrowth = useCallback((val: number) => {
    setIsPlaying(false);
    setGrowth(val);
  }, []);

  const handleSelectCamera = useCallback((preset: CameraPresetId) => {
    setCameraPreset(preset);
    setCameraTrigger((t) => t + 1);
  }, []);

  const handleSelectPart = useCallback(
    (part: PalmPartId | null) => {
      setSelectedPart(part);
      if (part === 'tandan_buah') {
        handleSelectCamera('fruit');
      } else if (part === 'batang' || part === 'akar') {
        handleSelectCamera('trunk');
      } else if (part === 'pucuk') {
        handleSelectCamera('crown');
      }
    },
    [handleSelectCamera]
  );

  if (viewMode === 'landing') {
    return (
      <LandingPage
        growth={growth}
        onChangeGrowth={handleChangeGrowth}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        cameraPreset={cameraPreset}
        cameraTrigger={cameraTrigger}
        onSelectCamera={handleSelectCamera}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((r) => !r)}
        selectedPart={selectedPart}
        hoveredPart={hoveredPart}
        onSelectPart={handleSelectPart}
        onHoverPart={setHoveredPart}
        onEnterStudioMode={() => {
          setViewMode('studio');
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#f7f2ec]">
      <PalmViewport
        growth={growth}
        renderStyle="voxel"
        cameraPreset={cameraPreset}
        cameraTrigger={cameraTrigger}
        lightingPreset={lightingPreset}
        selectedPart={selectedPart}
        autoRotate={autoRotate}
        onSelectPart={setSelectedPart}
        onHoverPart={setHoveredPart}
      />

      <ModernUIOverlay
        uiRefId={uiRefId}
        onSelectUIRef={handleSelectUIRef}
        renderStyle="voxel"
        onSelectRenderStyle={() => {}}
        growth={growth}
        onChangeGrowth={handleChangeGrowth}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        cameraPreset={cameraPreset}
        onSelectCamera={handleSelectCamera}
        lightingPreset={lightingPreset}
        onSelectLighting={setLightingPreset}
        autoRotate={autoRotate}
        onToggleAutoRotate={() => setAutoRotate((r) => !r)}
        selectedPart={selectedPart}
        hoveredPart={hoveredPart}
        onSelectPart={handleSelectPart}
        dockCollapsed={dockCollapsed}
        onToggleDock={() => setDockCollapsed((c) => !c)}
        onOpenGuide={() => setGuideOpen(true)}
        onBackToLanding={() => setViewMode('landing')}
      />

      <UIReferenceDrawer
        open={guideOpen}
        activeRefId={uiRefId}
        onSelectRef={handleSelectUIRef}
        onClose={() => setGuideOpen(false)}
      />
    </main>
  );
}
