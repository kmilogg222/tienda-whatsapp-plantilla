'use client';

import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './CartProvider';

/** Ícono del carrito en el encabezado, con el número de productos. Sin carrito activo no se muestra. */
export const CartButton: React.FC = () => {
  const cart = useCart();
  if (!cart) return null;
  return (
    <button
      type="button"
      className="header-icon-btn cart-button"
      onClick={cart.open}
      aria-haspopup="dialog"
      aria-label={`Carrito de compras (${cart.count})`}
      id="btn-open-cart"
    >
      <ShoppingBag size={20} aria-hidden="true" />
      {cart.count > 0 && (
        <span className="cart-button-count" aria-hidden="true">
          {cart.count > 99 ? '99+' : cart.count}
        </span>
      )}
    </button>
  );
};
