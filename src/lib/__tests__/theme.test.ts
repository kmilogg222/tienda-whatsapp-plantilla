import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FONT_STACKS,
  PALETTE_DEFINITIONS,
  brandPalette,
  buildTheme,
  contrastPairs,
  contrastRatio,
  deriveColors,
  ensureContrast,
  getPalette,
  getRelativeLuminance,
  getThemeMeta,
  normalizeHex,
  pickTextColor,
  resolveThemeColors,
  themeToCss,
  type ThemeSettings,
} from '@/lib/theme';
import { BACKGROUND_TONES, FONT_PAIRINGS, PALETTES } from '@/lib/contentOptions';
import { DEFAULT_SETTINGS } from '@/lib/settings';

const baseSettings: ThemeSettings = {
  palette: DEFAULT_SETTINGS.palette,
  backgroundTone: DEFAULT_SETTINGS.backgroundTone,
  fontPairing: DEFAULT_SETTINGS.fontPairing,
  cornerStyle: DEFAULT_SETTINGS.cornerStyle,
  buttonStyle: DEFAULT_SETTINGS.buttonStyle,
  imageRatio: DEFAULT_SETTINGS.imageRatio,
  mobileColumns: DEFAULT_SETTINGS.mobileColumns,
};

/** Generador pseudoaleatorio con semilla: los mismos 20 colores en cada corrida. */
function seededColors(count: number, seed = 20260925): string[] {
  let state = seed;
  const next = () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
  return Array.from({ length: count }, () =>
    `#${Math.floor(next() * 0xffffff).toString(16).padStart(6, '0')}`
  );
}

/** Colores difíciles a propósito + 20 aleatorios. */
const BRAND_COLORS = ['#ffff00', '#ffd600', '#000000', '#ffffff', '#808080', '#f0f', '#c2185b', ...seededColors(20)];

function failingPairs(colors: ReturnType<typeof deriveColors>) {
  return contrastPairs(colors)
    .map((p) => ({ ...p, ratio: Number(contrastRatio(p.fg, p.bg).toFixed(2)) }))
    .filter((p) => p.ratio < p.min);
}

describe('getRelativeLuminance', () => {
  it('devuelve 0 para negro y 1 para blanco', () => {
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(getRelativeLuminance('#ffffff')).toBeCloseTo(1, 5);
  });

  it('acepta hex de 3 dígitos igual que el de 6', () => {
    expect(getRelativeLuminance('#fff')).toBeCloseTo(getRelativeLuminance('#ffffff'), 5);
    expect(getRelativeLuminance('#f00')).toBeCloseTo(getRelativeLuminance('#ff0000'), 5);
  });

  it('funciona sin el símbolo #', () => {
    expect(getRelativeLuminance('ffffff')).toBeCloseTo(1, 5);
  });

  it('devuelve 0.5 para valores con longitud inválida', () => {
    expect(getRelativeLuminance('#12345')).toBe(0.5);
    expect(getRelativeLuminance('')).toBe(0.5);
  });
});

describe('utilidades de contraste', () => {
  it('normalizeHex acepta #RGB/#RRGGBB y rechaza lo demás', () => {
    expect(normalizeHex('#ABC')).toBe('#aabbcc');
    expect(normalizeHex(' #C2185B ')).toBe('#c2185b');
    expect(normalizeHex('rojo')).toBeUndefined();
    expect(normalizeHex('#12345')).toBeUndefined();
    expect(normalizeHex('red;}</style>')).toBeUndefined();
    expect(normalizeHex(undefined)).toBeUndefined();
  });

  it('contrastRatio: 21 entre blanco y negro, 1 entre colores iguales', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 1);
    expect(contrastRatio('#c2185b', '#c2185b')).toBeCloseTo(1, 5);
  });

  it('ensureContrast oscurece un amarillo sobre blanco hasta que se lea', () => {
    const fixed = ensureContrast('#ffff00', ['#ffffff'], 4.5);
    expect(contrastRatio(fixed, '#ffffff')).toBeGreaterThanOrEqual(4.5);
    // conserva el tono: sigue siendo más rojo/verde que azul
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(fixed.slice(i, i + 2), 16));
    expect(Math.min(r, g)).toBeGreaterThan(b);
  });

  it('ensureContrast no toca un color que ya cumple', () => {
    expect(ensureContrast('#111111', ['#ffffff'], 4.5)).toBe('#111111');
  });

  it('pickTextColor prefiere el primer candidato que cumple', () => {
    expect(pickTextColor('#c2185b', ['#ffffff', '#2b0f1d'])).toBe('#ffffff');
    expect(pickTextColor('#ffd600', ['#ffffff', '#2b0f1d'])).toBe('#2b0f1d');
  });
});

describe('paletas', () => {
  it('cada paleta del panel tiene sus colores (una sola fuente)', () => {
    expect(PALETTES.map((p) => p.value)).toEqual(PALETTE_DEFINITIONS.map((p) => p.value));
    expect(PALETTE_DEFINITIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('una paleta desconocida usa la primera', () => {
    expect(getPalette('no-existe').value).toBe(PALETTE_DEFINITIONS[0].value);
  });

  it.each(PALETTE_DEFINITIONS.map((p) => [p.value, p] as const))('%s: todo el texto se lee (WCAG AA)', (_, palette) => {
    expect(failingPairs(deriveColors(palette.mode, palette.colors))).toEqual([]);
  });

  it.each(PALETTE_DEFINITIONS.map((p) => [p.value, p] as const))('%s: los colores curados no necesitan corrección', (_, palette) => {
    const colors = deriveColors(palette.mode, palette.colors);
    expect(colors.text).toBe(palette.colors.text);
    expect(colors.accent).toBe(palette.colors.accent);
  });
});

describe('color de marca personalizado', () => {
  const cases = BRAND_COLORS.flatMap((color) => BACKGROUND_TONES.map((tone) => [color, tone.value] as const));

  it('prueba al menos 20 colores × 3 tonos de fondo', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
  });

  it.each(cases)('%s con fondo %s: todo el texto se lee (WCAG AA)', (color, tone) => {
    const { mode, colors } = brandPalette(color, tone);
    expect(failingPairs(deriveColors(mode, colors))).toEqual([]);
  });

  it('el color de marca reemplaza a la paleta y el tono decide claro u oscuro', () => {
    const light = resolveThemeColors({ palette: 'negro-oro', brandColor: '#c2185b', backgroundTone: 'light' });
    const dark = resolveThemeColors({ palette: 'blush-nude', brandColor: '#c2185b', backgroundTone: 'dark' });
    expect(light.mode).toBe('light');
    expect(dark.mode).toBe('dark');
    expect(getRelativeLuminance(light.page)).toBeGreaterThan(0.8);
    expect(getRelativeLuminance(dark.page)).toBeLessThan(0.05);
  });

  it('crema es un fondo cálido distinto del blanco', () => {
    const cream = resolveThemeColors({ palette: 'blush-nude', brandColor: '#2c7865', backgroundTone: 'cream' });
    const light = resolveThemeColors({ palette: 'blush-nude', brandColor: '#2c7865', backgroundTone: 'light' });
    expect(cream.page).not.toBe(light.page);
  });

  it('un color de marca oscuro sobre fondo oscuro se aclara para verse', () => {
    const colors = resolveThemeColors({ palette: 'blush-nude', brandColor: '#1a0033', backgroundTone: 'dark' });
    expect(contrastRatio(colors.accent, colors.page)).toBeGreaterThanOrEqual(3);
  });

  it('no hay degradados hacia colores fijos (antes terminaban en morado)', () => {
    const css = themeToCss(buildTheme({ ...baseSettings, brandColor: '#25a244' }));
    expect(css).not.toContain('#a855f7');
    expect(css).not.toContain('gradient');
  });
});

describe('buildTheme', () => {
  it('genera colores, fuentes y formas', () => {
    const vars = buildTheme({
      ...baseSettings,
      palette: 'lavanda',
      fontPairing: 'clasica',
      cornerStyle: 'square',
      buttonStyle: 'rounded',
      imageRatio: '3:4',
      mobileColumns: 1,
    });
    expect(vars['--accent-color']).toBe(getPalette('lavanda').colors.accent);
    expect(vars['--font-heading']).toContain('--font-dm-serif');
    expect(vars['--heading-weight']).toBe('400');
    expect(vars['--radius-md']).toBe('0px');
    expect(vars['--radius-button']).toBe('10px');
    expect(vars['--image-ratio']).toBe('3 / 4');
    expect(vars['--grid-cols-mobile']).toBe('1');
    expect(vars['color-scheme']).toBe('light');
  });

  it('todas las combinaciones tipográficas del panel tienen fuentes', () => {
    for (const { value } of FONT_PAIRINGS) {
      expect(FONT_STACKS[value].heading).toMatch(/^var\(--font-/);
      expect(FONT_STACKS[value].body).toMatch(/^var\(--font-/);
    }
  });

  it('los colores generados son siempre hex válidos', () => {
    for (const palette of PALETTE_DEFINITIONS) {
      const vars = buildTheme({ ...baseSettings, palette: palette.value });
      for (const [name, value] of Object.entries(vars)) {
        if (name.startsWith('--') && value.startsWith('#')) expect(normalizeHex(value), name).toBe(value);
      }
    }
  });

  it('themeToCss descarta nombres o valores peligrosos', () => {
    const css = themeToCss({
      '--ok': '#ffffff',
      '--malo': 'red;}</style><script>',
      'background': 'red',
    });
    expect(css).toBe(':root{--ok:#ffffff;}');
  });

  it('getThemeMeta usa el fondo de la página para la barra del celular', () => {
    const meta = getThemeMeta({ palette: 'negro-oro', backgroundTone: 'light' });
    expect(meta).toEqual({ themeColor: getPalette('negro-oro').colors.page, colorScheme: 'dark' });
  });
});

describe('hojas de estilo', () => {
  const stylesDir = join(__dirname, '../../app/styles');
  const files = readdirSync(stylesDir).filter((f) => f.endsWith('.css'));

  it.each(files)('%s no tiene colores fijos (salen del tema)', (file) => {
    const css = readFileSync(join(stylesDir, file), 'utf8');
    expect(css.match(/#[0-9a-f]{3,8}\b/gi) ?? []).toEqual([]);
    expect(css.match(/\b(rgba?|hsla?)\(/gi) ?? []).toEqual([]);
  });

  it('ningún estilo depende de los temas anteriores', () => {
    const css = files.map((f) => readFileSync(join(stylesDir, f), 'utf8')).join('\n');
    expect(css).not.toContain('data-theme');
    expect(css).not.toContain('@import');
  });
});
