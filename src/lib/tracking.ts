/**
 * Códigos opcionales de Google y Meta que la dueña pega en el panel
 * (Configuración → Google y estadísticas). Se limpian aquí para aceptar lo
 * que suelen copiar (espacios, la etiqueta completa…) y para que un valor raro
 * nunca termine dentro de un script de la página: si no es válido, no se carga nada.
 */

/** ID de medición de Google Analytics 4. Ej.: G-ABC123XYZ */
export const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;

/** Identificador del píxel de Meta: solo números. Ej.: 123456789012345 */
export const META_PIXEL_ID_PATTERN = /^\d{8,20}$/;

/** Código de verificación de Google Search Console. */
export const SITE_VERIFICATION_PATTERN = /^[A-Za-z0-9_-]{10,100}$/;

const clean = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

export function normalizeGoogleAnalyticsId(value: unknown): string | undefined {
  const id = clean(value).toUpperCase();
  return GA4_ID_PATTERN.test(id) ? id : undefined;
}

export function normalizeMetaPixelId(value: unknown): string | undefined {
  const id = clean(value).replace(/\s+/g, '');
  return META_PIXEL_ID_PATTERN.test(id) ? id : undefined;
}

/**
 * Acepta el código solo, la etiqueta completa que muestra Google
 * (<meta name="google-site-verification" content="…" />) o el formato de
 * registro DNS (google-site-verification=…).
 */
export function normalizeSiteVerification(value: unknown): string | undefined {
  const raw = clean(value);
  const fromTag = raw.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
  const code = (fromTag ?? raw).replace(/^google-site-verification\s*[=:]\s*/i, '').trim();
  return SITE_VERIFICATION_PATTERN.test(code) ? code : undefined;
}
