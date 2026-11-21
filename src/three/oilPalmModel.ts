import * as THREE from 'three';
import { PalmPartId } from '../data/palmStages';
import { ProceduralTextureSet } from './proceduralTextures';

// Pre-allocated scratch objects (zero GC in animation loop)
const _dummy = new THREE.Object3D();
const _pos = new THREE.Vector3();
const _dir = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _axisX = new THREE.Vector3(1, 0, 0);
const _axisZ = new THREE.Vector3(0, 0, 1);
const _quatA = new THREE.Quaternion();
const _quatB = new THREE.Quaternion();
const _color = new THREE.Color();
const _colorUnripe = new THREE.Color(0x2b1224);
const _colorMid = new THREE.Color(0x9e2114);
const _colorRipe = new THREE.Color(0xef5b14);
const _zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);

const GOLDEN_ANGLE = 137.507764 * (Math.PI / 180);

// Max pool capacities for InstancedMesh
const MAX_TRUNK_BASES = 180;
const MAX_FRONDS = 36;
const LEAFLETS_PER_FROND = 36; // 18 pairs per frond
const MAX_LEAFLETS = MAX_FRONDS * LEAFLETS_PER_FROND;
const MAX_BUNCHES = 6;
const FRUITS_PER_BUNCH = 44;
const MAX_FRUITS = MAX_BUNCHES * FRUITS_PER_BUNCH;
const MAX_ROOTS = 28;

interface FrondSlot {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  baseRadius: number;
  azimuth: number;
  elevation: number; // angle from horizontal
  length: number;
  droop: number;
  ageFactor: number;
  phase: number;
}

function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Creates a sculpted V-creased lanceolate palm leaflet geometry anchored at base (0,0,0)
 * extending along +Z with a subtle graceful downward arch.
 */
function createLeafletGeometry(): THREE.BufferGeometry {
  const segs = 6;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const z = t; // normalized length 0..1
    // Width profile: narrow petiole base, widest around 25%, sharp pointed tip
    const width = Math.sin(Math.pow(t, 0.62) * Math.PI) * 0.085;
    // Graceful downward arch along length
    const archY = -Math.pow(t, 2.0) * 0.16 + Math.sin(t * Math.PI) * 0.03;
    const vCrease = 0.014 * (1 - t * 0.6);

    // Left edge, central midrib, right edge
    positions.push(-width, archY - vCrease, z);
    uvs.push(0, t);

    positions.push(0, archY + vCrease * 0.7, z);
    uvs.push(0.5, t);

    positions.push(width, archY - vCrease, z);
    uvs.push(1, t);
  }

  for (let i = 0; i < segs; i++) {
    const row = i * 3;
    const next = (i + 1) * 3;
    // Left half
    indices.push(row, next, next + 1);
    indices.push(row, next + 1, row + 1);
    // Right half
    indices.push(row + 1, next + 1, next + 2);
    indices.push(row + 1, next + 2, row + 2);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Creates a beveled diamond petiole base stub (pelepah armor on oil palm trunk).
 */
function createTrunkBaseStubGeometry(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.09);
  shape.lineTo(0.14, 0);
  shape.lineTo(0.08, 0.09);
  shape.lineTo(-0.08, 0.09);
  shape.lineTo(-0.14, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.15,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

/**
 * Creates a LatheGeometry plum-like oil palm fruitlet.
 */
function createFruitletGeometry(): THREE.BufferGeometry {
  const pts: THREE.Vector2[] = [
    new THREE.Vector2(0.0, -0.055),
    new THREE.Vector2(0.026, -0.045),
    new THREE.Vector2(0.036, -0.01),
    new THREE.Vector2(0.031, 0.032),
    new THREE.Vector2(0.015, 0.056),
    new THREE.Vector2(0.0, 0.062),
  ];
  return new THREE.LatheGeometry(pts, 10);
}

/**
 * Creates a gently curved, tapered palm frond rachis along +Z.
 */
function createRachisGeometry(): THREE.BufferGeometry {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0.08, 0.33),
    new THREE.Vector3(0, 0.02, 0.68),
    new THREE.Vector3(0, -0.18, 1.0),
  ]);
  return new THREE.TubeGeometry(curve, 14, 0.018, 6, false);
}

function tagPart(obj: THREE.Object3D, partId: PalmPartId) {
  obj.userData.partId = partId;
  obj.layers.enable(1); // Layer 1 = raycastable palm parts
}

export class OilPalmController {
  public readonly root = new THREE.Group();
  public readonly raycastTargets: THREE.Object3D[] = [];

  private currentGrowth = 0.94;
  private targetGrowth = 0.94;
  private highlightedPart: PalmPartId | null = null;

  // Sub-groups & meshes
  private readonly polybagGroup = new THREE.Group();
  private readonly soilMoundMesh: THREE.Mesh;
  private readonly contactShadowMesh: THREE.Mesh;
  private readonly trunkMesh: THREE.Mesh;
  private readonly boleMesh: THREE.Mesh;
  private readonly crownHeartMesh: THREE.Mesh;
  private readonly spearGroup = new THREE.Group();

  private readonly trunkBasesMesh: THREE.InstancedMesh;
  private readonly leafletsMesh: THREE.InstancedMesh;
  private readonly fruitletsMesh: THREE.InstancedMesh;
  private readonly bunchCoresGroup = new THREE.Group();
  private readonly bunchCoreMeshes: THREE.Mesh[] = [];
  private readonly rootsMesh: THREE.InstancedMesh;

  private readonly frondSlots: FrondSlot[] = [];

  // Materials for highlight feedback & disposal
  private readonly materials: THREE.Material[] = [];
  private readonly geometries: THREE.BufferGeometry[] = [];
  private readonly partMaterials: Record<PalmPartId, THREE.MeshStandardMaterial[]>;

  constructor(textures: ProceduralTextureSet) {
    this.partMaterials = {
      akar: [],
      batang: [],
      pelepah: [],
      tandan_buah: [],
      pucuk: [],
    };

    // --- 1. Soft Contact Shadow Plane ---
    const shadowGeo = new THREE.PlaneGeometry(5.5, 5.5);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
    });
    this.contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.contactShadowMesh.position.y = 0.012;
    this.root.add(this.contactShadowMesh);
    this.geometries.push(shadowGeo);
    this.materials.push(shadowMat);

    // --- 2. Soil Mound & Nursery Polybag (Part: akar) ---
    const soilGeo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0, 0.16),
        new THREE.Vector2(0.45, 0.14),
        new THREE.Vector2(0.95, 0.06),
        new THREE.Vector2(1.45, 0.0),
      ],
      28
    );
    const soilMat = new THREE.MeshStandardMaterial({
      map: textures.soilColor,
      bumpMap: textures.soilBump,
      bumpScale: 0.04,
      roughness: 0.94,
      metalness: 0.0,
    });
    this.soilMoundMesh = new THREE.Mesh(soilGeo, soilMat);
    this.soilMoundMesh.receiveShadow = true;
    this.soilMoundMesh.castShadow = true;
    tagPart(this.soilMoundMesh, 'akar');
    this.root.add(this.soilMoundMesh);
    this.raycastTargets.push(this.soilMoundMesh);
    this.geometries.push(soilGeo);
    this.materials.push(soilMat);
    this.partMaterials.akar.push(soilMat);

    // Pleated Nursery Polybag (Stages 1-2)
    const bagGeo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(0.24, 0.0),
        new THREE.Vector2(0.26, 0.18),
        new THREE.Vector2(0.24, 0.34),
        new THREE.Vector2(0.255, 0.36),
        new THREE.Vector2(0.22, 0.36),
        new THREE.Vector2(0.21, 0.30),
      ],
      20
    );
    const bagMat = new THREE.MeshStandardMaterial({
      map: textures.polybagColor,
      roughness: 0.42,
      metalness: 0.08,
    });
    const bagMesh = new THREE.Mesh(bagGeo, bagMat);
    bagMesh.castShadow = true;
    bagMesh.receiveShadow = true;
    tagPart(bagMesh, 'akar');

    const bagSoilGeo = new THREE.CircleGeometry(0.215, 20);
    bagSoilGeo.rotateX(-Math.PI / 2);
    const bagSoilMesh = new THREE.Mesh(bagSoilGeo, soilMat);
    bagSoilMesh.position.y = 0.31;
    bagSoilMesh.receiveShadow = true;
    tagPart(bagSoilMesh, 'akar');

    this.polybagGroup.add(bagMesh, bagSoilMesh);
    this.root.add(this.polybagGroup);
    this.raycastTargets.push(bagMesh);
    this.geometries.push(bagGeo, bagSoilGeo);
    this.materials.push(bagMat);

    // Fibrous Adventitious Roots (InstancedMesh)
    const rootCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.08, 0),
      new THREE.Vector3(0, 0.07, 0.28),
      new THREE.Vector3(0, -0.02, 0.62),
    ]);
    const rootGeo = new THREE.TubeGeometry(rootCurve, 8, 0.018, 5, false);
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0x6b4e35,
      roughness: 0.88,
      metalness: 0.0,
    });
    this.rootsMesh = new THREE.InstancedMesh(rootGeo, rootMat, MAX_ROOTS);
    this.rootsMesh.castShadow = true;
    this.rootsMesh.frustumCulled = false;
    tagPart(this.rootsMesh, 'akar');
    this.root.add(this.rootsMesh);
    this.raycastTargets.push(this.rootsMesh);
    this.geometries.push(rootGeo);
    this.materials.push(rootMat);
    this.partMaterials.akar.push(rootMat);

    // --- 3. Sculpted Trunk & Swollen Bole (Part: batang) ---
    const trunkProfile: THREE.Vector2[] = [];
    const tSteps = 16;
    for (let i = 0; i <= tSteps; i++) {
      const t = i / tSteps;
      // Swollen basal bole at t=0..0.15, gentle taper toward crown, slight flare below crown
      const bole = Math.exp(-t * 10) * 0.14;
      const taper = 0.24 * (1 - t * 0.22);
      const crownFlare = Math.pow(t, 4) * 0.03;
      trunkProfile.push(new THREE.Vector2(taper + bole + crownFlare, t));
    }
    const trunkGeo = new THREE.LatheGeometry(trunkProfile, 20);
    const trunkMat = new THREE.MeshStandardMaterial({
      map: textures.barkColor,
      bumpMap: textures.barkBump,
      bumpScale: 0.035,
      roughness: 0.9,
      metalness: 0.0,
    });
    this.trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    this.trunkMesh.castShadow = true;
    this.trunkMesh.receiveShadow = true;
    tagPart(this.trunkMesh, 'batang');
    this.root.add(this.trunkMesh);
    this.raycastTargets.push(this.trunkMesh);
    this.geometries.push(trunkGeo);
    this.materials.push(trunkMat);
    this.partMaterials.batang.push(trunkMat);

    // Basal bole (visible from nursery stage onwards)
    const boleGeo = new THREE.LatheGeometry(
      [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(0.32, 0.02),
        new THREE.Vector2(0.28, 0.25),
        new THREE.Vector2(0.18, 0.45),
        new THREE.Vector2(0.0, 0.52),
      ],
      16
    );
    this.boleMesh = new THREE.Mesh(boleGeo, trunkMat);
    this.boleMesh.castShadow = true;
    tagPart(this.boleMesh, 'batang');
    this.root.add(this.boleMesh);
    this.raycastTargets.push(this.boleMesh);
    this.geometries.push(boleGeo);

    // Spiral Diamond Persistent Frond-Base Stubs (InstancedMesh)
    const stubGeo = createTrunkBaseStubGeometry();
    const stubMat = new THREE.MeshStandardMaterial({
      color: 0x5c4734,
      map: textures.barkColor,
      bumpMap: textures.barkBump,
      bumpScale: 0.02,
      roughness: 0.86,
      metalness: 0.02,
    });
    this.trunkBasesMesh = new THREE.InstancedMesh(stubGeo, stubMat, MAX_TRUNK_BASES);
    this.trunkBasesMesh.castShadow = true;
    this.trunkBasesMesh.receiveShadow = true;
    this.trunkBasesMesh.frustumCulled = false;
    tagPart(this.trunkBasesMesh, 'batang');
    this.root.add(this.trunkBasesMesh);
    this.raycastTargets.push(this.trunkBasesMesh);
    this.geometries.push(stubGeo);
    this.materials.push(stubMat);
    this.partMaterials.batang.push(stubMat);

    // --- 4. Crown Heart & Central Spear Leaf / Pucuk (Part: pucuk) ---
    const heartGeo = new THREE.SphereGeometry(0.26, 14, 12);
    const heartMat = new THREE.MeshStandardMaterial({
      color: 0x4b7433,
      roughness: 0.72,
      metalness: 0.0,
    });
    this.crownHeartMesh = new THREE.Mesh(heartGeo, heartMat);
    this.crownHeartMesh.castShadow = true;
    tagPart(this.crownHeartMesh, 'pucuk');
    this.root.add(this.crownHeartMesh);
    this.raycastTargets.push(this.crownHeartMesh);
    this.geometries.push(heartGeo);
    this.materials.push(heartMat);
    this.partMaterials.pucuk.push(heartMat);

    // Spear leaves (Daun Tombak / Janur)
    const spearGeo = new THREE.ConeGeometry(0.032, 1.35, 7);
    spearGeo.translate(0, 0.675, 0);
    const spearMat = new THREE.MeshStandardMaterial({
      color: 0x7cb342, // bright young lime-green spear
      roughness: 0.48,
      metalness: 0.04,
    });
    const spear1 = new THREE.Mesh(spearGeo, spearMat);
    spear1.rotation.z = 0.06;
    spear1.castShadow = true;
    tagPart(spear1, 'pucuk');

    const spear2 = new THREE.Mesh(spearGeo, spearMat);
    spear2.scale.set(0.75, 0.68, 0.75);
    spear2.rotation.z = -0.09;
    spear2.rotation.x = 0.08;
    spear2.castShadow = true;
    tagPart(spear2, 'pucuk');

    this.spearGroup.add(spear1, spear2);
    this.root.add(this.spearGroup);
    this.raycastTargets.push(spear1, spear2);
    this.geometries.push(spearGeo);
    this.materials.push(spearMat);
    this.partMaterials.pucuk.push(spearMat);

    // --- 5. Pinnate Fronds: Rachis Ribs & Instanced Leaflets (Part: pelepah) ---
    const rachisGeo = createRachisGeometry();
    const rachisMat = new THREE.MeshStandardMaterial({
      color: 0x4b7c32,
      roughness: 0.65,
      metalness: 0.02,
    });
    this.geometries.push(rachisGeo);
    this.materials.push(rachisMat);
    this.partMaterials.pelepah.push(rachisMat);

    for (let i = 0; i < MAX_FRONDS; i++) {
      const mesh = new THREE.Mesh(rachisGeo, rachisMat);
      mesh.castShadow = true;
      tagPart(mesh, 'pelepah');
      this.root.add(mesh);
      this.raycastTargets.push(mesh);

      this.frondSlots.push({
        mesh,
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0.08, 0.33),
          new THREE.Vector3(0, 0.02, 0.68),
          new THREE.Vector3(0, -0.18, 1.0),
        ]),
        baseRadius: 0.15,
        azimuth: i * GOLDEN_ANGLE,
        elevation: 0.4,
        length: 1.0,
        droop: 0.2,
        ageFactor: i / MAX_FRONDS,
        phase: i * 0.73,
      });
    }

    const leafletGeo = createLeafletGeometry();
    const leafletMat = new THREE.MeshStandardMaterial({
      map: textures.leafletColor,
      color: 0xffffff,
      roughness: 0.46,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });
    this.leafletsMesh = new THREE.InstancedMesh(leafletGeo, leafletMat, MAX_LEAFLETS);
    this.leafletsMesh.castShadow = true;
    this.leafletsMesh.receiveShadow = true;
    this.leafletsMesh.frustumCulled = false;
    tagPart(this.leafletsMesh, 'pelepah');
    this.root.add(this.leafletsMesh);
    this.raycastTargets.push(this.leafletsMesh);
    this.geometries.push(leafletGeo);
    this.materials.push(leafletMat);
    this.partMaterials.pelepah.push(leafletMat);

    // --- 6. Fresh Fruit Bunches / TBS (Part: tandan_buah) ---
    const coreGeo = new THREE.SphereGeometry(0.14, 10, 10);
    coreGeo.scale(1.0, 1.25, 1.0);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x3b2a1c,
      roughness: 0.85,
      metalness: 0.0,
    });
    this.geometries.push(coreGeo);
    this.materials.push(coreMat);
    this.partMaterials.tandan_buah.push(coreMat);

    for (let b = 0; b < MAX_BUNCHES; b++) {
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.castShadow = true;
      tagPart(coreMesh, 'tandan_buah');
      this.bunchCoresGroup.add(coreMesh);
      this.bunchCoreMeshes.push(coreMesh);
      this.raycastTargets.push(coreMesh);
    }
    this.root.add(this.bunchCoresGroup);

    const fruitletGeo = createFruitletGeometry();
    const fruitletMat = new THREE.MeshStandardMaterial({
      color: 0xffffff, // tinted per-instance via setColorAt
      roughness: 0.24, // glossy oily fruit skin contrast vs 0.90 bark!
      metalness: 0.08,
    });
    this.fruitletsMesh = new THREE.InstancedMesh(fruitletGeo, fruitletMat, MAX_FRUITS);
    this.fruitletsMesh.castShadow = true;
    this.fruitletsMesh.receiveShadow = true;
    this.fruitletsMesh.frustumCulled = false;
    tagPart(this.fruitletsMesh, 'tandan_buah');
    this.root.add(this.fruitletsMesh);
    this.raycastTargets.push(this.fruitletsMesh);
    this.geometries.push(fruitletGeo);
    this.materials.push(fruitletMat);
    this.partMaterials.tandan_buah.push(fruitletMat);

    // Initialize in mature state or target state
    this.applyGrowthPose(0);
  }

  public setTargetGrowth(growth: number) {
    this.targetGrowth = clamp01(growth);
  }

  public setHighlightedPart(part: PalmPartId | null) {
    if (this.highlightedPart === part) return;
    this.highlightedPart = part;

    (Object.keys(this.partMaterials) as PalmPartId[]).forEach((key) => {
      const isSelected = key === part;
      for (const mat of this.partMaterials[key]) {
        mat.emissive.setHex(isSelected ? 0x2c4a24 : 0x000000);
        mat.emissiveIntensity = isSelected ? 0.45 : 0.0;
      }
    });
  }

  public getCrownWorldY(): number {
    return this.crownHeartMesh.position.y;
  }

  public getTotalHeight(): number {
    const g = this.currentGrowth;
    const baseY = g < 0.34 ? 0.31 : 0.12;
    const trunkH = g < 0.25 ? 0 : Math.pow((g - 0.25) / 0.75, 1.15) * 4.4;
    const frondReach = 0.22 + g * 2.1;
    return baseY + trunkH + frondReach;
  }

  public update(elapsed: number, dt: number): boolean {
    const prev = this.currentGrowth;
    const lambda = 7.5;
    this.currentGrowth = THREE.MathUtils.damp(this.currentGrowth, this.targetGrowth, lambda, dt);
    const settled = Math.abs(this.currentGrowth - this.targetGrowth) < 0.0004;
    if (settled) {
      this.currentGrowth = this.targetGrowth;
    }

    this.applyGrowthPose(elapsed);
    return Math.abs(this.currentGrowth - prev) > 0.0001;
  }

  private applyGrowthPose(elapsed: number) {
    const g = this.currentGrowth;

    // 1. Nursery Polybag vs Ground Mound Transition
    const polybagPresence = 1 - smoothstep(0.32, 0.40, g);
    const polybagScale = (0.78 + smoothstep(0.0, 0.32, g) * 0.48) * polybagPresence;
    this.polybagGroup.visible = polybagPresence > 0.01;
    this.polybagGroup.scale.setScalar(Math.max(0.001, polybagScale));

    const groundPresence = smoothstep(0.28, 0.40, g);
    const soilScale = 0.35 + groundPresence * (0.65 + g * 0.45);
    this.soilMoundMesh.scale.set(soilScale, 0.4 + groundPresence * 0.75, soilScale);
    this.soilMoundMesh.visible = groundPresence > 0.02;

    // Contact shadow grows cleanly with canopy
    const shadowScale = 0.22 + g * 0.92;
    this.contactShadowMesh.scale.setScalar(shadowScale);

    // Base Y where plant meets soil
    const bagTopY = 0.31 * polybagScale;
    const moundTopY = 0.14 * (0.4 + groundPresence * 0.75);
    const baseY = THREE.MathUtils.lerp(bagTopY, moundTopY, groundPresence);

    // 2. Trunk & Basal Bole
    const trunkProgress = smoothstep(0.26, 1.0, g);
    const trunkHeight = Math.pow(trunkProgress, 1.15) * 4.45;
    const trunkRadiusScale = 0.45 + smoothstep(0.2, 0.78, g) * 0.65;

    this.trunkMesh.visible = trunkHeight > 0.05;
    this.trunkMesh.position.y = baseY;
    this.trunkMesh.scale.set(trunkRadiusScale, Math.max(0.001, trunkHeight), trunkRadiusScale);

    const boleScale = 0.25 + smoothstep(0.05, 0.45, g) * 0.85;
    this.boleMesh.position.y = baseY - 0.04;
    this.boleMesh.scale.set(boleScale, boleScale * 0.9, boleScale);

    const crownY = baseY + trunkHeight + 0.08 * boleScale;

    // 3. Fibrous Roots (visible after transplanting)
    const rootAlpha = smoothstep(0.34, 0.65, g);
    for (let i = 0; i < MAX_ROOTS; i++) {
      if (rootAlpha < 0.05) {
        this.rootsMesh.setMatrixAt(i, _zeroMatrix);
        continue;
      }
      const angle = (i / MAX_ROOTS) * Math.PI * 2 + (i % 3) * 0.18;
      const rScale = (0.45 + (i % 4) * 0.15) * rootAlpha * (0.6 + g * 0.55);
      _dummy.position.set(
        Math.cos(angle) * 0.16 * trunkRadiusScale,
        baseY + 0.02,
        Math.sin(angle) * 0.16 * trunkRadiusScale
      );
      _dummy.rotation.set(0, -angle + Math.PI / 2, 0);
      _dummy.scale.set(rScale * 0.7, rScale * 0.7, rScale);
      _dummy.updateMatrix();
      this.rootsMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.rootsMesh.instanceMatrix.needsUpdate = true;

    // 4. Spiral Diamond Trunk Base Stubs
    const activeStubs = Math.floor(smoothstep(0.30, 0.98, g) * MAX_TRUNK_BASES);
    for (let i = 0; i < MAX_TRUNK_BASES; i++) {
      if (i >= activeStubs || trunkHeight < 0.18) {
        this.trunkBasesMesh.setMatrixAt(i, _zeroMatrix);
        continue;
      }
      const frac = i / Math.max(1, activeStubs);
      const y = baseY + 0.08 + frac * Math.max(0.05, trunkHeight - 0.06);
      // Taper matches trunk profile
      const bole = Math.exp(-frac * 10) * 0.14;
      const taper = 0.24 * (1 - frac * 0.22);
      const r = (taper + bole) * trunkRadiusScale;
      const angle = i * GOLDEN_ANGLE;

      _dummy.position.set(Math.cos(angle) * r, y, Math.sin(angle) * r);
      _dummy.rotation.set(0, -angle + Math.PI / 2, 0);
      _dummy.rotateX(-0.28 - frac * 0.18); // angled slightly upward like real cut frond bases
      const s = (0.62 + frac * 0.35) * trunkRadiusScale;
      _dummy.scale.set(s, s, s * (0.75 + frac * 0.35));
      _dummy.updateMatrix();
      this.trunkBasesMesh.setMatrixAt(i, _dummy.matrix);
    }
    this.trunkBasesMesh.instanceMatrix.needsUpdate = true;

    // 5. Crown Heart & Central Spear Leaf (Pucuk)
    const heartScale = 0.2 + g * 0.9;
    this.crownHeartMesh.position.set(0, crownY + 0.06, 0);
    this.crownHeartMesh.scale.setScalar(heartScale);

    const spearScale = 0.22 + g * 0.95;
    const windSwayX = Math.sin(elapsed * 1.1) * 0.025 * (0.3 + g * 0.7);
    const windSwayZ = Math.cos(elapsed * 0.85) * 0.02 * (0.3 + g * 0.7);
    this.spearGroup.position.set(0, crownY + 0.08, 0);
    this.spearGroup.scale.setScalar(spearScale);
    this.spearGroup.rotation.set(windSwayX, 0, windSwayZ);

    // 6. Pinnate Fronds & Leaflets
    const activeFronds = Math.round(3 + g * (MAX_FRONDS - 3));
    const pinnateSplit = smoothstep(0.14, 0.35, g); // 0 = juvenile lanceolate, 1 = full pinnate leaflets
    let leafletIdx = 0;

    for (let f = 0; f < MAX_FRONDS; f++) {
      const slot = this.frondSlots[f];
      if (f >= activeFronds) {
        slot.mesh.visible = false;
        for (let l = 0; l < LEAFLETS_PER_FROND; l++) {
          this.leafletsMesh.setMatrixAt(leafletIdx++, _zeroMatrix);
        }
        continue;
      }

      slot.mesh.visible = true;
      // Tier from 0 (outer/lower older frond) to 1 (inner/upper younger frond)
      const tier = f / Math.max(1, activeFronds - 1);
      const frondLength = (0.28 + g * 2.25) * (0.82 + Math.sin(tier * Math.PI * 0.85) * 0.22);
      const frondThickness = 0.3 + g * 0.95;

      // Natural elevation: lower fronds arch outward/downward, upper fronds stand steeper
      const baseElev = THREE.MathUtils.lerp(-0.18, 0.95, tier);
      const sway = Math.sin(elapsed * 1.35 + slot.phase) * (0.025 + (1 - tier) * 0.025);
      const elev = baseElev + sway;
      const azimuth = slot.azimuth;

      const crownOffsetR = (0.04 + g * 0.18) * (1 - tier * 0.6);
      const startY = crownY + tier * (0.05 + g * 0.24);

      slot.mesh.position.set(
        Math.cos(azimuth) * crownOffsetR,
        startY,
        Math.sin(azimuth) * crownOffsetR
      );

      // Orient frond along azimuth (+Z local points outward)
      slot.mesh.rotation.set(0, -azimuth + Math.PI / 2, 0);
      slot.mesh.rotateX(-elev);
      slot.mesh.scale.set(frondThickness, frondThickness * (1.15 - tier * 0.25), frondLength);

      // Update world matrix of rachis to position instanced leaflets cleanly along the curve
      slot.mesh.updateMatrix();

      // Distribute leaflets along the curved rachis
      const pairCount = LEAFLETS_PER_FROND / 2;
      for (let p = 0; p < pairCount; p++) {
        // Start leaflets past the spiny petiole base (t = 0.16..0.98)
        const t = 0.16 + (p / (pairCount - 1)) * 0.82;
        // In seedling stage (pinnateSplit < 0.3), only render tip pairs as broad juvenile leaves
        const isJuvenileLeaf = pinnateSplit < 0.25 && p < pairCount - 2;

        if (isJuvenileLeaf) {
          this.leafletsMesh.setMatrixAt(leafletIdx++, _zeroMatrix);
          this.leafletsMesh.setMatrixAt(leafletIdx++, _zeroMatrix);
          continue;
        }

        slot.curve.getPoint(t, _pos);
        slot.curve.getTangent(t, _dir).normalize();

        // Transform local rachis point into palm root space
        _pos.applyMatrix4(slot.mesh.matrix);

        // Leaflet size envelope: longest in the middle of the frond, tapering at base & tip
        const envelope = Math.sin(Math.pow((t - 0.12) / 0.88, 0.78) * Math.PI);
        const leafletLen =
          (0.14 + g * 0.56) * (0.45 + envelope * 0.75) * (0.55 + pinnateSplit * 0.45);
        const leafletWidth = THREE.MathUtils.lerp(1.55, 0.92, pinnateSplit);

        // Left (-1) and Right (+1) leaflet in V-trough orientation
        for (const side of [-1, 1]) {
          _dummy.position.copy(_pos);
          // Base orientation aligned with frond azimuth & elevation
          _dummy.rotation.set(0, -azimuth + Math.PI / 2, 0);
          _dummy.rotateX(-elev);

          // Fan outward along rachis + slight upward V angle
          const fanAngle = side * (0.78 - t * 0.36);
          const vTilt = 0.32 + (p % 2) * 0.12; // double-ranked oil palm leaflet insertion!
          _dummy.rotateY(fanAngle);
          _dummy.rotateX(-vTilt + (1 - tier) * 0.18);

          _dummy.scale.set(
            leafletWidth * (0.5 + g * 0.65),
            0.7 + g * 0.4,
            leafletLen
          );
          _dummy.updateMatrix();
          this.leafletsMesh.setMatrixAt(leafletIdx, _dummy.matrix);

          // Subtle natural chlorophyll tint variation
          _color.setHSL(
            0.27 + (tier * 0.03) - (1 - pinnateSplit) * 0.02,
            0.48 + tier * 0.12,
            0.26 + tier * 0.08 + (p % 3) * 0.015
          );
          this.leafletsMesh.setColorAt(leafletIdx, _color);
          leafletIdx++;
        }
      }
    }
    this.leafletsMesh.instanceMatrix.needsUpdate = true;
    if (this.leafletsMesh.instanceColor) {
      this.leafletsMesh.instanceColor.needsUpdate = true;
    }

    // 7. Fresh Fruit Bunches (Tandan Buah Segar / TBS) — Stages 4 & 5 (g >= 0.52)
    const fruitAppear = smoothstep(0.52, 0.66, g);
    const ripeness = smoothstep(0.62, 0.90, g); // 0 = dark violet-black unripe, 1 = vivid vermilion-orange ripe
    const activeBunches = fruitAppear < 0.02 ? 0 : Math.min(MAX_BUNCHES, Math.floor(2 + fruitAppear * 4.5));

    let fruitIdx = 0;
    for (let b = 0; b < MAX_BUNCHES; b++) {
      const coreMesh = this.bunchCoreMeshes[b];
      if (b >= activeBunches) {
        coreMesh.visible = false;
        for (let k = 0; k < FRUITS_PER_BUNCH; k++) {
          this.fruitletsMesh.setMatrixAt(fruitIdx++, _zeroMatrix);
        }
        continue;
      }

      coreMesh.visible = true;
      const bAngle = b * GOLDEN_ANGLE * 2.0 + 0.5;
      const bRadius = 0.24 * trunkRadiusScale;
      const bY = crownY - 0.14 - (b % 2) * 0.11;
      const bx = Math.cos(bAngle) * bRadius;
      const bz = Math.sin(bAngle) * bRadius;
      const bScale = (0.42 + fruitAppear * 0.68) * (0.85 + (b % 3) * 0.08);

      coreMesh.position.set(bx, bY, bz);
      coreMesh.scale.setScalar(bScale);

      // Place fruitlets densely around the ellipsoidal bunch core
      for (let k = 0; k < FRUITS_PER_BUNCH; k++) {
        const phi = Math.acos(1 - (2 * (k + 0.5)) / FRUITS_PER_BUNCH);
        const theta = Math.PI * (1 + Math.sqrt(5)) * k;

        const ox = Math.sin(phi) * Math.cos(theta) * 0.145 * bScale;
        const oy = Math.cos(phi) * 0.18 * bScale;
        const oz = Math.sin(phi) * Math.sin(theta) * 0.145 * bScale;

        _dummy.position.set(bx + ox, bY + oy, bz + oz);
        _pos.set(ox, oy, oz).normalize();
        _quatA.setFromUnitVectors(_up, _pos);
        _dummy.quaternion.copy(_quatA);
        const fScale = bScale * (0.88 + (k % 4) * 0.08);
        _dummy.scale.setScalar(fScale);
        _dummy.updateMatrix();
        this.fruitletsMesh.setMatrixAt(fruitIdx, _dummy.matrix);

        // Fruit color: unripe dark plum-violet -> ripening crimson -> vibrant palm oil orange-red
        const localRipe = clamp01(ripeness + (b === 0 ? 0.12 : -b * 0.05) + Math.sin(k) * 0.08);
        if (localRipe < 0.45) {
          _color.copy(_colorUnripe).lerp(_colorMid, localRipe / 0.45);
        } else {
          _color.copy(_colorMid).lerp(_colorRipe, (localRipe - 0.45) / 0.55);
        }
        this.fruitletsMesh.setColorAt(fruitIdx, _color);
        fruitIdx++;
      }
    }
    this.fruitletsMesh.instanceMatrix.needsUpdate = true;
    if (this.fruitletsMesh.instanceColor) {
      this.fruitletsMesh.instanceColor.needsUpdate = true;
    }

    // Keep unused scratch refs referenced to satisfy strict checks
    void _axisX;
    void _axisZ;
    void _quatB;
  }

  public dispose() {
    for (const g of this.geometries) g.dispose();
    for (const m of this.materials) m.dispose();
  }
}
