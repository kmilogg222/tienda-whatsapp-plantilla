import React from 'react';
import type { HomeSection } from '@/types/catalog';
import { resolveLink } from '@/lib/links';
import { ProductImage } from '../ProductImage';
import { SmartLink } from './SmartLink';

interface TextBannerProps {
  section: Extract<HomeSection, { type: 'textBanner' }>;
}

/**
 * Banner de texto con botón. Con imagen: texto al lado de la foto.
 * Sin imagen: bloque con el color de acento del tema.
 */
export const TextBanner: React.FC<TextBannerProps> = ({ section }) => {
  const link = resolveLink(section.link);
  const headingId = `seccion-${section.key}`;

  return (
    <section className="home-section container" aria-labelledby={headingId}>
      <div className={`text-banner${section.image ? ' has-image' : ' is-accent'}`}>
        {section.image && (
          <div className="text-banner-media">
            <ProductImage image={section.image} sizes="(max-width: 768px) 100vw, 50vw" className="text-banner-img" />
          </div>
        )}
        <div className="text-banner-body">
          <h2 id={headingId} className="text-banner-title">
            {section.title}
          </h2>
          {section.text && <p className="text-banner-text">{section.text}</p>}
          {section.buttonText && link && (
            <SmartLink link={link} className={section.image ? 'btn-primary' : 'btn-on-accent'}>
              {section.buttonText}
            </SmartLink>
          )}
        </div>
      </div>
    </section>
  );
};
