import type { CustomValidator } from 'sanity';

export const HEX_COLOR = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

/** Advierte si el "precio antes" no es mayor que el precio de venta del mismo objeto o documento. */
export const originalPriceAbovePrice: CustomValidator<number | undefined> = (value, context) => {
  const parent = context.parent as { price?: number } | undefined;
  const price = parent?.price;
  if (value === undefined || value === null || price === undefined || price === null) return true;
  return value > price || 'El precio antes debería ser mayor que el precio de venta; si no, no se mostrará tachado.';
};
