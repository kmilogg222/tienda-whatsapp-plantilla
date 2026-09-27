import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, normalizeSettings } from '@/lib/settings';
import { DEFAULT_LABELS, LABEL_DEFINITIONS } from '@/lib/labels';
import { normalizeIconName, optionValues } from '@/lib/contentOptions';
import { normalizeGoogleAnalyticsId, normalizeMetaPixelId, normalizeSiteVerification } from '@/lib/tracking';

describe('normalizeSettings: documento vacío', () => {
  it.each([undefined, null, {}])('devuelve los valores por defecto (%s)', (raw) => {
    expect(normalizeSettings(raw)).toEqual(DEFAULT_SETTINGS);
  });

  it('ningún campo de interfaz queda vacío', () => {
    const settings = normalizeSettings({});
    for (const [key, value] of Object.entries(settings.labels)) {
      if (key === 'footerText') continue; // vacío a propósito: se usa el eslogan
      expect(value, key).not.toBe('');
    }
    expect(settings.announcement).toEqual({ enabled: false, text: '', icon: 'truck' });
    expect(settings.trustBadges).toEqual([]);
    expect(settings.enabledFilters.length).toBeGreaterThan(0);
  });

  it('cada texto editable tiene su valor por defecto', () => {
    expect(Object.keys(DEFAULT_LABELS).sort()).toEqual(Object.keys(LABEL_DEFINITIONS).sort());
  });
});

describe('normalizeSettings: documento de la versión anterior (v1)', () => {
  const v1 = {
    storeName: 'Tienda v1',
    tagline: 'Eslogan v1',
    whatsappNumber: '573001234567',
    defaultMessage: 'Hola v1',
    currencySymbol: '$',
    currencyCode: 'USD',
    shippingNotice: '🚚 Envíos gratis',
    announcementIcon: 'sparkles',
    themePreset: 'dark-velvet',
    customColorHex: '#FF5722',
    searchPlaceholder: 'Busca aquí',
    whatsappCtaText: 'Comprar ya',
    floatingWhatsAppTooltip: '¿Dudas?',
    emptyStateText: 'Nada por aquí',
    footerText: 'Pie v1',
  };

  it('conserva los datos generales', () => {
    const settings = normalizeSettings(v1);
    expect(settings.storeName).toBe('Tienda v1');
    expect(settings.tagline).toBe('Eslogan v1');
    expect(settings.whatsappNumber).toBe('573001234567');
    expect(settings.defaultMessage).toBe('Hola v1');
    expect(settings.currencySymbol).toBe('$');
    expect(settings.currencyCode).toBe('USD');
  });

  it('mapea el tema anterior a la paleta equivalente y conserva el fondo oscuro', () => {
    const settings = normalizeSettings(v1);
    expect(settings.palette).toBe('ciruela-noche');
    expect(settings.brandColor).toBe('#FF5722');
    // v1 no tenía "tono de fondo": un tema oscuro con color propio sigue siendo oscuro
    expect(settings.backgroundTone).toBe('dark');
  });

  it('pasa las frases antiguas a los textos editables', () => {
    const { labels } = normalizeSettings(v1);
    expect(labels.searchPlaceholder).toBe('Busca aquí');
    expect(labels.orderButton).toBe('Comprar ya');
    expect(labels.floatingButtonTooltip).toBe('¿Dudas?');
    expect(labels.noResultsText).toBe('Nada por aquí');
    expect(labels.footerText).toBe('Pie v1');
    expect(labels.contactButton).toBe(DEFAULT_LABELS.contactButton);
  });

  it('muestra la franja si tenía texto (v1 no tenía interruptor)', () => {
    expect(normalizeSettings(v1).announcement).toEqual({ enabled: true, text: '🚚 Envíos gratis', icon: 'sparkles' });
    expect(normalizeSettings({ ...v1, shippingNotice: '' }).announcement.enabled).toBe(false);
  });

  it('mapea themeMode "light" y primaryColor de versiones aún más antiguas', () => {
    const settings = normalizeSettings({ themeMode: 'light', primaryColor: '#123456' });
    expect(settings.palette).toBe('blanco-minimal');
    expect(settings.backgroundTone).toBe('light');
    expect(settings.brandColor).toBe('#123456');
  });
});

describe('normalizeSettings: documento v2', () => {
  it('los campos nuevos tienen prioridad sobre los antiguos', () => {
    const settings = normalizeSettings({
      palette: 'lavanda',
      themePreset: 'dark-gold',
      labels: { orderButton: 'Lo quiero' },
      whatsappCtaText: 'Comprar ya',
    });
    expect(settings.palette).toBe('lavanda');
    expect(settings.labels.orderButton).toBe('Lo quiero');
  });

  it('el tono de fondo elegido se respeta aunque la paleta sea oscura', () => {
    expect(normalizeSettings({ palette: 'negro-oro', backgroundTone: 'cream' }).backgroundTone).toBe('cream');
    expect(normalizeSettings({ palette: 'negro-oro' }).backgroundTone).toBe('dark');
  });

  it('un texto vacío vuelve al valor por defecto', () => {
    expect(normalizeSettings({ labels: { orderButton: '   ' } }).labels.orderButton).toBe(DEFAULT_LABELS.orderButton);
  });

  it('descarta valores desconocidos y conserva los válidos', () => {
    const settings = normalizeSettings({
      palette: 'no-existe',
      fontPairing: 'comic-sans',
      imageRatio: '4:5',
      mobileColumns: '1',
      enabledFilters: ['brand', 'inventado', null, 'price'],
      defaultSort: 'aleatorio',
      pageSize: -3,
      customColorHex: 'rojo',
    });
    expect(settings.palette).toBe(DEFAULT_SETTINGS.palette);
    expect(settings.fontPairing).toBe(DEFAULT_SETTINGS.fontPairing);
    expect(settings.imageRatio).toBe('4:5');
    expect(settings.mobileColumns).toBe(1);
    expect(settings.enabledFilters).toEqual(['brand', 'price']);
    expect(settings.defaultSort).toBe(DEFAULT_SETTINGS.defaultSort);
    expect(settings.pageSize).toBe(DEFAULT_SETTINGS.pageSize);
    expect(settings.brandColor).toBeUndefined();
  });

  it('una lista de filtros vacía significa "ningún filtro"', () => {
    expect(normalizeSettings({ enabledFilters: [] }).enabledFilters).toEqual([]);
  });

  it('respeta interruptores en falso', () => {
    const settings = normalizeSettings({
      cartEnabled: false,
      askCustomerName: false,
      cardOptions: { showBrand: false },
      announcementEnabled: false,
      shippingNotice: 'Texto',
    });
    expect(settings.cartEnabled).toBe(false);
    expect(settings.askCustomerName).toBe(false);
    expect(settings.askCustomerCity).toBe(true);
    expect(settings.cardOptions.showBrand).toBe(false);
    expect(settings.cardOptions.showQuickOrder).toBe(true);
    expect(settings.announcement.enabled).toBe(false);
  });

  it('sellos de confianza: descarta los vacíos y corrige íconos desconocidos', () => {
    const settings = normalizeSettings({
      trustBadges: [{ icon: 'truck', text: 'Envíos' }, { icon: 'x', text: 'Originales' }, { icon: 'truck', text: ' ' }, null],
    });
    expect(settings.trustBadges).toEqual([
      { icon: 'truck', text: 'Envíos' },
      { icon: 'badge-check', text: 'Originales' },
    ]);
  });

  it('resuelve el enlace de la franja y descarta enlaces incompletos', () => {
    const withLink = normalizeSettings({
      shippingNotice: 'Ofertas',
      announcementLink: { linkType: 'category', categorySlug: 'labios' },
    });
    expect(withLink.announcement.link).toEqual({ type: 'category', categorySlug: 'labios' });
    const broken = normalizeSettings({ shippingNotice: 'Ofertas', announcementLink: { linkType: 'category' } });
    expect(broken.announcement.link).toBeUndefined();
  });
});

describe('normalizeSettings: Google y estadísticas', () => {
  it('vacíos por defecto: no se carga nada', () => {
    const settings = normalizeSettings({ googleAnalyticsId: '', metaPixelId: '  ', googleSiteVerification: null });
    expect(settings.googleAnalyticsId).toBeUndefined();
    expect(settings.metaPixelId).toBeUndefined();
    expect(settings.googleSiteVerification).toBeUndefined();
  });

  it('acepta lo que la dueña suele copiar', () => {
    const settings = normalizeSettings({
      googleAnalyticsId: ' g-abc123xyz ',
      metaPixelId: '1234 5678 9012 345',
      googleSiteVerification: '<meta name="google-site-verification" content="AbC-123_xyz456" />',
    });
    expect(settings.googleAnalyticsId).toBe('G-ABC123XYZ');
    expect(settings.metaPixelId).toBe('123456789012345');
    expect(settings.googleSiteVerification).toBe('AbC-123_xyz456');
    expect(normalizeSiteVerification('google-site-verification=AbC-123_xyz456')).toBe('AbC-123_xyz456');
    expect(normalizeSiteVerification('AbC-123_xyz456')).toBe('AbC-123_xyz456');
  });

  it('descarta valores que no son códigos (nunca llegan a un script)', () => {
    expect(normalizeGoogleAnalyticsId("G-1');alert(1)//")).toBeUndefined();
    expect(normalizeGoogleAnalyticsId('UA-12345-1')).toBeUndefined();
    expect(normalizeMetaPixelId('abc123')).toBeUndefined();
    expect(normalizeMetaPixelId("123456789'")).toBeUndefined();
    expect(normalizeSiteVerification('<script>x</script>')).toBeUndefined();
    expect(normalizeSiteVerification('corto')).toBeUndefined();
  });
});

describe('normalizeIconName', () => {
  it('acepta nombres de la lista y convierte los de la versión anterior', () => {
    const icons = optionValues.categoryIcons;
    expect(normalizeIconName('sparkles', icons, 'tag')).toBe('sparkles');
    expect(normalizeIconName('ShoppingBag', icons, 'tag')).toBe('shopping-bag');
    expect(normalizeIconName('Flower2', icons, 'tag')).toBe('flower-2');
  });

  it('usa el ícono por defecto si no lo reconoce', () => {
    expect(normalizeIconName('Headphones', optionValues.categoryIcons, 'tag')).toBe('tag');
    expect(normalizeIconName(undefined, optionValues.categoryIcons, 'tag')).toBe('tag');
  });
});
