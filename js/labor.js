// 3D-Labor mit Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/jsm/controls/OrbitControls.js';
import { zustand, messwert, bMax, feldZurZeit, flaecheZurZeit, FELD_BREITE,
         spannungText, flussdichteText } from './physik.js';

let renderer, szene, kamera, steuerung, uhrDrei;
let gruppeFeld, gruppeFlaeche, feldlinien = [], spuleKupfer, schleife, schleifeStart;
let displayCanvas, displayTex, voltCanvas, voltTex;
let zeitGesamt = 0;

const KAMERAS = {
  gesamt:  { pos: [0.18, 0.96, 1.62], ziel: [0.05, 0.49, 0] },
  spule:   { pos: [0.30, 0.66, 0.52], ziel: [0, 0.48, 0] },
  messung: { pos: [0.72, 0.70, 0.78], ziel: [0.45, 0.50, 0.05] }
};

export function laborStarten(elementId) {
  const host = document.getElementById(elementId);
  szene = new THREE.Scene();
  szene.background = new THREE.Color(0xdfe7ea);
  szene.fog = new THREE.Fog(0xdfe7ea, 4, 11);

  kamera = new THREE.PerspectiveCamera(46, 16 / 11, 0.05, 50);
  kamera.position.set(...KAMERAS.gesamt.pos);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  steuerung = new OrbitControls(kamera, renderer.domElement);
  steuerung.target.set(...KAMERAS.gesamt.ziel);
  steuerung.enableDamping = true;
  steuerung.dampingFactor = 0.08;
  steuerung.minDistance = 0.4;
  steuerung.maxDistance = 4;
  steuerung.maxPolarAngle = Math.PI / 2 - 0.03;
  steuerung.update();

  licht();
  raum();
  tisch();
  gruppeFeld = new THREE.Group();   szene.add(gruppeFeld);
  gruppeFlaeche = new THREE.Group(); szene.add(gruppeFlaeche); gruppeFlaeche.visible = false;
  feldAufbau();
  flaechenAufbau();
  geraete();

  uhrDrei = new THREE.Clock();
  groesseAnpassen();
  addEventListener('resize', groesseAnpassen);
  renderer.setAnimationLoop(schleifeLauf);
}

export function groesseAnpassen() {
  const host = renderer.domElement.parentElement;
  const b = host.clientWidth, h = host.clientHeight || b * 11 / 16;
  renderer.setSize(b, h, false);
  kamera.aspect = b / h;
  // waagerechten Bildwinkel konstant halten, damit der Aufbau immer ganz im Bild ist
  const fovH = 62 * Math.PI / 180;
  kamera.fov = 2 * Math.atan(Math.tan(fovH / 2) / kamera.aspect) * 180 / Math.PI;
  kamera.updateProjectionMatrix();
}

// ---------------------------------------------------------------- Licht
function licht() {
  szene.add(new THREE.HemisphereLight(0xf4f8ff, 0xb9ae9c, 1.1));
  const sonne = new THREE.DirectionalLight(0xfff4e2, 2.0);
  sonne.position.set(-2.2, 2.6, 1.8);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  sonne.shadow.camera.left = -2; sonne.shadow.camera.right = 2;
  sonne.shadow.camera.top = 2;  sonne.shadow.camera.bottom = -2;
  sonne.shadow.bias = -0.0008;
  szene.add(sonne);
  const fuell = new THREE.DirectionalLight(0xdceaff, 0.45);
  fuell.position.set(2.5, 1.6, -1.5);
  szene.add(fuell);
}

// ---------------------------------------------------------------- Raum
function raum() {
  const boden = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0xb9a690, roughness: 0.92 }));
  boden.rotation.x = -Math.PI / 2;
  boden.receiveShadow = true;
  szene.add(boden);

  const wandMat = new THREE.MeshStandardMaterial({ color: 0xf1ece2, roughness: 1 });
  const hinten = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), wandMat);
  hinten.position.set(0, 2.5, -2.4);
  hinten.receiveShadow = true;
  szene.add(hinten);
  const links = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), wandMat);
  links.rotation.y = Math.PI / 2;
  links.position.set(-2.8, 2.5, 0);
  links.receiveShadow = true;
  szene.add(links);

  // Fenster an der linken Wand
  const rahmen = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.5, 2.1),
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }));
  rahmen.position.set(-2.76, 1.7, -0.2);
  szene.add(rahmen);
  const glas = new THREE.Mesh(new THREE.PlaneGeometry(1.95, 1.35),
    new THREE.MeshBasicMaterial({ color: 0xcfe6f2 }));
  glas.rotation.y = Math.PI / 2;
  glas.position.set(-2.72, 1.7, -0.2);
  szene.add(glas);

  // Tafel / Poster an der Rückwand
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95),
    new THREE.MeshStandardMaterial({ map: posterTextur(), roughness: 0.95 }));
  poster.position.set(0.6, 1.65, -2.37);
  szene.add(poster);

  pflanze(-1.9, 0, -1.6);
  regal();
}

function posterTextur() {
  const c = document.createElement('canvas'); c.width = 600; c.height = 380;
  const g = c.getContext('2d');
  g.fillStyle = '#fbf8f1'; g.fillRect(0, 0, 600, 380);
  g.strokeStyle = '#d7d0c2'; g.lineWidth = 6; g.strokeRect(3, 3, 594, 374);
  g.fillStyle = '#1f6f8b'; g.font = 'bold 40px -apple-system, Helvetica';
  g.fillText('Induktionsgesetz', 40, 80);
  g.fillStyle = '#1e2430'; g.font = '46px Georgia';
  g.fillText('U', 60, 190); g.font = '26px Georgia'; g.fillText('ind', 90, 200);
  g.font = '46px Georgia'; g.fillText('= – n · A · B', 135, 190);
  g.beginPath(); g.arc(382, 155, 4, 0, 7); g.fill();
  g.strokeStyle = '#c0392b'; g.lineWidth = 4;
  g.beginPath(); g.moveTo(60, 240); g.lineTo(540, 240); g.stroke();
  g.fillStyle = '#5a6475'; g.font = '24px -apple-system, Helvetica';
  g.fillText('Nur die Änderung zählt.', 60, 295);
  g.fillText('Faraday 1831 · Lenz 1834', 60, 335);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function pflanze(x, y, z) {
  const topf = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.13, 0.26, 20),
    new THREE.MeshStandardMaterial({ color: 0xb55c3a, roughness: 0.85 }));
  topf.position.set(x, y + 0.13, z); topf.castShadow = true; szene.add(topf);
  const blattMat = new THREE.MeshStandardMaterial({ color: 0x3f7d46, roughness: 0.75, side: THREE.DoubleSide });
  for (let i = 0; i < 11; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8, 0, Math.PI), blattMat);
    b.scale.set(1, 2.4, 0.18);
    b.position.set(x + Math.sin(i * 2.1) * 0.1, y + 0.45 + (i % 4) * 0.12, z + Math.cos(i * 2.1) * 0.1);
    b.rotation.set(Math.sin(i) * 0.4, i * 1.3, Math.cos(i) * 0.4);
    b.castShadow = true;
    szene.add(b);
  }
}

function regal() {
  const holz = new THREE.MeshStandardMaterial({ color: 0xcdb391, roughness: 0.8 });
  for (let i = 0; i < 2; i++) {
    const brett = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.3), holz);
    brett.position.set(-1.6, 1.15 + i * 0.5, -2.2);
    brett.castShadow = true; brett.receiveShadow = true;
    szene.add(brett);
    for (let k = 0; k < 7; k++) {
      const buch = new THREE.Mesh(new THREE.BoxGeometry(0.035 + (k % 3) * 0.012, 0.21 + (k % 4) * 0.03, 0.2),
        new THREE.MeshStandardMaterial({ color: [0x2a6ebb, 0xc0392b, 0x2e7d4f, 0xd9a300, 0x5a4a7a][k % 5], roughness: 0.75 }));
      buch.position.set(-2.22 + k * 0.07, 1.28 + i * 0.5 + (k % 4) * 0.015, -2.2);
      buch.castShadow = true;
      szene.add(buch);
    }
  }
}

function tisch() {
  const platte = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.045, 1.0),
    new THREE.MeshStandardMaterial({ color: 0xe2d7c3, roughness: 0.55 }));
  platte.position.set(0, 0.38, 0);
  platte.castShadow = true; platte.receiveShadow = true;
  szene.add(platte);
  const beinMat = new THREE.MeshStandardMaterial({ color: 0x8e949c, metalness: 0.75, roughness: 0.4 });
  [[-0.95, -0.42], [0.95, -0.42], [-0.95, 0.42], [0.95, 0.42]].forEach(([x, z]) => {
    const bein = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.36, 12), beinMat);
    bein.position.set(x, 0.18, z); bein.castShadow = true; szene.add(bein);
  });
}

// ------------------------------------------------- Feldmodus: Spulenaufbau
function feldAufbau() {
  const y = 0.49;      // Achse der Feldspule
  // Acrylrohr
  const rohr = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.30, 40, 1, true),
    new THREE.MeshPhysicalMaterial({ color: 0xbfe3f2, transparent: true, opacity: 0.3,
      roughness: 0.1, transmission: 0.6, side: THREE.DoubleSide }));
  rohr.rotation.z = Math.PI / 2;
  rohr.position.set(0, y, 0);
  gruppeFeld.add(rohr);

  // Kupferwicklung als Wendel
  const punkte = [], windungen = 30, r = 0.088;
  for (let i = 0; i <= windungen * 24; i++) {
    const u = i / (windungen * 24);
    const w = u * windungen * Math.PI * 2;
    punkte.push(new THREE.Vector3(-0.14 + u * 0.28, Math.sin(w) * r, Math.cos(w) * r));
  }
  const wendel = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(punkte), 1200, 0.0026, 7, false);
  spuleKupfer = new THREE.Mesh(wendel, new THREE.MeshStandardMaterial({
    color: 0xb87333, metalness: 0.85, roughness: 0.3, emissive: 0x3a1800, emissiveIntensity: 0 }));
  spuleKupfer.castShadow = true;
  spuleKupfer.position.y = y;
  gruppeFeld.add(spuleKupfer);

  // Halterung
  const halter = new THREE.MeshStandardMaterial({ color: 0x7fb4d4, roughness: 0.4, metalness: 0.2 });
  [-0.11, 0.11].forEach(x => {
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.11, 0.17), halter);
    f.position.set(x, y - 0.1, 0); f.castShadow = true; gruppeFeld.add(f);
  });
  const sockel = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.02, 0.2), halter);
  sockel.position.set(0, 0.415, 0); sockel.castShadow = true; sockel.receiveShadow = true;
  gruppeFeld.add(sockel);

  // Induktionsspule im Inneren
  const kern = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 20),
    new THREE.MeshStandardMaterial({ color: 0x3b3b40, roughness: 0.7 }));
  kern.rotation.z = Math.PI / 2; kern.position.set(0, y, 0);
  gruppeFeld.add(kern);
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.031, 0.031, 0.05, 24),
    new THREE.MeshStandardMaterial({ color: 0xc98a4b, metalness: 0.6, roughness: 0.45 }));
  wick.rotation.z = Math.PI / 2; wick.position.set(0, y, 0); wick.castShadow = true;
  gruppeFeld.add(wick);
  const stab = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.40, 10),
    new THREE.MeshStandardMaterial({ color: 0xcfcfd4, metalness: 0.7, roughness: 0.35 }));
  stab.rotation.z = Math.PI / 2; stab.position.set(0.20, y, 0);
  gruppeFeld.add(stab);

  // Hall-Sonde
  const sonde = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.008, 0.02),
    new THREE.MeshStandardMaterial({ color: 0x33373d, roughness: 0.6 }));
  sonde.position.set(-0.12, y - 0.045, 0.03);
  gruppeFeld.add(sonde);
  const sondenKopf = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.012, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x1f6f8b, emissive: 0x0d3a4a, roughness: 0.5 }));
  sondenKopf.position.set(-0.04, y - 0.045, 0.03);
  gruppeFeld.add(sondenKopf);

  // Feldlinien im Inneren (Pfeile)
  const pfeilMat = new THREE.MeshBasicMaterial({ color: 0x2a6ebb, transparent: true, opacity: 0.0 });
  for (let i = 0; i < 12; i++) {
    const ring = Math.floor(i / 4), k = i % 4;
    const rr = 0.018 + ring * 0.025;
    const winkel = k * Math.PI / 2 + ring * 0.4;
    const g = new THREE.Group();
    const schaft = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.2, 6), pfeilMat.clone());
    schaft.rotation.z = Math.PI / 2;
    const spitze = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.022, 10), pfeilMat.clone());
    spitze.rotation.z = -Math.PI / 2; spitze.position.x = 0.11;
    g.add(schaft, spitze);
    g.position.set(0, y + Math.sin(winkel) * rr, Math.cos(winkel) * rr);
    gruppeFeld.add(g);
    feldlinien.push(g);
  }

  // Netzgerät -> Feldspule
  kabel(new THREE.Vector3(-0.52, 0.445, 0.155), new THREE.Vector3(-0.15, 0.455, 0.075), 0xc0392b, gruppeFeld);
  kabel(new THREE.Vector3(-0.47, 0.445, 0.155), new THREE.Vector3(0.15, 0.455, 0.075), 0x2a6ebb, gruppeFeld);
  // Induktionsspule -> Voltmeter
  kabel(new THREE.Vector3(0.355, 0.487, 0.012), new THREE.Vector3(0.70, 0.445, 0.155), 0xc0392b, gruppeFeld);
  kabel(new THREE.Vector3(0.355, 0.487, -0.012), new THREE.Vector3(0.775, 0.445, 0.155), 0x2a6ebb, gruppeFeld);
}

function kabel(a, b, farbe, elternteil) {
  const m = a.clone().lerp(b, 0.5); m.y -= 0.11;
  const kurve = new THREE.CatmullRomCurve3([a, m, b]);
  const t = new THREE.Mesh(new THREE.TubeGeometry(kurve, 40, 0.0055, 8, false),
    new THREE.MeshStandardMaterial({ color: farbe, roughness: 0.6 }));
  t.castShadow = true;
  elternteil.add(t);
  return t;
}

// ------------------------------------------------- Flächenmodus
function flaechenAufbau() {
  const y = 0.52;
  const polMat = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.45, metalness: 0.3 });
  const nord = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.07, 0.17), polMat(0xc0392b));
  nord.position.set(0, y + 0.075, 0); nord.castShadow = true; gruppeFlaeche.add(nord);
  const sued = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.07, 0.17), polMat(0x2a6ebb));
  sued.position.set(0, y - 0.075, 0); sued.castShadow = true; gruppeFlaeche.add(sued);
  const joch = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.30, 0.17),
    new THREE.MeshStandardMaterial({ color: 0x6b7078, metalness: 0.6, roughness: 0.5 }));
  joch.position.set(-0.175, y, 0); joch.castShadow = true; gruppeFlaeche.add(joch);
  const fuss = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.24),
    new THREE.MeshStandardMaterial({ color: 0x7fb4d4, roughness: 0.5 }));
  fuss.position.set(-0.03, 0.415, 0); fuss.castShadow = true; gruppeFlaeche.add(fuss);

  // Feldbereich sichtbar machen
  const bereich = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.08, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x86c6e4, transparent: true, opacity: 0.18 }));
  bereich.position.set(0, y, 0);
  gruppeFlaeche.add(bereich);

  // Leiterschleife
  schleife = new THREE.Group();
  const draht = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.8, roughness: 0.3 });
  const rahmen = new THREE.Mesh(new THREE.TorusGeometry(0.001, 0.001, 4, 4), draht); // Platzhalter
  schleife.add(rahmen);
  const bauKante = (len, pos, achse) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, len, 10), draht);
    if (achse === 'x') m.rotation.z = Math.PI / 2;
    if (achse === 'z') m.rotation.x = Math.PI / 2;
    m.position.copy(pos); m.castShadow = true;
    schleife.add(m);
  };
  const B = 0.08, H = 0.055;
  bauKante(B, new THREE.Vector3(0, H / 2, 0), 'x');
  bauKante(B, new THREE.Vector3(0, -H / 2, 0), 'x');
  bauKante(H, new THREE.Vector3(-B / 2, 0, 0), 'y');
  bauKante(H, new THREE.Vector3(B / 2, 0, 0), 'y');
  const griff = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 10),
    new THREE.MeshStandardMaterial({ color: 0xe8e4da, roughness: 0.7 }));
  griff.rotation.z = Math.PI / 2; griff.position.set(0.12, 0, 0);
  schleife.add(griff);
  schleife.position.set(-0.11, y, 0);
  schleifeStart = schleife.position.clone();
  gruppeFlaeche.add(schleife);

  kabel(new THREE.Vector3(0.21, 0.515, 0.012), new THREE.Vector3(0.70, 0.445, 0.155), 0xc0392b, gruppeFlaeche);
  kabel(new THREE.Vector3(0.21, 0.515, -0.012), new THREE.Vector3(0.775, 0.445, 0.155), 0x2a6ebb, gruppeFlaeche);
}

// ------------------------------------------------- Geräte
function geraete() {
  // Netzgerät links
  const gehaeuse = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.17, 0.22),
    new THREE.MeshStandardMaterial({ color: 0x3d6f96, roughness: 0.5, metalness: 0.15 }));
  gehaeuse.position.set(-0.62, 0.49, 0.05);
  gehaeuse.castShadow = true; gehaeuse.receiveShadow = true;
  szene.add(gehaeuse);

  displayCanvas = document.createElement('canvas');
  displayCanvas.width = 512; displayCanvas.height = 256;
  displayTex = new THREE.CanvasTexture(displayCanvas);
  displayTex.colorSpace = THREE.SRGBColorSpace;
  const front = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.14),
    new THREE.MeshBasicMaterial({ map: displayTex }));
  front.position.set(-0.62, 0.505, 0.161);
  szene.add(front);

  // Voltmeter rechts
  const volt = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.20, 0.20),
    new THREE.MeshStandardMaterial({ color: 0xb8443a, roughness: 0.5 }));
  volt.position.set(0.74, 0.50, 0.06);
  volt.castShadow = true; volt.receiveShadow = true;
  szene.add(volt);
  voltCanvas = document.createElement('canvas');
  voltCanvas.width = 512; voltCanvas.height = 460;
  voltTex = new THREE.CanvasTexture(voltCanvas);
  voltTex.colorSpace = THREE.SRGBColorSpace;
  const skala = new THREE.Mesh(new THREE.PlaneGeometry(0.19, 0.17),
    new THREE.MeshBasicMaterial({ map: voltTex }));
  skala.position.set(0.74, 0.505, 0.161);
  szene.add(skala);

  // Notizblock auf dem Tisch
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.006, 0.23),
    new THREE.MeshStandardMaterial({ color: 0xfbf7ec, roughness: 0.95 }));
  block.position.set(0.30, 0.406, 0.33); block.rotation.y = -0.3;
  block.castShadow = true; szene.add(block);
  const stift = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.14, 8),
    new THREE.MeshStandardMaterial({ color: 0xd9a300, roughness: 0.6 }));
  stift.rotation.set(Math.PI / 2, 0, 0.5); stift.position.set(0.37, 0.412, 0.30);
  szene.add(stift);
}

function displayZeichnen(B, I) {
  const g = displayCanvas.getContext('2d');
  g.fillStyle = '#20262f'; g.fillRect(0, 0, 512, 256);
  g.fillStyle = '#131821'; g.fillRect(24, 20, 464, 96);
  g.fillStyle = '#7cf0b4';
  g.font = 'bold 62px "SF Mono", Menlo, monospace';
  g.textAlign = 'right';
  g.fillText(I.toFixed(2), 236, 92);
  g.fillStyle = '#ffd27d';
  g.fillText((B * 1e3).toFixed(2), 460, 92);
  g.font = '22px -apple-system, Helvetica'; g.fillStyle = '#8b97a7';
  g.fillText('I / A', 236, 138); g.fillText('B / mT', 460, 138);
  g.textAlign = 'left';
  g.fillStyle = '#c6d0dc'; g.font = 'bold 20px -apple-system, Helvetica';
  g.fillText('FUNKTIONSGENERATOR', 28, 182);
  const formText = { dreieck: 'Dreieck', sinus: 'Sinus', konstant: 'Gleichstrom' }[zustand.form];
  g.fillStyle = '#1f6f8b'; g.fillRect(28, 198, 170, 36);
  g.fillStyle = '#fff'; g.font = '20px -apple-system, Helvetica';
  g.fillText(formText + '  ·  ' + zustand.f.toFixed(2) + ' Hz', 38, 223);
  displayTex.needsUpdate = true;
}

function voltZeichnen(U) {
  const g = voltCanvas.getContext('2d');
  g.fillStyle = '#f6f2e8'; g.fillRect(0, 0, 512, 460);
  const cx = 256, cy = 350, r = 250;
  g.strokeStyle = '#2b3038'; g.lineWidth = 3;
  g.beginPath(); g.arc(cx, cy, r, Math.PI * 1.18, Math.PI * 1.82); g.stroke();
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * 1.18 + (Math.PI * 0.64) * i / 10;
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
    const l = i % 5 === 0 ? 28 : 16;
    const x2 = cx + Math.cos(a) * (r - l), y2 = cy + Math.sin(a) * (r - l);
    g.lineWidth = i % 5 === 0 ? 4 : 2;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  g.fillStyle = '#2b3038'; g.font = 'bold 30px -apple-system, Helvetica'; g.textAlign = 'center';
  g.fillText('–', 60, 190); g.fillText('0', 256, 60); g.fillText('+', 452, 190);
  // Zeiger
  const bereich = zustand.modus === 'feld' ? Math.max(1e-6, naechsterBereich()) : 1.0;
  const rel = Math.max(-1, Math.min(1, U / bereich));
  const a = Math.PI * 1.5 + rel * Math.PI * 0.32;
  g.strokeStyle = '#c0392b'; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * (r - 34), cy + Math.sin(a) * (r - 34)); g.stroke();
  g.fillStyle = '#2b3038'; g.beginPath(); g.arc(cx, cy, 16, 0, 7); g.fill();
  g.fillStyle = '#2b3038'; g.font = '26px -apple-system, Helvetica';
  g.fillText(spannungText(U), 256, 300);
  g.font = '20px -apple-system, Helvetica'; g.fillStyle = '#5a6475';
  g.fillText('Messbereich ± ' + spannungText(bereich), 256, 418);
  voltTex.needsUpdate = true;
}

function naechsterBereich() {
  const erwartet = zustand.n * zustand.A * 1e-4 * bMax() * 2 * zustand.f * 1.3;
  const stufen = [1e-5, 3e-5, 1e-4, 3e-4, 1e-3, 3e-3, 1e-2, 3e-2, 0.1, 0.3, 1, 3, 10];
  return stufen.find(s => s >= erwartet) || 10;
}

// ------------------------------------------------- Lauf
let aussen = null;
export function laborHorcher(fn) { aussen = fn; }

function schleifeLauf() {
  const dt = Math.min(uhrDrei.getDelta(), 0.05);
  zeitGesamt += dt;
  if (zustand.laeuft) zustand.t += dt;

  const m = messwert(zustand.t);
  const imFeldModus = zustand.modus === 'feld';
  gruppeFeld.visible = imFeldModus;
  gruppeFlaeche.visible = !imFeldModus;

  if (imFeldModus) {
    const I = zustand.form === 'konstant' ? zustand.I : m.B / (bMax() || 1) * zustand.I;
    displayZeichnen(m.B, Math.abs(I));
    const rel = bMax() > 0 ? m.B / bMax() : 0;
    spuleKupfer.material.emissiveIntensity = Math.min(1.4, Math.abs(rel) * 1.3);
    feldlinien.forEach((g, i) => {
      g.children.forEach(kind => {
        kind.material.opacity = Math.min(0.85, Math.abs(rel) * 0.9);
        kind.material.color.setHex(rel >= 0 ? 0x2a6ebb : 0xc0392b);
      });
      g.scale.x = rel >= 0 ? 1 : -1;
      g.position.x = Math.sin(zeitGesamt * 1.4 + i) * 0.012;
    });
  } else {
    const fl = flaecheZurZeit(zustand.t);
    schleife.position.x = schleifeStart.x + (zustand.laeuft ? fl.x : 0);
    displayZeichnen(zustand.fB * 1e-3, 0);
  }
  voltZeichnen(m.U);

  if (aussen) aussen(m);
  steuerung.update();
  renderer.render(szene, kamera);
}

export function kameraSetzen(name) {
  const k = KAMERAS[name] || KAMERAS.gesamt;
  kamera.position.set(...k.pos);
  steuerung.target.set(...k.ziel);
  steuerung.update();
}
