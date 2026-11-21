import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  CameraPresetId,
  LightingPresetId,
  PalmPartId,
  PalmRenderStyle,
} from '../data/palmStages';
import { OilPalmController } from '../three/oilPalmModel';
import { createProceduralTextures } from '../three/proceduralTextures';
import { VoxelPalmController } from '../three/voxelPalmModel';

interface PalmViewportProps {
  growth: number;
  renderStyle: PalmRenderStyle;
  transparentBg?: boolean;
  cameraPreset: CameraPresetId;
  cameraTrigger: number;
  lightingPreset: LightingPresetId;
  selectedPart: PalmPartId | null;
  autoRotate: boolean;
  onSelectPart: (part: PalmPartId | null) => void;
  onHoverPart: (part: PalmPartId | null) => void;
}

const _camGoal = new THREE.Vector3();
const _targetGoal = new THREE.Vector3();
const _bgColorGoal = new THREE.Color();
const _sunColorGoal = new THREE.Color();
const _hemiSkyGoal = new THREE.Color();
const _hemiGroundGoal = new THREE.Color();
const _sunPosGoal = new THREE.Vector3();

const LIGHTING_CONFIGS: Record<
  LightingPresetId,
  {
    bgHex: number;
    voxelBgHex: number;
    sunHex: number;
    sunIntensity: number;
    sunPos: [number, number, number];
    hemiSky: number;
    hemiGround: number;
    hemiIntensity: number;
    rimHex: number;
    rimIntensity: number;
    fogDensity: number;
  }
> = {
  pagi: {
    bgHex: 0xdbe6df,
    voxelBgHex: 0xf7f2ec, // warm pastel cream studio backdrop matching miniature voxel diorama
    sunHex: 0xfff3de,
    sunIntensity: 2.35,
    sunPos: [8, 12, 7],
    hemiSky: 0xd9ecfa,
    hemiGround: 0x7a6a58,
    hemiIntensity: 1.0,
    rimHex: 0xbfe3d6,
    rimIntensity: 0.72,
    fogDensity: 0.015,
  },
  siang: {
    bgHex: 0xe6ece8,
    voxelBgHex: 0xf2f4f2,
    sunHex: 0xfffaf0,
    sunIntensity: 2.6,
    sunPos: [5, 16, 6],
    hemiSky: 0xe2f0ff,
    hemiGround: 0x6f6856,
    hemiIntensity: 1.08,
    rimHex: 0xd4ece2,
    rimIntensity: 0.65,
    fogDensity: 0.013,
  },
  senja: {
    bgHex: 0x1a201d,
    voxelBgHex: 0x181c1a,
    sunHex: 0xffac5c,
    sunIntensity: 2.55,
    sunPos: [-9, 7.5, 6],
    hemiSky: 0x5c768c,
    hemiGround: 0x2b2219,
    hemiIntensity: 0.82,
    rimHex: 0xffca85,
    rimIntensity: 0.9,
    fogDensity: 0.017,
  },
};

export const PalmViewport: React.FC<PalmViewportProps> = ({
  growth,
  renderStyle,
  transparentBg = false,
  cameraPreset,
  cameraTrigger,
  lightingPreset,
  selectedPart,
  autoRotate,
  onSelectPart,
  onHoverPart,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglError, setWebglError] = useState(false);

  const propsRef = useRef({
    growth,
    renderStyle,
    transparentBg,
    cameraPreset,
    cameraTrigger,
    lightingPreset,
    selectedPart,
    autoRotate,
    onSelectPart,
    onHoverPart,
  });
  propsRef.current = {
    growth,
    renderStyle,
    transparentBg,
    cameraPreset,
    cameraTrigger,
    lightingPreset,
    selectedPart,
    autoRotate,
    onSelectPart,
    onHoverPart,
  };

  const presetPendingRef = useRef<{
    trigger: number;
    growthSnapshot: number;
    styleSnapshot: PalmRenderStyle;
    active: boolean;
  }>({
    trigger: cameraTrigger,
    growthSnapshot: growth,
    styleSnapshot: renderStyle,
    active: true,
  });

  useEffect(() => {
    presetPendingRef.current.trigger = cameraTrigger;
    presetPendingRef.current.active = true;
  }, [cameraPreset, cameraTrigger, renderStyle]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      try {
        const probe = document.createElement('canvas').getContext('webgl2');
        if (!probe) return true;
        const ext = probe.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probe.RENDERER;
        const gpu = String(probe.getParameter(param));
        probe.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (propsRef.current.transparentBg) {
      renderer.setClearColor(0x000000, 0);
    }

    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    // Scene & Studio Environment
    const scene = new THREE.Scene();
    const initLight = LIGHTING_CONFIGS[propsRef.current.lightingPreset];
    const startBg =
      propsRef.current.renderStyle === 'voxel' ? initLight.voxelBgHex : initLight.bgHex;
    const fog = new THREE.FogExp2(startBg, initLight.fogDensity);
    if (propsRef.current.transparentBg) {
      scene.background = null;
      scene.fog = null;
    } else {
      scene.background = new THREE.Color(startBg);
      scene.fog = fog;
    }

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    // Camera & OrbitControls (isometric-friendly 38° FOV)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 150);
    camera.position.set(5.0, 3.8, 5.4);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.485;
    controls.minPolarAngle = 0.12;
    controls.minDistance = 0.9;
    controls.maxDistance = 18;
    controls.target.set(0, 2.0, 0);

    let userInteracting = false;
    const onControlStart = () => {
      userInteracting = true;
      presetPendingRef.current.active = false;
    };
    const onControlEnd = () => {
      userInteracting = false;
    };
    controls.addEventListener('start', onControlStart);
    controls.addEventListener('end', onControlEnd);

    // Three-point studio lighting
    const hemiLight = new THREE.HemisphereLight(
      initLight.hemiSky,
      initLight.hemiGround,
      initLight.hemiIntensity
    );
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(initLight.sunHex, initLight.sunIntensity);
    sunLight.position.set(...initLight.sunPos);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 1;
    sunLight.shadow.camera.far = 35;
    const d = 7.5;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(initLight.rimHex, initLight.rimIntensity);
    rimLight.position.set(-7, 6, -8);
    scene.add(rimLight);

    // Textures & Realistic Outdoor Grounds
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextures(maxAniso);

    const realisticEnvGroup = new THREE.Group();
    const groundGeo = new THREE.CircleGeometry(70, 64);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x3b4733,
      map: textures.soilColor,
      bumpMap: textures.soilBump,
      bumpScale: 0.03,
      roughness: 0.96,
      metalness: 0.0,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    realisticEnvGroup.add(groundMesh);

    const ringGeo = new THREE.RingGeometry(1.75, 1.84, 48);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x566446,
      roughness: 0.9,
      metalness: 0.0,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.006;
    ringMesh.receiveShadow = true;
    realisticEnvGroup.add(ringMesh);

    const moundGeo = new THREE.SphereGeometry(2.6, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const moundMat = new THREE.MeshStandardMaterial({
      color: 0x2f432b,
      roughness: 0.92,
      metalness: 0.0,
    });
    const distantMounds = new THREE.InstancedMesh(moundGeo, moundMat, 28);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < 28; i++) {
      const ang = (i / 28) * Math.PI * 2 + (i % 3) * 0.12;
      const dist = 22 + (i % 4) * 5;
      dummy.position.set(Math.cos(ang) * dist, -0.1, Math.sin(ang) * dist);
      const sx = 1.4 + (i % 5) * 0.45;
      const sy = 0.7 + (i % 3) * 0.35;
      dummy.scale.set(sx, sy, sx);
      dummy.updateMatrix();
      distantMounds.setMatrixAt(i, dummy.matrix);
    }
    distantMounds.instanceMatrix.needsUpdate = true;
    distantMounds.computeBoundingSphere();
    realisticEnvGroup.add(distantMounds);
    scene.add(realisticEnvGroup);

    // Clean Studio Shadow-Catching Floor for 3D Pixel Diorama
    const studioShadowGeo = new THREE.PlaneGeometry(40, 40);
    studioShadowGeo.rotateX(-Math.PI / 2);
    const studioShadowMat = new THREE.ShadowMaterial({
      opacity: 0.15,
    });
    const studioShadowMesh = new THREE.Mesh(studioShadowGeo, studioShadowMat);
    studioShadowMesh.position.y = 0.002;
    studioShadowMesh.receiveShadow = true;
    scene.add(studioShadowMesh);

    // Both Palm Models (Seamless Live Switching)
    const realisticPalm = new OilPalmController(textures);
    realisticPalm.setTargetGrowth(propsRef.current.growth);
    scene.add(realisticPalm.root);

    const voxelPalm = new VoxelPalmController();
    voxelPalm.setTargetGrowth(propsRef.current.growth);
    scene.add(voxelPalm.root);

    const syncVisibility = (style: PalmRenderStyle) => {
      const isVoxel = style === 'voxel';
      voxelPalm.root.visible = isVoxel;
      studioShadowMesh.visible = isVoxel;
      realisticPalm.root.visible = !isVoxel;
      realisticEnvGroup.visible = !isVoxel;
    };
    syncVisibility(propsRef.current.renderStyle);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycasting on Layer 1
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverCheck = 0;

    const updateNdc = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const pickPart = (clientX: number, clientY: number): PalmPartId | null => {
      updateNdc(clientX, clientY);
      raycaster.setFromCamera(pointerNdc, camera);
      const targets =
        propsRef.current.renderStyle === 'voxel'
          ? voxelPalm.raycastTargets
          : realisticPalm.raycastTargets;
      const hits = raycaster.intersectObjects(targets, false);
      if (hits.length > 0) {
        return (hits[0].object.userData.partId as PalmPartId) ?? null;
      }
      return null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return;
      const part = pickPart(e.clientX, e.clientY);
      if (part && propsRef.current.renderStyle === 'voxel') {
        voxelPalm.triggerBounce();
      }
      propsRef.current.onSelectPart(part);
    };

    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      const part = pickPart(e.clientX, e.clientY);
      canvas.style.cursor = part ? 'pointer' : 'grab';
      propsRef.current.onHoverPart(part);
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointermove', onPointerMove);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglError(true);
    };
    const onContextRestored = () => {
      setWebglError(false);
    };
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const computeCameraGoals = (
      g: number,
      preset: CameraPresetId,
      style: PalmRenderStyle
    ) => {
      const activeModel = style === 'voxel' ? voxelPalm : realisticPalm;
      const crownY = activeModel.getCrownWorldY();
      const totalH = activeModel.getTotalHeight();

      if (preset === 'fruit') {
        const focusY = Math.max(0.55, crownY - 0.16);
        _targetGoal.set(0, focusY, 0);
        const dist = 1.55 + g * 0.75;
        _camGoal.set(dist * 0.85, focusY + 0.35, dist * 0.85);
      } else if (preset === 'trunk') {
        const focusY = Math.max(0.3, crownY * 0.44);
        _targetGoal.set(0, focusY, 0);
        const dist = 1.8 + g * 2.0;
        _camGoal.set(dist * 0.92, focusY + 0.45, dist * 0.85);
      } else if (preset === 'crown') {
        const focusY = crownY + 0.3 + g * 0.3;
        _targetGoal.set(0, focusY, 0);
        const dist = 1.7 + g * 2.5;
        _camGoal.set(dist * 0.72, focusY + 1.3 + g * 0.9, dist * 0.72);
      } else {
        // Isometric studio hero angle for voxel diorama (or full framing for realistic)
        const midY = style === 'voxel' ? Math.max(0.45, totalH * 0.42) : Math.max(0.32, totalH * 0.44);
        _targetGoal.set(0, midY, 0);
        const minDist = style === 'voxel' ? 3.9 : 1.45;
        const dist = Math.max(minDist, 1.45 + totalH * 1.12);
        _camGoal.set(dist * 0.78, midY + totalH * 0.25 + (style === 'voxel' ? 0.6 : 0), dist * 0.82);
      }
    };

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();
      const current = propsRef.current;

      syncVisibility(current.renderStyle);

      // Update active palm controller
      let isGrowing = false;
      if (current.renderStyle === 'voxel') {
        voxelPalm.setTargetGrowth(current.growth);
        voxelPalm.setHighlightedPart(current.selectedPart);
        isGrowing = voxelPalm.update(elapsed, dt);
      } else {
        realisticPalm.setTargetGrowth(current.growth);
        realisticPalm.setHighlightedPart(current.selectedPart);
        isGrowing = realisticPalm.update(elapsed, dt);
      }

      if (
        Math.abs(current.growth - presetPendingRef.current.growthSnapshot) > 0.025 ||
        current.renderStyle !== presetPendingRef.current.styleSnapshot
      ) {
        presetPendingRef.current.growthSnapshot = current.growth;
        presetPendingRef.current.styleSnapshot = current.renderStyle;
        if (!userInteracting && current.cameraPreset === 'full') {
          presetPendingRef.current.active = true;
        }
      }

      if (presetPendingRef.current.active && !userInteracting) {
        computeCameraGoals(current.growth, current.cameraPreset, current.renderStyle);
        const camLambda = isSoftwareGl ? 18 : 5.2;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _camGoal.x, camLambda, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _camGoal.y, camLambda, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _camGoal.z, camLambda, dt);

        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetGoal.x, camLambda, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetGoal.y, camLambda, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetGoal.z, camLambda, dt);

        if (
          !isGrowing &&
          camera.position.distanceTo(_camGoal) < 0.02 &&
          controls.target.distanceTo(_targetGoal) < 0.02
        ) {
          presetPendingRef.current.active = false;
        }
      }

      const lCfg = LIGHTING_CONFIGS[current.lightingPreset];
      const lightLambda = isSoftwareGl ? 18 : 5.0;
      const targetBgHex = current.renderStyle === 'voxel' ? lCfg.voxelBgHex : lCfg.bgHex;
      if (current.transparentBg) {
        renderer.setClearColor(0x000000, 0);
        scene.background = null;
        scene.fog = null;
      } else {
        renderer.setClearColor(targetBgHex, 1);
        if (!(scene.background instanceof THREE.Color)) {
          scene.background = new THREE.Color(targetBgHex);
        }
        scene.fog = fog;
        _bgColorGoal.setHex(targetBgHex);
        scene.background.lerp(_bgColorGoal, 1 - Math.exp(-lightLambda * dt));
        fog.color.copy(scene.background);
        fog.density = THREE.MathUtils.damp(
          fog.density,
          current.renderStyle === 'voxel' ? lCfg.fogDensity * 0.45 : lCfg.fogDensity,
          lightLambda,
          dt
        );
      }

      _sunColorGoal.setHex(lCfg.sunHex);
      sunLight.color.lerp(_sunColorGoal, 1 - Math.exp(-lightLambda * dt));
      sunLight.intensity = THREE.MathUtils.damp(sunLight.intensity, lCfg.sunIntensity, lightLambda, dt);
      _sunPosGoal.set(...lCfg.sunPos);
      sunLight.position.lerp(_sunPosGoal, 1 - Math.exp(-lightLambda * dt));

      _hemiSkyGoal.setHex(lCfg.hemiSky);
      _hemiGroundGoal.setHex(lCfg.hemiGround);
      hemiLight.color.lerp(_hemiSkyGoal, 1 - Math.exp(-lightLambda * dt));
      hemiLight.groundColor.lerp(_hemiGroundGoal, 1 - Math.exp(-lightLambda * dt));
      hemiLight.intensity = THREE.MathUtils.damp(hemiLight.intensity, lCfg.hemiIntensity, lightLambda, dt);

      rimLight.color.setHex(lCfg.rimHex);
      rimLight.intensity = THREE.MathUtils.damp(rimLight.intensity, lCfg.rimIntensity, lightLambda, dt);

      controls.autoRotate = !isSoftwareGl && current.autoRotate;
      controls.autoRotateSpeed = 0.75;
      controls.update();

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    computeCameraGoals(
      propsRef.current.growth,
      propsRef.current.cameraPreset,
      propsRef.current.renderStyle
    );
    camera.position.copy(_camGoal);
    controls.target.copy(_targetGoal);
    controls.update();

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', onResize);
      controls.removeEventListener('start', onControlStart);
      controls.removeEventListener('end', onControlEnd);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      realisticPalm.dispose();
      voxelPalm.dispose();
      textures.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      moundGeo.dispose();
      moundMat.dispose();
      studioShadowGeo.dispose();
      studioShadowMat.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }
    };
  }, []);

  if (webglError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#18211c] text-[#eef2ef] p-8">
        <div className="max-w-md text-center space-y-3">
          <h2 className="text-xl font-semibold">Tampilan 3D WebGL Tidak Tersedia</h2>
          <p className="text-sm text-[#a6b5ac]">
            Perangkat atau peramban Anda saat ini membatasi konteks WebGL. Silakan aktifkan akselerasi perangkat keras atau muat ulang halaman.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full select-none"
      aria-label="Kanvas 3D Siklus Pertumbuhan Kelapa Sawit"
    />
  );
};
