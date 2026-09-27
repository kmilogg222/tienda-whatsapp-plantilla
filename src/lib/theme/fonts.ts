import type { FontPairingId } from '../contentOptions';

/**
 * Pila de fuentes de cada combinación. Las variables `--font-*` las declara
 * `src/app/fonts.ts` (next/font); aquí solo se decide cuál usar en títulos y
 * en textos, con fuentes del sistema como respaldo.
 */
export interface FontStack {
  heading: string;
  body: string;
  /** Grosor de los títulos (DM Serif Display solo existe en 400) */
  headingWeight: number;
  /** Grosor de precios y números destacados */
  headingWeightStrong: number;
}

const SERIF = 'Georgia, "Times New Roman", serif';
const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const FONT_STACKS: Record<FontPairingId, FontStack> = {
  elegante: {
    heading: `var(--font-playfair), ${SERIF}`,
    body: `var(--font-inter), ${SANS}`,
    headingWeight: 600,
    headingWeightStrong: 700,
  },
  delicada: {
    heading: `var(--font-cormorant), ${SERIF}`,
    body: `var(--font-jost), ${SANS}`,
    headingWeight: 600,
    headingWeightStrong: 700,
  },
  moderna: {
    heading: `var(--font-poppins), ${SANS}`,
    body: `var(--font-poppins), ${SANS}`,
    headingWeight: 600,
    headingWeightStrong: 700,
  },
  clasica: {
    heading: `var(--font-dm-serif), ${SERIF}`,
    body: `var(--font-dm-sans), ${SANS}`,
    headingWeight: 400,
    headingWeightStrong: 400,
  },
  limpia: {
    heading: `var(--font-outfit), ${SANS}`,
    body: `var(--font-inter), ${SANS}`,
    headingWeight: 700,
    headingWeightStrong: 800,
  },
};
