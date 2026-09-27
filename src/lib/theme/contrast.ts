/**
 * Utilidades de color y contraste WCAG 2.1. Todo trabaja con hex (#RGB o
 * #RRGGBB) y devuelve siempre hex de 6 dígitos en minúsculas, así los valores
 * que llegan al CSS son predecibles y seguros.
 */

export type Rgb = [number, number, number];

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Devuelve el color como #rrggbb o `undefined` si no es un hex válido. */
export function normalizeHex(value: string | null | undefined): string | undefined {
  const match = typeof value === 'string' ? HEX.exec(value.trim()) : null;
  if (!match) return undefined;
  const digits = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
  return `#${digits.toLowerCase()}`;
}

export function hexToRgb(hex: string): Rgb {
  const normalized = normalizeHex(hex) ?? '#000000';
  return [1, 3, 5].map((i) => parseInt(normalized.slice(i, i + 2), 16)) as Rgb;
}

export function rgbToHex([r, g, b]: Rgb): string {
  const part = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** Mezcla `a` con `b`: `amount` 0 = solo `a`, 1 = solo `b`. */
export function mix(a: string, b: string, amount: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex(ca.map((v, i) => v + (cb[i] - v) * amount) as Rgb);
}

/**
 * Luminancia relativa de un color hexadecimal (#RRGGBB o #RGB) según WCAG 2.1.
 * Devuelve 0.5 si el valor no es un color válido.
 */
export function getRelativeLuminance(hex: string): number {
  if (!normalizeHex(hex)) return 0.5;
  const [R, G, B] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/** Relación de contraste WCAG entre dos colores (de 1 a 21). */
export function contrastRatio(a: string, b: string): number {
  const la = getRelativeLuminance(a);
  const lb = getRelativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* ---------- HSL: para aclarar u oscurecer sin cambiar el tono ---------- */

function rgbToHsl([r, g, b]: Rgb): [number, number, number] {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === rn ? ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6 : max === gn ? ((bn - rn) / d + 2) / 6 : ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): Rgb {
  if (s === 0) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number) => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255];
}

function withLightness(hex: string, lightness: number): string {
  const [h, s] = rgbToHsl(hexToRgb(hex));
  return rgbToHex(hslToRgb([h, s, Math.min(1, Math.max(0, lightness))]));
}

const minContrast = (color: string, backgrounds: readonly string[]) =>
  Math.min(...backgrounds.map((bg) => contrastRatio(color, bg)));

/**
 * Aclara u oscurece `color` (conservando su tono) lo mínimo necesario para
 * que tenga al menos `ratio` de contraste con todos los fondos indicados.
 * Si ni así se logra, devuelve negro o blanco (el que más contraste tenga).
 */
export function ensureContrast(color: string, backgrounds: readonly string[], ratio: number): string {
  const base = normalizeHex(color) ?? '#000000';
  if (minContrast(base, backgrounds) >= ratio) return base;

  // Dirección: hacia el extremo (negro o blanco) que más contrasta con los fondos
  const towardDark = minContrast('#000000', backgrounds) >= minContrast('#ffffff', backgrounds);
  const [, , startLightness] = rgbToHsl(hexToRgb(base));
  for (let step = 1; step <= 100; step++) {
    const lightness = towardDark ? startLightness - step / 100 : startLightness + step / 100;
    const candidate = withLightness(base, lightness);
    if (minContrast(candidate, backgrounds) >= ratio) return candidate;
    if (lightness <= 0 || lightness >= 1) break;
  }
  return towardDark ? '#000000' : '#ffffff';
}

/**
 * Elige, de los candidatos en orden de preferencia, el primero que cumple
 * `ratio` sobre `background`; si ninguno cumple, el de mayor contraste.
 * Negro y blanco se agregan siempre al final como respaldo.
 */
export function pickTextColor(background: string, candidates: readonly string[] = [], ratio = 4.5): string {
  const options = [...candidates, '#ffffff', '#000000'];
  const passing = options.find((c) => contrastRatio(c, background) >= ratio);
  if (passing) return normalizeHex(passing) ?? passing;
  return options.reduce((best, c) => (contrastRatio(c, background) > contrastRatio(best, background) ? c : best));
}
