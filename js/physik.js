// Physikalisches Modell des Versuchs.
// Feldspule: N Windungen auf der Länge l -> B = mu0 * N/l * I
export const MU0 = 4 * Math.PI * 1e-7;

export const FELDSPULE = { N: 1000, l: 0.30 };          // Windungen, Länge in m
export const K_FELD = MU0 * FELDSPULE.N / FELDSPULE.l;  // T pro Ampere  (≈ 4,189 mT/A)

export const SPULEN = [
  { id: 's150', name: '150 Wdg · 21 cm² (4,6 cm Kante)', n: 150,  A: 21.0 },
  { id: 's250', name: '250 Wdg · 40 cm²',                n: 250,  A: 40.0 },
  { id: 's500', name: '500 Wdg · 25 cm²',                n: 500,  A: 25.0 },
  { id: 's1000', name: '1000 Wdg · 25 cm²',              n: 1000, A: 25.0 },
  { id: 'frei', name: 'eigene Werte eingeben',           n: null, A: null }
];

// Zustand der Simulation
export const zustand = {
  modus: 'feld',           // 'feld' | 'flaeche'
  laeuft: false,
  t: 0,
  // Feldmodus
  form: 'dreieck',
  I: 1.2,                  // Scheitelstrom in A
  f: 0.12,                 // Frequenz in Hz
  n: 150,                  // Windungen der Induktionsspule
  A: 21.0,                 // Querschnitt in cm²
  // Flächenmodus
  fB: 300,                 // Flussdichte in mT
  fn: 20,                  // Windungen der Schleife
  fb: 8,                   // Breite in cm
  fv: 0.5,                 // Zuggeschwindigkeit in m/s
  fx: 0                    // Position der Schleife in m (0 = ganz im Feld)
};

export function bMax() {           // Scheitelwert der Flussdichte in Tesla
  return K_FELD * zustand.I;
}

// Flussdichte und ihre Änderungsrate zum Zeitpunkt t (SI-Einheiten)
export function feldZurZeit(t) {
  const Bm = bMax(), f = zustand.f;
  if (zustand.form === 'konstant') return { B: Bm, dB: 0 };
  const p = (t * f) % 1;
  if (zustand.form === 'dreieck') {
    const B  = p < 0.5 ? Bm * 2 * p : Bm * (2 - 2 * p);
    const dB = p < 0.5 ? Bm * 2 * f : -Bm * 2 * f;
    return { B, dB };
  }
  // Sinus (bipolar)
  const w = 2 * Math.PI * f;
  return { B: Bm * Math.sin(w * t), dB: Bm * w * Math.cos(w * t) };
}

// Induzierte Spannung im Feldmodus (Volt)
export function spannungFeld(dB) {
  return -zustand.n * (zustand.A * 1e-4) * dB;
}

// Flächenmodus: die Schleife wird aus dem Feld gezogen.
// Feldbereich reicht von x = 0 bis x = FELD_BREITE.
export const FELD_BREITE = 0.30;   // m

export function flaecheZurZeit(t) {
  const b = zustand.fb * 1e-2;
  const weg = (0.14 + zustand.fv * t) % (FELD_BREITE + 2 * b);
  const x = weg;                                   // linke Kante der Schleife
  const ueberlapp = Math.max(0, Math.min(FELD_BREITE, x + b) - Math.max(0, x));
  const imFeld = ueberlapp > 1e-6 && ueberlapp < b - 1e-6;  // Kante schneidet die Feldgrenze
  const A = ueberlapp * b;
  const dA = imFeld ? (x + b <= FELD_BREITE ? zustand.fv * b : -zustand.fv * b) : 0;
  return { x, A, dA, ueberlapp };
}

export function spannungFlaeche(dA) {
  return -zustand.fn * (zustand.fB * 1e-3) * dA;
}

// Aktueller Messzustand – eine Funktion für beide Modi
export function messwert(t) {
  if (zustand.modus === 'feld') {
    const { B, dB } = feldZurZeit(t);
    return { B, dB, U: spannungFeld(dB) };
  }
  const { dA, x } = flaecheZurZeit(t);
  return { B: zustand.fB * 1e-3, dB: 0, dA, x, U: spannungFlaeche(dA) };
}

// --- Formatierung ----------------------------------------------------------
export function zahl(x, stellen = 2) {
  return x.toLocaleString('de-DE', { minimumFractionDigits: stellen, maximumFractionDigits: stellen });
}

export function spannungText(U) {
  const a = Math.abs(U);
  if (a < 1e-9) return '0,0 µV';
  if (a < 1e-3) return zahl(U * 1e6, 1) + ' µV';
  if (a < 1)    return zahl(U * 1e3, 2) + ' mV';
  return zahl(U, 3) + ' V';
}

export function flussdichteText(B) {
  return zahl(B * 1e3, 2) + ' mT';
}

export function rateText(dB) {
  return zahl(dB * 1e3, 2) + ' mT/s';
}
