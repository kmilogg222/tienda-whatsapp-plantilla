import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

// Variables de entorno de Sanity (sin ellas la web funciona en modo demostración)
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01';

export const isSanityConfigured = Boolean(projectId && projectId.trim() !== '');

// El CDN de Sanity refleja lo publicado en segundos y tiene una cuota mucho mayor que la API
export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: true,
    })
  : null;

const builder = isSanityConfigured ? imageUrlBuilder({ projectId, dataset }) : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any): string {
  if (typeof source === 'string') return source;
  if (!builder || !source) return '';
  return builder.image(source).url();
}
