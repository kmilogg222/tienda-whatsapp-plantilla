'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import type { Product, ProductVariant } from '@/types/catalog';
import { useCart } from './CartProvider';

interface AddToCartButtonProps {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  label: string;
}

/** Agrega el producto (con su opción y cantidad) y abre el carrito. Sin carrito activo no se muestra. */
export const AddToCartButton: React.FC<AddToCartButtonProps> = ({ product, variant, quantity, label }) => {
  const cart = useCart();
  if (!cart) return null;
  return (
    <button
      type="button"
      className="btn-primary btn-add-to-cart"
      id="btn-add-to-cart"
      onClick={() => {
        cart.add(product, variant, quantity);
        cart.open();
      }}
    >
      <ShoppingBag size={20} aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};
