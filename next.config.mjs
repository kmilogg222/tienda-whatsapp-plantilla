/**
 * Variables que la web necesita, tomadas de donde estén:
 * - Netlify expone la URL del sitio como URL; se publica para getSiteUrl().
 * - La integración de Sanity en el Marketplace de Vercel crea NEXT_PUBLIC_SANITY_*
 *   con el prefijo por defecto; si se instaló con otro prefijo, se usan
 *   SANITY_PROJECT_ID / SANITY_DATASET (o las SANITY_STUDIO_API_*), que siempre crea.
 */
function publicEnv() {
  const env = {};
  if (process.env.NETLIFY === 'true' && process.env.URL) {
    env.NEXT_PUBLIC_NETLIFY_URL = process.env.URL;
  }
  const projectId = process.env.SANITY_PROJECT_ID || process.env.SANITY_STUDIO_API_PROJECT_ID;
  if (process.env.NEXT_PUBLIC_SANITY_PROJECT_ID === undefined && projectId) {
    env.NEXT_PUBLIC_SANITY_PROJECT_ID = projectId;
  }
  const dataset = process.env.SANITY_DATASET || process.env.SANITY_STUDIO_API_DATASET;
  if (process.env.NEXT_PUBLIC_SANITY_DATASET === undefined && dataset) {
    env.NEXT_PUBLIC_SANITY_DATASET = dataset;
  }
  return env;
}

/**
 * Cabeceras de seguridad básicas para todas las páginas. No se usa una política
 * de contenido (CSP) completa: el panel /admin carga código, imágenes y conexiones
 * en vivo de varios dominios de Sanity y una lista cerrada lo rompería.
 */
const SECURITY_HEADERS = [
  // Otras páginas no pueden mostrar la tienda dentro de un marco (evita engaños de "clic")
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
  // El navegador no adivina el tipo de archivo
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Al salir a otro sitio (WhatsApp, redes) solo se comparte el dominio, no la página
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // La tienda no usa cámara, micrófono ni ubicación
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  // Siempre por https (el navegador lo ignora en http://localhost)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Las fotos se redimensionan en el CDN de Sanity (no gasta la cuota de imágenes de Vercel/Netlify)
    loader: 'custom',
    loaderFile: './src/lib/imageLoader.ts',
  },
  // Los filtros del catálogo se movieron de la portada a /productos (Fase 6):
  // los enlaces viejos o compartidos (/?categoria=…, /?marca=…) siguen funcionando
  async redirects() {
    return ['categoria', 'marca'].map((key) => ({
      source: '/',
      has: [{ type: 'query', key }],
      destination: '/productos',
      permanent: false,
    }));
  },
  async headers() {
    return [{ source: '/:path*', headers: SECURITY_HEADERS }];
  },
  env: publicEnv(),
};

export default nextConfig;
