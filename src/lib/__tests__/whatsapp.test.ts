import { describe, expect, it } from 'vitest';
import {
  cleanPhoneNumber,
  createAvailabilityWhatsAppUrl,
  createGeneralWhatsAppUrl,
  createProductWhatsAppUrl,
} from '@/lib/whatsapp';
import { normalizeSettings } from '@/lib/settings';
import type { Product } from '@/types/catalog';

const settings = normalizeSettings({
  storeName: 'Tienda Prueba',
  tagline: 'Eslogan',
  whatsappNumber: '+57 300 123-4567',
  defaultMessage: '¡Hola! Quiero este producto:',
  messageClosing: '¿Me confirmas el envío?',
  locale: 'es-CO',
  currencyCode: 'COP',
  showDecimals: false,
});

const product: Product = {
  _id: 'p1',
  name: 'Labial Mate Rojo',
  slug: 'labial-mate-rojo',
  price: 45000,
  sku: 'LAB-001',
  category: 'labios',
  images: [],
  description: 'Descripción',
  tags: [],
  inStock: true,
  variants: [],
  infoSections: [],
};

const BASE_URL = 'https://mitienda.test';

/** Decodifica el mensaje incluido en la URL de WhatsApp. */
function decodeMessage(url: string): string {
  // Intl usa espacios de no separación en los precios; se normalizan para comparar
  return (new URL(url).searchParams.get('text') ?? '').replace(/ /g, ' ');
}

describe('cleanPhoneNumber', () => {
  it('quita todo lo que no sea dígito', () => {
    expect(cleanPhoneNumber('+57 (300) 123-4567')).toBe('573001234567');
  });
});

describe('createProductWhatsAppUrl', () => {
  it('apunta a wa.me con el número limpio', () => {
    const url = createProductWhatsAppUrl(product, settings, { baseUrl: BASE_URL });
    expect(url.startsWith('https://wa.me/573001234567?text=')).toBe(true);
  });

  it('incluye saludo, nombre, precio, SKU y enlace al producto', () => {
    const msg = decodeMessage(createProductWhatsAppUrl(product, settings, { baseUrl: BASE_URL }));
    expect(msg.startsWith(settings.defaultMessage)).toBe(true);
    expect(msg).toContain('*Labial Mate Rojo*');
    expect(msg).toContain('*Precio:* $ 45.000');
    expect(msg).toContain('*Ref / SKU:* LAB-001');
    expect(msg).toContain(`${BASE_URL}/producto/labial-mate-rojo`);
    expect(msg).not.toContain('Cantidad');
    expect(msg.endsWith('¿Me confirmas el envío?')).toBe(true);
  });

  it('muestra cantidad, precio unitario y total cuando la cantidad es mayor a 1', () => {
    const msg = decodeMessage(
      createProductWhatsAppUrl(product, settings, { baseUrl: BASE_URL, quantity: 3 })
    );
    expect(msg).toContain('*Cantidad:* 3 unidades');
    expect(msg).toContain('*Precio unitario:* $ 45.000');
    expect(msg).toContain('*Total estimado:* $ 135.000');
  });

  it('usa N/A si el producto no tiene SKU', () => {
    const msg = decodeMessage(
      createProductWhatsAppUrl({ ...product, sku: undefined }, settings, { baseUrl: BASE_URL })
    );
    expect(msg).toContain('*Ref / SKU:* N/A');
  });

  it('agrega la nota del cliente solo si no está vacía', () => {
    const withNote = decodeMessage(
      createProductWhatsAppUrl(product, settings, { baseUrl: BASE_URL, customNote: '  tono 02  ' })
    );
    expect(withNote).toContain('*Nota adicional:* tono 02');

    const blankNote = decodeMessage(
      createProductWhatsAppUrl(product, settings, { baseUrl: BASE_URL, customNote: '   ' })
    );
    expect(blankNote).not.toContain('Nota adicional');
  });

  it('codifica correctamente tildes, emoji y símbolos especiales', () => {
    const tricky = { ...product, name: 'Rímel & Sérum #1 💄' };
    const url = createProductWhatsAppUrl(tricky, settings, { baseUrl: BASE_URL });
    expect(url.split('?text=')[1]).not.toMatch(/[ &#]/);
    expect(decodeMessage(url)).toContain('*Rímel & Sérum #1 💄*');
  });
});

describe('mensaje con la opción elegida (tono, tamaño)', () => {
  const lipstick: Product = {
    ...product,
    originalPrice: 52000,
    variantLabel: 'Tono',
    variants: [
      { key: 'a', name: 'Rojo Carmesí', color: '#B0263A', sku: 'LAB-001-RC', available: true },
      { key: 'b', name: 'Coral', price: 39000, available: true },
      { key: 'c', name: 'Vino', available: false },
    ],
  };
  const [rojo, coral, vino] = lipstick.variants;

  it('incluye el tono, su referencia y el enlace que abre ese tono', () => {
    const msg = decodeMessage(createProductWhatsAppUrl(lipstick, settings, { baseUrl: BASE_URL, variant: rojo }));
    expect(msg).toContain('*Labial Mate Rojo*\n🎨 *Tono:* Rojo Carmesí');
    expect(msg).toContain('*Precio:* $ 45.000');
    expect(msg).toContain('*Ref / SKU:* LAB-001-RC');
    expect(msg).toContain(`${BASE_URL}/producto/labial-mate-rojo?tono=rojo-carmesi`);
  });

  it('usa el precio del tono y, sin referencia propia, la del producto', () => {
    const msg = decodeMessage(
      createProductWhatsAppUrl(lipstick, settings, { baseUrl: BASE_URL, variant: coral, quantity: 2 })
    );
    expect(msg).toContain('*Precio unitario:* $ 39.000');
    expect(msg).toContain('*Total estimado:* $ 78.000');
    expect(msg).toContain('*Ref / SKU:* LAB-001');
  });

  it('sin nombre de opciones usa el texto de respaldo del panel', () => {
    const msg = decodeMessage(
      createProductWhatsAppUrl({ ...lipstick, variantLabel: undefined }, settings, { baseUrl: BASE_URL, variant: coral })
    );
    expect(msg).toContain(`🎨 *${settings.labels.variantLabelFallback}:* Coral`);
    expect(msg).toContain('?opcion=coral');
  });

  it('sin opción elegida el mensaje es el de siempre', () => {
    const msg = decodeMessage(createProductWhatsAppUrl(lipstick, settings, { baseUrl: BASE_URL }));
    expect(msg).not.toContain('🎨');
    expect(msg).toContain(`${BASE_URL}/producto/labial-mate-rojo\n`);
  });

  it('agotado: pregunta por la disponibilidad del tono, sin precio', () => {
    const msg = decodeMessage(createAvailabilityWhatsAppUrl(lipstick, settings, { baseUrl: BASE_URL, variant: vino }));
    expect(msg.startsWith(settings.labels.askAvailabilityMessage)).toBe(true);
    expect(msg).toContain('*Labial Mate Rojo*\n🎨 *Tono:* Vino');
    expect(msg).toContain(`${BASE_URL}/producto/labial-mate-rojo?tono=vino`);
    expect(msg).not.toContain('Precio');
  });

  it('agotado sin opciones: el mensaje editable del panel y el producto', () => {
    const custom = normalizeSettings({ ...settings, labels: { askAvailabilityMessage: '¿Cuándo llega?' } });
    const msg = decodeMessage(createAvailabilityWhatsAppUrl(product, custom, { baseUrl: BASE_URL }));
    expect(msg).toBe(`¿Cuándo llega?\n\n🛍️ *Labial Mate Rojo*\n🔗 *Enlace:* ${BASE_URL}/producto/labial-mate-rojo`);
  });
});

describe('createGeneralWhatsAppUrl', () => {
  it('usa un mensaje por defecto con el nombre de la tienda', () => {
    const msg = decodeMessage(createGeneralWhatsAppUrl(settings));
    expect(msg).toContain('*Tienda Prueba*');
  });

  it('respeta un mensaje personalizado', () => {
    const msg = decodeMessage(createGeneralWhatsAppUrl(settings, 'Hola, ¿tienen envíos?'));
    expect(msg).toBe('Hola, ¿tienen envíos?');
  });
});
