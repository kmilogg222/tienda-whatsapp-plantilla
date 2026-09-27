'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CatalogImage } from '@/types/catalog';
import { ProductImage } from '../ProductImage';

/** Distancia mínima (px) de un deslizamiento con el dedo para cambiar de foto. */
const SWIPE_THRESHOLD = 40;

interface ProductGalleryProps {
  images: CatalogImage[];
  productName: string;
  /** Foto visible (la controla la ficha: al elegir un tono salta a su foto) */
  index: number;
  onIndexChange: (index: number) => void;
}

/** Cambia de foto al deslizar el dedo a la izquierda o a la derecha. */
function useSwipe(onSwipe: (direction: 1 | -1) => void) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => {
      start.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return;
      const dx = e.changedTouches[0].clientX - start.current.x;
      const dy = e.changedTouches[0].clientY - start.current.y;
      start.current = null;
      // Solo gestos horizontales: desplazarse hacia abajo no cambia la foto
      if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? 1 : -1);
    },
  };
}

/**
 * Galería de la ficha: foto grande (deslizable en el celular), miniaturas y
 * vista ampliada al tocar la foto (con flechas, deslizamiento y tecla Esc).
 */
export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName, index, onIndexChange }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Solo la primera foto que se ve al abrir la ficha se carga con prioridad
  const [firstIndex] = useState(index);
  const count = images.length;
  const current = Math.min(Math.max(index, 0), Math.max(count - 1, 0));
  const currentImage = images[current];
  const go = (direction: 1 | -1) => count > 1 && onIndexChange((current + direction + count) % count);
  const swipe = useSwipe(go);

  const openZoom = () => dialogRef.current?.showModal();
  const closeZoom = () => dialogRef.current?.close();

  const arrows = count > 1 && (
    <>
      <button type="button" className="gallery-arrow is-prev" onClick={() => go(-1)} aria-label="Foto anterior">
        <ChevronLeft size={22} aria-hidden="true" />
      </button>
      <button type="button" className="gallery-arrow is-next" onClick={() => go(1)} aria-label="Foto siguiente">
        <ChevronRight size={22} aria-hidden="true" />
      </button>
    </>
  );

  return (
    <div className="product-gallery">
      <div className="product-gallery-main" {...swipe}>
        {currentImage ? (
          <button
            type="button"
            className="gallery-zoom-trigger"
            onClick={openZoom}
            aria-label={`Ampliar foto ${current + 1} de ${count}: ${currentImage.alt}`}
          >
            <ProductImage
              key={currentImage.url}
              image={currentImage}
              priority={current === firstIndex}
              sizes="(max-width: 840px) 100vw, 50vw"
              className="product-gallery-main-img"
            />
          </button>
        ) : (
          <ProductImage image={undefined} sizes="100vw" alt={productName} />
        )}
        {arrows}
        {count > 1 && (
          <span className="gallery-counter" aria-hidden="true">
            {current + 1} / {count}
          </span>
        )}
      </div>

      {count > 1 && (
        <div className="product-gallery-thumbs" role="group" aria-label={`Fotos de ${productName}`}>
          {images.map((image, i) => (
            <button
              key={image.url}
              type="button"
              aria-pressed={i === current}
              aria-label={`Ver foto ${i + 1} de ${productName}`}
              className={`gallery-thumb-btn${i === current ? ' active' : ''}`}
              onClick={() => onIndexChange(i)}
            >
              <ProductImage image={image} alt="" sizes="72px" className="gallery-thumb-img" />
            </button>
          ))}
        </div>
      )}

      {/* Vista ampliada: <dialog> nativo (Esc cierra, el foco queda dentro) */}
      <dialog
        ref={dialogRef}
        className="gallery-lightbox"
        aria-label={`Fotos de ${productName}`}
        onClick={(e) => e.target === e.currentTarget && closeZoom()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') go(1);
          if (e.key === 'ArrowLeft') go(-1);
        }}
      >
        {/* Primero en el orden: al abrir, el foco queda en "Cerrar" */}
        <button type="button" className="gallery-lightbox-close" onClick={closeZoom} aria-label="Cerrar">
          <X size={24} aria-hidden="true" />
        </button>
        <div className="gallery-lightbox-stage" {...swipe}>
          {currentImage && (
            <ProductImage key={currentImage.url} image={currentImage} sizes="100vw" className="gallery-lightbox-img" />
          )}
          {arrows}
        </div>
        {count > 1 && (
          <span className="gallery-counter" aria-hidden="true">
            {current + 1} / {count}
          </span>
        )}
      </dialog>
    </div>
  );
};
