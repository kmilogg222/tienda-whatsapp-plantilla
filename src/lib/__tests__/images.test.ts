import { describe, expect, it } from 'vitest';
import imageLoader from '@/lib/imageLoader';
import { focalPointStyle, toCatalogImage } from '@/lib/sanity/images';

const project = { projectId: 'abc123', dataset: 'production' };
const assetId = 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000-jpg';
const rawUrl = 'https://cdn.sanity.io/images/abc123/production/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000.jpg';

describe('toCatalogImage', () => {
  it('devuelve null si no hay imagen', () => {
    expect(toCatalogImage(null, 'x', project)).toBeNull();
    expect(toCatalogImage({ url: null }, 'x', project)).toBeNull();
  });

  it('sin recorte conserva la URL y las dimensiones', () => {
    const image = toCatalogImage(
      { assetId, url: rawUrl, lqip: 'data:image/jpeg;base64,xx', dimensions: { width: 2000, height: 3000 } },
      'Labial',
      project
    );
    expect(image).toEqual({
      url: rawUrl,
      alt: 'Labial',
      lqip: 'data:image/jpeg;base64,xx',
      width: 2000,
      height: 3000,
    });
  });

  it('aplica el recorte de Sanity (rect) y ajusta dimensiones y punto focal', () => {
    const image = toCatalogImage(
      {
        assetId,
        url: rawUrl,
        dimensions: { width: 2000, height: 3000 },
        crop: { top: 0.1, bottom: 0.1, left: 0, right: 0.2 },
        hotspot: { x: 0.4, y: 0.5 },
      },
      'Labial',
      project
    );
    expect(image?.url).toBe(`${rawUrl}?rect=0,300,1600,2400`);
    expect(image?.width).toBe(1600);
    expect(image?.height).toBe(2400);
    expect(image?.focalPoint?.x).toBeCloseTo(0.5, 5);
    expect(image?.focalPoint?.y).toBeCloseTo(0.5, 5);
  });

  it('convierte el punto focal en object-position', () => {
    expect(focalPointStyle({ url: rawUrl, alt: '', focalPoint: { x: 0.25, y: 0.8 } })).toEqual({
      objectPosition: '25% 80%',
    });
    expect(focalPointStyle({ url: rawUrl, alt: '' })).toBeUndefined();
  });
});

describe('imageLoader', () => {
  it('redimensiona en el CDN de Sanity conservando el recorte', () => {
    const url = new URL(imageLoader({ src: `${rawUrl}?rect=0,300,1600,2400`, width: 640, quality: 80 }));
    expect(url.hostname).toBe('cdn.sanity.io');
    expect(url.searchParams.get('rect')).toBe('0,300,1600,2400');
    expect(url.searchParams.get('w')).toBe('640');
    expect(url.searchParams.get('q')).toBe('80');
    expect(url.searchParams.get('auto')).toBe('format');
  });

  it('usa calidad 75 por defecto', () => {
    expect(new URL(imageLoader({ src: rawUrl, width: 320 })).searchParams.get('q')).toBe('75');
  });

  it('reemplaza el ancho de las fotos de Unsplash', () => {
    const url = new URL(
      imageLoader({ src: 'https://images.unsplash.com/photo-1?w=800&auto=format&fit=crop&q=80', width: 384 })
    );
    expect(url.searchParams.get('w')).toBe('384');
  });

  it('deja intactas las URLs de otros dominios', () => {
    expect(imageLoader({ src: 'https://example.com/a.png', width: 640 })).toBe('https://example.com/a.png');
  });

  it('añade el ancho a los archivos locales', () => {
    expect(imageLoader({ src: '/demo/labial.webp', width: 640 })).toBe('/demo/labial.webp?w=640');
  });
});
