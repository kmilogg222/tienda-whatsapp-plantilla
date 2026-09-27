import type { StoreSettings } from '@/types/catalog';

export const DEFAULT_LOCALE = 'es-CO';
export const DEFAULT_CURRENCY = 'COP';

export type PriceFormatOptions = Partial<
  Pick<StoreSettings, 'locale' | 'currencyCode' | 'currencySymbol' | 'showDecimals'>
>;

/**
 * Monedas que no usan centavos. Se define aquí en lugar de confiar en Intl porque
 * Node y cada navegador traen datos distintos (ej. COP), lo que haría que el precio
 * del servidor y el del navegador no coincidan.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(['CLP', 'PYG', 'JPY', 'KRW', 'VND', 'ISK', 'UGX', 'XAF', 'XOF']);

/** Número de decimales a mostrar: los de la moneda si se piden, 0 si no; en automático solo si el monto tiene centavos. */
function resolveFractionDigits(amount: number, currencyDigits: number, showDecimals?: boolean) {
  if (showDecimals === true) return currencyDigits;
  if (showDecimals === false) return 0;
  return Number.isInteger(amount) ? 0 : currencyDigits;
}

function createFormatter(locale: string, currency: string): Intl.NumberFormat | null {
  for (const loc of [locale, DEFAULT_LOCALE]) {
    try {
      return new Intl.NumberFormat(loc, { style: 'currency', currency });
    } catch {
      // Locale o moneda inválidos (datos antiguos escritos a mano): se intenta el siguiente
    }
  }
  return null;
}

/**
 * Formatea un precio según el país y la moneda de la tienda.
 * Ej.: 45000 COP en es-CO → "$ 45.000"; 19.99 USD en en-US → "$19.99".
 * `currencySymbol` (opcional) reemplaza el símbolo que trae la moneda.
 */
export function formatPrice(amount: number, options: PriceFormatOptions = {}): string {
  const locale = options.locale?.trim() || DEFAULT_LOCALE;
  const currency = options.currencyCode?.trim().toUpperCase() || DEFAULT_CURRENCY;
  const symbolOverride = options.currencySymbol?.trim();
  const value = Number.isFinite(amount) ? amount : 0;

  const base = createFormatter(locale, currency);
  if (!base) {
    // Moneda desconocida: número con formato local y el símbolo configurado
    const digits = resolveFractionDigits(value, 2, options.showDecimals);
    const number = new Intl.NumberFormat(DEFAULT_LOCALE, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
    return symbolOverride ? `${symbolOverride} ${number}` : number;
  }

  const digits = resolveFractionDigits(
    value,
    ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2,
    options.showDecimals
  );
  const formatter = new Intl.NumberFormat(base.resolvedOptions().locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

  if (!symbolOverride) return formatter.format(value);
  return formatter
    .formatToParts(value)
    .map((part) => (part.type === 'currency' ? symbolOverride : part.value))
    .join('');
}
