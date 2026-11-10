// Messtabelle, Diagramm und Ausgleichsgerade
import { zahl } from './physik.js';

export const messreihe = [];   // { n, A, dB (mT/s), U (µV) }

export function messwertHinzufuegen(e) {
  messreihe.push(e);
  tabelleZeichnen();
  diagrammZeichnen();
}

export function tabelleLeeren() {
  messreihe.length = 0;
  tabelleZeichnen();
  diagrammZeichnen();
}

export function tabelleZeichnen() {
  const tb = document.querySelector('#messtabelle tbody');
  const leer = document.getElementById('tab-leer');
  tb.innerHTML = '';
  leer.hidden = messreihe.length > 0;
  messreihe.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i + 1}</td><td>${m.n}</td><td>${zahl(m.A, 1)}</td>` +
      `<td>${zahl(m.dB, 3)}</td><td>${zahl(m.U, 1)}</td>` +
      `<td><button class="loeschen" data-weg="${i}" title="Zeile löschen">×</button></td>`;
    tb.appendChild(tr);
  });
  tb.querySelectorAll('[data-weg]').forEach(b => b.addEventListener('click', () => {
    messreihe.splice(+b.dataset.weg, 1); tabelleZeichnen(); diagrammZeichnen();
  }));
}

// Ausgleichsgerade durch den Ursprung ist physikalisch sinnvoll,
// wir rechnen zusätzlich die allgemeine Regression für den Achsenabschnitt.
export function regression() {
  const p = messreihe.filter(m => isFinite(m.dB) && isFinite(m.U));
  if (p.length < 2) return null;
  const sx = p.reduce((s, m) => s + m.dB, 0), sy = p.reduce((s, m) => s + m.U, 0);
  const n = p.length, mx = sx / n, my = sy / n;
  let zaehler = 0, nenner = 0;
  p.forEach(m => { zaehler += (m.dB - mx) * (m.U - my); nenner += (m.dB - mx) ** 2; });
  if (nenner === 0) return null;
  const a = zaehler / nenner, b = my - a * mx;
  // Bestimmtheitsmaß
  let ssr = 0, sst = 0;
  p.forEach(m => { const v = a * m.dB + b; ssr += (m.U - v) ** 2; sst += (m.U - my) ** 2; });
  const r2 = sst > 0 ? 1 - ssr / sst : 1;
  // Steigung in µV/(mT/s) = 1e-6 V / 1e-3 (T/s) = 1e-3 m²  ->  n·A in m²
  const nA = a * 1e-3;
  return { a, b, r2, nA, punkte: p.length };
}

export function diagrammZeichnen() {
  const c = document.getElementById('diagramm'); if (!c) return;
  if (!c._fertig) {
    const q = Math.min(devicePixelRatio || 1, 2);
    c._b = c.width; c._h = c.height;
    c.width = c._b * q; c.height = c._h * q;
    c.getContext('2d').scale(q, q);
    c._fertig = true;
  }
  const g = c.getContext('2d'), W = c._b, H = c._h;
  g.clearRect(0, 0, W, H);
  const r = { x: 72, y: 26, w: W - 100, h: H - 82 };

  const maxX = Math.max(0.5, ...messreihe.map(m => m.dB)) * 1.15;
  const maxY = Math.max(10, ...messreihe.map(m => m.U)) * 1.15;
  const px = v => r.x + v / maxX * r.w;
  const py = v => r.y + r.h - v / maxY * r.h;

  // Gitter
  g.strokeStyle = '#eeebe3'; g.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    const y = r.y + i * r.h / 5, x = r.x + i * r.w / 5;
    g.beginPath(); g.moveTo(r.x, y); g.lineTo(r.x + r.w, y); g.stroke();
    g.beginPath(); g.moveTo(x, r.y); g.lineTo(x, r.y + r.h); g.stroke();
  }
  // Achsen
  g.strokeStyle = '#1e2430'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + r.h); g.lineTo(r.x + r.w, r.y + r.h); g.stroke();
  g.fillStyle = '#5a6475'; g.font = '12px -apple-system, Helvetica';
  g.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const v = maxY * i / 5;
    g.fillText(zahl(v, 0), r.x - 8, r.y + r.h - i * r.h / 5 + 4);
  }
  g.textAlign = 'center';
  for (let i = 0; i <= 5; i++) {
    const v = maxX * i / 5;
    g.fillText(zahl(v, 2), r.x + i * r.w / 5, r.y + r.h + 18);
  }
  g.fillStyle = '#1e2430'; g.font = '600 13px -apple-system, Helvetica';
  g.fillText('Änderungsrate Ḃ in mT/s', r.x + r.w / 2, H - 10);
  g.save(); g.translate(18, r.y + r.h / 2); g.rotate(-Math.PI / 2);
  g.fillText('U in µV', 0, 0); g.restore();

  // Ausgleichsgerade
  const reg = regression();
  if (reg) {
    g.strokeStyle = '#1f6f8b'; g.lineWidth = 2;
    g.beginPath();
    g.moveTo(px(0), py(Math.max(0, reg.b)));
    g.lineTo(px(maxX), py(reg.a * maxX + reg.b));
    g.stroke();
  }
  // Punkte
  messreihe.forEach(m => {
    g.fillStyle = '#c0392b';
    g.beginPath(); g.arc(px(m.dB), py(m.U), 5, 0, 7); g.fill();
    g.strokeStyle = '#fff'; g.lineWidth = 1.5; g.stroke();
  });

  // Kästen unter dem Diagramm füllen
  const f = document.getElementById('reg-formel'),
        s = document.getElementById('reg-steigung'),
        th = document.getElementById('reg-theorie'),
        u = document.getElementById('reg-urteil');
  if (!reg) {
    f.textContent = s.textContent = th.textContent = '–';
    u.textContent = 'Mindestens zwei Messwerte nötig.'; u.className = 'urteil';
    return;
  }
  f.textContent = `U = ${zahl(reg.a, 1)} µV/(mT/s) · Ḃ ${reg.b >= 0 ? '+' : '–'} ${zahl(Math.abs(reg.b), 1)} µV   (R² = ${zahl(reg.r2, 4)})`;
  s.textContent = `${zahl(reg.a, 1)} µV/(mT/s)  =  ${zahl(reg.nA, 4)} m²`;
  const theorie = messreihe.map(m => m.n * m.A * 1e-4);
  const gleich = theorie.every(t => Math.abs(t - theorie[0]) < 1e-9);
  th.textContent = gleich ? `${zahl(theorie[0], 4)} m²`
                          : 'verschiedene Spulen in der Reihe – bitte getrennt auswerten';
  if (gleich) {
    const abw = Math.abs(reg.nA - theorie[0]) / theorie[0] * 100;
    u.textContent = abw < 5
      ? `Sehr gut: Abweichung nur ${zahl(abw, 1)} %. Die Steigung ist n·A.`
      : abw < 15
        ? `Fast: Abweichung ${zahl(abw, 1)} %. Miss noch ein paar Werte.`
        : `Abweichung ${zahl(abw, 1)} %. Prüfe, ob alle Werte zur selben Spule gehören.`;
    u.className = 'urteil ' + (abw < 5 ? 'urteil-gut' : abw < 15 ? 'urteil-mittel' : '');
  } else {
    u.textContent = 'Wähle für die Ausgleichsgerade nur Messwerte mit derselben Spule.';
    u.className = 'urteil urteil-mittel';
  }
}
