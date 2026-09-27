import { Cormorant_Garamond, DM_Sans, DM_Serif_Display, Inter, Jost, Outfit, Playfair_Display, Poppins } from 'next/font/google';
import type { FontPairingId } from '@/lib/contentOptions';

/*
 * Todas las fuentes se descargan en la compilación y se sirven desde la
 * propia tienda (el navegador no llama a Google). `preload: false`: como se
 * declaran en el layout raíz, con precarga se descargarían las 8 en cada
 * página; así el navegador solo baja las de la combinación activa.
 * Las pilas (qué variable va en títulos y cuál en textos) están en
 * src/lib/theme/fonts.ts. next/font exige escribir las opciones de forma
 * literal en cada llamada (no se pueden compartir en una constante).
 */
const playfair = Playfair_Display({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-playfair' });
const inter = Inter({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-inter' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-cormorant' });
const jost = Jost({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-jost' });
const poppins = Poppins({ subsets: ['latin'], display: 'swap', preload: false, weight: ['400', '500', '600', '700'], variable: '--font-poppins' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], display: 'swap', preload: false, weight: '400', variable: '--font-dm-serif' });
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-dm-sans' });
const outfit = Outfit({ subsets: ['latin'], display: 'swap', preload: false, variable: '--font-outfit' });

/** Clases que declaran las variables de fuente de cada combinación. */
export const FONT_CLASSES: Record<FontPairingId, string> = {
  elegante: `${playfair.variable} ${inter.variable}`,
  delicada: `${cormorant.variable} ${jost.variable}`,
  moderna: poppins.variable,
  clasica: `${dmSerif.variable} ${dmSans.variable}`,
  limpia: `${outfit.variable} ${inter.variable}`,
};
