import React from 'react';
import { Product, StoreSettings } from '@/types/catalog';
import { ProductCard } from '../ProductCard';

interface RelatedProductsProps {
  products: Product[];
  settings: StoreSettings;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ products, settings }) => {
  if (products.length === 0) return null;
  return (
    <section className="related-products-section" aria-labelledby="related-title">
      <h2 id="related-title">{settings.labels.relatedTitle}</h2>
      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} settings={settings} />
        ))}
      </div>
    </section>
  );
};
