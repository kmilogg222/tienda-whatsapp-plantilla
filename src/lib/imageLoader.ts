'use client';

import type { ImageLoaderProps } from 'next/image';

const RESIZABLE_HOSTS = ['cdn.sanity.io', 'images.unsplash.com'];

/**
 * Loader de next/image: redimensiona en el CDN de origen (Sanity o Unsplash)
 * en lugar de usar la optimización de imágenes de Vercel/Netlify.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith('/')) {
    // Archivo local de /public: se sirve tal cual (el parámetro solo evita el aviso de Next)
    return `${src}${src.includes('?') ? '&' : '?'}w=${width}`;
  }

  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src;
  }
  if (!RESIZABLE_HOSTS.includes(url.hostname)) return src;

  url.searchParams.set('w', String(width));
  url.searchParams.set('q', String(quality || 75));
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'max');
  return url.toString();
}
