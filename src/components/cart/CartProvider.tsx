'use client';

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Product, ProductVariant, StoreSettings } from '@/types/catalog';
import {
  addItem,
  cartCount,
  type CartItem,
  type CustomerInfo,
  parseStoredCart,
  removeItem,
  resolveCart,
  sameLine,
  serializeCart,
  setItemQty,
} from '@/lib/cart';
import { variantOffer } from '@/lib/catalog/variants';
import { createStoredValue, useStoredValue } from './storedValue';
import { CartDrawer } from './CartDrawer';

type Line = Pick<CartItem, 'productId' | 'variantKey'>;
export type CartStatus = 'idle' | 'loading' | 'ready' | 'error';

interface CartContextValue {
  items: CartItem[];
  count: number;
  /** Productos conocidos (los recién agregados y los consultados al abrir el carrito) */
  products: Record<string, Product>;
  status: CartStatus;
  /** Se quitaron productos que ya no existen (se muestra un aviso) */
  removedNotice: boolean;
  customer: CustomerInfo;
  add: (product: Product, variant: ProductVariant | undefined, qty: number) => void;
  setQty: (line: Line, qty: number) => void;
  remove: (line: Line) => void;
  clear: () => void;
  setCustomer: (customer: CustomerInfo) => void;
  open: () => void;
  close: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/** Carrito de la tienda; `null` si está desactivado en Configuración → WhatsApp y pedidos. */
export const useCart = () => useContext(CartContext);

function parseCustomer(raw: string | null): CustomerInfo {
  try {
    const data = raw ? JSON.parse(raw) : null;
    const pick = (value: unknown) => (typeof value === 'string' ? value.slice(0, 500) : undefined);
    return data && typeof data === 'object' ? { name: pick(data.name), city: pick(data.city), notes: pick(data.notes) } : {};
  } catch {
    return {};
  }
}

interface CartProviderProps {
  settings: StoreSettings;
  /** Clave del carrito en el navegador (una por tienda, ver cartStorageKey) */
  storageKey: string;
  children?: React.ReactNode;
}

/**
 * Carrito ligero guardado en el navegador. Con el carrito desactivado no
 * dibuja nada: la tienda funciona con pedido directo por producto.
 */
export const CartProvider: React.FC<CartProviderProps> = ({ settings, storageKey, children }) => {
  if (!settings.cartEnabled) return <>{children}</>;
  return (
    <ActiveCartProvider settings={settings} storageKey={storageKey}>
      {children}
    </ActiveCartProvider>
  );
};

const ActiveCartProvider: React.FC<CartProviderProps> = ({ settings, storageKey, children }) => {
  const [cartStore] = useState(() => createStoredValue(storageKey, parseStoredCart, serializeCart));
  const [customerStore] = useState(() =>
    createStoredValue(`${storageKey}:cliente`, parseCustomer, (value) => JSON.stringify(value))
  );
  const items = useStoredValue(cartStore);
  const customer = useStoredValue(customerStore);

  const [products, setProducts] = useState<Record<string, Product>>({});
  const [status, setStatus] = useState<CartStatus>('idle');
  const [removedNotice, setRemovedNotice] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  /** Pide los datos actuales de los productos del carrito y descarta los que ya no existen. */
  const refresh = useCallback(() => {
    const ids = [...new Set(cartStore.get().map((item) => item.productId))];
    if (ids.length === 0) {
      setStatus('ready');
      return;
    }
    setStatus('loading');
    fetch(`/api/carrito?ids=${encodeURIComponent(ids.join(','))}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(({ products: fresh }: { products: Product[] }) => {
        setProducts(Object.fromEntries(fresh.map((p) => [p._id, p])));
        const { removed } = resolveCart(cartStore.get(), fresh);
        if (removed.length > 0) {
          cartStore.set(cartStore.get().filter((item) => !removed.some((r) => sameLine(r, item))));
          setRemovedNotice(true);
        }
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, [cartStore]);

  const open = useCallback(() => {
    setRemovedNotice(false);
    if (!dialogRef.current?.open) dialogRef.current?.showModal();
    refresh();
  }, [refresh]);

  const close = useCallback(() => dialogRef.current?.close(), []);

  /** Al cerrar, los precios vistos pasan a ser los "de referencia" (ya se avisó del cambio). */
  const onClosed = useCallback(() => {
    const current = cartStore.get();
    const synced = current.map((item) => {
      const product = products[item.productId];
      const variant = item.variantKey ? product?.variants.find((v) => v.key === item.variantKey) : undefined;
      return product ? { ...item, price: variantOffer(product, variant).price } : item;
    });
    if (synced.some((item, i) => item.price !== current[i].price)) cartStore.set(synced);
  }, [cartStore, products]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: cartCount(items),
      products,
      status,
      removedNotice,
      customer,
      add: (product, variant, qty) => {
        setProducts((prev) => ({ ...prev, [product._id]: product }));
        cartStore.set(
          addItem(cartStore.get(), {
            productId: product._id,
            ...(variant ? { variantKey: variant.key } : {}),
            qty,
            price: variantOffer(product, variant).price,
          })
        );
      },
      setQty: (line, qty) => cartStore.set(setItemQty(cartStore.get(), line, qty)),
      remove: (line) => cartStore.set(removeItem(cartStore.get(), line)),
      clear: () => cartStore.set([]),
      setCustomer: (next) => customerStore.set(next),
      open,
      close,
    }),
    [items, products, status, removedNotice, customer, cartStore, customerStore, open, close]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer ref={dialogRef} settings={settings} onClosed={onClosed} />
    </CartContext.Provider>
  );
};
