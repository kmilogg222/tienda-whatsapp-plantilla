import React from 'react';
import Link from 'next/link';
import type { Brand } from '@/types/catalog';
import { catalogHref } from '@/lib/links';
import { ProductImage } from '../ProductImage';
import { HorizontalScroller } from './HorizontalScroller';
import { SectionHeading } from './SectionHeading';

interface BrandStripProps {
  id: string;
  title?: string;
  brands: Brand[];
}

/** Logos de las marcas (o su nombre si no tienen logo); cada una abre el catálogo filtrado. */
export const BrandStrip: React.FC<BrandStripProps> = ({ id, title, brands }) => {
  if (brands.length === 0) return null;
  const headingId = `seccion-${id}`;

  return (
    <section className="home-section container" aria-labelledby={title ? headingId : undefined}>
      <SectionHeading id={headingId} title={title} />
      <HorizontalScroller className="brand-strip" label={title}>
        {brands.map((brand) => (
          <li key={brand._id}>
            <Link href={catalogHref({ marca: brand.slug })} className="brand-tile" aria-label={brand.name}>
              {brand.logo ? (
                <span className="brand-tile-logo">
                  <ProductImage image={brand.logo} alt="" sizes="180px" className="brand-tile-img" />
                </span>
              ) : (
                <span className="brand-tile-name">{brand.name}</span>
              )}
            </Link>
          </li>
        ))}
      </HorizontalScroller>
    </section>
  );
};
