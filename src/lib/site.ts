export interface SiteEnv {
  siteUrl?: string;
  vercelProductionUrl?: string;
  netlifyUrl?: string;
}

/**
 * Lee las variables de entorno de forma explícita para que Next.js
 * pueda incrustarlas también en el código que corre en el navegador.
 */
function readSiteEnv(): SiteEnv {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelProductionUrl: process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL,
    netlifyUrl: process.env.NEXT_PUBLIC_NETLIFY_URL,
  };
}

/**
 * URL pública del sitio, sin barra final. Orden: URL definida a mano →
 * dominio de producción de Vercel → URL de Netlify → localhost.
 */
export function getSiteUrl(env: SiteEnv = readSiteEnv()): string {
  const raw =
    [env.siteUrl, env.vercelProductionUrl, env.netlifyUrl]
      .map((value) => value?.trim())
      .find((value) => value) || 'http://localhost:3000';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withProtocol.replace(/\/+$/, '');
}
