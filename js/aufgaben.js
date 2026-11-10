// Rechenaufgaben mit Selbstkontrolle
import { zahl } from './physik.js';

export const AUFGABEN = [
  {
    nr: 1, stufe: 'Grundlagen',
    text: 'In einer Spule steigt die magnetische Flussdichte innerhalb von ' +
          '<b>Δt = 7,5 ms</b> gleichmäßig um <b>ΔB = 6,4 mT</b> an. ' +
          'Die Spule hat <b>n = 1500</b> Windungen und eine Querschnittsfläche von <b>A = 0,0028 m²</b>.',
    teile: [
      { frage: 'a) Berechne den Betrag der induzierten Spannung während des Anstiegs.',
        soll: 3.584, einheit: 'V', tol: 0.02,
        loesung: 'U = n·A·ΔB/Δt = 1500 · 0,0028 m² · (6,4·10⁻³ T / 7,5·10⁻³ s) = 1500 · 0,0028 · 0,8533 T/s ≈ <b>3,58 V</b>' },
      { frage: 'b) Die Spule wird durch eine Spule mit halbem Radius ersetzt (gleiche Windungszahl). Wie groß ist die Spannung jetzt?',
        soll: 0.896, einheit: 'V', tol: 0.02,
        loesung: 'Halber Radius bedeutet ein Viertel der Fläche (A ~ r²). Also auch ein Viertel der Spannung: 3,58 V / 4 ≈ <b>0,896 V</b>' },
      { frage: 'c) In einer Zeitspanne von Δt = 5,0 ms bleibt die Flussdichte konstant bei B = 12,8 mT. Wie groß ist U?',
        soll: 0, einheit: 'V', tol: 0.001, absolut: true,
        loesung: 'Konstantes Feld heißt Ḃ = 0. Damit ist <b>U = 0 V</b>. Nur die Änderung zählt.' }
    ]
  },
  {
    nr: 2, stufe: 'Umkehraufgabe',
    text: 'Eine Spule mit <b>n = 1000</b> Windungen und <b>A = 0,0028 m²</b> liefert ' +
          'für die ersten <b>7,5 ms</b> die Spannung <b>U = 2,5 V</b> und für die folgenden ' +
          '<b>15 ms</b> die Spannung <b>U = −2,5 V</b>.',
    teile: [
      { frage: 'a) Berechne die Flussdichteänderung ΔB in den ersten 7,5 ms (in mT).',
        soll: 6.696, einheit: 'mT', tol: 0.03,
        loesung: 'ΔB = U·Δt / (n·A) = 2,5 V · 7,5·10⁻³ s / (1000 · 0,0028 m²) = 0,01875 / 2,8 T ≈ <b>6,70 mT</b>' },
      { frage: 'b) Berechne ΔB in den folgenden 15 ms (Betrag, in mT).',
        soll: 13.393, einheit: 'mT', tol: 0.03,
        loesung: 'ΔB = 2,5 V · 15·10⁻³ s / 2,8 m² ≈ <b>13,4 mT</b>. Das Vorzeichen ist negativ: Das Feld fällt wieder ab.' },
      { frage: 'c) In einer Zeitspanne von 5,0 ms bleibt U = 5 V konstant. Welche Flussdichteänderung gehört dazu (in mT)?',
        soll: 8.929, einheit: 'mT', tol: 0.03,
        loesung: 'Konstantes U heißt: B ändert sich gleichmäßig (lineare Rampe). ' +
                 'ΔB = 5 V · 5·10⁻³ s / 2,8 m² ≈ <b>8,93 mT</b>' }
    ]
  },
  {
    nr: 3, stufe: 'Diagramm lesen', diagramm: true,
    text: 'Die Flussdichte B in einer Spule (<b>n = 500</b> Windungen, <b>A = 0,0025 m²</b>) ' +
          'verläuft wie im Diagramm. Lies die Abschnitte ab und berechne jeweils U.',
    teile: [
      { frage: 'a) Spannung im Abschnitt 0 s bis 6 s (in mV).',
        soll: 2.5, einheit: 'mV', tol: 0.03,
        loesung: 'Ḃ = 12 mT / 6 s = 2,0 mT/s. U = n·A·Ḃ = 500 · 0,0025 · 2,0·10⁻³ = 2,5·10⁻³ V = <b>2,5 mV</b> (negativ, weil B steigt)' },
      { frage: 'b) Spannung im Abschnitt 6 s bis 9 s (in mV).',
        soll: 0, einheit: 'mV', tol: 0.001, absolut: true,
        loesung: 'B ist konstant, also Ḃ = 0 und <b>U = 0 mV</b>.' },
      { frage: 'c) Spannung im Abschnitt 9 s bis 15 s (in mV, Betrag).',
        soll: 2.5, einheit: 'mV', tol: 0.03,
        loesung: 'Ḃ = −12 mT / 6 s = −2,0 mT/s. Betrag der Spannung wieder <b>2,5 mV</b>, ' +
                 'aber mit umgekehrtem Vorzeichen zu Teil a).' }
    ]
  },
  {
    nr: 4, stufe: 'Fläche statt Feld',
    text: 'Eine rechteckige Leiterschleife mit <b>n = 50</b> Windungen und der Breite ' +
          '<b>b = 12 cm</b> wird mit <b>v = 1,5 m/s</b> aus einem Magnetfeld der Flussdichte ' +
          '<b>B = 0,45 T</b> herausgezogen.',
    teile: [
      { frage: 'a) Berechne den Betrag der induzierten Spannung (in V).',
        soll: 4.05, einheit: 'V', tol: 0.02,
        loesung: 'U = n·B·b·v = 50 · 0,45 T · 0,12 m · 1,5 m/s = <b>4,05 V</b>' },
      { frage: 'b) Die Schleife ist vollständig aus dem Feld heraus und bewegt sich weiter. Wie groß ist U (in V)?',
        soll: 0, einheit: 'V', tol: 0.001, absolut: true,
        loesung: 'Außerhalb des Feldes ändert sich der Fluss nicht mehr: <b>U = 0 V</b>.' }
    ]
  },
  {
    nr: 5, stufe: 'Begründen', frei: true,
    text: 'In einem zweiten Versuch wird statt des Dreieckstromnetzgeräts ein <b>Sinusgenerator</b> verwendet. ' +
          'Begründe, welche Form die induzierte Spannung dann hat, und gib ihren Scheitelwert als Formel an.',
    teile: [
      { frage: 'Deine Begründung:',
        loesung: 'Mit B(t) = B<sub>max</sub>·sin(2πft) folgt nach der Kettenregel<br>' +
                 'U(t) = −n·A·Ḃ(t) = −n·A·B<sub>max</sub>·2πf·cos(2πft).<br>' +
                 'Die Spannung ist also ebenfalls sinusförmig (genauer: cosinusförmig, um eine Viertelperiode verschoben). ' +
                 'Der Scheitelwert beträgt <b>U<sub>max</sub> = n·A·B<sub>max</sub>·2πf</b>. ' +
                 'Er wächst mit der Frequenz: doppelte Frequenz, doppelte Spannung.' }
    ]
  }
];

export function aufgabenAufbauen(speicher) {
  const liste = document.getElementById('aufgaben-liste'); if (!liste) return;
  AUFGABEN.forEach((a, ai) => {
    const el = document.createElement('article');
    el.className = 'aufgabe';
    el.innerHTML = `<div class="aufgabe-kopf"><span class="aufgabe-nr">Aufgabe ${a.nr}</span>` +
                   `<span class="aufgabe-stufe">${a.stufe}</span></div><p>${a.text}</p>`;
    if (a.diagramm) {
      const c = document.createElement('canvas');
      c.width = 520; c.height = 260; c.className = 'auf-diagramm';
      c.style.cssText = 'width:100%;max-width:520px;height:auto;background:#fff;border:1px solid #e1ddd4;border-radius:10px;margin:10px 0';
      el.appendChild(c);
      setTimeout(() => btDiagramm(c), 0);
    }
    a.teile.forEach((t, ti) => {
      const d = document.createElement('div');
      d.className = 'teilaufgabe';
      if (a.frei) {
        d.innerHTML = `<p>${t.frage}</p>` +
          `<textarea rows="5" data-frei="${ai}-${ti}" placeholder="Schreibe deine Begründung …"></textarea>` +
          `<details class="loesung"><summary>Musterlösung anzeigen</summary><div>${t.loesung}</div></details>`;
      } else {
        d.innerHTML = `<p>${t.frage}</p>` +
          `<div class="eingabe-zeile"><input type="text" inputmode="decimal" data-ein="${ai}-${ti}" placeholder="Ergebnis">` +
          `<span class="einheit">${t.einheit}</span>` +
          `<button class="knopf-klein" data-pruef="${ai}-${ti}">Prüfen</button>` +
          `<span class="rueck" data-rueck="${ai}-${ti}"></span></div>` +
          `<details class="loesung"><summary>Lösungsweg anzeigen</summary><div>${t.loesung}</div></details>`;
      }
      el.appendChild(d);
    });
    liste.appendChild(el);
  });

  liste.querySelectorAll('[data-pruef]').forEach(b => {
    b.addEventListener('click', () => pruefen(b.dataset.pruef, speicher));
  });
  liste.querySelectorAll('[data-ein]').forEach(i => {
    i.addEventListener('keydown', e => { if (e.key === 'Enter') pruefen(i.dataset.ein, speicher); });
  });
  standAktualisieren(speicher);
}

function pruefen(schluessel, speicher) {
  const [ai, ti] = schluessel.split('-').map(Number);
  const t = AUFGABEN[ai].teile[ti];
  const feld = document.querySelector(`[data-ein="${schluessel}"]`);
  const r = document.querySelector(`[data-rueck="${schluessel}"]`);
  const roh = feld.value.replace(',', '.').trim();
  if (roh === '') { r.textContent = 'Bitte etwas eintragen.'; r.className = 'rueck'; return; }
  const wert = parseFloat(roh);
  if (!isFinite(wert)) { r.textContent = 'Das ist keine Zahl.'; r.className = 'rueck rueck-nein'; return; }
  const abw = t.absolut ? Math.abs(wert - t.soll) : Math.abs(wert - t.soll) / Math.abs(t.soll || 1);
  const grenze = t.tol ?? 0.02;
  let ok = false;
  if (abw <= grenze) {
    r.textContent = '✓ Richtig'; r.className = 'rueck rueck-ok'; ok = true;
  } else if (abw <= grenze * 5) {
    r.textContent = '≈ Fast – prüfe deine Rundung oder die Einheiten.'; r.className = 'rueck rueck-fast';
  } else if (Math.abs(wert - t.soll * 1000) / Math.abs(t.soll * 1000 || 1) <= grenze ||
             Math.abs(wert - t.soll / 1000) / Math.abs(t.soll / 1000 || 1) <= grenze) {
    r.textContent = '✗ Zahl stimmt, Einheit nicht. Rechne um.'; r.className = 'rueck rueck-nein';
  } else {
    r.textContent = '✗ Noch nicht richtig.'; r.className = 'rueck rueck-nein';
  }
  speicher.aufgaben[schluessel] = { eingabe: feld.value, richtig: ok };
  standAktualisieren(speicher);
}

function standAktualisieren(speicher) {
  const gesamt = AUFGABEN.reduce((s, a) => s + (a.frei ? 0 : a.teile.length), 0);
  const richtig = Object.values(speicher.aufgaben).filter(x => x.richtig).length;
  document.getElementById('punkte-stand').textContent = `${richtig} von ${gesamt}`;
}

// B-t-Diagramm für Aufgabe 3
function btDiagramm(c) {
  const q = Math.min(devicePixelRatio || 1, 2);
  const W = c.width, H = c.height;
  c.width = W * q; c.height = H * q;
  const g = c.getContext('2d'); g.scale(q, q);
  const r = { x: 52, y: 18, w: W - 80, h: H - 56 };
  const tMax = 16, bMaxW = 16;
  const px = t => r.x + t / tMax * r.w;
  const py = b => r.y + r.h - b / bMaxW * r.h;

  g.strokeStyle = '#eeebe3'; g.lineWidth = 1;
  for (let t = 0; t <= tMax; t += 3) { g.beginPath(); g.moveTo(px(t), r.y); g.lineTo(px(t), r.y + r.h); g.stroke(); }
  for (let b = 0; b <= bMaxW; b += 4) { g.beginPath(); g.moveTo(r.x, py(b)); g.lineTo(r.x + r.w, py(b)); g.stroke(); }
  g.strokeStyle = '#1e2430'; g.lineWidth = 1.8;
  g.beginPath(); g.moveTo(r.x, r.y); g.lineTo(r.x, r.y + r.h); g.lineTo(r.x + r.w, r.y + r.h); g.stroke();
  g.fillStyle = '#5a6475'; g.font = '12px -apple-system, Helvetica'; g.textAlign = 'right';
  for (let b = 0; b <= bMaxW; b += 4) g.fillText(String(b), r.x - 7, py(b) + 4);
  g.textAlign = 'center';
  for (let t = 0; t <= tMax; t += 3) g.fillText(String(t), px(t), r.y + r.h + 17);
  g.fillStyle = '#1e2430'; g.font = '600 12px -apple-system, Helvetica';
  g.fillText('t in s', r.x + r.w / 2, H - 6);
  g.save(); g.translate(14, r.y + r.h / 2); g.rotate(-Math.PI / 2);
  g.fillText('B in mT', 0, 0); g.restore();

  g.strokeStyle = '#c0392b'; g.lineWidth = 2.6;
  g.beginPath();
  g.moveTo(px(0), py(0)); g.lineTo(px(6), py(12)); g.lineTo(px(9), py(12)); g.lineTo(px(15), py(0));
  g.stroke();
  [[0, 0], [6, 12], [9, 12], [15, 0]].forEach(([t, b]) => {
    g.fillStyle = '#c0392b'; g.beginPath(); g.arc(px(t), py(b), 3.5, 0, 7); g.fill();
  });
}

export { zahl };
