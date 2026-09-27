import React from 'react';
import type { Brand, Category, HomeSection, StoreSettings } from '@/types/catalog';
import { HeroBanner } from './HeroBanner';
import { ProductShelf } from './ProductShelf';
import { CategoryGrid } from './CategoryGrid';
import { BrandStrip } from './BrandStrip';
import { InfoBlocks } from './InfoBlocks';
import { TextBanner } from './TextBanner';
import { SocialCta } from './SocialCta';

interface HomeSectionsProps {
  sections: HomeSection[];
  settings: StoreSettings;
  /** Solo se necesitan si hay una sección de categorías */
  categories: Category[];
  /** Solo se necesitan si hay una sección de marcas */
  brands: Brand[];
}

/** Portada armada en el panel (Portada → Secciones): una sección tras otra, en el orden elegido. */
export const HomeSections: React.FC<HomeSectionsProps> = ({ sections, settings, categories, brands }) => (
  <>
    {sections.map((section, index) => {
      switch (section.type) {
        case 'heroBanner':
          return (
            <HeroBanner key={section.key} slides={section.slides} autoplay={section.autoplay} isFirst={index === 0} />
          );
        case 'productShelf':
          return <ProductShelf key={section.key} section={section} settings={settings} />;
        case 'categoryGrid':
          return (
            <CategoryGrid
              key={section.key}
              id={section.key}
              title={section.title}
              style={section.style}
              categories={categories}
            />
          );
        case 'brandStrip':
          return <BrandStrip key={section.key} id={section.key} title={section.title} brands={brands} />;
        case 'infoBlocks':
          return <InfoBlocks key={section.key} section={section} />;
        case 'textBanner':
          return <TextBanner key={section.key} section={section} />;
        case 'socialCta':
          return <SocialCta key={section.key} section={section} settings={settings} />;
        default:
          return null;
      }
    })}
  </>
);
