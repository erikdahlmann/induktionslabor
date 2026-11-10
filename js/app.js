// Verdrahtung der ganzen Seite
import { zustand, SPULEN, bMax, messwert, feldZurZeit, zahl,
         spannungText, flussdichteText, rateText } from './physik.js';
import { laborStarten, laborHorcher, kameraSetzen } from './labor.js';
import { animFluss, animBU, animFlaeche, animLenz, selbstcheck } from './theorie.js';
import { messwertHinzufuegen, tabelleLeeren, tabelleZeichnen, diagrammZeichnen } from './auswertung.js';
import { aufgabenAufbauen } from './aufgaben.js';
import { alsPDF, alsHTML, alsCSV, standSichern, standLaden, vorschauZeigen } from './export.js';

const speicher = { aufgaben: {}, check: {} };
window.labor = { zustand, speicher };   // für Vorführung und Fehlersuche

// ---------------------------------------------------------------- KaTeX
function formelnSetzen() {
  document.querySelectorAll('span.m:not([data-fertig])').forEach(e => {
    const quelle = e.dataset.tex ?? e.textContent;
    e.dataset.tex = quelle;
    e.dataset.fertig = '1';
    try { katex.render(quelle, e, { throwOnError: false }); } catch {}
  });
  document.querySelectorAll('p.formel[data-tex]:not([data-fertig])').forEach(e => {
    e.dataset.fertig = '1';
    try { katex.render(e.dataset.tex, e, { throwOnError: false, displayMode: true }); } catch {}
  });
}

// ---------------------------------------------------------------- Oszilloskop
const spur = [];           // { t, B, U }
const SPUR_DAUER = 12;     // Sekunden Fenster

function oszi() {
  const c = document.getElementById('oszi');
  if (!c._fertig) {
    const q = Math.min(devicePixelRatio || 1, 2);
    c._b = c.width; c._h = c.height;
    c.width = c._b * q; c.height = c._h * q;
    c.getContext('2d').scale(q, q);
    c._fertig = true;
  }
  const g = c.getContext('2d'), W = c._b, H = c._h;
  g.fillStyle = '#10151d'; g.fillRect(0, 0, W, H);
  const r = { x: 38, y: 14, w: W - 52, h: H - 44 };
  g.strokeStyle = '#1d2a38'; g.lineWidth = 1;
  for (let i = 0; i <= 8; i++) {
    const x = r.x + i * r.w / 8; g.beginPath(); g.moveTo(x, r.y); g.lineTo(x, r.y + r.h); g.stroke();
  }
  for (let i = 0; i <= 4; i++) {
    const y = r.y + i * r.h / 4; g.beginPath(); g.moveTo(r.x, y); g.lineTo(r.x + r.w, y); g.stroke();
  }
  const my = r.y + r.h / 2;
  g.strokeStyle = '#2c3d50'; g.lineWidth = 1.4;
  g.beginPath(); g.moveTo(r.x, my); g.lineTo(r.x + r.w, my); g.stroke();

  if (spur.length > 1) {
    const t1 = spur[spur.length - 1].t, t0 = t1 - SPUR_DAUER;
    const bAbs = Math.max(1e-9, ...spur.map(s => Math.abs(s.B)));
    const uAbs = Math.max(1e-12, ...spur.map(s => Math.abs(s.U)));
    const px = t => r.x + (t - t0) / SPUR_DAUER * r.w;

    const linie = (feld, grenze, farbe) => {
      g.strokeStyle = farbe; g.lineWidth = 2;
      g.beginPath();
      let erster = true;
      spur.forEach(s => {
        if (s.t < t0) return;
        const y = my - s[feld] / grenze * (r.h / 2 - 8);
        erster ? (g.moveTo(px(s.t), y), erster = false) : g.lineTo(px(s.t), y);
      });
      g.stroke();
    };
    linie('B', bAbs, '#ff8a6b');
    linie('U', uAbs, '#7cf0b4');

    g.font = '11px -apple-system, Helvetica'; g.textAlign = 'left';
    g.fillStyle = '#ff8a6b'; g.fillText('B  (± ' + flussdichteText(bAbs) + ')', r.x + 4, r.y + 12);
    g.fillStyle = '#7cf0b4'; g.fillText('U  (± ' + spannungText(uAbs) + ')', r.x + 4, r.y + 26);
    g.fillStyle = '#6d7b8c'; g.textAlign = 'right';
    g.fillText(zahl(SPUR_DAUER, 0) + ' s Fenster', r.x + r.w, r.y + r.h + 18);
  } else {
    g.fillStyle = '#4a5a6c'; g.font = '13px -apple-system, Helvetica'; g.textAlign = 'center';
    g.fillText('Versuch starten, um die Kurven zu sehen', W / 2, H / 2);
  }
  requestAnimationFrame(oszi);
}

// ---------------------------------------------------------------- Bedienpult
function pultAufbauen() {
  const sel = document.getElementById('r-spule');
  SPULEN.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.name;
    sel.appendChild(o);
  });
  sel.value = 's150';

  const nF = document.getElementById('r-n'), aF = document.getElementById('r-a');
  sel.addEventListener('change', () => {
    const s = SPULEN.find(x => x.id === sel.value);
    if (s && s.n) { nF.value = s.n; aF.value = s.A; }
    uebernehmen();
  });

  const binden = (id, feld, wandler, ausgabe) => {
    const e = document.getElementById(id);
    const setzen = () => {
      zustand[feld] = wandler(e.value);
      if (ausgabe) document.getElementById(id + '-out').textContent = ausgabe(zustand[feld]);
      infosAktualisieren();
    };
    e.addEventListener('input', setzen);
    setzen();
  };

  binden('r-strom', 'I', Number, v => zahl(v, 2) + ' A');
  binden('r-freq', 'f', Number, v => zahl(v, 2) + ' Hz');
  document.getElementById('r-form').addEventListener('change', e => {
    zustand.form = e.target.value; infosAktualisieren();
  });
  [nF, aF].forEach(e => e.addEventListener('input', uebernehmen));

  binden('f-b', 'fB', Number, v => Math.round(v) + ' mT');
  binden('f-v', 'fv', Number, v => zahl(v, 2) + ' m/s');
  document.getElementById('f-n').addEventListener('input', uebernehmen);
  document.getElementById('f-b-breite').addEventListener('input', uebernehmen);

  function uebernehmen() {
    zustand.n = Math.max(1, +nF.value || 1);
    zustand.A = Math.max(0.1, +aF.value || 0.1);
    zustand.fn = Math.max(1, +document.getElementById('f-n').value || 1);
    zustand.fb = Math.max(1, +document.getElementById('f-b-breite').value || 1);
    infosAktualisieren();
  }
  uebernehmen();

  // Tabs
  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(x => x.classList.remove('tab-aktiv'));
    t.classList.add('tab-aktiv');
    zustand.modus = t.dataset.modus;
    document.getElementById('pult-feld').hidden = zustand.modus !== 'feld';
    document.getElementById('pult-flaeche').hidden = zustand.modus !== 'flaeche';
    zustand.t = 0; spur.length = 0;
  }));

  document.querySelectorAll('[data-kamera]').forEach(b =>
    b.addEventListener('click', () => kameraSetzen(b.dataset.kamera)));

  document.getElementById('btn-start').addEventListener('click', e => {
    zustand.laeuft = !zustand.laeuft;
    e.target.textContent = zustand.laeuft ? 'Pause' : 'Versuch starten';
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    zustand.t = 0; zustand.laeuft = false; spur.length = 0;
    document.getElementById('btn-start').textContent = 'Versuch starten';
  });
  document.getElementById('btn-messen').addEventListener('click', messwertUebernehmen);
  document.getElementById('btn-tab-leeren').addEventListener('click', tabelleLeeren);
}

function infosAktualisieren() {
  document.getElementById('info-bmax').textContent = zahl(bMax() * 1e3, 2) + ' mT';
  document.getElementById('info-na').textContent = zahl(zustand.n * zustand.A * 1e-4, 4) + ' m²';
  const u = zustand.fn * zustand.fB * 1e-3 * zustand.fb * 1e-2 * zustand.fv;
  document.getElementById('info-uflaeche').textContent = spannungText(u);
}

// Messwert aufnehmen: mittlere Änderungsrate während einer Rampe
function messwertUebernehmen() {
  if (zustand.modus !== 'feld') {
    alert('Messwerte für die Tabelle werden im Modus „Feld ändern" aufgenommen.');
    return;
  }
  if (zustand.form === 'konstant') {
    alert('Bei Gleichstrom ändert sich nichts. Stelle Dreieck- oder Sinusstrom ein.');
    return;
  }
  // Rauschen wie bei einer echten Messung (± 2 %)
  const rauschen = () => 1 + (Math.random() - 0.5) * 0.04;
  let dB, U;
  if (zustand.form === 'dreieck') {
    dB = bMax() * 2 * zustand.f;                       // Betrag der Rampensteigung
    U = zustand.n * zustand.A * 1e-4 * dB;
  } else {
    dB = bMax() * 2 * Math.PI * zustand.f;             // Scheitelwert der Änderungsrate
    U = zustand.n * zustand.A * 1e-4 * dB;
  }
  messwertHinzufuegen({
    n: zustand.n, A: zustand.A,
    dB: dB * 1e3 * rauschen(),
    U: U * 1e6 * rauschen()
  });
  const b = document.getElementById('btn-messen');
  b.textContent = 'Übernommen ✓';
  setTimeout(() => b.textContent = 'Messwert übernehmen', 1200);
}

// ---------------------------------------------------------------- Export
function exportAufbauen() {
  const d = document.getElementById('ex-datum');
  if (!d.value) d.value = new Date().toISOString().slice(0, 10);
  document.getElementById('btn-pdf').addEventListener('click', () => alsPDF(speicher));
  document.getElementById('btn-html').addEventListener('click', () => alsHTML(speicher));
  document.getElementById('btn-csv').addEventListener('click', alsCSV);
  document.getElementById('btn-speichern').addEventListener('click', () => standSichern(speicher));
  document.getElementById('btn-laden').addEventListener('click', () => standLaden(speicher, () => {
    tabelleZeichnen(); diagrammZeichnen(); vorschauZeigen(speicher);
  }));
  // Vorschau aktualisieren, wenn der Abschnitt sichtbar wird
  const b = new IntersectionObserver(e => {
    if (e[0].isIntersecting) vorschauZeigen(speicher);
  }, { threshold: 0.15 });
  b.observe(document.getElementById('export'));
}

// ---------------------------------------------------------------- Start
function start() {
  formelnSetzen();
  animFluss(); animBU(); animFlaeche(); animLenz();
  selbstcheck(speicher);
  aufgabenAufbauen(speicher);
  pultAufbauen();
  tabelleZeichnen(); diagrammZeichnen();
  exportAufbauen();

  try {
    laborStarten('buehne');
    laborHorcher(m => {
      document.getElementById('anz-b').textContent = flussdichteText(m.B);
      document.getElementById('anz-bp').textContent = zustand.modus === 'feld'
        ? rateText(m.dB) : '– (Fläche ändert sich)';
      document.getElementById('anz-u').textContent = spannungText(m.U);
      document.getElementById('uhr-wert').textContent = zahl(zustand.t, 1) + ' s';
      if (zustand.laeuft) {
        spur.push({ t: zustand.t, B: m.B, U: m.U });
        if (spur.length > 4000) spur.splice(0, 1500);
      }
    });
  } catch (e) {
    document.getElementById('buehne').innerHTML =
      '<p style="padding:30px;font:15px -apple-system,Helvetica;color:#5a6475">' +
      'Das 3D-Labor konnte nicht starten (WebGL fehlt). Die Rechnung und die Diagramme funktionieren trotzdem.</p>';
    console.error(e);
  }
  oszi();
  // Formeln, die erst jetzt in den Aufbau kamen
  formelnSetzen();
}

if (document.readyState === 'loading') addEventListener('DOMContentLoaded', start);
else start();
