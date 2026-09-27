import type { StoreSettings } from '@/types/catalog';
import type { BackgroundTone, ButtonStyle, CornerStyle, ImageRatio } from '../contentOptions';
import { ensureContrast, getRelativeLuminance, mix, normalizeHex, pickTextColor } from './contrast';
import { FONT_STACKS } from './fonts';
import { getPalette, type PaletteColors, type ThemeMode } from './palettes';

/** Contraste mínimo WCAG AA: texto normal y elementos de interfaz. */
export const TEXT_CONTRAST = 4.5;
export const UI_CONTRAST = 3;

export type ThemeSettings = Pick<
  StoreSettings,
  | 'palette'
  | 'brandColor'
  | 'backgroundTone'
  | 'fontPairing'
  | 'cornerStyle'
  | 'buttonStyle'
  | 'imageRatio'
  | 'mobileColumns'
>;

/** Colores finales del tema, ya corregidos para que todo se lea. */
export interface ThemeColors {
  mode: ThemeMode;
  page: string;
  surface: string;
  surfaceElevated: string;
  cardHover: string;
  mediaPlaceholder: string;
  /** Fondo verde muy suave de los enlaces de WhatsApp (lleva texto principal) */
  whatsappSurface: string;
  /** Fondo rojo muy suave de la etiqueta de descuento */
  saleSurface: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  /** Acento usado como color de texto (más contraste que `accent`) */
  accentText: string;
  /** Texto sobre botones con fondo de acento */
  accentContrastText: string;
  announcementBg: string;
  announcementText: string;
  /** Fondo de insignias de oferta / popular (llevan texto blanco) */
  saleBg: string;
  warningBg: string;
  badgeText: string;
  /** Rojo de descuento y verde de "disponible" usados como texto */
  saleText: string;
  successText: string;
  whatsapp: string;
  whatsappHover: string;
  whatsappActive: string;
  whatsappContrastText: string;
  /** Verde de WhatsApp usado como texto sobre el fondo de la tienda */
  whatsappText: string;
}

/* ---------- Colores fijos (no dependen de la paleta) ---------- */

const WHITE = '#ffffff';
const SALE = '#dc2626';
const SUCCESS = '#15803d';
const WARNING = '#b45309';
const WHATSAPP = '#25d366';
const WHATSAPP_TEXT = '#052e16';

/** Fondos base para un color de marca personalizado, según el tono elegido. */
const BRAND_BASES: Record<BackgroundTone, { page: string; surface: string; text: string; tint: [number, number, number] }> = {
  // tint = cuánto color de marca se mezcla en [página, tarjeta, texto]
  light: { page: '#ffffff', surface: '#ffffff', text: '#1a1719', tint: [0.035, 0, 0.12] },
  cream: { page: '#f8f2e9', surface: '#fffcf7', text: '#2b221c', tint: [0.04, 0.015, 0.1] },
  dark: { page: '#111013', surface: '#1b1a1e', text: '#f6f4f7', tint: [0.07, 0.08, 0.05] },
};

/** Paleta generada a partir del color de marca y el tono de fondo. */
export function brandPalette(brandColor: string, tone: BackgroundTone): { mode: ThemeMode; colors: PaletteColors } {
  const brand = normalizeHex(brandColor) ?? '#000000';
  const base = BRAND_BASES[tone];
  return {
    mode: tone === 'dark' ? 'dark' : 'light',
    colors: {
      page: mix(base.page, brand, base.tint[0]),
      surface: mix(base.surface, brand, base.tint[1]),
      text: mix(base.text, brand, base.tint[2]),
      accent: brand,
      announcement: brand,
    },
  };
}

/**
 * Calcula todos los colores a partir de los colores base. Cada color que
 * lleva texto encima (o que se usa como texto) pasa por ensureContrast, así
 * ninguna combinación de paleta o color de marca puede quedar ilegible.
 */
export function deriveColors(mode: ThemeMode, seed: PaletteColors): ThemeColors {
  const page = normalizeHex(seed.page) ?? (mode === 'dark' ? '#111111' : '#ffffff');
  const surface = normalizeHex(seed.surface) ?? page;
  const rawText = normalizeHex(seed.text) ?? (mode === 'dark' ? '#ffffff' : '#111111');

  const surfaceElevated = mix(surface, rawText, mode === 'dark' ? 0.06 : 0.04);
  const cardHover = mix(surface, rawText, 0.025);
  const mediaPlaceholder = mix(page, rawText, 0.05);
  const whatsappSurface = mix(surface, WHATSAPP, 0.12);
  const backgrounds = [page, surface, surfaceElevated, cardHover, whatsappSurface];

  const text = ensureContrast(rawText, backgrounds, TEXT_CONTRAST);
  const textSecondary = ensureContrast(mix(text, surface, 0.22), backgrounds, TEXT_CONTRAST);
  const textMuted = ensureContrast(mix(text, surface, 0.38), backgrounds, TEXT_CONTRAST);

  // Acento: visible como elemento (3:1) y con texto legible encima (4.5:1)
  const accent = ensureContrast(normalizeHex(seed.accent) ?? text, [page, surface], UI_CONTRAST);
  const accentContrastText = pickTextColor(accent, [WHITE, mode === 'dark' ? page : text]);
  // Al pasar el mouse el botón se aleja del color de su texto: el contraste solo mejora
  const accentHover = mix(accent, getRelativeLuminance(accentContrastText) > 0.5 ? '#000000' : WHITE, 0.12);
  const accentText = ensureContrast(accent, backgrounds, TEXT_CONTRAST);

  const announcementBg = normalizeHex(seed.announcement) ?? accent;
  const announcementText = pickTextColor(announcementBg, [WHITE, mode === 'dark' ? page : text]);

  const saleSeed = mode === 'dark' ? '#f87171' : SALE;
  const saleSurface = mix(surface, saleSeed, 0.12);
  const saleText = ensureContrast(saleSeed, [...backgrounds, saleSurface], TEXT_CONTRAST);

  const whatsappHover = mix(WHATSAPP, '#000000', 0.08);

  return {
    mode,
    page,
    surface,
    surfaceElevated,
    cardHover,
    mediaPlaceholder,
    whatsappSurface,
    saleSurface,
    text,
    textSecondary,
    textMuted,
    accent,
    accentHover,
    accentText,
    accentContrastText,
    announcementBg,
    announcementText,
    saleBg: ensureContrast(SALE, [WHITE], TEXT_CONTRAST),
    warningBg: ensureContrast(WARNING, [WHITE], TEXT_CONTRAST),
    badgeText: WHITE,
    saleText,
    successText: ensureContrast(mode === 'dark' ? '#34d399' : SUCCESS, backgrounds, TEXT_CONTRAST),
    whatsapp: WHATSAPP,
    whatsappHover,
    whatsappActive: mix(WHATSAPP, '#000000', 0.16),
    whatsappContrastText: pickTextColor(whatsappHover, [WHATSAPP_TEXT]),
    whatsappText: ensureContrast(WHATSAPP, backgrounds, TEXT_CONTRAST),
  };
}

/** Colores del tema: color de marca (si hay) o la paleta elegida. */
export function resolveThemeColors(settings: Pick<ThemeSettings, 'palette' | 'brandColor' | 'backgroundTone'>): ThemeColors {
  const brand = normalizeHex(settings.brandColor);
  const { mode, colors } = brand ? brandPalette(brand, settings.backgroundTone) : getPalette(settings.palette);
  return deriveColors(mode, colors);
}

/* ---------- Formas ---------- */

const RADII: Record<CornerStyle, [number, number, number, number, number]> = {
  // xs, sm, md, lg, xl (px)
  square: [0, 0, 0, 0, 0],
  soft: [4, 8, 12, 16, 22],
  rounded: [8, 14, 20, 28, 36],
};

const BUTTON_RADIUS: Record<ButtonStyle, string> = {
  pill: '9999px',
  rounded: '10px',
  square: '0px',
};

const IMAGE_RATIO: Record<ImageRatio, string> = {
  '1:1': '1 / 1',
  '4:5': '4 / 5',
  '3:4': '3 / 4',
};

const SHADOWS: Record<ThemeMode, [string, string, string]> = {
  light: [
    '0 2px 8px rgba(0, 0, 0, 0.06)',
    '0 8px 24px -4px rgba(0, 0, 0, 0.1)',
    '0 20px 40px -10px rgba(0, 0, 0, 0.14)',
  ],
  dark: [
    '0 2px 8px rgba(0, 0, 0, 0.25)',
    '0 8px 24px -4px rgba(0, 0, 0, 0.45)',
    '0 20px 40px -10px rgba(0, 0, 0, 0.65)',
  ],
};

/**
 * Variables CSS del tema activo. Los valores salen solo de listas fijas o de
 * colores recalculados por el motor, nunca de texto libre.
 */
export function buildTheme(settings: ThemeSettings): Record<string, string> {
  const c = resolveThemeColors(settings);
  const fonts = FONT_STACKS[settings.fontPairing] ?? FONT_STACKS.elegante;
  const [xs, sm, md, lg, xl] = RADII[settings.cornerStyle] ?? RADII.soft;
  const [shadowSm, shadowMd, shadowLg] = SHADOWS[c.mode];

  return {
    'color-scheme': c.mode,

    '--bg-page': c.page,
    '--bg-surface': c.surface,
    '--bg-surface-elevated': c.surfaceElevated,
    '--bg-card': c.surface,
    '--bg-card-hover': c.cardHover,
    '--bg-media-placeholder': c.mediaPlaceholder,
    '--wa-surface': c.whatsappSurface,
    '--sale-surface': c.saleSurface,

    '--text-main': c.text,
    '--text-secondary': c.textSecondary,
    '--text-muted': c.textMuted,
    '--text-inverse': c.page,

    '--accent-color': c.accent,
    '--accent-hover': c.accentHover,
    '--accent-text': c.accentText,
    '--accent-contrast-text': c.accentContrastText,

    '--announcement-bg': c.announcementBg,
    '--announcement-text': c.announcementText,

    '--sale-bg': c.saleBg,
    '--warning-bg': c.warningBg,
    '--badge-text': c.badgeText,
    '--sale-text': c.saleText,
    '--success-text': c.successText,

    '--wa-color': c.whatsapp,
    '--wa-hover': c.whatsappHover,
    '--wa-active': c.whatsappActive,
    '--wa-contrast-text': c.whatsappContrastText,
    '--wa-text': c.whatsappText,

    '--shadow-sm': shadowSm,
    '--shadow-md': shadowMd,
    '--shadow-lg': shadowLg,

    '--font-heading': fonts.heading,
    '--font-body': fonts.body,
    '--heading-weight': String(fonts.headingWeight),
    '--heading-weight-strong': String(fonts.headingWeightStrong),

    '--radius-xs': `${xs}px`,
    '--radius-sm': `${sm}px`,
    '--radius-md': `${md}px`,
    '--radius-lg': `${lg}px`,
    '--radius-xl': `${xl}px`,
    '--radius-button': BUTTON_RADIUS[settings.buttonStyle] ?? BUTTON_RADIUS.pill,
    '--image-ratio': IMAGE_RATIO[settings.imageRatio] ?? IMAGE_RATIO['4:5'],
    '--grid-cols-mobile': settings.mobileColumns === 1 ? '1' : '2',
  };
}

const SAFE_NAME = /^(--[a-z0-9-]+|color-scheme)$/;
const SAFE_VALUE = /^[^<>{};\\]*$/;

/**
 * Convierte las variables en el contenido de un <style>. Descarta cualquier
 * nombre o valor con caracteres que pudieran cerrar la regla o la etiqueta.
 */
export function themeToCss(vars: Record<string, string>): string {
  const body = Object.entries(vars)
    .filter(([name, value]) => SAFE_NAME.test(name) && SAFE_VALUE.test(value))
    .map(([name, value]) => `${name}:${value};`)
    .join('');
  return `:root{${body}}`;
}

/** Color para la barra del navegador en celulares y esquema claro/oscuro. */
export function getThemeMeta(settings: Pick<ThemeSettings, 'palette' | 'brandColor' | 'backgroundTone'>) {
  const c = resolveThemeColors(settings);
  return { themeColor: c.page, colorScheme: c.mode };
}

/** Pares texto/fondo que deben cumplir contraste (usado por las pruebas). */
export function contrastPairs(c: ThemeColors): { name: string; fg: string; bg: string; min: number }[] {
  const pairs: { name: string; fg: string; bg: string; min: number }[] = [];
  const add = (name: string, fg: string, bgs: string[], min = TEXT_CONTRAST) =>
    bgs.forEach((bg, i) => pairs.push({ name: `${name}#${i}`, fg, bg, min }));

  const backgrounds = [c.page, c.surface, c.surfaceElevated, c.cardHover, c.whatsappSurface];
  add('texto', c.text, backgrounds);
  add('texto secundario', c.textSecondary, backgrounds);
  add('texto suave', c.textMuted, backgrounds);
  add('acento como texto', c.accentText, backgrounds);
  add('oferta como texto', c.saleText, [...backgrounds, c.saleSurface]);
  add('disponible como texto', c.successText, backgrounds);
  add('whatsapp como texto', c.whatsappText, backgrounds);
  add('texto de botón', c.accentContrastText, [c.accent, c.accentHover]);
  add('acento visible', c.accent, [c.page, c.surface], UI_CONTRAST);
  add('franja superior', c.announcementText, [c.announcementBg]);
  add('insignias', c.badgeText, [c.saleBg, c.warningBg]);
  add('insignia destacada', c.page, [c.text]);
  add('botón whatsapp', c.whatsappContrastText, [c.whatsapp, c.whatsappHover, c.whatsappActive]);
  return pairs;
}

