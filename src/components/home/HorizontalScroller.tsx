'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalScrollerProps {
  className?: string;
  /** Nombre de la lista para lectores de pantalla */
  label?: string;
  children: React.ReactNode;
}

/**
 * Fila que se desliza con el dedo (scroll-snap). En computador muestra
 * flechas solo cuando hay más elementos de los que caben.
 */
export const HorizontalScroller: React.FC<HorizontalScrollerProps> = ({ className, label, children }) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => observer.disconnect();
  }, [update]);

  const scrollByPage = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="scroller">
      <ul ref={trackRef} className={`scroller-track ${className ?? ''}`} onScroll={update} aria-label={label}>
        {children}
      </ul>
      {canPrev && (
        <button
          type="button"
          className="scroller-arrow is-prev"
          onClick={() => scrollByPage(-1)}
          aria-label="Ver anteriores"
          tabIndex={-1}
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          className="scroller-arrow is-next"
          onClick={() => scrollByPage(1)}
          aria-label="Ver siguientes"
          tabIndex={-1}
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
