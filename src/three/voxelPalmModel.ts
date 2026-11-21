import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { PalmPartId } from '../data/palmStages';

// Pre-allocated scratch helpers (zero GC in render loop)
const _dummy = new THREE.Object3D();
const _color = new THREE.Color();
const _zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

const _colTileLight = new THREE.Color(0xf0e9e0);
const _colTileWarm = new THREE.Color(0xe5dcd0);
const _colTileMoss = new THREE.Color(0xd5dccb);
const _colSoilDark = new THREE.Color(0x5b422f);
const _colSoilWarm = new THREE.Color(0x6d5039);

const _colTrunkA = new THREE.Color(0x6e4e37);
const _colTrunkB = new THREE.Color(0x583d2a);
const _colTrunkC = new THREE.Color(0x7e5b41);
const _colRoot = new THREE.Color(0x523927);

const _colBagDark = new THREE.Color(0x23272a);
const _colBagMid = new THREE.Color(0x2f3438);

const _colLeafBright = new THREE.Color(0x72b638);
const _colLeafEmerald = new THREE.Color(0x3f8f3d);
const _colLeafMid = new THREE.Color(0x2d6e35);
const _colLeafDeep = new THREE.Color(0x1f4f28);
const _colSpear = new THREE.Color(0x9be04c);

const _colFruitUnripe = new THREE.Color(0x381533);
const _colFruitMid = new THREE.Color(0x9e1f1c);
const _colFruitRipe = new THREE.Color(0xf25c19);
const _colFruitGold = new THREE.Color(0xf59e0b);

const GOLDEN_ANGLE = 137.507764 * (Math.PI / 180);

const PLINTH_GRID = 14;
const PLINTH_TILE_COUNT = PLINTH_GRID * PLINTH_GRID; // 196 tiles
const GRASS_BLADE_COUNT = 36;
const MAX_TRUNK_BLOCKS = 220;
const MAX_POLYBAG_BLOCKS = 42;
const MAX_FROND_BLOCKS = 1350;
const MAX_SPEAR_BLOCKS = 14;
const MAX_FRUIT_BLOCKS = 216;
const MOTE_COUNT = 22;

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hash2(x: number, z: number): number {
  const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function tagVoxelPart(obj: THREE.Object3D, partId: PalmPartId) {
  obj.userData.partId = partId;
  obj.layers.enable(1);
}

export class VoxelPalmController {
  public readonly root = new THREE.Group();
  public readonly raycastTargets: THREE.Object3D[] = [];

  private currentGrowth = 0.92;
  private targetGrowth = 0.92;
  private highlightedPart: PalmPartId | null = null;
  private bounceVelocity = 0;
  private bounceScale = 1;

  private readonly palmPivot = new THREE.Group();
  private readonly plinthFrameMesh: THREE.Mesh;
  private readonly plinthTilesMesh: THREE.InstancedMesh;
  private readonly grassMesh: THREE.InstancedMesh;
  private readonly polybagMesh: THREE.InstancedMesh;
  private readonly trunkMesh: THREE.InstancedMesh;
  private readonly frondMesh: THREE.InstancedMesh;
  private readonly spearMesh: THREE.InstancedMesh;
  private readonly fruitMesh: THREE.InstancedMesh;
  private readonly motesMesh: THREE.InstancedMesh;

  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly materials: THREE.Material[] = [];
  private readonly partMaterials: Record<PalmPartId, THREE.MeshStandardMaterial[]>;

  constructor() {
    this.partMaterials = {
      akar: [],
      batang: [],
      pelepah: [],
      tandan_buah: [],
      pucuk: [],
    };

    // 1. Isometric Square Tiled Diorama Plinth (inspired by miniature voxel studio pedestals)
    const frameGeo = new RoundedBoxGeometry(3.62, 0.1, 3.62, 2, 0.025);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0xe6dfd6,
      roughness: 0.78,
      metalness: 0.02,
    });
    this.plinthFrameMesh = new THREE.Mesh(frameGeo, frameMat);
    this.plinthFrameMesh.position.y = 0.05;
    this.plinthFrameMesh.receiveShadow = true;
    this.plinthFrameMesh.castShadow = true;
    this.root.add(this.plinthFrameMesh);
    this.geometries.push(frameGeo);
    this.materials.push(frameMat);

    const tileGeo = new RoundedBoxGeometry(0.232, 0.12, 0.232, 2, 0.022);
    const tileMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.72,
      metalness: 0.02,
    });
    this.plinthTilesMesh = new THREE.InstancedMesh(tileGeo, tileMat, PLINTH_TILE_COUNT);
    this.plinthTilesMesh.receiveShadow = true;
    this.plinthTilesMesh.castShadow = true;
    this.plinthTilesMesh.frustumCulled = false;
    tagVoxelPart(this.plinthTilesMesh, 'akar');
    this.root.add(this.plinthTilesMesh);
    this.raycastTargets.push(this.plinthTilesMesh);
    this.geometries.push(tileGeo);
    this.materials.push(tileMat);
    this.partMaterials.akar.push(tileMat);

    // 2. Corner Voxel Grass / Fern Tufts (echoing miniature garden diorama corners)
    const bladeGeo = new RoundedBoxGeometry(0.045, 0.22, 0.045, 1, 0.01);
    bladeGeo.translate(0, 0.11, 0);
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.58,
      metalness: 0.02,
    });
    this.grassMesh = new THREE.InstancedMesh(bladeGeo, bladeMat, GRASS_BLADE_COUNT);
    this.grassMesh.castShadow = true;
    this.grassMesh.frustumCulled = false;
    this.root.add(this.grassMesh);
    this.geometries.push(bladeGeo);
    this.materials.push(bladeMat);

    // Palm Pivot sits on top of plinth tiles (y ~ 0.14)
    this.root.add(this.palmPivot);

    // Shared crisp beveled micro-voxel cube geometry
    const voxelGeo = new RoundedBoxGeometry(1, 1, 1, 2, 0.14);
    this.geometries.push(voxelGeo);

    // 3. Nursery Polybag Voxel Mesh (Part: akar)
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.55,
      metalness: 0.05,
    });
    this.polybagMesh = new THREE.InstancedMesh(voxelGeo, bagMat, MAX_POLYBAG_BLOCKS);
    this.polybagMesh.castShadow = true;
    this.polybagMesh.receiveShadow = true;
    this.polybagMesh.frustumCulled = false;
    tagVoxelPart(this.polybagMesh, 'akar');
    this.palmPivot.add(this.polybagMesh);
    this.raycastTargets.push(this.polybagMesh);
    this.materials.push(bagMat);
    this.partMaterials.akar.push(bagMat);

    // 4. Trunk & Root Buttresses Voxel Mesh (Part: batang)
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.78,
      metalness: 0.02,
    });
    this.trunkMesh = new THREE.InstancedMesh(voxelGeo, trunkMat, MAX_TRUNK_BLOCKS);
    this.trunkMesh.castShadow = true;
    this.trunkMesh.receiveShadow = true;
    this.trunkMesh.frustumCulled = false;
    tagVoxelPart(this.trunkMesh, 'batang');
    this.palmPivot.add(this.trunkMesh);
    this.raycastTargets.push(this.trunkMesh);
    this.materials.push(trunkMat);
    this.partMaterials.batang.push(trunkMat);

    // 5. Pinnate Fronds Voxel Mesh (Part: pelepah)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.48,
      metalness: 0.03,
    });
    this.frondMesh = new THREE.InstancedMesh(voxelGeo, frondMat, MAX_FROND_BLOCKS);
    this.frondMesh.castShadow = true;
    this.frondMesh.receiveShadow = true;
    this.frondMesh.frustumCulled = false;
    tagVoxelPart(this.frondMesh, 'pelepah');
    this.palmPivot.add(this.frondMesh);
    this.raycastTargets.push(this.frondMesh);
    this.materials.push(frondMat);
    this.partMaterials.pelepah.push(frondMat);

    // 6. Central Spear Leaf / Pucuk Voxel Mesh (Part: pucuk)
    const spearMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.42,
      metalness: 0.03,
    });
    this.spearMesh = new THREE.InstancedMesh(voxelGeo, spearMat, MAX_SPEAR_BLOCKS);
    this.spearMesh.castShadow = true;
    this.spearMesh.frustumCulled = false;
    tagVoxelPart(this.spearMesh, 'pucuk');
    this.palmPivot.add(this.spearMesh);
    this.raycastTargets.push(this.spearMesh);
    this.materials.push(spearMat);
    this.partMaterials.pucuk.push(spearMat);

    // 7. Glossy Fruit Bunches / TBS Voxel Mesh (Part: tandan_buah)
    const fruitMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.24, // glossy oily fruit sheen contrast!
      metalness: 0.08,
    });
    this.fruitMesh = new THREE.InstancedMesh(voxelGeo, fruitMat, MAX_FRUIT_BLOCKS);
    this.fruitMesh.castShadow = true;
    this.fruitMesh.receiveShadow = true;
    this.fruitMesh.frustumCulled = false;
    tagVoxelPart(this.fruitMesh, 'tandan_buah');
    this.palmPivot.add(this.fruitMesh);
    this.raycastTargets.push(this.fruitMesh);
    this.materials.push(fruitMat);
    this.partMaterials.tandan_buah.push(fruitMat);

    // 8. Floating Micro-Voxel Motes (sunlit pollen / brondolan sparkle)
    const moteMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.05,
    });
    this.motesMesh = new THREE.InstancedMesh(voxelGeo, moteMat, MOTE_COUNT);
    this.motesMesh.frustumCulled = false;
    this.root.add(this.motesMesh);
    this.materials.push(moteMat);

    this.applyGrowthPose(0);
  }

  public setTargetGrowth(growth: number) {
    this.targetGrowth = clamp01(growth);
  }

  public triggerBounce() {
    this.bounceVelocity = 0.65;
  }

  public setHighlightedPart(part: PalmPartId | null) {
    if (this.highlightedPart === part) return;
    this.highlightedPart = part;
    if (part) {
      this.triggerBounce();
    }

    (Object.keys(this.partMaterials) as PalmPartId[]).forEach((key) => {
      const isSelected = key === part;
      for (const mat of this.partMaterials[key]) {
        mat.emissive.setHex(isSelected ? 0x2f5228 : 0x000000);
        mat.emissiveIntensity = isSelected ? 0.38 : 0.0;
      }
    });
  }

  public getCrownWorldY(): number {
    const g = this.currentGrowth;
    const baseY = g < 0.36 ? 0.42 : 0.16;
    const trunkH = g < 0.24 ? 0 : Math.pow((g - 0.24) / 0.76, 1.15) * 3.85;
    return baseY + trunkH + 0.22;
  }

  public getTotalHeight(): number {
    const g = this.currentGrowth;
    return this.getCrownWorldY() + 0.3 + g * 1.65;
  }

  public update(elapsed: number, dt: number): boolean {
    const prev = this.currentGrowth;
    this.currentGrowth = THREE.MathUtils.damp(this.currentGrowth, this.targetGrowth, 7.5, dt);
    if (Math.abs(this.currentGrowth - this.targetGrowth) < 0.0004) {
      this.currentGrowth = this.targetGrowth;
    }

    // Playful miniature toy spring-bounce
    const force = (1 - this.bounceScale) * 48 - this.bounceVelocity * 9;
    this.bounceVelocity += force * dt;
    this.bounceScale += this.bounceVelocity * dt;
    this.palmPivot.scale.set(
      this.bounceScale,
      2 - this.bounceScale, // subtle squash & stretch volume preservation
      this.bounceScale
    );

    this.applyGrowthPose(elapsed);
    return Math.abs(this.currentGrowth - prev) > 0.0001;
  }

  private applyGrowthPose(elapsed: number) {
    const g = this.currentGrowth;
    const soilReveal = smoothstep(0.3, 0.42, g);

    // --- 1. Plinth Micro-Tiles ---
    let tileIdx = 0;
    const half = (PLINTH_GRID - 1) * 0.5;
    const step = 0.242;
    for (let ix = 0; ix < PLINTH_GRID; ix++) {
      for (let iz = 0; iz < PLINTH_GRID; iz++) {
        const px = (ix - half) * step;
        const pz = (iz - half) * step;
        const hSeed = hash2(ix, iz);
        const distCenter = Math.hypot(px, pz);
        const isSoilPatch = distCenter < 0.72 * soilReveal + 0.18;

        const yJitter = (hSeed - 0.5) * 0.022;
        _dummy.position.set(px, 0.08 + yJitter, pz);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, 1 + (hSeed - 0.5) * 0.18, 1);
        _dummy.updateMatrix();
        this.plinthTilesMesh.setMatrixAt(tileIdx, _dummy.matrix);

        if (isSoilPatch && soilReveal > 0.25) {
          _color.copy(hSeed > 0.45 ? _colSoilDark : _colSoilWarm);
        } else if (hSeed > 0.88) {
          _color.copy(_colTileMoss);
        } else if (hSeed > 0.42) {
          _color.copy(_colTileLight);
        } else {
          _color.copy(_colTileWarm);
        }
        this.plinthTilesMesh.setColorAt(tileIdx, _color);
        tileIdx++;
      }
    }
    this.plinthTilesMesh.instanceMatrix.needsUpdate = true;
    if (this.plinthTilesMesh.instanceColor) this.plinthTilesMesh.instanceColor.needsUpdate = true;

    // --- 2. Corner Voxel Fern Tufts (3 corners of plinth) ---
    const tuftCenters: [number, number][] = [
      [-1.12, 1.05],
      [1.14, 0.92],
      [-0.98, -1.1],
    ];
    for (let i = 0; i < GRASS_BLADE_COUNT; i++) {
      const cluster = tuftCenters[i % 3];
      const localIdx = Math.floor(i / 3);
      const ang = (localIdx / 12) * Math.PI * 2 + (i % 2) * 0.3;
      const sway = Math.sin(elapsed * 1.7 + i * 0.5) * 0.06;
      const rad = 0.05 + (localIdx % 3) * 0.045;

      _dummy.position.set(
        cluster[0] + Math.cos(ang) * rad,
        0.13,
        cluster[1] + Math.sin(ang) * rad
      );
      _dummy.rotation.set(Math.sin(ang) * 0.35 + sway, ang, Math.cos(ang) * 0.25);
      const s = 0.7 + (localIdx % 4) * 0.22;
      _dummy.scale.set(s, s, s);
      _dummy.updateMatrix();
      this.grassMesh.setMatrixAt(i, _dummy.matrix);

      _color.copy(localIdx % 3 === 0 ? _colLeafBright : _colLeafEmerald);
      this.grassMesh.setColorAt(i, _color);
    }
    this.grassMesh.instanceMatrix.needsUpdate = true;
    if (this.grassMesh.instanceColor) this.grassMesh.instanceColor.needsUpdate = true;

    // --- 3. Nursery Polybag (Stages 1-2) ---
    const polybagVis = 1 - smoothstep(0.32, 0.4, g);
    const bagSize = (0.72 + smoothstep(0.0, 0.32, g) * 0.44) * polybagVis;
    let bagIdx = 0;
    const bagLayers = 3;
    const blocksPerRing = 12;
    for (let ly = 0; ly < bagLayers; ly++) {
      for (let b = 0; b < blocksPerRing; b++) {
        if (bagIdx >= MAX_POLYBAG_BLOCKS) break;
        if (polybagVis < 0.02) {
          this.polybagMesh.setMatrixAt(bagIdx++, _zeroMatrix);
          continue;
        }
        const a = (b / blocksPerRing) * Math.PI * 2;
        const r = (0.16 + ly * 0.008) * bagSize;
        _dummy.position.set(Math.cos(a) * r, 0.14 + (ly * 0.095 + 0.05) * bagSize, Math.sin(a) * r);
        _dummy.rotation.set(0, -a, 0);
        _dummy.scale.set(0.105 * bagSize, 0.105 * bagSize, 0.105 * bagSize);
        _dummy.updateMatrix();
        this.polybagMesh.setMatrixAt(bagIdx, _dummy.matrix);
        this.polybagMesh.setColorAt(bagIdx, (b + ly) % 2 === 0 ? _colBagDark : _colBagMid);
        bagIdx++;
      }
    }
    // Soil cap inside polybag
    for (; bagIdx < MAX_POLYBAG_BLOCKS; bagIdx++) {
      if (polybagVis < 0.02) {
        this.polybagMesh.setMatrixAt(bagIdx, _zeroMatrix);
        continue;
      }
      const k = bagIdx - bagLayers * blocksPerRing;
      const a = k * 1.1;
      const r = k === 0 ? 0 : 0.09 * bagSize;
      _dummy.position.set(Math.cos(a) * r, 0.14 + 0.27 * bagSize, Math.sin(a) * r);
      _dummy.rotation.set(0, a, 0);
      _dummy.scale.set(0.11 * bagSize, 0.08 * bagSize, 0.11 * bagSize);
      _dummy.updateMatrix();
      this.polybagMesh.setMatrixAt(bagIdx, _dummy.matrix);
      this.polybagMesh.setColorAt(bagIdx, _colSoilDark);
    }
    this.polybagMesh.instanceMatrix.needsUpdate = true;
    if (this.polybagMesh.instanceColor) this.polybagMesh.instanceColor.needsUpdate = true;

    // Base elevation where stem emerges
    const baseY = THREE.MathUtils.lerp(0.14 + 0.3 * bagSize, 0.14, soilReveal);

    // --- 4. Stepped Voxel Trunk & Flaring Roots ---
    const trunkProgress = smoothstep(0.24, 1.0, g);
    const trunkHeight = Math.pow(trunkProgress, 1.15) * 3.85;
    const trunkThick = 0.65 + smoothstep(0.15, 0.78, g) * 0.55;
    let trunkIdx = 0;

    // Flaring root buttresses (first 32 blocks)
    const rootPresence = smoothstep(0.32, 0.6, g);
    const rootCount = 8;
    for (let r = 0; r < rootCount; r++) {
      const ang = (r / rootCount) * Math.PI * 2 + 0.2;
      for (let seg = 0; seg < 4; seg++) {
        if (trunkIdx >= MAX_TRUNK_BLOCKS) break;
        if (rootPresence < 0.05) {
          this.trunkMesh.setMatrixAt(trunkIdx++, _zeroMatrix);
          continue;
        }
        const dist = (0.16 + seg * 0.11) * trunkThick * rootPresence;
        const ry = baseY + Math.max(0.02, (0.15 - seg * 0.042) * rootPresence);
        const s = (0.125 - seg * 0.018) * trunkThick * rootPresence;
        _dummy.position.set(Math.cos(ang) * dist, ry, Math.sin(ang) * dist);
        _dummy.rotation.set(0, -ang, 0);
        _dummy.scale.set(s, s * 0.9, s * 1.25);
        _dummy.updateMatrix();
        this.trunkMesh.setMatrixAt(trunkIdx, _dummy.matrix);
        this.trunkMesh.setColorAt(trunkIdx, _colRoot);
        trunkIdx++;
      }
    }

    // Core stepped trunk + Fibonacci spiral frond-base collar voxels
    const remainingTrunkSlots = MAX_TRUNK_BLOCKS - trunkIdx;
    const activeTrunkBlocks =
      trunkHeight < 0.08
        ? Math.floor(smoothstep(0.05, 0.3, g) * 6)
        : Math.min(remainingTrunkSlots, Math.max(8, Math.floor((trunkHeight / 3.85) * remainingTrunkSlots)));

    for (let i = 0; i < remainingTrunkSlots; i++) {
      if (i >= activeTrunkBlocks) {
        this.trunkMesh.setMatrixAt(trunkIdx++, _zeroMatrix);
        continue;
      }
      const frac = i / Math.max(1, activeTrunkBlocks - 1);
      const y = baseY + 0.06 + frac * Math.max(0.14, trunkHeight);
      const angle = i * GOLDEN_ANGLE;

      // Stepped spiral offset around trunk core
      const boleFlare = Math.exp(-frac * 6) * 0.07;
      const coreRadius = (0.13 * (1 - frac * 0.18) + boleFlare) * trunkThick;
      const isCore = i % 3 === 0;
      const rOffset = isCore ? 0.02 : coreRadius;

      _dummy.position.set(Math.cos(angle) * rOffset, y, Math.sin(angle) * rOffset);
      _dummy.rotation.set(0, -angle, isCore ? 0 : 0.18);
      const blockSize = isCore
        ? 0.25 * trunkThick * (1 - frac * 0.15)
        : 0.145 * trunkThick * (0.85 + frac * 0.25);
      _dummy.scale.set(blockSize, blockSize * (isCore ? 1.15 : 0.78), blockSize * (isCore ? 1.0 : 1.15));
      _dummy.updateMatrix();
      this.trunkMesh.setMatrixAt(trunkIdx, _dummy.matrix);

      const tone = i % 3;
      _color.copy(tone === 0 ? _colTrunkB : tone === 1 ? _colTrunkA : _colTrunkC);
      this.trunkMesh.setColorAt(trunkIdx, _color);
      trunkIdx++;
    }
    this.trunkMesh.instanceMatrix.needsUpdate = true;
    if (this.trunkMesh.instanceColor) this.trunkMesh.instanceColor.needsUpdate = true;

    const crownY = baseY + Math.max(0.12, trunkHeight) + 0.1;

    // --- 5. Central Spear Leaf / Pucuk (Janur Voxel Spire) ---
    const spearScale = 0.28 + g * 0.85;
    const spearBlocks = Math.round(4 + g * (MAX_SPEAR_BLOCKS - 4));
    const swayX = Math.sin(elapsed * 1.2) * 0.03 * (0.3 + g * 0.7);
    const swayZ = Math.cos(elapsed * 0.95) * 0.025 * (0.3 + g * 0.7);

    for (let s = 0; s < MAX_SPEAR_BLOCKS; s++) {
      if (s >= spearBlocks) {
        this.spearMesh.setMatrixAt(s, _zeroMatrix);
        continue;
      }
      const frac = s / Math.max(1, spearBlocks - 1);
      const sy = crownY + 0.06 + frac * 0.95 * spearScale;
      const sz = (1 - frac * 0.68) * 0.095 * spearScale;
      _dummy.position.set(swayX * frac * 1.8, sy, swayZ * frac * 1.8);
      _dummy.rotation.set(swayZ, frac * 0.4, -swayX);
      _dummy.scale.set(sz, sz * 1.45, sz);
      _dummy.updateMatrix();
      this.spearMesh.setMatrixAt(s, _dummy.matrix);
      this.spearMesh.setColorAt(s, frac > 0.4 ? _colSpear : _colLeafBright);
    }
    this.spearMesh.instanceMatrix.needsUpdate = true;
    if (this.spearMesh.instanceColor) this.spearMesh.instanceColor.needsUpdate = true;

    // --- 6. Stepped Voxel Pinnate Fronds ---
    const frondCount = Math.round(4 + g * 24); // 4 juvenile blades -> 28 full voxel fronds
    const segsPerFrond = 12;
    const pinnateFactor = smoothstep(0.14, 0.36, g);
    let fIdx = 0;

    for (let f = 0; f < 28; f++) {
      if (f >= frondCount) {
        // Zero out remaining blocks allocated to unused fronds cleanly below
        continue;
      }
      const tier = f / Math.max(1, frondCount - 1); // 0 = lower drooping, 1 = upper steep
      const azimuth = f * GOLDEN_ANGLE;
      const frondLen = (0.32 + g * 1.92) * (0.82 + Math.sin(tier * Math.PI * 0.8) * 0.24);
      const baseElev = THREE.MathUtils.lerp(-0.14, 0.92, tier);
      const frondSway = Math.sin(elapsed * 1.35 + f * 0.65) * (0.025 + (1 - tier) * 0.025);
      const elev = baseElev + frondSway;

      const cosA = Math.cos(azimuth);
      const sinA = Math.sin(azimuth);

      for (let s = 0; s < segsPerFrond; s++) {
        const t = (s + 0.5) / segsPerFrond;
        // Parabolic arch outward + gravity droop
        const reach = t * frondLen;
        const archY = Math.sin(elev) * reach - Math.pow(t, 2.05) * (0.32 + (1 - tier) * 0.42) * frondLen * 0.48;
        const horiz = Math.cos(elev) * reach;

        const rx = cosA * (0.1 * g + horiz);
        const rz = sinA * (0.1 * g + horiz);
        const ry = crownY + tier * (0.06 + g * 0.18) + archY;

        // Spine voxel block along rachis
        if (fIdx < MAX_FROND_BLOCKS) {
          const spineSize = (0.05 + g * 0.055) * (1 - t * 0.48);
          _dummy.position.set(rx, ry, rz);
          _dummy.rotation.set(0, -azimuth, 0);
          _dummy.scale.set(spineSize, spineSize, spineSize * 1.5);
          _dummy.updateMatrix();
          this.frondMesh.setMatrixAt(fIdx, _dummy.matrix);
          this.frondMesh.setColorAt(fIdx, t < 0.25 ? _colLeafMid : _colLeafEmerald);
          fIdx++;
        }

        // Clustered micro-voxel leaflet pairs along the frond (gives lush pixel-cloud look!)
        const isJuvenileOnly = pinnateFactor < 0.25 && t < 0.45;
        if (!isJuvenileOnly && t > 0.16 && fIdx + 3 < MAX_FROND_BLOCKS) {
          const envelope = Math.sin(Math.pow((t - 0.12) / 0.88, 0.72) * Math.PI);
          const wingSpread = (0.09 + g * 0.28) * (0.45 + envelope * 0.75);
          const perpX = -sinA;
          const perpZ = cosA;

          for (const side of [-1, 1]) {
            // Inner & outer micro-voxel cluster per side
            const steps = t > 0.25 && t < 0.82 ? 2 : 1;
            for (let k = 0; k < steps; k++) {
              if (fIdx >= MAX_FROND_BLOCKS) break;
              const lateral = side * wingSpread * (0.55 + k * 0.45);
              const droopY = (k === 0 ? 0.035 : -0.025) * (0.4 + g * 0.6);
              const cubeSize = (0.068 + g * 0.072) * (0.55 + envelope * 0.52);

              _dummy.position.set(rx + perpX * lateral, ry + droopY, rz + perpZ * lateral);
              _dummy.rotation.set(
                (k === 1 ? 0.22 : -0.1) * side,
                -azimuth + side * 0.35,
                0
              );
              _dummy.scale.set(cubeSize * 1.25, cubeSize * 0.85, cubeSize * 1.45);
              _dummy.updateMatrix();
              this.frondMesh.setMatrixAt(fIdx, _dummy.matrix);

              // Layered multi-tone green pixel shading (sunlit top -> deeper underside)
              if (tier > 0.65 && k === 0) {
                _color.copy(_colLeafBright);
              } else if ((f + s + k) % 4 === 0) {
                _color.copy(_colLeafDeep);
              } else if (k === 1 || tier > 0.35) {
                _color.copy(_colLeafEmerald);
              } else {
                _color.copy(_colLeafMid);
              }
              this.frondMesh.setColorAt(fIdx, _color);
              fIdx++;
            }
          }
        }
      }
    }
    for (; fIdx < MAX_FROND_BLOCKS; fIdx++) {
      this.frondMesh.setMatrixAt(fIdx, _zeroMatrix);
    }
    this.frondMesh.instanceMatrix.needsUpdate = true;
    if (this.frondMesh.instanceColor) this.frondMesh.instanceColor.needsUpdate = true;

    // --- 7. Glossy Voxel Tandan Buah Segar / TBS (Stages 4-5) ---
    const fruitAppear = smoothstep(0.52, 0.66, g);
    const ripeness = smoothstep(0.62, 0.90, g);
    const bunchCount = fruitAppear < 0.03 ? 0 : Math.min(6, Math.floor(2 + fruitAppear * 4.5));
    const blocksPerBunch = 36;
    let fruitIdx = 0;

    for (let b = 0; b < 6; b++) {
      if (b >= bunchCount) {
        for (let k = 0; k < blocksPerBunch; k++) {
          this.fruitMesh.setMatrixAt(fruitIdx++, _zeroMatrix);
        }
        continue;
      }
      const bAngle = b * GOLDEN_ANGLE * 2.0 + 0.45;
      const bRad = 0.21 * trunkThick;
      const bx = Math.cos(bAngle) * bRad;
      const bz = Math.sin(bAngle) * bRad;
      const by = crownY - 0.14 - (b % 2) * 0.09;
      const bScale = (0.45 + fruitAppear * 0.62) * (0.88 + (b % 3) * 0.07);

      for (let k = 0; k < blocksPerBunch; k++) {
        const phi = Math.acos(1 - (2 * (k + 0.5)) / blocksPerBunch);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;

        const ox = Math.sin(phi) * Math.cos(theta) * 0.125 * bScale;
        const oy = Math.cos(phi) * 0.145 * bScale;
        const oz = Math.sin(phi) * Math.sin(theta) * 0.125 * bScale;

        _dummy.position.set(bx + ox, by + oy, bz + oz);
        _dummy.rotation.set(phi * 0.5, theta, 0);
        const cs = 0.072 * bScale * (0.9 + (k % 3) * 0.12);
        _dummy.scale.set(cs, cs * 1.15, cs);
        _dummy.updateMatrix();
        this.fruitMesh.setMatrixAt(fruitIdx, _dummy.matrix);

        const localRipe = clamp01(ripeness + (b === 0 ? 0.14 : -b * 0.05) + Math.sin(k) * 0.09);
        if (localRipe < 0.45) {
          _color.copy(_colFruitUnripe).lerp(_colFruitMid, localRipe / 0.45);
        } else if (localRipe < 0.85) {
          _color.copy(_colFruitMid).lerp(_colFruitRipe, (localRipe - 0.45) / 0.4);
        } else {
          _color.copy(_colFruitRipe).lerp(_colFruitGold, (localRipe - 0.85) / 0.15);
        }
        this.fruitMesh.setColorAt(fruitIdx, _color);
        fruitIdx++;
      }
    }
    this.fruitMesh.instanceMatrix.needsUpdate = true;
    if (this.fruitMesh.instanceColor) this.fruitMesh.instanceColor.needsUpdate = true;

    // --- 8. Floating Sunlit Micro-Voxel Motes (like floating cherry petals in ref) ---
    for (let m = 0; m < MOTE_COUNT; m++) {
      const baseAngle = m * 1.73 + elapsed * (0.14 + (m % 3) * 0.05);
      const radius = 0.8 + (m % 5) * 0.28;
      const yCycle = ((elapsed * 0.25 + m * 0.37) % 1);
      const my = 0.25 + yCycle * (0.9 + g * 3.2);
      const alphaScale = Math.sin(yCycle * Math.PI) * 0.036;

      _dummy.position.set(Math.cos(baseAngle) * radius, my, Math.sin(baseAngle) * radius);
      _dummy.rotation.set(elapsed + m, elapsed * 0.7, m);
      _dummy.scale.setScalar(Math.max(0.001, alphaScale));
      _dummy.updateMatrix();
      this.motesMesh.setMatrixAt(m, _dummy.matrix);

      // Golden-orange harvest motes when fruiting, fresh spring-green motes when young
      _color.copy(g > 0.56 && m % 2 === 0 ? _colFruitGold : _colLeafBright);
      this.motesMesh.setColorAt(m, _color);
    }
    this.motesMesh.instanceMatrix.needsUpdate = true;
    if (this.motesMesh.instanceColor) this.motesMesh.instanceColor.needsUpdate = true;
  }

  public dispose() {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
