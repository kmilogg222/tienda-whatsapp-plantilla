/**
 * Paletas de colores curadas. ÚNICA fuente: de aquí salen la lista del panel
 * (`PALETTES` en contentOptions) y los colores de la web (buildTheme).
 *
 * Para añadir una paleta basta con agregar un elemento a esta lista. Solo se
 * definen 4-5 colores base; el resto (bordes, textos secundarios, hover…) se
 * calcula automáticamente y el motor corrige cualquier color que no se lea
 * bien (prueba: src/lib/__tests__/theme.test.ts).
 */

export type ThemeMode = 'light' | 'dark';

export interface PaletteColors {
  /** Fondo de la página */
  page: string;
  /** Fondo de tarjetas, cabecera y cajas */
  surface: string;
  /** Texto principal */
  text: string;
  /** Color de acento: botones, categoría activa, enlaces */
  accent: string;
  /** Fondo de la franja superior (opcional; por defecto, el acento) */
  announcement?: string;
}

export interface PaletteDefinition {
  value: string;
  /** Nombre que ve la dueña en el panel */
  title: string;
  mode: ThemeMode;
  colors: PaletteColors;
}

export const PALETTE_DEFINITIONS = [
  {
    value: 'blush-nude',
    title: '🌸 Blush Nude (rosa empolvado y beige)',
    mode: 'light',
    colors: { page: '#fbf6f3', surface: '#ffffff', text: '#3a2a2c', accent: '#a35865', announcement: '#ecd9d3' },
  },
  {
    value: 'rosa-chic',
    title: '💗 Rosa Chic (fucsia sobre blanco)',
    mode: 'light',
    colors: { page: '#fff7fa', surface: '#ffffff', text: '#2b0f1d', accent: '#c2185b' },
  },
  {
    value: 'lavanda',
    title: '💜 Lavanda (lila suave)',
    mode: 'light',
    colors: { page: '#f9f6fe', surface: '#ffffff', text: '#261a3d', accent: '#7446c4', announcement: '#e9e0f8' },
  },
  {
    value: 'terracota',
    title: '🏺 Terracota y Arena (tonos tierra)',
    mode: 'light',
    colors: { page: '#f7efe6', surface: '#fffaf4', text: '#3b2418', accent: '#a94f28', announcement: '#e6d2bf' },
  },
  {
    value: 'spa-menta',
    title: '🌿 Spa Menta (verde fresco)',
    mode: 'light',
    colors: { page: '#f1f8f5', surface: '#ffffff', text: '#12302a', accent: '#2c7865', announcement: '#d3eae1' },
  },
  {
    value: 'blanco-minimal',
    title: '🤍 Blanco Minimal (blanco y negro)',
    mode: 'light',
    colors: { page: '#fafafa', surface: '#ffffff', text: '#141414', accent: '#141414' },
  },
  {
    value: 'negro-oro',
    title: '👑 Negro y Oro (oscuro elegante)',
    mode: 'dark',
    colors: { page: '#0f0e0c', surface: '#1b1915', text: '#f7f1e3', accent: '#d4af37' },
  },
  {
    value: 'ciruela-noche',
    title: '🍷 Ciruela Noche (oscuro con rosa)',
    mode: 'dark',
    colors: { page: '#1a0b1a', surface: '#261326', text: '#fbeff6', accent: '#f08cb8', announcement: '#5a1f4f' },
  },
  {
    value: 'obsidiana-indigo',
    title: '🌙 Obsidiana Índigo (oscuro tecnológico)',
    mode: 'dark',
    colors: { page: '#0a0d14', surface: '#131a29', text: '#f8fafc', accent: '#8b93f8', announcement: '#312e81' },
  },
  {
    value: 'esmeralda-noche',
    title: '💚 Esmeralda Noche (oscuro con verde)',
    mode: 'dark',
    colors: { page: '#07110e', surface: '#0f1d18', text: '#effcf6', accent: '#34d399', announcement: '#064e3b' },
  },
] as const satisfies readonly PaletteDefinition[];

export type PaletteId = (typeof PALETTE_DEFINITIONS)[number]['value'];

export function getPalette(id: string): PaletteDefinition {
  return PALETTE_DEFINITIONS.find((p) => p.value === id) ?? PALETTE_DEFINITIONS[0];
}
