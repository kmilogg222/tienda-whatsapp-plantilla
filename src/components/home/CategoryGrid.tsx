import React from 'react';
import Link from 'next/link';
import { Tag } from 'lucide-react';
import type { Category } from '@/types/catalog';
import type { CategoryGridStyle } from '@/lib/contentOptions';
import { catalogHref } from '@/lib/links';
import { Icon } from '../Icon';
import { ProductImage } from '../ProductImage';
import { HorizontalScroller } from './HorizontalScroller';
import { SectionHeading } from './SectionHeading';

interface CategoryGridProps {
  id: string;
  title?: string;
  style: CategoryGridStyle;
  categories: Category[];
}

/** Foto de la categoría o, si no tiene, su ícono. */
const CategoryMedia: React.FC<{ category: Category; sizes: string }> = ({ category, sizes }) =>
  category.image ? (
    <ProductImage image={category.image} alt="" sizes={sizes} className="category-tile-img" />
  ) : (
    <span className="category-tile-icon" aria-hidden="true">
      <Icon name={category.icon} size={28} fallback={Tag} />
    </span>
  );

/** Categorías como círculos con foto (fila deslizable) o como tarjetas (cuadrícula). */
export const CategoryGrid: React.FC<CategoryGridProps> = ({ id, title, style, categories }) => {
  if (categories.length === 0) return null;
  const headingId = `seccion-${id}`;

  return (
    <section className="home-section container" aria-labelledby={title ? headingId : undefined}>
      <SectionHeading id={headingId} title={title} />

      {style === 'cards' ? (
        <ul className="category-cards">
          {categories.map((category) => (
            <li key={category._id}>
              <Link href={catalogHref({ categoria: category.slug })} className="category-card">
                <span className="category-card-media">
                  <CategoryMedia category={category} sizes="(max-width: 680px) 50vw, 25vw" />
                </span>
                <span className="category-card-name">{category.name}</span>
                {category.description && <span className="category-card-text">{category.description}</span>}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <HorizontalScroller className="category-circles" label={title}>
          {categories.map((category) => (
            <li key={category._id}>
              <Link href={catalogHref({ categoria: category.slug })} className="category-circle">
                <span className="category-circle-media">
                  <CategoryMedia category={category} sizes="120px" />
                </span>
                <span className="category-circle-name">{category.name}</span>
              </Link>
            </li>
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
};
