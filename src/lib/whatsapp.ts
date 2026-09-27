import { Product, ProductVariant, StoreSettings } from '@/types/catalog';
import { formatPrice } from './format';
import { getSiteUrl } from './site';
import { productPath, variantOffer } from './catalog/variants';
import type { CartLine, CustomerInfo } from './cart';

/**
 * Limpia el número de teléfono removiendo caracteres no numéricos
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export interface ProductWhatsAppOptions {
  quantity?: number;
  baseUrl?: string;
  customNote?: string;
  /** Opción elegida (tono, tamaño…): cambia precio, referencia y enlace */
  variant?: ProductVariant;
}

const whatsAppUrl = (settings: StoreSettings, message: string) =>
  `https://wa.me/${cleanPhoneNumber(settings.whatsappNumber)}?text=${encodeURIComponent(message)}`;

/** Nombre del producto y, si hay, la opción elegida: "🎨 *Tono:* Coral". */
function productLines(product: Product, settings: StoreSettings, variant?: ProductVariant): string {
  const optionName = product.variantLabel || settings.labels.variantLabelFallback;
  return `🛍️ *${product.name}*${variant ? `\n🎨 *${optionName}:* ${variant.name}` : ''}`;
}

/**
 * Genera la URL de WhatsApp con mensaje estructurado para un producto específico
 */
export function createProductWhatsAppUrl(
  product: Product,
  storeSettings: StoreSettings,
  options: ProductWhatsAppOptions = {}
): string {
  const { quantity = 1, baseUrl, customNote, variant } = options;
  const siteUrl = baseUrl || getSiteUrl();
  const productUrl = `${siteUrl}${productPath(product, variant)}`;
  const { price, sku } = variantOffer(product, variant);

  const unitPriceFormatted = formatPrice(price, storeSettings);
  const totalPriceFormatted = formatPrice(price * quantity, storeSettings);

  let pricingBlock = `💰 *Precio:* ${unitPriceFormatted}`;
  if (quantity > 1) {
    pricingBlock = `🔢 *Cantidad:* ${quantity} unidades\n💵 *Precio unitario:* ${unitPriceFormatted}\n💰 *Total estimado:* ${totalPriceFormatted}`;
  }

  let message = `${storeSettings.defaultMessage}

${productLines(product, storeSettings, variant)}
${pricingBlock}
📦 *Ref / SKU:* ${sku || 'N/A'}
🔗 *Enlace:* ${productUrl}`;

  if (customNote && customNote.trim() !== '') {
    message += `\n💬 *Nota adicional:* ${customNote.trim()}`;
  }

  message += `\n\n${storeSettings.messageClosing}`;

  return whatsAppUrl(storeSettings, message);
}

/**
 * Mensaje para un producto (u opción) agotado: pregunta cuándo vuelve a estar
 * disponible, sin precio ni cantidad. El saludo se edita en Configuración → Textos.
 */
export function createAvailabilityWhatsAppUrl(
  product: Product,
  storeSettings: StoreSettings,
  options: Pick<ProductWhatsAppOptions, 'baseUrl' | 'variant'> = {}
): string {
  const { baseUrl, variant } = options;
  const productUrl = `${baseUrl || getSiteUrl()}${productPath(product, variant)}`;
  const message = `${storeSettings.labels.askAvailabilityMessage}

${productLines(product, storeSettings, variant)}
🔗 *Enlace:* ${productUrl}`;
  return whatsAppUrl(storeSettings, message);
}

/** Largo máximo recomendado del enlace de WhatsApp: más largo, algunos celulares no lo abren. */
export const MAX_WHATSAPP_URL_LENGTH = 1800;

export interface OrderMessageResult {
  url: string;
  message: string;
  /** Se quitaron los enlaces de cada producto para que el mensaje quepa */
  compacted: boolean;
}

/**
 * Mensaje del carrito: saludo, lista numerada (producto, opción, cantidad y
 * precio), total, datos del cliente y cierre. Solo incluye líneas disponibles.
 * Si el enlace supera MAX_WHATSAPP_URL_LENGTH, se quitan los enlaces por producto.
 */
export function buildOrderMessage(
  lines: CartLine[],
  customer: CustomerInfo,
  settings: StoreSettings,
  options: { baseUrl?: string } = {}
): OrderMessageResult {
  const { labels } = settings;
  const siteUrl = options.baseUrl || getSiteUrl();
  const orderable = lines.filter((line) => line.available);
  const total = orderable.reduce((sum, line) => sum + line.lineTotal, 0);

  const build = (withLinks: boolean) => {
    const items = orderable.map((line, index) => {
      const optionName = line.product.variantLabel || labels.variantLabelFallback;
      const option = line.variant ? ` (${optionName}: ${line.variant.name})` : '';
      const price =
        line.item.qty > 1
          ? `${line.item.qty} x ${formatPrice(line.unitPrice, settings)} = ${formatPrice(line.lineTotal, settings)}`
          : `${line.item.qty} x ${formatPrice(line.unitPrice, settings)}`;
      const link = withLinks ? `\n   🔗 ${siteUrl}${productPath(line.product, line.variant)}` : '';
      return `${index + 1}. *${line.product.name}*${option}\n   ${price}${link}`;
    });

    const customerLines = [
      settings.askCustomerName && customer.name?.trim() ? `👤 *${labels.customerName}:* ${customer.name.trim()}` : '',
      settings.askCustomerCity && customer.city?.trim() ? `📍 *${labels.customerCity}:* ${customer.city.trim()}` : '',
      settings.askNotes && customer.notes?.trim() ? `📝 *${labels.customerNotes}:* ${customer.notes.trim()}` : '',
    ].filter(Boolean);

    return [
      labels.cartMessageGreeting,
      items.join('\n\n'),
      `💰 *${labels.cartTotal}:* ${formatPrice(total, settings)}`,
      customerLines.join('\n'),
      settings.messageClosing,
    ]
      .filter(Boolean)
      .join('\n\n');
  };

  let message = build(true);
  let url = whatsAppUrl(settings, message);
  const compacted = url.length > MAX_WHATSAPP_URL_LENGTH && orderable.length > 0;
  if (compacted) {
    message = build(false);
    url = whatsAppUrl(settings, message);
  }
  return { url, message, compacted };
}

/**
 * Genera la URL de WhatsApp para una consulta general sobre la tienda
 */
export function createGeneralWhatsAppUrl(
  storeSettings: StoreSettings,
  customMessage?: string
): string {
  const message =
    customMessage ||
    `¡Hola! Vengo de su catálogo web *${storeSettings.storeName}* y me gustaría hacer una consulta sobre disponibilidad y envíos.`;

  return whatsAppUrl(storeSettings, message);
}
