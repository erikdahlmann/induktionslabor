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
    const feld = { x: 24, y: 24, w: W - 150, h: H - 56 };

    // Feldbereich
    g.fillStyle = 'rgba(42,110,187,.05)';
    g.fillRect(feld.x, feld.y, feld.w, feld.h);

    const anzahl = Math.max(0, Math.round(B * 2.4));
    const yFuer = i => anzahl < 2 ? feld.y + feld.h / 2
                                  : feld.y + 14 + i * (feld.h - 28) / (anzahl - 1);
    g.lineWidth = 1.6;
    for (let i = 0; i < anzahl; i++) {
      const y = yFuer(i);
      g.strokeStyle = 'rgba(42,110,187,.55)';
      g.beginPath(); g.moveTo(feld.x + 6, y); g.lineTo(feld.x + feld.w - 6, y); g.stroke();
      const x = feld.x + 20 + ((phase * 70 + i * 43) % (feld.w - 40));
      g.fillStyle = FARBE.blau;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x - 9, y - 4.5); g.lineTo(x - 9, y + 4.5); g.closePath(); g.fill();
    }

    // Spulenfläche
    const seite = Math.sqrt(A) * 17;
    const cx = feld.x + feld.w * 0.52, cy = feld.y + feld.h / 2;
    const x0 = cx - seite / 2, y0 = cy - seite / 2;
    g.fillStyle = 'rgba(31,111,139,.13)';
    g.fillRect(x0, y0, seite, seite);
    g.strokeStyle = FARBE.akzent; g.lineWidth = 3;
    g.strokeRect(x0, y0, seite, seite);
    // kleine Windungen am Rand andeuten
    g.lineWidth = 2; g.strokeStyle = 'rgba(184,115,51,.85)';
    for (let i = 1; i <= 3; i++) {
      g.strokeRect(x0 - i * 3.5, y0 - i * 3.5, seite + i * 7, seite + i * 7);
    }
    g.fillStyle = FARBE.akzent; g.font = '600 13px -apple-system, Helvetica'; g.textAlign = 'center';
    g.fillText('Spulenfläche A', cx, y0 - 16);

    // getroffene Linien hervorheben
    let treffer = 0;
    for (let i = 0; i < anzahl; i++) {
      const y = yFuer(i);
      if (y > y0 && y < y0 + seite) {
        treffer++;
        g.strokeStyle = FARBE.akzent; g.lineWidth = 2.6;
        g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + seite, y); g.stroke();
      }
    }

    // Flussbalken rechts
    const bx = W - 104, by = feld.y + 10, bw = 54, bh = feld.h - 20;
    g.fillStyle = '#f1ede4'; g.fillRect(bx, by, bw, bh);
    g.strokeStyle = '#cfc9ba'; g.lineWidth = 1.5; g.strokeRect(bx, by, bw, bh);
    const phi = B * 1e-3 * A * 1e-4 * 1e6;             // µWb
    const hoehe = Math.min(1, phi / 40) * (bh - 6);
    const verlauf = g.createLinearGradient(0, by + bh, 0, by);
    verlauf.addColorStop(0, '#2a6ebb'); verlauf.addColorStop(1, '#5aa7d8');
    g.fillStyle = verlauf;
    g.fillRect(bx + 3, by + bh - 3 - hoehe, bw - 6, hoehe);
    g.fillStyle = FARBE.leicht; g.font = '11.5px -apple-system, Helvetica'; g.textAlign = 'center';
    g.fillText('Fluss Φ', bx + bw / 2, by - 6);
    g.fillText('0', bx + bw / 2, by + bh + 15);

    g.textAlign = 'left';
    g.fillStyle = FARBE.leicht; g.font = '12.5px -apple-system, Helvetica';
    g.fillText('Feldlinien durch die Fläche: ' + treffer, feld.x, H - 12);

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
  let x = 40, letzte = performance.now();
  const N_WDG = 20, BREITE_M = 0.08;

  function zeichnen() {
    const W = c._b, H = c._h;
    const v = +vR.value, B = +bR.value;
    g.clearRect(0, 0, W, H);

    const fx = 90, fw = 330, fy = 56, fh = 150;

    // Feldbereich mit Kreuzen
    g.fillStyle = 'rgba(42,110,187,.09)';
    g.fillRect(fx, fy, fw, fh);
    g.strokeStyle = FARBE.blau; g.lineWidth = 1.5; g.setLineDash([6, 5]);
    g.strokeRect(fx, fy, fw, fh); g.setLineDash([]);
    const staerke = B / 500;
    for (let i = 0; i < 7; i++) for (let k = 0; k < 3; k++) {
      const cx2 = fx + 28 + i * 46, cy2 = fy + 28 + k * 47;
      g.globalAlpha = 0.25 + staerke * 0.75;
      g.strokeStyle = FARBE.blau; g.lineWidth = 1.3;
      g.beginPath(); g.arc(cx2, cy2, 8.5, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(cx2 - 6, cy2 - 6); g.lineTo(cx2 + 6, cy2 + 6);
      g.moveTo(cx2 + 6, cy2 - 6); g.lineTo(cx2 - 6, cy2 + 6); g.stroke();
      g.globalAlpha = 1;
    }
    g.fillStyle = FARBE.blau; g.font = '600 12.5px -apple-system, Helvetica'; g.textAlign = 'left';
    g.fillText('Feld B zeigt in die Zeichenebene hinein', fx, fy - 12);

    // Schleife
    const sb = 110, sh = 118, sy = fy + 16;
    const li = Math.max(x, fx), re = Math.min(x + sb, fx + fw);
    const ueber = Math.max(0, re - li);
    if (ueber > 0) {
      g.fillStyle = 'rgba(217,163,0,.3)';
      g.fillRect(li, sy, ueber, sh);
    }
    g.strokeStyle = '#b87333'; g.lineWidth = 5;
    g.strokeRect(x, sy, sb, sh);
    g.fillStyle = FARBE.leicht; g.font = '12px -apple-system, Helvetica'; g.textAlign = 'left';
    g.fillText('Leiterschleife, n = ' + N_WDG, x, sy - 10);

    // Zugpfeil am Griff
    if (v > 0.01) {
      const ay = sy + sh / 2;
      g.strokeStyle = FARBE.gruen; g.lineWidth = 3; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x + sb + 10, ay); g.lineTo(x + sb + 46, ay); g.stroke();
      g.beginPath(); g.moveTo(x + sb + 56, ay); g.lineTo(x + sb + 42, ay - 8);
      g.lineTo(x + sb + 42, ay + 8); g.closePath(); g.fillStyle = FARBE.gruen; g.fill();
      g.fillStyle = FARBE.gruen; g.font = '600 13px -apple-system, Helvetica';
      g.fillText('v', x + sb + 26, ay - 12);
    }

    // Spannung
    const kanteDrin = (x < fx + fw && x + sb > fx + fw) || (x < fx && x + sb > fx);
    const U = kanteDrin ? N_WDG * (B * 1e-3) * BREITE_M * v : 0;

    // Spannungsbalken unten
    const by = H - 34, bx = fx, bw = fw;
    g.fillStyle = '#f1ede4'; g.fillRect(bx, by, bw, 18);
    const anteil = Math.min(1, U / 1.0);
    const verlauf = g.createLinearGradient(bx, 0, bx + bw, 0);
    verlauf.addColorStop(0, '#2e7d4f'); verlauf.addColorStop(1, '#7cc79b');
    g.fillStyle = verlauf; g.fillRect(bx, by, bw * anteil, 18);
    g.strokeStyle = '#e4e0d6'; g.lineWidth = 1; g.strokeRect(bx, by, bw, 18);
    g.fillStyle = FARBE.tinte; g.font = '600 12.5px -apple-system, Helvetica'; g.textAlign = 'left';
    g.fillText('U = ' + zahl(U * 1e3, 0) + ' mV', bx + bw + 12, by + 14);
    g.fillStyle = FARBE.leicht; g.font = '12px -apple-system, Helvetica';
    g.fillText(kanteDrin ? 'Die Kante schneidet die Feldgrenze – es wird induziert.'
                         : 'Keine Kante an der Feldgrenze – nichts ändert sich.', bx, by - 8);

    document.getElementById('fa-v-out').textContent = zahl(v, 2) + ' m/s';
    document.getElementById('fa-b-out').textContent = Math.round(B) + ' mT';
    document.getElementById('fa-u').textContent = zahl(U * 1e3, 1) + ' mV';
  }

  function lauf(jetzt) {
    const dt = Math.min((jetzt - letzte) / 1000, 0.05); letzte = jetzt;
    x += +vR.value * 75 * dt;
    if (x > 470) x = 20;
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
  const autoKnopf = document.getElementById('lz-auto');
  const linienAn = document.getElementById('lz-linien');
  let letztePos = +pos.value, v = 0, letzte = performance.now();
  let auto = false, richtung = 1;

  autoKnopf.addEventListener('click', () => {
    auto = !auto;
    autoKnopf.textContent = auto ? 'Automatik aus' : 'Automatisch bewegen';
  });
  pos.addEventListener('input', () => { auto = false; autoKnopf.textContent = 'Automatisch bewegen'; });

  // Feld eines Stabmagneten: Bögen von Nord nach Süd
  function feldlinien(mx, my, halb) {
    g.lineWidth = 1.8;
    for (let k = 1; k <= 4; k++) {
      const h = 18 + k * 26;
      const w = halb + k * 18;
      [-1, 1].forEach(seite => {
        g.strokeStyle = 'rgba(42,110,187,' + (0.62 - k * 0.075).toFixed(3) + ')';
        g.beginPath();
        g.moveTo(mx - halb, my);
        g.bezierCurveTo(mx - w, my + seite * h, mx + w, my + seite * h, mx + halb, my);
        g.stroke();
        const px2 = mx, py2 = my + seite * h * 0.74;
        g.fillStyle = 'rgba(42,110,187,' + (0.7 - k * 0.09).toFixed(3) + ')';
        g.beginPath();
        g.moveTo(px2 + 8, py2 - 5); g.lineTo(px2 + 8, py2 + 5); g.lineTo(px2 + 16, py2);
        g.closePath(); g.fill();
      });
    }
  }

  function zeichnen() {
    const W = c._b, H = c._h, my = H / 2 - 8;
    g.clearRect(0, 0, W, H);
    const p = +pos.value;
    const sx = W / 2 - 90;
    const mx = sx + p * 1.5;
    const halb = 52;

    if (linienAn.checked) feldlinien(mx, my, halb);

    // Spule
    const windungen = 8, abstand = 15;
    const x0 = sx - (windungen - 1) * abstand / 2;
    g.strokeStyle = '#b87333'; g.lineWidth = 4.5;
    for (let i = 0; i < windungen; i++) {
      g.beginPath(); g.ellipse(x0 + i * abstand, my, 13, 56, 0, 0, 7); g.stroke();
    }

    // Magnet
    g.save();
    g.shadowColor = 'rgba(30,36,48,.2)'; g.shadowBlur = 10; g.shadowOffsetY = 4;
    g.fillStyle = FARBE.rot; g.fillRect(mx - halb, my - 20, halb, 40);
    g.fillStyle = FARBE.blau; g.fillRect(mx, my - 20, halb, 40);
    g.restore();
    g.fillStyle = '#fff'; g.font = 'bold 16px -apple-system, Helvetica'; g.textAlign = 'center';
    g.fillText('N', mx - halb / 2, my + 6);
    g.fillText('S', mx + halb / 2, my + 6);

    // Messgerät
    const gx = Math.min(W - 92, sx + 250), gy = my;
    g.strokeStyle = FARBE.tinte; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x0 + (windungen - 1) * abstand + 8, my - 54); g.lineTo(gx + 6, gy - 42); g.stroke();
    g.beginPath(); g.moveTo(x0 + (windungen - 1) * abstand + 8, my + 54); g.lineTo(gx + 6, gy + 42); g.stroke();
    g.fillStyle = '#fff'; g.strokeStyle = FARBE.tinte; g.lineWidth = 2;
    g.beginPath();
    if (g.roundRect) g.roundRect(gx, gy - 40, 76, 80, 8); else g.rect(gx, gy - 40, 76, 80);
    g.fill(); g.stroke();
    const zeiger = Math.max(-1, Math.min(1, v / 130));
    g.strokeStyle = '#ddd8cc'; g.lineWidth = 2;
    g.beginPath(); g.arc(gx + 38, gy + 22, 42, Math.PI * 1.23, Math.PI * 1.77); g.stroke();
    g.strokeStyle = FARBE.rot; g.lineWidth = 3; g.lineCap = 'round';
    const w2 = Math.PI * 1.5 + zeiger * Math.PI * 0.26;
    g.beginPath(); g.moveTo(gx + 38, gy + 22);
    g.lineTo(gx + 38 + Math.cos(w2) * 42, gy + 22 + Math.sin(w2) * 42); g.stroke();
    g.fillStyle = FARBE.tinte; g.beginPath(); g.arc(gx + 38, gy + 22, 4, 0, 7); g.fill();
    g.fillStyle = FARBE.leicht; g.font = '11px -apple-system, Helvetica';
    g.fillText('mV', gx + 38, gy + 36);

    const text = document.getElementById('lz-text');
    const drinnen = Math.abs(mx - sx) < 54;
    if (Math.abs(v) > 8) {
      const naehert = (mx < sx && v > 0) || (mx > sx && v < 0);
      g.strokeStyle = FARBE.gruen; g.lineWidth = 3;
      g.beginPath();
      g.arc(sx, my, 76, naehert ? -1.0 : 1.0, naehert ? 1.0 : -1.0, !naehert);
      g.stroke();
      const aw = naehert ? 1.0 : -1.0;
      g.save(); g.translate(sx + Math.cos(aw) * 76, my + Math.sin(aw) * 76);
      g.rotate(aw + (naehert ? Math.PI / 2 : -Math.PI / 2));
      g.fillStyle = FARBE.gruen; g.beginPath();
      g.moveTo(0, -9); g.lineTo(6, 6); g.lineTo(-6, 6); g.closePath(); g.fill();
      g.restore();
      g.fillStyle = FARBE.gruen; g.font = '600 13px -apple-system, Helvetica'; g.textAlign = 'center';
      g.fillText('induzierter Strom', sx, my + 98);

      const seiteX = mx < sx ? x0 - 26 : x0 + (windungen - 1) * abstand + 26;
      g.fillStyle = naehert ? FARBE.rot : FARBE.blau;
      g.font = 'bold 21px -apple-system, Helvetica';
      g.fillText(naehert ? 'N' : 'S', seiteX, my + 7);

      text.textContent = drinnen
        ? (naehert ? 'Der Magnet taucht ein. Der Fluss wächst, die Spule hält dagegen.'
                   : 'Der Magnet taucht aus. Der Fluss schrumpft, die Spule hält ihn fest.')
        : (naehert ? 'Der Pol kommt näher. Die Spule baut denselben Pol auf und stößt ihn ab.'
                   : 'Der Magnet geht weg. Die Spule baut den Gegenpol auf und zieht hinterher.');
    } else {
      text.textContent = 'Nichts passiert – der Magnet steht still.';
    }

    g.textAlign = 'center';
    g.fillStyle = FARBE.leicht; g.font = '12.5px -apple-system, Helvetica';
    g.fillText('Schiebe den Magneten ganz durch die Spule.', W / 2, H - 8);
  }

  function lauf(jetzt) {
    const dt = Math.max(0.001, Math.min((jetzt - letzte) / 1000, 0.05)); letzte = jetzt;
    if (auto) {
      let p = +pos.value + richtung * 75 * dt;
      if (p > 150) { p = 150; richtung = -1; }
      if (p < -150) { p = -150; richtung = 1; }
      pos.value = p;
    }
    const p = +pos.value;
    v = v * 0.78 + ((p - letztePos) / dt) * 0.22;
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
