import * as THREE from 'three';

export interface ProceduralTextureSet {
  soilColor: THREE.CanvasTexture;
  soilBump: THREE.CanvasTexture;
  barkColor: THREE.CanvasTexture;
  barkBump: THREE.CanvasTexture;
  leafletColor: THREE.CanvasTexture;
  polybagColor: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function createCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

export function createProceduralTextures(maxAnisotropy: number): ProceduralTextureSet {
  // 1. Tropical laterite soil & organic mulch
  const [soilC, soilCtx] = createCanvas(512, 512);
  soilCtx.fillStyle = '#4a3525';
  soilCtx.fillRect(0, 0, 512, 512);

  const [soilBC, soilBCtx] = createCanvas(512, 512);
  soilBCtx.fillStyle = '#808080';
  soilBCtx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 6500; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 0.8 + Math.random() * 3.2;
    const tone = Math.random();
    if (tone < 0.45) {
      soilCtx.fillStyle = 'rgba(56, 38, 25, 0.55)';
      soilBCtx.fillStyle = 'rgba(60, 60, 60, 0.5)';
    } else if (tone < 0.85) {
      soilCtx.fillStyle = 'rgba(98, 70, 44, 0.45)';
      soilBCtx.fillStyle = 'rgba(185, 185, 185, 0.45)';
    } else {
      // small organic twig / moss fleck
      soilCtx.fillStyle = 'rgba(72, 86, 46, 0.4)';
      soilBCtx.fillStyle = 'rgba(215, 215, 215, 0.5)';
    }
    soilCtx.beginPath();
    soilCtx.arc(x, y, r, 0, Math.PI * 2);
    soilCtx.fill();

    soilBCtx.beginPath();
    soilBCtx.arc(x, y, r, 0, Math.PI * 2);
    soilBCtx.fill();
  }

  const soilColor = new THREE.CanvasTexture(soilC);
  soilColor.colorSpace = THREE.SRGBColorSpace;
  soilColor.wrapS = THREE.RepeatWrapping;
  soilColor.wrapT = THREE.RepeatWrapping;
  soilColor.repeat.set(4, 4);
  soilColor.anisotropy = maxAnisotropy;

  const soilBump = new THREE.CanvasTexture(soilBC);
  soilBump.wrapS = THREE.RepeatWrapping;
  soilBump.wrapT = THREE.RepeatWrapping;
  soilBump.repeat.set(4, 4);

  // 2. Fibrous palm trunk bark + diamond leaf-scar shading
  const [barkC, barkCtx] = createCanvas(512, 512);
  barkCtx.fillStyle = '#5a4636';
  barkCtx.fillRect(0, 0, 512, 512);

  const [barkBC, barkBCtx] = createCanvas(512, 512);
  barkBCtx.fillStyle = '#7c7c7c';
  barkBCtx.fillRect(0, 0, 512, 512);

  // Vertical fibrous streaks
  for (let i = 0; i < 1600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const h = 10 + Math.random() * 44;
    const dark = Math.random() > 0.5;
    barkCtx.strokeStyle = dark ? 'rgba(42, 31, 22, 0.45)' : 'rgba(116, 94, 72, 0.35)';
    barkCtx.lineWidth = 1 + Math.random() * 1.8;
    barkCtx.beginPath();
    barkCtx.moveTo(x, y);
    barkCtx.lineTo(x + (Math.random() - 0.5) * 4, y + h);
    barkCtx.stroke();

    barkBCtx.strokeStyle = dark ? 'rgba(40,40,40,0.5)' : 'rgba(205,205,205,0.45)';
    barkBCtx.lineWidth = 1.5;
    barkBCtx.beginPath();
    barkBCtx.moveTo(x, y);
    barkBCtx.lineTo(x, y + h);
    barkBCtx.stroke();
  }

  // Subtle horizontal ring indentations
  for (let y = 0; y < 512; y += 28) {
    barkCtx.fillStyle = 'rgba(35, 25, 18, 0.28)';
    barkCtx.fillRect(0, y, 512, 5);
    barkBCtx.fillStyle = 'rgba(45, 45, 45, 0.5)';
    barkBCtx.fillRect(0, y, 512, 6);
  }

  const barkColor = new THREE.CanvasTexture(barkC);
  barkColor.colorSpace = THREE.SRGBColorSpace;
  barkColor.wrapS = THREE.RepeatWrapping;
  barkColor.wrapT = THREE.RepeatWrapping;
  barkColor.repeat.set(2, 4);
  barkColor.anisotropy = maxAnisotropy;

  const barkBump = new THREE.CanvasTexture(barkBC);
  barkBump.wrapS = THREE.RepeatWrapping;
  barkBump.wrapT = THREE.RepeatWrapping;
  barkBump.repeat.set(2, 4);

  // 3. Palm leaflet venation texture
  const [leafC, leafCtx] = createCanvas(256, 256);
  const grad = leafCtx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#2c6b2f');
  grad.addColorStop(0.48, '#3f8a3c');
  grad.addColorStop(0.5, '#68ad49'); // central midrib highlight
  grad.addColorStop(0.52, '#3c8439');
  grad.addColorStop(1, '#265d28');
  leafCtx.fillStyle = grad;
  leafCtx.fillRect(0, 0, 256, 256);

  // Fine longitudinal veins
  leafCtx.strokeStyle = 'rgba(255, 255, 210, 0.08)';
  leafCtx.lineWidth = 1;
  for (let x = 8; x < 256; x += 9) {
    leafCtx.beginPath();
    leafCtx.moveTo(x, 0);
    leafCtx.lineTo(x, 256);
    leafCtx.stroke();
  }

  const leafletColor = new THREE.CanvasTexture(leafC);
  leafletColor.colorSpace = THREE.SRGBColorSpace;
  leafletColor.anisotropy = maxAnisotropy;

  // 4. Nursery HDPE Polybag texture
  const [bagC, bagCtx] = createCanvas(256, 256);
  bagCtx.fillStyle = '#1b1d1f';
  bagCtx.fillRect(0, 0, 256, 256);
  // Subtle vertical crease lines
  for (let x = 16; x < 256; x += 28) {
    bagCtx.fillStyle = 'rgba(255,255,255,0.04)';
    bagCtx.fillRect(x, 0, 4, 256);
    bagCtx.fillStyle = 'rgba(0,0,0,0.3)';
    bagCtx.fillRect(x + 4, 0, 3, 256);
  }
  // Drainage holes along bottom third
  bagCtx.fillStyle = '#0a0b0c';
  for (let x = 24; x < 256; x += 48) {
    bagCtx.beginPath();
    bagCtx.arc(x, 210, 5, 0, Math.PI * 2);
    bagCtx.fill();
  }

  const polybagColor = new THREE.CanvasTexture(bagC);
  polybagColor.colorSpace = THREE.SRGBColorSpace;
  polybagColor.anisotropy = maxAnisotropy;

  // 5. Soft radial contact shadow
  const [shadC, shadCtx] = createCanvas(256, 256);
  const shadGrad = shadCtx.createRadialGradient(128, 128, 8, 128, 128, 124);
  shadGrad.addColorStop(0, 'rgba(10, 14, 10, 0.72)');
  shadGrad.addColorStop(0.45, 'rgba(12, 16, 12, 0.34)');
  shadGrad.addColorStop(1, 'rgba(12, 16, 12, 0.0)');
  shadCtx.fillStyle = shadGrad;
  shadCtx.fillRect(0, 0, 256, 256);

  const contactShadow = new THREE.CanvasTexture(shadC);
  contactShadow.colorSpace = THREE.SRGBColorSpace;

  return {
    soilColor,
    soilBump,
    barkColor,
    barkBump,
    leafletColor,
    polybagColor,
    contactShadow,
    dispose() {
      soilColor.dispose();
      soilBump.dispose();
      barkColor.dispose();
      barkBump.dispose();
      leafletColor.dispose();
      polybagColor.dispose();
      contactShadow.dispose();
    },
  };
}
