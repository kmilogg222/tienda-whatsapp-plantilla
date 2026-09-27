import imageUrlBuilder from '@sanity/image-url';
import type { CatalogImage } from '@/types/catalog';

export interface SanityImageCrop {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Imagen tal como la devuelve la proyección IMAGE_PROJECTION de queries.ts */
export interface RawSanityImage {
  assetId?: string | null;
  url?: string | null;
  lqip?: string | null;
  dimensions?: { width?: number; height?: number } | null;
  crop?: Partial<SanityImageCrop> | null;
  hotspot?: { x?: number; y?: number } | null;
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/**
 * Convierte una imagen de Sanity en CatalogImage: URL con el recorte aplicado
 * (parámetro rect), tamaño final y punto focal relativo al área recortada.
 */
export function toCatalogImage(
  raw: RawSanityImage | null | undefined,
  alt: string,
  project: { projectId: string; dataset: string }
): CatalogImage | null {
  if (!raw?.url) return null;

  const crop: SanityImageCrop = {
    top: raw.crop?.top ?? 0,
    bottom: raw.crop?.bottom ?? 0,
    left: raw.crop?.left ?? 0,
    right: raw.crop?.right ?? 0,
  };

  let url = raw.url;
  if (raw.assetId && project.projectId) {
    try {
      url = imageUrlBuilder(project)
        .image({ asset: { _ref: raw.assetId }, crop, hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 } })
        .url();
    } catch {
      // ID de asset con formato inesperado: se usa la URL original sin recorte
    }
  }

  const visibleWidth = 1 - crop.left - crop.right;
  const visibleHeight = 1 - crop.top - crop.bottom;
  const width = raw.dimensions?.width ? Math.round(raw.dimensions.width * visibleWidth) : undefined;
  const height = raw.dimensions?.height ? Math.round(raw.dimensions.height * visibleHeight) : undefined;

  let focalPoint: CatalogImage['focalPoint'];
  if (typeof raw.hotspot?.x === 'number' && typeof raw.hotspot?.y === 'number' && visibleWidth > 0 && visibleHeight > 0) {
    focalPoint = {
      x: clamp01((raw.hotspot.x - crop.left) / visibleWidth),
      y: clamp01((raw.hotspot.y - crop.top) / visibleHeight),
    };
  }

  return {
    url,
    alt,
    ...(raw.lqip ? { lqip: raw.lqip } : {}),
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(focalPoint ? { focalPoint } : {}),
  };
}

/** Estilo object-position para respetar el punto focal al recortar con object-fit: cover. */
export function focalPointStyle(image?: CatalogImage): { objectPosition: string } | undefined {
  if (!image?.focalPoint) return undefined;
  const { x, y } = image.focalPoint;
  return { objectPosition: `${Math.round(x * 100)}% ${Math.round(y * 100)}%` };
}
