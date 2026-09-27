'use client';

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getImageProps } from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { CatalogImage, HeroSlide } from '@/types/catalog';
import { resolveLink } from '@/lib/links';
import { focalPointStyle } from '@/lib/sanity/images';
import { SmartLink } from './SmartLink';

/** Tiempo que se muestra cada diapositiva cuando pasan solas. */
const AUTOPLAY_MS = 6000;
/** Desde este ancho se usa la imagen para computador. */
const DESKTOP_MEDIA = '(min-width: 768px)';
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** true si la persona pidió menos movimiento (en el servidor se asume que sí: nada se mueve solo). */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true
  );
}

const focal = (image: CatalogImage) => focalPointStyle(image)?.objectPosition ?? '50% 50%';

/** Imagen de la diapositiva: la de celular en pantallas angostas y la de computador en las anchas. */
const SlidePicture: React.FC<{ desktop: CatalogImage; mobile?: CatalogImage; eager: boolean }> = ({
  desktop,
  mobile,
  eager,
}) => {
  const common = { alt: desktop.alt, fill: true, sizes: '100vw' } as const;
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: desktop.url });
  const { props } = getImageProps({
    ...common,
    src: (mobile ?? desktop).url,
    loading: eager ? 'eager' : 'lazy',
    ...(eager ? { fetchPriority: 'high' as const } : {}),
  });
  const style = {
    ...props.style,
    '--focal-mobile': focal(mobile ?? desktop),
    '--focal-desktop': focal(desktop),
  } as React.CSSProperties;

  return (
    <picture>
      {mobile && <source media={DESKTOP_MEDIA} srcSet={desktopSrcSet} sizes="100vw" />}
      {/* <picture> para cambiar de imagen según la pantalla (ver docs de next/image → Art Direction) */}
      <img {...props} alt={props.alt} style={style} className="hero-img" />
    </picture>
  );
};

interface HeroBannerProps {
  slides: HeroSlide[];
  autoplay: boolean;
  /** Es la primera sección de la portada: la primera imagen se carga de inmediato */
  isFirst?: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ slides, autoplay, isFirst = false }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [pausedByUser, setPausedByUser] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const count = slides.length;
  const hasControls = count > 1;
  const canAutoplay = autoplay && hasControls && !reducedMotion;
  const playing = canAutoplay && !pausedByUser && !interacting;

  const goTo = useCallback(
    (target: number) => {
      const track = trackRef.current;
      if (!track) return;
      const next = (target + count) % count;
      track.scrollTo({ left: next * track.clientWidth, behavior: reducedMotion ? 'auto' : 'smooth' });
    },
    [count, reducedMotion]
  );

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const current = Math.round(track.scrollLeft / track.clientWidth);
    indexRef.current = current;
    setIndex(current);
  };

  // Avance automático: se detiene al tocar, pasar el mouse, enfocar o con la pestaña oculta
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) goTo(indexRef.current + 1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [playing, goTo]);

  // Todas las diapositivas usan la proporción vertical en celular solo si todas tienen imagen de celular
  const mobileArt = slides.every((slide) => slide.mobileImage);

  return (
    <section
      className={`hero-banner${mobileArt ? ' has-mobile-art' : ''}`}
      aria-roledescription="carrusel"
      aria-label={slides[0].title || slides[0].image?.alt || undefined}
      onMouseEnter={() => setInteracting(true)}
      onMouseLeave={() => setInteracting(false)}
      onFocus={() => setInteracting(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setInteracting(false);
      }}
      onTouchStart={() => setInteracting(true)}
    >
      <div ref={trackRef} className="hero-track" onScroll={handleScroll} aria-live={playing ? 'off' : 'polite'}>
        {slides.map((slide, i) => {
          const link = resolveLink(slide.link);
          const showButton = Boolean(slide.buttonText && link);
          const hasText = Boolean(slide.title || slide.subtitle || showButton);
          const Title = i === 0 ? 'h2' : 'p';

          return (
            <div
              key={slide.key}
              className="hero-slide"
              role="group"
              aria-roledescription="diapositiva"
              aria-label={`${i + 1} / ${count}`}
            >
              {slide.image && <SlidePicture desktop={slide.image} mobile={slide.mobileImage} eager={isFirst && i === 0} />}

              {/* Sin botón: toda la imagen es el enlace */}
              {link && !showButton && (
                <SmartLink link={link} className="hero-slide-link" aria-label={slide.title || slide.image?.alt} />
              )}

              {hasText && (
                <div className="hero-content">
                  <div className="hero-panel">
                    {slide.title && <Title className="hero-title">{slide.title}</Title>}
                    {slide.subtitle && <p className="hero-subtitle">{slide.subtitle}</p>}
                    {showButton && link && (
                      <SmartLink link={link} className="btn-primary hero-button">
                        {slide.buttonText}
                      </SmartLink>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasControls && (
        <div className="hero-controls">
          <button type="button" className="hero-arrow" onClick={() => goTo(index - 1)} aria-label="Diapositiva anterior">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <div className="hero-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                type="button"
                className={`hero-dot${i === index ? ' is-active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la diapositiva ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
          <button type="button" className="hero-arrow" onClick={() => goTo(index + 1)} aria-label="Diapositiva siguiente">
            <ChevronRight size={20} aria-hidden="true" />
          </button>
          {canAutoplay && (
            <button
              type="button"
              className="hero-arrow"
              onClick={() => setPausedByUser((paused) => !paused)}
              aria-label={pausedByUser ? 'Reanudar diapositivas' : 'Pausar diapositivas'}
            >
              {pausedByUser ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
};
