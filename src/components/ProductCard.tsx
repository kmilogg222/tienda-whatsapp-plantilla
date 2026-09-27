import React from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { Product, StoreSettings } from '@/types/catalog';
import { createProductWhatsAppUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/format';
import { priceRange } from '@/lib/catalog/filters';
import { ProductImage } from './ProductImage';

/** Muestras de color que caben en la tarjeta. */
const MAX_SWATCHES = 4;

interface ProductCardProps {
  product: Product;
  settings: StoreSettings;
  /** Cargar la foto de inmediato (primeras tarjetas visibles) */
  priority?: boolean;
  /** Ancho de la foto según la pantalla (atributo sizes); por defecto, el de la cuadrícula */
  imageSizes?: string;
  /** Poner ids a la tarjeta y su botón. Falso cuando el producto puede repetirse en la página (estantes) */
  withIds?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, settings, priority, imageSizes: customSizes, withIds = true }) => {
  const { labels } = settings;
  const { showBrand, showCategory, showQuickOrder } = settings.cardOptions;
  const href = `/producto/${product.slug}`;
  const soldOut = !product.inStock;

  // Con opciones de distinto precio se muestra "Desde" el menor (el mismo que usan filtros y orden)
  const { min: price, max: maxPrice } = priceRange(product);
  const isRange = price !== maxPrice;
  const discountPercent =
    !isRange && price === product.price && product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const swatches = product.variants.filter((v) => v.color).slice(0, MAX_SWATCHES);
  const hiddenSwatches = product.variants.filter((v) => v.color).length - swatches.length;
  const [mainImage, hoverImage] = product.images;
  const imageSizes =
    customSizes ?? `(max-width: 680px) ${settings.mobileColumns === 1 ? 100 : 50}vw, (max-width: 1024px) 33vw, 25vw`;

  return (
    <article className={`product-card${soldOut ? ' is-sold-out' : ''}`} id={withIds ? `product-${product.slug}` : undefined}>
      {/* Toda la tarjeta lleva a la ficha mediante el enlace del nombre (ver .product-card-link) */}
      <div className="product-card-media">
        <ProductImage image={mainImage} sizes={imageSizes} className="product-card-img" priority={priority} />
        {hoverImage && (
          <ProductImage image={hoverImage} alt="" sizes={imageSizes} className="product-card-img is-hover" />
        )}
        {soldOut ? (
          <span className="product-badge badge-agotado">{labels.soldOutBadge}</span>
        ) : (
          product.badge && (
            <span className={`product-badge badge-${product.badge.toLowerCase()}`}>{product.badge}</span>
          )
        )}
      </div>

      <div className="product-card-body">
        {showBrand && product.brandName && <p className="product-card-brand">{product.brandName}</p>}
        {showCategory && product.categoryName && <p className="product-card-category">{product.categoryName}</p>}

        <h3 className="product-card-title">
          <Link href={href} className="product-card-link">
            {product.name}
          </Link>
        </h3>

        {product.variants.length > 1 && (
          <div className="product-card-variants">
            {swatches.length > 0 && (
              <span className="swatch-list" aria-hidden="true">
                {swatches.map((variant) => (
                  <span key={variant.key} className="swatch" style={{ backgroundColor: variant.color }} />
                ))}
                {hiddenSwatches > 0 && <span className="swatch-more">+{hiddenSwatches}</span>}
              </span>
            )}
            <span>
              {product.variants.length} {labels.variantsCount}
            </span>
          </div>
        )}

        <div className="product-card-pricing">
          {isRange && <span className="price-from">{labels.priceFrom}</span>}
          <span className="price-current">{formatPrice(price, settings)}</span>
          {discountPercent !== null && product.originalPrice && (
            <s className="price-original">{formatPrice(product.originalPrice, settings)}</s>
          )}
          {!!discountPercent && <span className="price-discount-tag">-{discountPercent}%</span>}
        </div>

        {showQuickOrder && !soldOut && (
          <a
            href={createProductWhatsAppUrl(product, settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-card-whatsapp"
            id={withIds ? `btn-wa-${product.slug}` : undefined}
            aria-label={`${labels.orderButton}: ${product.name}`}
          >
            <MessageCircle size={16} aria-hidden="true" />
            <span>{labels.orderButton}</span>
          </a>
        )}
      </div>
    </article>
  );
};
