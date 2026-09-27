'use client';

import React from 'react';
import { Product, ProductVariant, StoreSettings } from '@/types/catalog';

interface VariantPickerProps {
  product: Product;
  selected?: ProductVariant;
  onSelect: (variant: ProductVariant) => void;
  labels: StoreSettings['labels'];
}

/**
 * Opciones del producto: muestras de color redondas (si la opción tiene color)
 * o píldoras con el nombre. Las agotadas se ven tachadas pero se pueden elegir
 * (para preguntar cuándo vuelven). Son botones de radio: se usan con las flechas.
 */
export const VariantPicker: React.FC<VariantPickerProps> = ({ product, selected, onSelect, labels }) => {
  const optionName = product.variantLabel || labels.variantLabelFallback;
  const groupName = `variante-${product._id}`;

  return (
    <fieldset className="variant-picker">
      <legend className="variant-picker-legend">
        {optionName}: <strong>{selected?.name}</strong>
        {selected && !selected.available && <span className="variant-picker-soldout">{labels.soldOutBadge}</span>}
      </legend>

      <div className="variant-options">
        {product.variants.map((variant) => {
          const isSelected = variant.key === selected?.key;
          const classes = [
            'variant-option',
            variant.color ? 'is-swatch' : 'is-pill',
            isSelected ? 'is-selected' : '',
            variant.available ? '' : 'is-unavailable',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <label key={variant.key} className={classes} title={variant.name}>
              <input
                type="radio"
                className="sr-only"
                name={groupName}
                value={variant.key}
                checked={isSelected}
                onChange={() => onSelect(variant)}
              />
              {variant.color ? (
                <>
                  <span className="variant-swatch" style={{ backgroundColor: variant.color }} aria-hidden="true" />
                  <span className="sr-only">
                    {variant.name}
                    {!variant.available && ` (${labels.soldOutBadge})`}
                  </span>
                </>
              ) : (
                <span>
                  {variant.name}
                  {!variant.available && <span className="sr-only">{` (${labels.soldOutBadge})`}</span>}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
