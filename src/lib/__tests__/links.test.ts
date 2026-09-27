import { describe, expect, it } from 'vitest';
import { catalogHref, resolveLink, socialUrl } from '@/lib/links';

describe('resolveLink', () => {
  it('lleva a categoría, marca, producto y catálogo dentro de la tienda', () => {
    expect(resolveLink({ type: 'category', categorySlug: 'maquillaje' })).toEqual({
      href: '/productos?categoria=maquillaje',
      external: false,
    });
    expect(resolveLink({ type: 'brand', brandSlug: 'rosa-bella' })?.href).toBe('/productos?marca=rosa-bella');
    expect(resolveLink({ type: 'product', productSlug: 'labial' })?.href).toBe('/producto/labial');
    expect(resolveLink({ type: 'catalog' })?.href).toBe('/productos');
  });

  it('codifica los filtros de la dirección', () => {
    expect(resolveLink({ type: 'category', categorySlug: 'uñas & más' })?.href).toBe(
      '/productos?categoria=u%C3%B1as+%26+m%C3%A1s'
    );
  });

  it('acepta correo y teléfono (el panel los permite)', () => {
    expect(resolveLink({ type: 'url', url: 'mailto:hola@tienda.com' })).toEqual({
      href: 'mailto:hola@tienda.com',
      external: false,
    });
    expect(resolveLink({ type: 'url', url: 'tel:+573001234567' })?.href).toBe('tel:+573001234567');
  });

  it('las direcciones web externas se marcan como externas', () => {
    expect(resolveLink({ type: 'url', url: 'https://instagram.com/x' })).toEqual({
      href: 'https://instagram.com/x',
      external: true,
    });
    expect(resolveLink({ type: 'url', url: '/producto/labial' })?.external).toBe(false);
  });

  it('descarta destinos incompletos o peligrosos', () => {
    expect(resolveLink(undefined)).toBeUndefined();
    expect(resolveLink({ type: 'category' })).toBeUndefined();
    expect(resolveLink({ type: 'url', url: 'javascript:alert(1)' })).toBeUndefined();
    expect(resolveLink({ type: 'url', url: '  ' })).toBeUndefined();
  });
});

describe('socialUrl', () => {
  it('respeta el enlace completo', () => {
    expect(socialUrl('instagram', 'https://instagram.com/glow')).toBe('https://instagram.com/glow');
    expect(socialUrl('facebook', 'facebook.com/glow')).toBe('https://facebook.com/glow');
  });

  it('arma el enlace si solo escribieron el usuario', () => {
    expect(socialUrl('instagram', '@glow.studio')).toBe('https://instagram.com/glow.studio');
    expect(socialUrl('tiktok', 'glow')).toBe('https://tiktok.com/@glow');
  });

  it('ignora vacíos y valores raros', () => {
    expect(socialUrl('youtube', '')).toBeUndefined();
    expect(socialUrl('youtube', undefined)).toBeUndefined();
    expect(socialUrl('instagram', 'javascript:alert(1)')).toBeUndefined();
  });
});

describe('catalogHref', () => {
  it('arma la dirección del catálogo solo con los filtros que tienen valor', () => {
    expect(catalogHref()).toBe('/productos');
    expect(catalogHref({ categoria: undefined, marca: '' })).toBe('/productos');
    expect(catalogHref({ oferta: true, orden: 'newest' })).toBe('/productos?oferta=1&orden=newest');
  });
});
