// Export der Bearbeitung: Druck/PDF, HTML-Datei, CSV, Zwischenstand
import { messreihe, regression } from './auswertung.js';
import { AUFGABEN } from './aufgaben.js';
import { zahl } from './physik.js';

const SCHLUESSEL = 'induktionslabor-stand-v1';

function textfelder() {
  return {
    beobachtung: val('txt-beobachtung'),
    aus1: val('txt-aus1'), aus2: val('txt-aus2'), aus3: val('txt-aus3'),
    name: val('ex-name'), kurs: val('ex-kurs'), datum: val('ex-datum')
  };
}
const val = id => (document.getElementById(id)?.value || '').trim();

function diagrammBild() {
  const c = document.getElementById('diagramm');
  try { return c.toDataURL('image/png'); } catch { return ''; }
}

export function berichtHTML(speicher) {
  const t = textfelder();
  const reg = regression();
  const datum = t.datum || new Date().toISOString().slice(0, 10);
  const zeilen = messreihe.map((m, i) =>
    `<tr><td>${i + 1}</td><td>${m.n}</td><td>${zahl(m.A, 1)}</td><td>${zahl(m.dB, 3)}</td><td>${zahl(m.U, 1)}</td></tr>`).join('');

  const checkTeil = Object.keys(speicher.check).length
    ? '<h4>Selbstcheck</h4><ul>' + Object.entries(speicher.check).map(([i, c]) =>
        `<li>Frage ${+i + 1}: ${c.gewaehlt} — ${c.richtig ? 'richtig' : 'nicht richtig'}</li>`).join('') + '</ul>'
    : '';

  let aufgabenTeil = '<h4>Aufgaben</h4>';
  AUFGABEN.forEach((a, ai) => {
    aufgabenTeil += `<p><b>Aufgabe ${a.nr}</b></p><ul>`;
    a.teile.forEach((teil, ti) => {
      const k = `${ai}-${ti}`;
      if (a.frei) {
        const fr = document.querySelector(`[data-frei="${k}"]`)?.value.trim() || '(nicht bearbeitet)';
        aufgabenTeil += `<li>${teil.frage}<br><i>${escape2(fr)}</i></li>`;
      } else {
        const e = speicher.aufgaben[k];
        aufgabenTeil += `<li>${teil.frage.replace(/<[^>]+>/g, '')} → <b>${e ? escape2(e.eingabe) : '–'} ${teil.einheit}</b>` +
          (e ? (e.richtig ? ' ✓' : ' ✗') : '') + '</li>';
      }
    });
    aufgabenTeil += '</ul>';
  });

  const bild = diagrammBild();

  return `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8">
<title>Induktionslabor – Bearbeitung ${escape2(t.name)}</title>
<style>
 body{font:15px/1.6 Georgia,serif;color:#1e2430;max-width:780px;margin:30px auto;padding:0 22px}
 h1{font:600 26px -apple-system,Helvetica;margin:0 0 4px}
 h2{font:600 19px -apple-system,Helvetica;margin:28px 0 8px;color:#1f6f8b;border-bottom:1px solid #e1ddd4;padding-bottom:4px}
 h4{font:600 15px -apple-system,Helvetica;margin:16px 0 4px}
 .kopf{color:#5a6475;font:14px -apple-system,Helvetica;margin-bottom:18px}
 table{border-collapse:collapse;width:100%;font:14px -apple-system,Helvetica;margin:8px 0}
 th,td{border:1px solid #d9d4c8;padding:5px 8px;text-align:right}
 th:first-child,td:first-child{text-align:left}
 th{background:#f4f2ed}
 .antwort{background:#faf8f3;border-left:3px solid #1f6f8b;padding:8px 14px;margin:6px 0;white-space:pre-wrap}
 img{max-width:100%;border:1px solid #e1ddd4;border-radius:8px}
 ul{margin:4px 0 10px}
 @media print{body{margin:0}}
</style></head><body>
<h1>Induktion durch Änderung des Magnetfelds oder der Fläche</h1>
<p class="kopf">${escape2(t.name) || '(kein Name)'} · ${escape2(t.kurs)} · ${datum}</p>

<h2>1 Beobachtungen im Versuch</h2>
<div class="antwort">${escape2(t.beobachtung) || '(nicht ausgefüllt)'}</div>

<h2>2 Messwerte</h2>
${messreihe.length
   ? `<table><thead><tr><th>#</th><th>n</th><th>A / cm²</th><th>Ḃ / (mT/s)</th><th>U / µV</th></tr></thead><tbody>${zeilen}</tbody></table>`
   : '<p>(keine Messwerte aufgenommen)</p>'}

<h2>3 Diagramm und Ausgleichsgerade</h2>
${bild ? `<img src="${bild}" alt="U über Ḃ">` : ''}
${reg ? `<p>Ausgleichsgerade: U = ${zahl(reg.a, 1)} µV/(mT/s) · Ḃ ${reg.b >= 0 ? '+' : '–'} ${zahl(Math.abs(reg.b), 1)} µV &nbsp;(R² = ${zahl(reg.r2, 4)})<br>
Steigung entspricht n·A = ${zahl(reg.nA, 4)} m²</p>` : '<p>(keine Ausgleichsgerade berechnet)</p>'}

<h2>4 Auswertung</h2>
<h4>Zusammenhang U und Ḃ</h4><div class="antwort">${escape2(t.aus1) || '(nicht ausgefüllt)'}</div>
<h4>Bedeutung der Steigung</h4><div class="antwort">${escape2(t.aus2) || '(nicht ausgefüllt)'}</div>
<h4>Ergebnis als Gesetz</h4><div class="antwort">${escape2(t.aus3) || '(nicht ausgefüllt)'}</div>

<h2>5 Aufgaben und Selbstcheck</h2>
${checkTeil}
${aufgabenTeil}
</body></html>`;
}

function escape2(s) {
  return String(s ?? '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

export function alsPDF(speicher) {
  const w = window.open('', '_blank');
  if (!w) { alert('Bitte Pop-ups für diese Seite erlauben.'); return; }
  w.document.write(berichtHTML(speicher));
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 300);
}

export function alsHTML(speicher) {
  const name = (val('ex-name') || 'Bearbeitung').replace(/\s+/g, '_');
  datenDownload(berichtHTML(speicher), `Induktionslabor_${name}.html`, 'text/html');
}

export function alsCSV() {
  const kopf = 'Nr;n;A in cm2;Bpunkt in mT/s;U in µV\n';
  const zeilen = messreihe.map((m, i) =>
    [i + 1, m.n, m.A.toFixed(1), m.dB.toFixed(3), m.U.toFixed(1)].join(';').replace(/\./g, ',')).join('\n');
  datenDownload('﻿' + kopf + zeilen, 'Messwerte_Induktion.csv', 'text/csv');
}

function datenDownload(inhalt, dateiname, typ) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([inhalt], { type: typ + ';charset=utf-8' }));
  a.download = dateiname;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function vorschauZeigen(speicher) {
  const box = document.getElementById('export-vorschau');
  const roh = berichtHTML(speicher);
  box.innerHTML = roh.slice(roh.indexOf('<body>') + 6, roh.indexOf('</body>'));
}

// ---- Zwischenstand ----
export function standSichern(speicher) {
  const daten = {
    texte: textfelder(),
    frei: Object.fromEntries(Array.from(document.querySelectorAll('[data-frei]'))
      .map(e => [e.dataset.frei, e.value])),
    mess: messreihe,
    aufgaben: speicher.aufgaben,
    check: speicher.check
  };
  try {
    localStorage.setItem(SCHLUESSEL, JSON.stringify(daten));
    melden('Zwischenstand gesichert.');
  } catch { melden('Sichern hat nicht geklappt (Speicher voll oder gesperrt).'); }
}

export function standLaden(speicher, nachLaden) {
  let daten;
  try { daten = JSON.parse(localStorage.getItem(SCHLUESSEL) || 'null'); } catch { daten = null; }
  if (!daten) { melden('Kein gesicherter Stand gefunden.'); return; }
  Object.entries({ 'txt-beobachtung': daten.texte.beobachtung, 'txt-aus1': daten.texte.aus1,
    'txt-aus2': daten.texte.aus2, 'txt-aus3': daten.texte.aus3, 'ex-name': daten.texte.name,
    'ex-kurs': daten.texte.kurs, 'ex-datum': daten.texte.datum }).forEach(([id, v]) => {
      const e = document.getElementById(id); if (e && v != null) e.value = v;
    });
  Object.entries(daten.frei || {}).forEach(([k, v]) => {
    const e = document.querySelector(`[data-frei="${k}"]`); if (e) e.value = v;
  });
  messreihe.length = 0;
  (daten.mess || []).forEach(m => messreihe.push(m));
  Object.assign(speicher.aufgaben, daten.aufgaben || {});
  Object.assign(speicher.check, daten.check || {});
  nachLaden();
  melden('Zwischenstand geladen.');
}

function melden(text) {
  const p = document.createElement('p');
  p.className = 'hinweis-klein';
  p.textContent = text;
  p.style.color = '#2e7d4f';
  const box = document.querySelector('.export-knoepfe');
  box.after(p);
  setTimeout(() => p.remove(), 4000);
}
