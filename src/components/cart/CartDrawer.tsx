'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import type { StoreSettings } from '@/types/catalog';
import { freeShippingProgress, MAX_ITEM_QUANTITY, resolveCart } from '@/lib/cart';
import { buildOrderMessage } from '@/lib/whatsapp';
import { formatPrice } from '@/lib/format';
import { CATALOG_PATH } from '@/lib/links';
import { productPath } from '@/lib/catalog/variants';
import { ProductImage } from '../ProductImage';
import { useCart } from './CartProvider';

const FORM_ID = 'cart-order-form';

interface CartDrawerProps {
  ref: React.Ref<HTMLDialogElement>;
  settings: StoreSettings;
  /** Se llama al cerrar el panel */
  onClosed: () => void;
}

/**
 * Panel del carrito (desde la derecha en computador y desde abajo en el celular):
 * productos con cantidades, subtotal, avance al envío gratis, datos del cliente
 * y botón que abre WhatsApp con todo el pedido.
 */
export const CartDrawer: React.FC<CartDrawerProps> = ({ ref, settings, onClosed }) => {
  const cart = useCart()!;
  const { labels } = settings;
  const [sent, setSent] = useState(false);

  const { lines, removed, subtotal } = resolveCart(cart.items, Object.values(cart.products));
  // Ítems cuyos datos aún no llegan (se muestran como "cargando")
  const pending = cart.status === 'ready' ? 0 : removed.length;
  const shipping = freeShippingProgress(subtotal, settings.freeShippingThreshold);
  const order = buildOrderMessage(lines, cart.customer, settings);
  const canSend = lines.some((line) => line.available) && pending === 0;
  const isEmpty = cart.items.length === 0;
  const hasForm = settings.askCustomerName || settings.askCustomerCity || settings.askNotes;

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    const win = window.open(order.url, '_blank');
    if (win) win.opener = null;
    // Ventanas emergentes bloqueadas: se abre WhatsApp en esta misma pestaña (el carrito queda guardado)
    else window.location.assign(order.url);
    setSent(true);
  };

  const field = (key: 'name' | 'city' | 'notes') => ({
    value: cart.customer[key] ?? '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      cart.setCustomer({ ...cart.customer, [key]: e.target.value }),
  });

  return (
    <dialog
      ref={ref}
      className="cart-drawer"
      aria-labelledby="cart-drawer-title"
      onClose={() => {
        setSent(false);
        onClosed();
      }}
      onClick={(e) => e.target === e.currentTarget && cart.close()}
    >
      <div className="cart-drawer-inner">
        <div className="cart-drawer-header">
          <h2 id="cart-drawer-title" className="cart-drawer-title">
            {labels.cartTitle}
            {cart.count > 0 && <span className="cart-drawer-count">{cart.count}</span>}
          </h2>
          <button type="button" className="filter-sheet-close" onClick={cart.close} aria-label="Cerrar">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cart.removedNotice && (
            <p className="cart-notice" role="status">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{labels.cartItemsRemoved}</span>
            </p>
          )}

          {cart.status === 'error' && pending > 0 && (
            <div className="cart-notice" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{labels.loadErrorTitle}</span>
              <button type="button" className="cart-notice-action" onClick={cart.open}>
                {labels.retryButton}
              </button>
            </div>
          )}

          {isEmpty ? (
            <div className="cart-empty">
              <ShoppingBag size={40} aria-hidden="true" />
              <p>{labels.cartEmpty}</p>
              <Link href={CATALOG_PATH} className="btn-secondary" onClick={cart.close}>
                {labels.cartEmptyButton}
              </Link>
            </div>
          ) : (
            <>
              <ul className="cart-lines">
                {lines.map((line) => {
                  const key = `${line.item.productId}:${line.item.variantKey ?? ''}`;
                  const optionName = line.product.variantLabel || labels.variantLabelFallback;
                  return (
                    <li key={key} className={`cart-line${line.available ? '' : ' is-unavailable'}`}>
                      <div className="cart-line-media">
                        <ProductImage
                          image={line.variant?.image ?? line.product.images[0]}
                          alt=""
                          sizes="72px"
                          className="cart-line-img"
                        />
                      </div>
                      <div className="cart-line-info">
                        <div className="cart-line-top">
                          <Link
                            href={productPath(line.product, line.variant)}
                            className="cart-line-name"
                            onClick={cart.close}
                          >
                            {line.product.name}
                          </Link>
                          <span className="cart-line-total">{formatPrice(line.lineTotal, settings)}</span>
                        </div>
                        {line.variant && (
                          <span className="cart-line-variant">
                            {optionName}: {line.variant.name}
                          </span>
                        )}
                        <span className="cart-line-price">{formatPrice(line.unitPrice, settings)}</span>
                        {!line.available && <span className="cart-line-alert">{labels.outOfStock}</span>}
                        {line.available && line.priceChanged && (
                          <span className="cart-line-alert">{labels.cartPriceChanged}</span>
                        )}
                        <div className="cart-line-actions">
                          <div className="quantity-controls" role="group" aria-label={`Cantidad de ${line.product.name}`}>
                            <button
                              type="button"
                              className="quantity-btn"
                              onClick={() => cart.setQty(line.item, line.item.qty - 1)}
                              disabled={line.item.qty <= 1}
                              aria-label="Disminuir una unidad"
                            >
                              -
                            </button>
                            <span className="quantity-value" aria-live="polite">
                              {line.item.qty}
                            </span>
                            <button
                              type="button"
                              className="quantity-btn"
                              onClick={() => cart.setQty(line.item, line.item.qty + 1)}
                              disabled={line.item.qty >= MAX_ITEM_QUANTITY}
                              aria-label="Aumentar una unidad"
                            >
                              +
                            </button>
                          </div>
                          <button type="button" className="cart-line-remove" onClick={() => cart.remove(line.item)}>
                            <Trash2 size={14} aria-hidden="true" />
                            <span>{labels.cartRemove}</span>
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
                {Array.from({ length: pending }, (_, i) => (
                  <li key={`cargando-${i}`} className="cart-line is-loading" aria-hidden="true">
                    <div className="cart-line-media skeleton" />
                    <div className="cart-line-info">
                      <div className="skeleton skeleton-line" />
                      <div className="skeleton skeleton-line is-short" />
                    </div>
                  </li>
                ))}
              </ul>

              {hasForm && (
                <form id={FORM_ID} className="cart-customer" onSubmit={send}>
                  <h3 className="cart-customer-title">{labels.customerTitle}</h3>
                  {settings.askCustomerName && (
                    <label className="cart-field">
                      <span>{labels.customerName}</span>
                      <input type="text" name="name" autoComplete="name" maxLength={80} required {...field('name')} />
                    </label>
                  )}
                  {settings.askCustomerCity && (
                    <label className="cart-field">
                      <span>{labels.customerCity}</span>
                      <input
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        maxLength={120}
                        required
                        {...field('city')}
                      />
                    </label>
                  )}
                  {settings.askNotes && (
                    <label className="cart-field">
                      <span>{labels.customerNotes}</span>
                      <textarea name="notes" rows={2} maxLength={300} {...field('notes')} />
                    </label>
                  )}
                </form>
              )}
            </>
          )}
        </div>

        {!isEmpty && (
          <div className="cart-drawer-footer">
            {sent ? (
              <div className="cart-sent" role="status">
                <p>{labels.cartSentQuestion}</p>
                <div className="cart-sent-actions">
                  <button type="button" className="btn-secondary" onClick={() => setSent(false)}>
                    {labels.cartKeep}
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      cart.clear();
                      setSent(false);
                      cart.close();
                    }}
                  >
                    {labels.cartClear}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {shipping && (
                  <div className="cart-shipping">
                    <p>
                      <Truck size={16} aria-hidden="true" />
                      <span>
                        {shipping.missing > 0
                          ? `${labels.freeShippingMissing} ${formatPrice(shipping.missing, settings)} ${labels.freeShippingMissingEnd}`
                          : labels.freeShippingReached}
                      </span>
                    </p>
                    <div className="cart-shipping-bar" aria-hidden="true">
                      <span style={{ width: `${Math.round(shipping.ratio * 100)}%` }} />
                    </div>
                  </div>
                )}
                <div className="cart-subtotal">
                  <span>{labels.cartSubtotal}</span>
                  <strong>{formatPrice(subtotal, settings)}</strong>
                </div>
                {order.compacted && <p className="cart-compacted">{labels.cartCompacted}</p>}
                {/* Con datos del cliente, el botón envía el formulario (revisa las casillas obligatorias) */}
                <button
                  type={hasForm ? 'submit' : 'button'}
                  form={hasForm ? FORM_ID : undefined}
                  onClick={hasForm ? undefined : send}
                  className="btn-whatsapp-detail"
                  disabled={!canSend}
                  id="btn-send-cart-whatsapp"
                >
                  <span>{labels.cartSend}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
};
