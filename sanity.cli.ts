import { defineCliConfig } from 'sanity/cli';

/**
 * Configuración del CLI de Sanity (comandos `npx sanity …`, p. ej. `schema validate`).
 * No afecta a la web ni al panel /admin, que se sirven con Next.js.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  },
  vite: {
    ssr: {
      // lexorank (usado por el orden por arrastre) es CommonJS: se carga con Node en vez de Vite
      external: ['lexorank'],
    },
  },
});
