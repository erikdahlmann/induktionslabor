// Animationen im Theorieteil (2D-Canvas)
import { zahl } from './physik.js';

const FARBE = { tinte:'#1e2430', leicht:'#5a6475', linie:'#e1ddd4', blau:'#2a6ebb',
                rot:'#c0392b', gruen:'#2e7d4f', akzent:'#1f6f8b', gelb:'#d9a300' };

function hd(canvas) {                      // scharf auf Retina
  const q = Math.min(devicePixelRatio || 1, 2);
  const b = canvas.width, h = canvas.height;
  canvas.width = b * q; canvas.height = h * q;
  const g = canvas.getContext('2d');
  g.scale(q, q);
  canvas._b = b; canvas._h = h;
  return g;
}

// ---------------------------------------------------- 1.1 Fluss
export function animFluss() {
  const c = document.getElementById('anim-fluss'); if (!c) return;
  const g = hd(c), B_r = document.getElementById('fl-b'), A_r = document.getElementById('fl-a');
  let phase = 0;

  function zeichnen() {
    const B = +B_r.value, A = +A_r.value;      // mT, cm²
    const W = c._b, H = c._h;
    g.clearRect(0, 0, W, H);

    // Feldlinien
    const anzahl = Math.max(0, Math.round(B * 2.2));
    g.strokeStyle = FARBE.blau; g.lineWidth = 1.6;
    for (let i = 0; i < anzahl; i++) {
      const y = 30 + i * (H - 60) / Math.max(1, anzahl - 1 || 1);
      g.globalAlpha = 0.65;
      g.beginPath(); g.moveTo(20, y); g.lineTo(W - 20, y); g.stroke();
      const x = 20 + ((phase * 60 + i * 37) % (W - 60));
      g.globalAlpha = 1;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 9, y - 5); g.lineTo(x - 9, y + 5); g.closePath();
      g.fillStyle = FARBE.blau; g.fill();
    }
    g.globalAlpha = 1;

    // Spulenfläche als Rechteck
    const seite = Math.sqrt(A) * 10.5;         // cm² -> Pixel
    const cx = W / 2, cy = H / 2;
    g.fillStyle = 'rgba(31,111,139,.12)';
    g.strokeStyle = FARBE.akzent; g.lineWidth = 3;
    g.fillRect(cx - seite / 2, cy - seite / 2, seite, seite);
    g.strokeRect(cx - seite / 2, cy - seite / 2, seite, seite);
    g.fillStyle = FARBE.akzent; g.font = '600 14px -apple-system, Helvetica';
    g.textAlign = 'center';
    g.fillText('Spulenfläche A', cx, cy - seite / 2 - 10);

    // Treffer zählen
    const treffer = Array.from({ length: anzahl }, (_, i) =>
      30 + i * (H - 60) / Math.max(1, anzahl - 1 || 1))
      .filter(y => Math.abs(y - cy) < seite / 2).length;
    g.textAlign = 'left';
    g.fillStyle = FARBE.leicht; g.font = '13px -apple-system, Helvetica';
    g.fillText('Feldlinien durch die Fläche: ' + treffer, 20, H - 12);

    const phi = B * 1e-3 * A * 1e-4 * 1e6;     // µWb
    document.getElementById('fl-b-out').textContent = zahl(B, 1) + ' mT';
    document.getElementById('fl-a-out').textContent = zahl(A, 1) + ' cm²';
    document.getElementById('fl-phi').textContent = zahl(phi, 2) + ' µWb';
  }

  function lauf() { phase += 0.016; zeichnen(); requestAnimationFrame(lauf); }
  B_r.addEventListener('input', zeichnen); A_r.addEventListener('input', zeichnen);
  lauf();
}

// ---------------------------------------------------- 1.3 B(t) -> U(t)
export function animBU() {
  const c = document.getElementById('anim-bu'); if (!c) return;
  const g = hd(c);
  const formW = document.getElementById('bu-form'), tempo = document.getElementById('bu-tempo');
  const pause = document.getElementById('bu-pause');
  let t = 0, laeuft = true, letzte = performance.now();

  pause.addEventListener('click', () => {
    laeuft = !laeuft; pause.textContent = laeuft ? 'Pause' : 'Weiter';
  });
  tempo.addEventListener('input', () =>
    document.getElementById('bu-tempo-out').textContent = zahl(+tempo.value, 1) + ' ×');

  function werte(x) {                 // x in [0,2): zwei Perioden
    const form = formW.value, p = x % 1;
    if (form === 'konstant') return { B: 0.7, U: 0 };
    if (form === 'sinus')    return { B: Math.sin(2 * Math.PI * p), U: -Math.cos(2 * Math.PI * p) };
    if (form === 'trapez') {
      let B, U;
      if (p < 0.25)      { B = p * 4;            U = -1; }
      else if (p < 0.5)  { B = 1;                U = 0; }
      else if (p < 0.75) { B = 1 - (p - 0.5) * 4; U = 1; }
      else               { B = 0;                U = 0; }
      return { B, U };
    }
    return p < 0.5 ? { B: p * 2, U: -1 } : { B: 2 - p * 2, U: 1 };
  }

  function zeichnen() {
    const W = c._b, H = c._h;
    g.clearRect(0, 0, W, H);
    const links = { x: 30, y: 20, w: W / 2 - 50, h: H - 60 };
    const rechts = { x: W / 2 + 20, y: 20, w: W / 2 - 50, h: H - 60 };

    [[links, 'B(t) – magnetische Flussdichte', FARBE.rot, 'B'],
     [rechts, 'U(t) – induzierte Spannung', FARBE.blau, 'U']].forEach(([r, titel, farbe, art]) => {
      const my = r.y + r.h / 2;
      g.strokeStyle = FARBE.linie; g.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = r.y + i * r.h / 4;
        g.beginPath(); g.moveTo(r.x, y); g.lineTo(r.x + r.w, y); g.stroke();
      }
      g.strokeStyle = FARBE.tinte; g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(r.x, my); g.lineTo(r.x + r.w, my); g.stroke();
      g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + r.h); g.stroke();
      g.fillStyle = FARBE.leicht; g.font = '600 13px -apple-system, Helvetica'; g.textAlign = 'left';
      g.fillText(titel, r.x, r.y - 6);

      // Kurve
      g.strokeStyle = farbe; g.lineWidth = 2.6;
      g.beginPath();
      for (let i = 0; i <= 240; i++) {
        const x = i / 240 * 2;
        const v = werte(x)[art];
        const px = r.x + i / 240 * r.w;
        const py = my - v * (r.h / 2 - 12);
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();

      // Laufpunkt
      const xl = t % 2;
      const v = werte(xl)[art];
      const px = r.x + xl / 2 * r.w, py = my - v * (r.h / 2 - 12);
      g.strokeStyle = 'rgba(30,36,48,.25)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(px, r.y); g.lineTo(px, r.y + r.h); g.stroke();
      g.fillStyle = farbe; g.beginPath(); g.arc(px, py, 6, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(px, py, 2.4, 0, 7); g.fill();
    });

    // Spule in der Mitte unten
    const akt = werte(t % 2);
    g.fillStyle = FARBE.leicht; g.font = '13px -apple-system, Helvetica'; g.textAlign = 'center';
    const text = Math.abs(akt.U) < 0.05
      ? 'B ändert sich nicht → keine Spannung'
      : (akt.U < 0 ? 'B steigt → Spannung negativ (Lenz!)' : 'B fällt → Spannung positiv');
    g.fillText(text, W / 2, H - 14);
  }

  function lauf(jetzt) {
    const dt = Math.min((jetzt - letzte) / 1000, 0.05); letzte = jetzt;
    if (laeuft) t += dt * 0.35 * +tempo.value;
    zeichnen();
    requestAnimationFrame(lauf);
  }
  formW.addEventListener('change', () => { t = 0; });
  requestAnimationFrame(lauf);
}

// ---------------------------------------------------- 1.4 Fläche
export function animFlaeche() {
  const c = document.getElementById('anim-flaeche'); if (!c) return;
  const g = hd(c);
  const vR = document.getElementById('fa-v'), bR = document.getElementById('fa-b');
  let x = 60, letzte = performance.now();

  function zeichnen() {
    const W = c._b, H = c._h;
    const v = +vR.value, B = +bR.value;
    g.clearRect(0, 0, W, H);

    // Feldbereich
    const fx = 70, fw = 330, fy = 50, fh = 170;
    g.fillStyle = 'rgba(42,110,187,.10)';
    g.fillRect(fx, fy, fw, fh);
    g.strokeStyle = FARBE.blau; g.lineWidth = 1.5; g.setLineDash([5, 4]);
    g.strokeRect(fx, fy, fw, fh); g.setLineDash([]);
    g.fillStyle = FARBE.blau;
    for (let i = 0; i < 8; i++) for (let k = 0; k < 4; k++) {
      const cx2 = fx + 22 + i * 41, cy2 = fy + 22 + k * 42;
      g.globalAlpha = B / 500 * 0.9 + 0.08;
      g.beginPath(); g.arc(cx2, cy2, 4.5, 0, 7); g.fill();
      g.globalAlpha = 1;
      g.strokeStyle = FARBE.blau; g.lineWidth = 1;
      g.beginPath(); g.arc(cx2, cy2, 9, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(cx2 - 6, cy2 - 6); g.lineTo(cx2 + 6, cy2 + 6);
      g.moveTo(cx2 + 6, cy2 - 6); g.lineTo(cx2 - 6, cy2 + 6); g.stroke();
    }
    g.fillStyle = FARBE.blau; g.font = '600 13px -apple-system, Helvetica'; g.textAlign = 'left';
    g.fillText('Feld B in die Zeichenebene hinein', fx, fy - 10);

    // Schleife
    const sb = 110, sh = 120, sy = fy + 25;
    g.strokeStyle = '#b87333'; g.lineWidth = 5;
    g.strokeRect(x, sy, sb, sh);
    g.fillStyle = FARBE.leicht; g.font = '12px -apple-system, Helvetica';
    g.fillText('Leiterschleife', x, sy - 8);
    // Zugpfeil
    if (v > 0.01) {
      g.strokeStyle = FARBE.gruen; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x + sb + 8, sy + sh / 2); g.lineTo(x + sb + 48, sy + sh / 2); g.stroke();
      g.beginPath(); g.moveTo(x + sb + 56, sy + sh / 2); g.lineTo(x + sb + 42, sy + sh / 2 - 7);
      g.lineTo(x + sb + 42, sy + sh / 2 + 7); g.closePath(); g.fillStyle = FARBE.gruen; g.fill();
      g.fillText('v', x + sb + 28, sy + sh / 2 - 12);
    }

    // überlappender Teil
    const li = Math.max(x, fx), re = Math.min(x + sb, fx + fw);
    const ueber = Math.max(0, re - li);
    if (ueber > 0) {
      g.fillStyle = 'rgba(217,163,0,.25)';
      g.fillRect(li, sy, ueber, sh);
    }
    const kanteDrin = x < fx + fw && x + sb > fx + fw ? true : (x < fx && x + sb > fx);
    const U = kanteDrin ? (B * 1e-3) * 0.08 * v * 20 : 0;   // 20 Windungen, b = 8 cm

    g.fillStyle = FARBE.tinte; g.font = '600 14px -apple-system, Helvetica';
    g.fillText('wirksame Fläche', li + 6, sy + sh + 20);
    document.getElementById('fa-v-out').textContent = zahl(v, 2) + ' m/s';
    document.getElementById('fa-b-out').textContent = Math.round(B) + ' mT';
    document.getElementById('fa-u').textContent = zahl(U * 1e3, 1) + ' mV';
  }

  function lauf(jetzt) {
    const dt = Math.min((jetzt - letzte) / 1000, 0.05); letzte = jetzt;
    x += +vR.value * 70 * dt;
    if (x > 460) x = 20;
    zeichnen();
    requestAnimationFrame(lauf);
  }
  requestAnimationFrame(lauf);
}

// ---------------------------------------------------- 1.5 Lenz
export function animLenz() {
  const c = document.getElementById('anim-lenz'); if (!c) return;
  const g = hd(c);
  const pos = document.getElementById('lz-pos');
  let letztePos = +pos.value, v = 0, letzte = performance.now();

  function zeichnen() {
    const W = c._b, H = c._h, my = H / 2;
    g.clearRect(0, 0, W, H);
    const p = +pos.value;
    const mx = W / 2 - 150 + p * 1.1;

    // Spule
    const sx = W / 2 + 120;
    g.strokeStyle = '#b87333'; g.lineWidth = 4;
    for (let i = 0; i < 7; i++) {
      g.beginPath(); g.ellipse(sx + i * 13, my, 10, 52, 0, 0, 7); g.stroke();
    }
    // Messgerät
    g.strokeStyle = FARBE.tinte; g.lineWidth = 2;
    g.beginPath(); g.moveTo(sx + 80, my - 52); g.lineTo(W - 70, my - 80); g.stroke();
    g.beginPath(); g.moveTo(sx + 80, my + 52); g.lineTo(W - 70, my + 80); g.stroke();
    g.fillStyle = '#fff'; g.strokeStyle = FARBE.tinte;
    g.fillRect(W - 70, my - 36, 56, 72); g.strokeRect(W - 70, my - 36, 56, 72);
    const zeiger = Math.max(-1, Math.min(1, v / 90));
    g.strokeStyle = FARBE.rot; g.lineWidth = 3;
    g.beginPath(); g.moveTo(W - 42, my + 22);
    g.lineTo(W - 42 + Math.sin(zeiger * 0.9) * 40, my + 22 - Math.cos(zeiger * 0.9) * 40);
    g.stroke();
    g.fillStyle = FARBE.leicht; g.font = '11px -apple-system, Helvetica'; g.textAlign = 'center';
    g.fillText('mV', W - 42, my + 32);

    // Magnet
    g.fillStyle = FARBE.rot; g.fillRect(mx, my - 20, 46, 40);
    g.fillStyle = FARBE.blau; g.fillRect(mx + 46, my - 20, 46, 40);
    g.fillStyle = '#fff'; g.font = 'bold 18px -apple-system, Helvetica';
    g.fillText('N', mx + 23, my + 6); g.fillText('S', mx + 69, my + 6);

    // Induzierter Strom und Gegenfeld
    const text = document.getElementById('lz-text');
    if (Math.abs(v) > 6) {
      const naehert = v > 0;
      g.strokeStyle = FARBE.gruen; g.lineWidth = 3;
      const bx = sx + 45;
      g.beginPath(); g.arc(bx, my, 66, naehert ? -0.9 : 0.9, naehert ? 0.9 : -0.9, !naehert); g.stroke();
      const aw = naehert ? 0.9 : -0.9;
      g.beginPath();
      g.moveTo(bx + Math.cos(aw) * 66, my + Math.sin(aw) * 66);
      g.lineTo(bx + Math.cos(aw) * 56, my + Math.sin(aw) * 74);
      g.lineTo(bx + Math.cos(aw) * 76, my + Math.sin(aw) * 72);
      g.closePath(); g.fillStyle = FARBE.gruen; g.fill();
      g.fillStyle = FARBE.gruen; g.font = '600 13px -apple-system, Helvetica'; g.textAlign = 'left';
      g.fillText('induzierter Strom', sx - 10, my + 92);
      // Gegenpol
      g.fillStyle = naehert ? FARBE.rot : FARBE.blau;
      g.font = 'bold 24px -apple-system, Helvetica'; g.textAlign = 'center';
      g.fillText(naehert ? 'N' : 'S', sx - 16, my + 6);
      text.textContent = naehert
        ? 'Der Nordpol kommt näher. Die Spule baut einen Nordpol auf und stößt ihn ab.'
        : 'Der Magnet geht weg. Die Spule baut einen Südpol auf und hält ihn fest.';
    } else {
      text.textContent = 'Nichts passiert – der Magnet steht still.';
    }
  }

  function lauf(jetzt) {
    const dt = Math.max(0.001, Math.min((jetzt - letzte) / 1000, 0.05)); letzte = jetzt;
    const p = +pos.value;
    v = v * 0.82 + ((p - letztePos) / dt) * 0.18;
    letztePos = p;
    zeichnen();
    requestAnimationFrame(lauf);
  }
  requestAnimationFrame(lauf);
}

// ---------------------------------------------------- Selbstcheck
const CHECKS = [
  { f: 'Eine Spule liegt in einem starken, aber völlig konstanten Magnetfeld. Was misst das Voltmeter?',
    o: ['Eine große Spannung, weil das Feld stark ist.',
        'Null, weil sich der Fluss nicht ändert.',
        'Eine Spannung, die langsam abnimmt.'], r: 1,
    e: 'Nur die Änderung des Flusses erzeugt Spannung. Ein konstantes Feld erzeugt gar nichts.' },
  { f: 'Die Flussdichte steigt gleichmäßig an (Dreieckstrom). Wie sieht U(t) aus?',
    o: ['Ebenfalls dreieckförmig.', 'Konstant, also rechteckig.', 'Sinusförmig.'], r: 1,
    e: 'U ist proportional zur Steigung von B. Eine gerade Rampe hat überall dieselbe Steigung.' },
  { f: 'Du verdoppelst die Windungszahl n der Induktionsspule. Die Spannung …',
    o: ['bleibt gleich.', 'verdoppelt sich.', 'vervierfacht sich.'], r: 1,
    e: 'U = –n·A·Ḃ. n steht als Faktor davor, also doppelt so viel.' },
  { f: 'Warum steht im Induktionsgesetz ein Minuszeichen?',
    o: ['Weil die Spannung immer negativ ist.',
        'Wegen der Lenzschen Regel: die Wirkung wehrt sich gegen die Ursache.',
        'Weil man rückwärts rechnet.'], r: 1,
    e: 'Das Minuszeichen ist die Lenzsche Regel. Sie folgt aus der Energieerhaltung.' }
];

export function selbstcheck(speicher) {
  const box = document.getElementById('check-liste'); if (!box) return;
  CHECKS.forEach((ch, i) => {
    const d = document.createElement('div');
    d.className = 'check';
    d.innerHTML = `<p class="check-frage">${i + 1}. ${ch.f}</p><div class="check-optionen">` +
      ch.o.map((o, k) => `<label><input type="radio" name="ch${i}" value="${k}"><span>${o}</span></label>`).join('') +
      `</div><p class="rueck" data-rueck="${i}"></p>`;
    box.appendChild(d);
  });
  const btn = document.createElement('button');
  btn.className = 'knopf'; btn.textContent = 'Prüfen';
  btn.addEventListener('click', () => {
    CHECKS.forEach((ch, i) => {
      const gew = box.querySelector(`input[name="ch${i}"]:checked`);
      const r = box.querySelector(`[data-rueck="${i}"]`);
      if (!gew) { r.textContent = 'Noch nicht beantwortet.'; r.className = 'rueck'; return; }
      const ok = +gew.value === ch.r;
      r.textContent = (ok ? '✓ Richtig. ' : '✗ Noch nicht. ') + ch.e;
      r.className = 'rueck ' + (ok ? 'check-ok' : 'check-nein');
      speicher.check[i] = { gewaehlt: ch.o[+gew.value], richtig: ok };
    });
  });
  box.appendChild(btn);
}
