import { describe, expect, it } from 'vitest';
import { formatPrice } from '@/lib/format';

/** Intl usa espacios de no separación; se normalizan para comparar. */
const plain = (text: string) => text.replace(/[  ]/g, ' ');

describe('formatPrice', () => {
  it('COP en Colombia sin decimales', () => {
    expect(plain(formatPrice(45000, { locale: 'es-CO', currencyCode: 'COP', showDecimals: false }))).toBe(
      '$ 45.000'
    );
  });

  it('COP con centavos activados', () => {
    expect(plain(formatPrice(45000, { locale: 'es-CO', currencyCode: 'COP', showDecimals: true }))).toBe(
      '$ 45.000,00'
    );
  });

  it('usa Colombia y COP por defecto', () => {
    expect(plain(formatPrice(1250000))).toBe('$ 1.250.000');
  });

  it('USD en Estados Unidos con decimales', () => {
    expect(formatPrice(19.99, { locale: 'en-US', currencyCode: 'USD', showDecimals: true })).toBe('$19.99');
    expect(formatPrice(20, { locale: 'en-US', currencyCode: 'USD', showDecimals: true })).toBe('$20.00');
  });

  it('MXN en México', () => {
    expect(formatPrice(1234.5, { locale: 'es-MX', currencyCode: 'MXN', showDecimals: true })).toBe('$1,234.50');
    expect(formatPrice(1234.5, { locale: 'es-MX', currencyCode: 'MXN', showDecimals: false })).toBe('$1,235');
  });

  it('CLP nunca muestra decimales aunque se pidan (la moneda no tiene)', () => {
    expect(formatPrice(1500, { locale: 'es-CL', currencyCode: 'CLP', showDecimals: true })).toBe('$1.500');
  });

  it('en automático muestra centavos solo si el precio los tiene', () => {
    expect(plain(formatPrice(45000, { locale: 'es-CO', currencyCode: 'COP' }))).toBe('$ 45.000');
    expect(plain(formatPrice(45000.5, { locale: 'es-CO', currencyCode: 'COP' }))).toBe('$ 45.000,50');
  });

  it('el símbolo personalizado reemplaza al de la moneda', () => {
    expect(plain(formatPrice(1234.5, { locale: 'es-CO', currencyCode: 'USD', currencySymbol: '$', showDecimals: true }))).toBe(
      '$ 1.234,50'
    );
    expect(plain(formatPrice(80, { locale: 'es-PE', currencyCode: 'PEN', currencySymbol: 'S/.', showDecimals: false }))).toContain(
      'S/.'
    );
  });

  it('no falla con moneda o país inválidos (datos antiguos escritos a mano)', () => {
    expect(plain(formatPrice(45000, { locale: 'xx-??', currencyCode: 'COP' }))).toBe('$ 45.000');
    expect(plain(formatPrice(45000, { currencyCode: '$COP', currencySymbol: '$' }))).toBe('$ 45.000');
    expect(plain(formatPrice(45000, { currencyCode: 'nope' }))).toBe('45.000');
  });

  it('trata valores no numéricos como 0', () => {
    expect(plain(formatPrice(Number.NaN))).toBe('$ 0');
  });
});
