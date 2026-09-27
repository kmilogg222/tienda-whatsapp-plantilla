'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react';
import { Product, ProductVariant, StoreSettings } from '@/types/catalog';
import { createAvailabilityWhatsAppUrl, createProductWhatsAppUrl } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/format';
import { CATALOG_PATH, catalogHref } from '@/lib/links';
import {
  DEFAULT_VARIANT_PARAM,
  galleryImages,
  selectedVariant,
  variantImageIndex,
  variantOffer,
  variantParamName,
  variantSlug,
} from '@/lib/catalog/variants';
import { ProductGallery } from './ProductGallery';
import { VariantPicker } from './VariantPicker';
import { InfoAccordion } from './InfoAccordion';
import { TrustBadges } from './TrustBadges';
import { ShareButton } from './ShareButton';
import { AddToCartButton } from '../cart/AddToCartButton';

// Cantidad máxima que se puede pedir de una vez desde la ficha
const MAX_QUANTITY = 10;

interface ProductDetailProps {
  product: Product;
  settings: StoreSettings;
  /** Opción elegida (la de la dirección o la primera disponible) */
  variant?: ProductVariant;
  /** Sin esta función (vista previa mientras carga) elegir una opción no guarda nada en la dirección */
  onSelectVariant?: (variant: ProductVariant) => void;
}

/**
 * Ficha con la opción leída de la dirección (?tono=coral). Elegir otra la
 * reemplaza con history.replaceState (Next lo integra con useSearchParams),
 * así el enlace compartido abre el mismo tono sin llenar el historial.
 * Va dentro de Suspense (ver la página).
 */
export const ProductDetailFromUrl: React.FC<Omit<ProductDetailProps, 'variant' | 'onSelectVariant'>> = (props) => {
  const searchParams = useSearchParams();
  const { product } = props;
  const variant = useMemo(() => selectedVariant(product, searchParams), [product, searchParams]);

  const selectVariant = (next: ProductVariant) => {
    const params = new URLSearchParams(window.location.search);
    for (const key of ['tono', DEFAULT_VARIANT_PARAM]) params.delete(key);
    params.set(variantParamName(product), variantSlug(next));
    window.history.replaceState(null, '', `${window.location.pathname}?${params}`);
  };

  return <ProductDetail {...props} variant={variant} onSelectVariant={selectVariant} />;
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, settings, variant, onSelectVariant }) => {
  const { labels } = settings;
  const [quantity, setQuantity] = useState(1);
  const [previewVariant, setPreviewVariant] = useState(variant);
  const current = onSelectVariant ? variant : previewVariant;

  // Galería: fotos del producto y de sus opciones; al elegir una opción se salta a su foto
  const images = useMemo(() => galleryImages(product), [product]);
  const [imageIndex, setImageIndex] = useState(() => Math.max(0, variantImageIndex(images, current)));

  const offer = variantOffer(product, current);

  const handleSelect = (next: ProductVariant) => {
    const index = variantImageIndex(images, next);
    if (index >= 0) setImageIndex(index);
    if (onSelectVariant) onSelectVariant(next);
    else setPreviewVariant(next);
  };

  const orderUrl = offer.available
    ? createProductWhatsAppUrl(product, settings, { quantity, variant: current })
    : createAvailabilityWhatsAppUrl(product, settings, { variant: current });

  return (
    <div className="container">
      <nav className="detail-breadcrumb-bar" aria-label="Volver">
        <Link href={CATALOG_PATH} className="breadcrumb-back-btn" id="btn-back-to-catalog">
          <ArrowLeft size={16} aria-hidden="true" />
          <span>{labels.backToCatalog}</span>
        </Link>
        <ShareButton title={product.name} label={labels.shareButton} copiedLabel={labels.linkCopied} />
      </nav>

      <article className="product-detail-layout">
        <section aria-label="Fotografías del producto">
          <ProductGallery images={images} productName={product.name} index={imageIndex} onIndexChange={setImageIndex} />
        </section>

        <section className="product-detail-info" aria-label="Detalles y pedido">
          <div className="detail-header-meta">
            <span className="detail-meta-links">
              {product.brandName && product.brand && (
                <Link href={catalogHref({ marca: product.brand })} className="detail-brand-link">
                  {product.brandName}
                </Link>
              )}
              {(product.categoryName || product.category) && (
                <Link href={catalogHref({ categoria: product.category })} className="detail-category-badge">
                  {product.categoryName || product.category}
                </Link>
              )}
            </span>
            {offer.sku && (
              <span className="detail-sku-tag">
                {labels.skuPrefix} {offer.sku}
              </span>
            )}
          </div>

          <h1 className="detail-title">{product.name}</h1>

          <div className="detail-pricing-card" aria-live="polite">
            <span className="detail-price-current">{formatPrice(offer.price, settings)}</span>
            {offer.originalPrice && (
              <s className="detail-price-original">{formatPrice(offer.originalPrice, settings)}</s>
            )}
            {offer.discount > 0 && (
              <span className="detail-discount-pill">
                {labels.savingsPrefix} {offer.discount}%
              </span>
            )}
          </div>

          <div className={`detail-stock-indicator${offer.available ? '' : ' is-sold-out'}`}>
            <span className="detail-stock-dot" aria-hidden="true" />
            <span>{offer.available ? labels.inStock : labels.outOfStock}</span>
          </div>

          {product.description && <p className="detail-description">{product.description}</p>}

          {product.variants.length > 0 && (
            <VariantPicker product={product} selected={current} onSelect={handleSelect} labels={labels} />
          )}

          {offer.available && (
            <div className="quantity-section">
              <span className="quantity-label" id="quantity-label">
                {labels.quantityLabel}
              </span>
              <div className="quantity-controls" role="group" aria-labelledby="quantity-label">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Disminuir una unidad"
                >
                  -
                </button>
                <span className="quantity-value" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
                  disabled={quantity >= MAX_QUANTITY}
                  aria-label="Aumentar una unidad"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Con carrito activo: agregar al carrito (el pedido directo por WhatsApp se conserva) */}
          {offer.available && (
            <AddToCartButton product={product} variant={current} quantity={quantity} label={labels.addToCart} />
          )}

          {/* Pedido por WhatsApp; si está agotado, pregunta por la disponibilidad */}
          <a
            href={orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-whatsapp-detail${offer.available ? '' : ' is-ask'}`}
            id="btn-order-product-whatsapp"
          >
            <MessageCircle size={22} aria-hidden="true" />
            <span>{offer.available ? labels.orderButton : labels.askAvailabilityButton}</span>
            {offer.available && (
              <span className="btn-whatsapp-detail-total">{formatPrice(offer.price * quantity, settings)}</span>
            )}
          </a>

          <TrustBadges badges={settings.trustBadges} />

          {product.features && product.features.length > 0 && (
            <div className="detail-features-box">
              <h2>{labels.featuresTitle}</h2>
              <ul className="detail-features-list">
                {product.features.map((feat, idx) => (
                  <li key={idx} className="detail-features-item">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <InfoAccordion sections={product.infoSections} />
        </section>
      </article>
    </div>
  );
};
