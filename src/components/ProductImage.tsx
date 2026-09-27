import React from 'react';
import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { CatalogImage } from '@/types/catalog';
import { focalPointStyle } from '@/lib/sanity/images';

interface ProductImageProps {
  image?: CatalogImage;
  sizes: string;
  className?: string;
  priority?: boolean;
  /** Texto alternativo que reemplaza al de la imagen (ej. "" para imágenes decorativas) */
  alt?: string;
}

/**
 * Foto de producto que llena su contenedor respetando el punto focal
 * elegido en Sanity y mostrando una versión borrosa mientras carga.
 */
export const ProductImage: React.FC<ProductImageProps> = ({ image, sizes, className, priority, alt }) => {
  if (!image) {
    return (
      <div className="image-placeholder" role="img" aria-label={alt || 'Producto sin foto'}>
        <ImageOff size={28} aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={image.url}
      alt={alt ?? image.alt}
      fill
      sizes={sizes}
      className={className}
      priority={priority}
      style={focalPointStyle(image)}
      {...(image.lqip ? { placeholder: 'blur' as const, blurDataURL: image.lqip } : {})}
    />
  );
};
