import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { evaluate, parse } from 'groq-js';
import type { Product } from '@/types/catalog';
import {
  addItem,
  cartCount,
  cartStorageKey,
  type CartItem,
  freeShippingProgress,
  MAX_CART_LINES,
  MAX_ITEM_QUANTITY,
  parseStoredCart,
  removeItem,
  resolveCart,
  serializeCart,
  setItemQty,
} from '@/lib/cart';
import { buildOrderMessage, MAX_WHATSAPP_URL_LENGTH } from '@/lib/whatsapp';
import { normalizeSettings } from '@/lib/settings';
import { PRODUCTS_BY_IDS_QUERY } from '@/lib/sanity/queries';
import { buildDemoDocuments, demoImageFiles, demoProductId } from '@/lib/demo/sanityDocuments';
import { CartProvider } from '@/components/cart/CartProvider';
import { CartButton } from '@/components/cart/CartButton';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

const BASE_URL = 'https://mitienda.test';

const settings = normalizeSettings({
  storeName: 'Tienda',
  whatsappNumber: '573001234567',
  currencyCode: 'COP',
  locale: 'es-CO',
  messageClosing: '¿Me confirmas el envío?',
  labels: { cartMessageGreeting: '¡Hola! Quiero hacer este pedido:' },
  cartEnabled: true,
  askCustomerName: true,
  askCustomerCity: true,
  askNotes: true,
  freeShippingThreshold: 150000,
});

const base: Omit<Product, '_id' | 'name' | 'slug' | 'price'> = {
  category: 'maquillaje',
  images: [],
  description: '',
  tags: [],
  inStock: true,
  variants: [],
  infoSections: [],
};

const lipstick: Product = {
  ...base,
  _id: 'labial',
  name: 'Labial Mate',
  slug: 'labial-mate',
  price: 45000,
  variantLabel: 'Tono',
  variants: [
    { key: 'rojo', name: 'Rojo Carmesí', available: true },
    { key: 'coral', name: 'Coral', price: 39000, available: true },
    { key: 'vino', name: 'Vino', available: false },
  ],
};
const serum: Product = { ...base, _id: 'serum', name: 'Sérum Vitamina C', slug: 'serum', price: 72000 };
const mist: Product = { ...base, _id: 'mist', name: 'Body Mist', slug: 'body-mist', price: 38000, inStock: false };

const item = (productId: string, qty = 1, price = 0, variantKey?: string): CartItem => ({
  productId,
  qty,
  price,
  ...(variantKey ? { variantKey } : {}),
});

/** Intl usa espacios de no separación en los precios; se normalizan para comparar. */
const norm = (text: string) => text.replace(/[\u00a0\u202f]/g, ' ');
const decode = (url: string) => norm(new URL(url).searchParams.get('text') ?? '');

describe('operaciones del carrito', () => {
  it('agregar suma unidades si el producto y la opción ya estaban', () => {
    let items = addItem([], item('labial', 1, 45000, 'rojo'));
    items = addItem(items, item('labial', 2, 45000, 'rojo'));
    items = addItem(items, item('labial', 1, 39000, 'coral'));
    expect(items).toEqual([item('labial', 3, 45000, 'rojo'), item('labial', 1, 39000, 'coral')]);
    expect(cartCount(items)).toBe(4);
  });

  it('nunca pasa del máximo por producto ni del máximo de productos', () => {
    expect(addItem([item('a', 8)], item('a', 5))[0].qty).toBe(MAX_ITEM_QUANTITY);
    const full = Array.from({ length: MAX_CART_LINES }, (_, i) => item(`p${i}`));
    expect(addItem(full, item('otro'))).toHaveLength(MAX_CART_LINES);
  });

  it('cambiar cantidad y quitar', () => {
    const items = [item('a', 2), item('b', 1, 0, 'x')];
    expect(setItemQty(items, { productId: 'a' }, 5)[0].qty).toBe(5);
    expect(setItemQty(items, { productId: 'a' }, 50)[0].qty).toBe(MAX_ITEM_QUANTITY);
    expect(setItemQty(items, { productId: 'a' }, 0)).toEqual([item('b', 1, 0, 'x')]);
    expect(removeItem(items, { productId: 'b', variantKey: 'x' })).toEqual([item('a', 2)]);
    // Otra opción del mismo producto no se toca
    expect(removeItem(items, { productId: 'b', variantKey: 'y' })).toHaveLength(2);
  });

  it('guardar y leer el carrito; datos dañados no fallan', () => {
    const items = [item('labial', 2, 45000, 'rojo'), item('serum', 1, 72000)];
    expect(parseStoredCart(serializeCart(items))).toEqual(items);
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart('{no es json')).toEqual([]);
    expect(parseStoredCart('"texto"')).toEqual([]);
    expect(
      parseStoredCart(JSON.stringify([{ productId: 'a', qty: 99 }, { qty: 1 }, { productId: 'a', qty: 'x' }, null]))
    ).toEqual([{ productId: 'a', qty: MAX_ITEM_QUANTITY, price: 0 }]);
  });

  it('una clave por tienda', () => {
    expect(cartStorageKey('abc', 'production')).toBe('catalogo-carrito:abc:production');
    expect(cartStorageKey('', undefined)).toBe('catalogo-carrito:demo:production');
    expect(cartStorageKey('abc', 'pruebas')).not.toBe(cartStorageKey('abc', 'production'));
  });
});

describe('carrito con los datos actuales de los productos', () => {
  it('precios y opciones frescos, subtotal y aviso de precio cambiado', () => {
    const { lines, removed, subtotal, count } = resolveCart(
      [item('labial', 2, 45000, 'rojo'), item('labial', 1, 42000, 'coral'), item('serum', 1, 72000)],
      [lipstick, serum]
    );
    expect(removed).toEqual([]);
    expect(lines.map((l) => [l.variant?.name ?? l.product.name, l.unitPrice, l.lineTotal, l.priceChanged])).toEqual([
      ['Rojo Carmesí', 45000, 90000, false],
      ['Coral', 39000, 39000, true],
      ['Sérum Vitamina C', 72000, 72000, false],
    ]);
    expect(subtotal).toBe(201000);
    expect(count).toBe(4);
  });

  it('descarta productos borrados u ocultos, opciones borradas y productos que ahora tienen opciones', () => {
    const { lines, removed } = resolveCart(
      [item('borrado'), item('labial', 1, 0, 'azul'), item('labial'), item('serum')],
      [lipstick, serum]
    );
    expect(lines.map((l) => l.product._id)).toEqual(['serum']);
    expect(removed).toEqual([item('borrado'), item('labial', 1, 0, 'azul'), item('labial')]);
  });

  it('lo agotado se muestra pero no suma', () => {
    const { lines, subtotal, count } = resolveCart(
      [item('labial', 1, 0, 'vino'), item('mist'), item('serum')],
      [lipstick, serum, mist]
    );
    expect(lines.map((l) => l.available)).toEqual([false, false, true]);
    expect(subtotal).toBe(72000);
    expect(count).toBe(1);
  });

  it('avance al envío gratis', () => {
    expect(freeShippingProgress(100000, 150000)).toEqual({ missing: 50000, ratio: 2 / 3 });
    expect(freeShippingProgress(200000, 150000)).toEqual({ missing: 0, ratio: 1 });
    expect(freeShippingProgress(100000, undefined)).toBeNull();
    expect(freeShippingProgress(100000, 0)).toBeNull();
  });
});

describe('mensaje de WhatsApp del carrito', () => {
  const lines = (items: CartItem[], products: Product[] = [lipstick, serum, mist]) =>
    resolveCart(items, products).lines;

  it('un producto: saludo, lista, total, datos del cliente y cierre', () => {
    const { message, compacted, url } = buildOrderMessage(
      lines([item('serum', 1)]),
      { name: ' Ana ', city: 'Chapinero', notes: '' },
      settings,
      { baseUrl: BASE_URL }
    );
    expect(compacted).toBe(false);
    expect(url.startsWith('https://wa.me/573001234567?text=')).toBe(true);
    expect(decode(url)).toBe(norm(message));
    expect(norm(message)).toBe(
      [
        '¡Hola! Quiero hacer este pedido:',
        `1. *Sérum Vitamina C*\n   1 x $ 72.000\n   🔗 ${BASE_URL}/producto/serum`,
        '💰 *Total:* $ 72.000',
        '👤 *Nombre:* Ana\n📍 *Ciudad o barrio:* Chapinero',
        '¿Me confirmas el envío?',
      ].join('\n\n')
    );
  });

  it('con opciones: nombre de la opción, cantidad, subtotal por línea y enlace al tono', () => {
    const msg = decode(
      buildOrderMessage(lines([item('labial', 2, 0, 'rojo'), item('labial', 1, 0, 'coral')]), {}, settings, {
        baseUrl: BASE_URL,
      }).url
    );
    expect(msg).toContain('1. *Labial Mate* (Tono: Rojo Carmesí)\n   2 x $ 45.000 = $ 90.000');
    expect(msg).toContain(`${BASE_URL}/producto/labial-mate?tono=rojo-carmesi`);
    expect(msg).toContain('2. *Labial Mate* (Tono: Coral)\n   1 x $ 39.000');
    expect(msg).toContain('💰 *Total:* $ 129.000');
    expect(msg).not.toContain('Nombre');
  });

  it('no incluye lo agotado', () => {
    const msg = decode(
      buildOrderMessage(lines([item('mist'), item('labial', 1, 0, 'vino'), item('serum')]), {}, settings).url
    );
    expect(msg).not.toContain('Body Mist');
    expect(msg).not.toContain('Vino');
    expect(msg).toContain('1. *Sérum Vitamina C*');
  });

  it('solo pide los datos que la dueña activó', () => {
    const customer = { name: 'Ana', city: 'Cali', notes: 'Es para regalo' };
    const off = normalizeSettings({ ...settings, askCustomerName: false, askCustomerCity: false, askNotes: true });
    const msg = decode(buildOrderMessage(lines([item('serum')]), customer, off).url);
    expect(msg).not.toContain('Ana');
    expect(msg).not.toContain('Cali');
    expect(msg).toContain('📝 *Notas:* Es para regalo');
  });

  it('caracteres especiales y emoji viajan bien codificados', () => {
    const tricky: Product = { ...serum, name: 'Rímel & Sérum #1 💄' };
    const { url } = buildOrderMessage(lines([item('serum')], [tricky]), { notes: 'Llamar antes 📞 & timbrar #2' }, settings);
    expect(url.split('?text=')[1]).not.toMatch(/[ &#]/);
    const msg = decode(url);
    expect(msg).toContain('*Rímel & Sérum #1 💄*');
    expect(msg).toContain('Llamar antes 📞 & timbrar #2');
  });

  it('15 productos: si el enlace es muy largo quita los enlaces por producto y avisa', () => {
    const many = Array.from({ length: 15 }, (_, i): Product => ({
      ...serum,
      _id: `p${i}`,
      name: `Producto de belleza número ${i + 1}`,
      slug: `producto-de-belleza-numero-${i + 1}`,
    }));
    const result = buildOrderMessage(
      lines(
        many.map((p) => item(p._id, 2)),
        many
      ),
      {},
      settings,
      { baseUrl: BASE_URL }
    );
    expect(result.compacted).toBe(true);
    expect(result.message).not.toContain('🔗');
    expect(result.message).toContain('15. *Producto de belleza número 15*');
    expect(norm(result.message)).toContain('💰 *Total:* $ 2.160.000');
    // Con 2 productos cabe completo
    const small = buildOrderMessage(lines([item('p0'), item('p1')], many), {}, settings, { baseUrl: BASE_URL });
    expect(small.compacted).toBe(false);
    expect(small.url.length).toBeLessThanOrEqual(MAX_WHATSAPP_URL_LENGTH);
  });
});

describe('carrito desactivado', () => {
  const render = (cartEnabled: boolean) =>
    renderToString(
      createElement(
        CartProvider,
        { settings: normalizeSettings({ ...settings, cartEnabled }), storageKey: 'prueba' },
        createElement(CartButton),
        createElement(AddToCartButton, { product: serum, quantity: 1, label: 'Agregar al carrito' })
      )
    );

  it('con el carrito activo se ven el ícono, el botón y el panel', () => {
    const html = render(true);
    expect(html).toContain('btn-open-cart');
    expect(html).toContain('btn-add-to-cart');
    expect(html).toContain('cart-drawer');
  });

  it('desactivado no se dibuja nada del carrito', () => {
    const html = render(false);
    expect(html).not.toContain('btn-open-cart');
    expect(html).not.toContain('btn-add-to-cart');
    expect(html).not.toContain('cart-drawer');
  });
});

describe('consulta de productos del carrito (GROQ)', () => {
  const assets = Object.fromEntries(demoImageFiles().map((file) => [file, `image-${file}-800x1000-webp`]));
  const docs = buildDemoDocuments(assets);

  it('devuelve los pedidos y omite ocultos y desconocidos', async () => {
    const hidden = demoProductId('serum-vitamina-c');
    const dataset = docs.map((d) => ((d as { _id: string })._id === hidden ? { ...d, hidden: true } : d));
    const ids = [demoProductId('labial-mate-larga-duracion'), hidden, 'no-existe'];
    const result = await evaluate(parse(PRODUCTS_BY_IDS_QUERY, { params: { ids } }), { dataset, params: { ids } });
    const found = (await result.get()) as { _id: string }[];
    expect(found.map((p) => p._id)).toEqual([demoProductId('labial-mate-larga-duracion')]);
  });
});
