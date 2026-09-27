import React from 'react';
import Image from 'next/image';
import { Sparkles, Layers, Headphones, Watch, Zap, Briefcase, Home, Shirt, Smartphone } from 'lucide-react';
import { Category } from '@/types/catalog';
import { focalPointStyle } from '@/lib/sanity/images';
import { ICONS } from '../Icon';

interface CategoryCarouselProps {
  categories: Category[];
  /** Slug de la categoría elegida; vacío = todas */
  selectedCategory: string | undefined;
  onSelectCategory: (slug: string | undefined) => void;
  totalProductsCount: number;
  /** Texto del botón "todas las categorías" */
  allLabel: string;
}

/** Íconos de la versión anterior (ej. "Headphones"): se siguen mostrando. */
const legacyIcons: Record<string, React.ReactNode> = {
  Headphones: <Headphones size={15} aria-hidden="true" />,
  Watch: <Watch size={15} aria-hidden="true" />,
  Zap: <Zap size={15} aria-hidden="true" />,
  Briefcase: <Briefcase size={15} aria-hidden="true" />,
  Home: <Home size={15} aria-hidden="true" />,
  Shirt: <Shirt size={15} aria-hidden="true" />,
  Smartphone: <Smartphone size={15} aria-hidden="true" />,
};

/** Foto pequeña de la categoría; si no tiene, su ícono. */
function CategoryThumb({ category }: { category: Category }) {
  if (category.image) {
    return (
      <span className="category-pill-thumb" aria-hidden="true">
        <Image
          src={category.image.url}
          alt=""
          fill
          sizes="28px"
          style={focalPointStyle(category.image)}
          className="category-pill-img"
        />
      </span>
    );
  }
  const ListIcon = category.icon ? ICONS[category.icon as keyof typeof ICONS] : undefined;
  if (ListIcon) return <ListIcon size={15} aria-hidden="true" />;
  return (category.icon && legacyIcons[category.icon]) || <Layers size={15} aria-hidden="true" />;
}

export const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
  allLabel,
}) => {
  if (categories.length === 0) return null;

  return (
    <nav className="categories-carousel-wrapper" aria-label="Categorías">
      <div className="categories-carousel">
        <button
          type="button"
          aria-pressed={!selectedCategory}
          className={`category-pill ${!selectedCategory ? 'active' : ''}`}
          onClick={() => onSelectCategory(undefined)}
        >
          <Sparkles size={15} aria-hidden="true" />
          <span>
            {allLabel} ({totalProductsCount})
          </span>
        </button>

        {categories.map((category) => {
          const isSelected = selectedCategory === category.slug;
          return (
            <button
              key={category._id}
              type="button"
              aria-pressed={isSelected}
              className={`category-pill ${isSelected ? 'active' : ''}${category.image ? ' has-thumb' : ''}`}
              onClick={() => onSelectCategory(isSelected ? undefined : category.slug)}
            >
              <CategoryThumb category={category} />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
