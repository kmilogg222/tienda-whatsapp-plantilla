import { defineArrayMember, defineField, defineType } from 'sanity';
import {
  ALL_ICONS,
  BACKGROUND_TONES,
  BUTTON_STYLES,
  CATALOG_FILTERS,
  CORNER_STYLES,
  FONT_PAIRINGS,
  IMAGE_RATIOS,
  MOBILE_COLUMNS,
  OUT_OF_STOCK_BEHAVIORS,
  PALETTES,
  SORT_OPTIONS,
  toSanityList,
} from '../../lib/contentOptions';
import { DEFAULT_SETTINGS } from '../../lib/settings';
import { normalizeGoogleAnalyticsId, normalizeMetaPixelId, normalizeSiteVerification } from '../../lib/tracking';
import { HEX_COLOR } from './objects/validation';

/**
 * Campos de la versión anterior. Se conservan ocultos para no perder datos:
 * normalizeSettings() los usa cuando el campo nuevo equivalente está vacío.
 */
const legacyField = (name: string, type: 'string' | 'text' = 'string') =>
  defineField({
    name,
    type,
    hidden: true,
    deprecated: { reason: 'Reemplazado por un campo nuevo; se conserva para no perder datos antiguos.' },
  });

export const storeSettingsType = defineType({
  name: 'storeSettings',
  title: 'Configuración de la Tienda',
  type: 'document',
  groups: [
    { name: 'general', title: '🏷️ General', default: true },
    { name: 'branding', title: '🖼️ Marca' },
    { name: 'appearance', title: '🎨 Apariencia' },
    { name: 'texts', title: '💬 Textos' },
    { name: 'whatsapp', title: '📱 WhatsApp y pedidos' },
    { name: 'catalog', title: '🔎 Catálogo y filtros' },
    { name: 'trust', title: '🛡️ Confianza' },
    { name: 'social', title: '📣 Redes y contacto' },
    { name: 'announcement', title: '📢 Franja superior' },
    { name: 'stats', title: '📈 Google y estadísticas' },
  ],
  fieldsets: [
    { name: 'shape', title: 'Formas', options: { collapsible: true, collapsed: false } },
    {
      name: 'customerData',
      title: 'Datos que se le piden al cliente',
      description: 'Solo con el carrito activado. Se piden en el carrito, antes de enviar el pedido por WhatsApp.',
      options: { collapsible: true },
    },
  ],
  fields: [
    // --- GENERAL ---
    defineField({
      name: 'storeName',
      title: 'Nombre de la Tienda / Negocio',
      type: 'string',
      group: 'general',
      description: 'Se ve en el encabezado, en la pestaña del navegador y en el pie de página. Ej.: Glow Beauty Store',
      validation: (Rule) => Rule.required().error('El nombre de la tienda es obligatorio'),
    }),
    defineField({
      name: 'tagline',
      title: 'Eslogan o Subtítulo',
      type: 'string',
      group: 'general',
      description: 'Frase corta debajo del nombre. Ej.: Maquillaje y skincare original',
    }),
    defineField({
      name: 'locale',
      title: 'País para mostrar precios',
      type: 'string',
      group: 'general',
      initialValue: DEFAULT_SETTINGS.locale,
      description: 'Define cómo se escriben los precios (puntos, comas y posición del símbolo). Ej.: Colombia muestra $ 45.000',
      options: {
        list: [
          { title: 'Colombia', value: 'es-CO' },
          { title: 'México', value: 'es-MX' },
          { title: 'Argentina', value: 'es-AR' },
          { title: 'Chile', value: 'es-CL' },
          { title: 'Perú', value: 'es-PE' },
          { title: 'Ecuador', value: 'es-EC' },
          { title: 'España', value: 'es-ES' },
          { title: 'Estados Unidos', value: 'en-US' },
        ],
      },
    }),
    defineField({
      name: 'currencyCode',
      title: 'Moneda',
      type: 'string',
      group: 'general',
      initialValue: DEFAULT_SETTINGS.currencyCode,
      description: 'Moneda en la que están tus precios. Ej.: Peso colombiano (COP)',
      options: {
        list: [
          { title: 'Peso colombiano (COP)', value: 'COP' },
          { title: 'Peso mexicano (MXN)', value: 'MXN' },
          { title: 'Peso argentino (ARS)', value: 'ARS' },
          { title: 'Peso chileno (CLP)', value: 'CLP' },
          { title: 'Sol peruano (PEN)', value: 'PEN' },
          { title: 'Peso uruguayo (UYU)', value: 'UYU' },
          { title: 'Boliviano (BOB)', value: 'BOB' },
          { title: 'Guaraní (PYG)', value: 'PYG' },
          { title: 'Quetzal (GTQ)', value: 'GTQ' },
          { title: 'Colón costarricense (CRC)', value: 'CRC' },
          { title: 'Peso dominicano (DOP)', value: 'DOP' },
          { title: 'Dólar estadounidense (USD)', value: 'USD' },
          { title: 'Euro (EUR)', value: 'EUR' },
        ],
      },
    }),
    defineField({
      name: 'showDecimals',
      title: 'Mostrar centavos en los precios',
      type: 'boolean',
      group: 'general',
      initialValue: false,
      description: 'Actívalo si vendes con centavos. Ej.: apagado muestra $ 45.000; encendido muestra $ 45.000,00',
    }),
    defineField({
      name: 'currencySymbol',
      title: 'Símbolo de moneda personalizado (opcional)',
      type: 'string',
      group: 'general',
      description: 'Déjalo vacío para usar el símbolo de tu moneda. Escribe uno solo si quieres cambiarlo. Ej.: $, COP, S/',
    }),

    // --- MARCA ---
    defineField({
      name: 'logo',
      title: 'Logotipo de la Tienda',
      type: 'image',
      group: 'branding',
      description: 'PNG con fondo transparente o SVG. Si no subes ninguno, se muestra un ícono y el nombre.',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'favicon',
      title: 'Icono del Navegador (Favicon)',
      type: 'image',
      group: 'branding',
      description: 'Imagen cuadrada pequeña (ej. 64 × 64 px) que aparece en la pestaña del navegador.',
    }),
    defineField({
      name: 'ogImage',
      title: 'Imagen para compartir (opcional)',
      type: 'image',
      group: 'branding',
      description:
        'Se ve cuando compartes el enlace de la portada o del catálogo en WhatsApp o redes (cada producto usa su propia foto). Recomendado: 1200 × 630 px. Si no subes ninguna, se comparte solo el nombre y el eslogan.',
      options: { hotspot: true },
    }),

    // --- APARIENCIA ---
    defineField({
      name: 'palette',
      title: 'Paleta de colores',
      type: 'string',
      group: 'appearance',
      initialValue: DEFAULT_SETTINGS.palette,
      description: 'Combinaciones de colores probadas para que todo se lea bien. Ej.: Blush Nude',
      options: { list: toSanityList(PALETTES) },
    }),
    defineField({
      name: 'customColorHex',
      title: 'Color de tu marca (opcional)',
      type: 'string',
      group: 'appearance',
      description:
        'Si tienes un color de marca, escribe su código y la tienda se adapta a él cuidando que el texto se lea. Ej.: #C2185B',
      validation: (Rule) =>
        Rule.regex(HEX_COLOR, { name: 'hex' }).error('Debe ser un código que empiece con # (ej.: #C2185B)'),
    }),
    defineField({
      name: 'backgroundTone',
      title: 'Tono de fondo (con color de marca)',
      type: 'string',
      group: 'appearance',
      initialValue: DEFAULT_SETTINGS.backgroundTone,
      description: 'Solo se usa si escribiste un color de marca. Ej.: Crema',
      options: { list: toSanityList(BACKGROUND_TONES), layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'fontPairing',
      title: 'Tipografía',
      type: 'string',
      group: 'appearance',
      initialValue: DEFAULT_SETTINGS.fontPairing,
      description: 'Estilo de las letras de títulos y textos. Ej.: Elegante',
      options: { list: toSanityList(FONT_PAIRINGS) },
    }),
    defineField({
      name: 'cornerStyle',
      title: 'Esquinas de tarjetas y fotos',
      type: 'string',
      group: 'appearance',
      fieldset: 'shape',
      initialValue: DEFAULT_SETTINGS.cornerStyle,
      options: { list: toSanityList(CORNER_STYLES), layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'buttonStyle',
      title: 'Forma de los botones',
      type: 'string',
      group: 'appearance',
      fieldset: 'shape',
      initialValue: DEFAULT_SETTINGS.buttonStyle,
      options: { list: toSanityList(BUTTON_STYLES), layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'imageRatio',
      title: 'Forma de las fotos de producto',
      type: 'string',
      group: 'appearance',
      fieldset: 'shape',
      initialValue: DEFAULT_SETTINGS.imageRatio,
      options: { list: toSanityList(IMAGE_RATIOS), layout: 'radio' },
    }),
    defineField({
      name: 'mobileColumns',
      title: 'Productos por fila en celular',
      type: 'string',
      group: 'appearance',
      fieldset: 'shape',
      initialValue: String(DEFAULT_SETTINGS.mobileColumns),
      options: { list: toSanityList(MOBILE_COLUMNS), layout: 'radio', direction: 'horizontal' },
    }),
    defineField({
      name: 'cardOptions',
      title: 'Qué mostrar en cada tarjeta de producto',
      type: 'object',
      group: 'appearance',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'showBrand',
          title: 'Mostrar la marca',
          type: 'boolean',
          initialValue: DEFAULT_SETTINGS.cardOptions.showBrand,
        }),
        defineField({
          name: 'showCategory',
          title: 'Mostrar la categoría',
          type: 'boolean',
          initialValue: DEFAULT_SETTINGS.cardOptions.showCategory,
        }),
        defineField({
          name: 'showQuickOrder',
          title: 'Mostrar botón de pedido rápido',
          type: 'boolean',
          initialValue: DEFAULT_SETTINGS.cardOptions.showQuickOrder,
        }),
      ],
    }),

    // --- TEXTOS ---
    defineField({
      name: 'labels',
      title: 'Textos de la tienda',
      type: 'storeLabels',
      group: 'texts',
      description: 'Cambia cualquier texto que ven tus clientes. Si dejas uno vacío, se usa el texto por defecto.',
    }),

    // --- WHATSAPP Y PEDIDOS ---
    defineField({
      name: 'whatsappNumber',
      title: 'Número de WhatsApp para Pedidos',
      type: 'string',
      group: 'whatsapp',
      description: 'Con código de país, SIN signo + ni espacios. Ej.: Colombia 573001234567, México 5215512345678',
      validation: (Rule) =>
        Rule.required()
          .regex(/^[0-9]{8,15}$/, {
            name: 'whatsappNumber',
            invert: false,
          })
          .error('Ingresa solo dígitos con el código de país (entre 8 y 15 números)'),
    }),
    defineField({
      name: 'defaultMessage',
      title: 'Saludo del mensaje',
      type: 'text',
      rows: 2,
      group: 'whatsapp',
      description: 'Primera línea del mensaje que te llega. Ej.: ¡Hola! Quiero pedir este producto:',
      initialValue: DEFAULT_SETTINGS.defaultMessage,
    }),
    defineField({
      name: 'messageClosing',
      title: 'Cierre del mensaje',
      type: 'text',
      rows: 2,
      group: 'whatsapp',
      description: 'Última línea del mensaje. Ej.: ¿Me confirmas disponibilidad y costo de envío?',
      initialValue: DEFAULT_SETTINGS.messageClosing,
    }),
    defineField({
      name: 'cartEnabled',
      title: 'Activar carrito',
      type: 'boolean',
      group: 'whatsapp',
      initialValue: DEFAULT_SETTINGS.cartEnabled,
      description:
        'Permite juntar varios productos y enviarlos en un solo mensaje. Si lo apagas, cada producto se pide por separado.',
    }),
    defineField({
      name: 'askCustomerName',
      title: 'Pedir nombre',
      type: 'boolean',
      group: 'whatsapp',
      fieldset: 'customerData',
      initialValue: DEFAULT_SETTINGS.askCustomerName,
      description: 'Si lo activas, el cliente debe escribir su nombre para enviar el pedido.',
    }),
    defineField({
      name: 'askCustomerCity',
      title: 'Pedir ciudad o barrio',
      type: 'boolean',
      group: 'whatsapp',
      fieldset: 'customerData',
      initialValue: DEFAULT_SETTINGS.askCustomerCity,
      description: 'Si lo activas, el cliente debe escribir su ciudad o barrio para enviar el pedido.',
    }),
    defineField({
      name: 'askNotes',
      title: 'Permitir notas',
      type: 'boolean',
      group: 'whatsapp',
      fieldset: 'customerData',
      initialValue: DEFAULT_SETTINGS.askNotes,
      description: 'Casilla opcional para comentarios. Ej.: "Es para regalo", "Entregar después de las 5 pm"',
    }),
    defineField({
      name: 'freeShippingThreshold',
      title: 'Monto mínimo para envío gratis (opcional)',
      type: 'number',
      group: 'whatsapp',
      description:
        'Si ofreces envío gratis desde cierto valor, escríbelo sin puntos. El carrito muestra cuánto le falta al cliente. Ej.: 150000',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'outOfStockBehavior',
      title: 'Productos agotados',
      type: 'string',
      group: 'whatsapp',
      initialValue: DEFAULT_SETTINGS.outOfStockBehavior,
      description: 'Qué hacer con los productos marcados como no disponibles.',
      options: { list: toSanityList(OUT_OF_STOCK_BEHAVIORS), layout: 'radio' },
    }),

    // --- CATÁLOGO Y FILTROS ---
    defineField({
      name: 'enabledFilters',
      title: 'Filtros disponibles para tus clientes',
      type: 'array',
      group: 'catalog',
      description: 'Marca los filtros que quieres mostrar. Solo aparecen si tus productos tienen esa información.',
      of: [defineArrayMember({ type: 'string' })],
      options: { list: toSanityList(CATALOG_FILTERS), layout: 'grid' },
      initialValue: [...DEFAULT_SETTINGS.enabledFilters],
    }),
    defineField({
      name: 'defaultSort',
      title: 'Orden inicial de los productos',
      type: 'string',
      group: 'catalog',
      initialValue: DEFAULT_SETTINGS.defaultSort,
      options: { list: toSanityList(SORT_OPTIONS) },
    }),
    defineField({
      name: 'pageSize',
      title: 'Productos por página',
      type: 'number',
      group: 'catalog',
      initialValue: DEFAULT_SETTINGS.pageSize,
      description: 'Cuántos productos se muestran antes del botón "Cargar más". Ej.: 24',
      validation: (Rule) => Rule.min(6).max(96).integer(),
    }),

    // --- CONFIANZA ---
    defineField({
      name: 'trustBadges',
      title: 'Sellos de confianza',
      type: 'array',
      group: 'trust',
      description:
        'Frases cortas que dan tranquilidad al comprar, en la ficha de producto. Recomendado: 3. Si lo dejas vacío, no se muestran.',
      of: [defineArrayMember({ type: 'trustBadge' })],
      validation: (Rule) => Rule.max(6),
    }),

    // --- REDES Y CONTACTO ---
    defineField({
      name: 'instagram',
      title: 'Instagram',
      type: 'url',
      group: 'social',
      description: 'Enlace completo. Ej.: https://instagram.com/mitienda',
    }),
    defineField({
      name: 'tiktok',
      title: 'TikTok',
      type: 'url',
      group: 'social',
      description: 'Ej.: https://tiktok.com/@mitienda',
    }),
    defineField({
      name: 'facebook',
      title: 'Facebook',
      type: 'url',
      group: 'social',
      description: 'Ej.: https://facebook.com/mitienda',
    }),
    defineField({
      name: 'youtube',
      title: 'YouTube',
      type: 'url',
      group: 'social',
      description: 'Ej.: https://youtube.com/@mitienda',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Correo de contacto',
      type: 'string',
      group: 'social',
      description: 'Ej.: hola@mitienda.com',
      validation: (Rule) => Rule.email().error('Escribe un correo válido'),
    }),
    defineField({
      name: 'address',
      title: 'Dirección (opcional)',
      type: 'string',
      group: 'social',
      description: 'Si tienes local. Ej.: Calle 10 # 20-30, Medellín',
    }),
    defineField({
      name: 'openingHours',
      title: 'Horario de atención (opcional)',
      type: 'string',
      group: 'social',
      description: 'Ej.: Lunes a sábado de 9 a. m. a 7 p. m.',
    }),

    // --- FRANJA SUPERIOR ---
    defineField({
      name: 'announcementEnabled',
      title: 'Mostrar franja superior',
      type: 'boolean',
      group: 'announcement',
      initialValue: true,
      description: 'Una franja delgada arriba de todo con un aviso corto.',
    }),
    defineField({
      name: 'shippingNotice',
      title: 'Texto de la franja',
      type: 'string',
      group: 'announcement',
      initialValue: '🚚 Envíos seguros a todo el país • Pagos contra entrega disponibles',
      description: 'Ej.: Envío gratis desde $150.000 • 10% de descuento en tu primera compra',
    }),
    defineField({
      name: 'announcementIcon',
      title: 'Ícono de la franja',
      type: 'string',
      group: 'announcement',
      initialValue: DEFAULT_SETTINGS.announcement.icon,
      options: { list: toSanityList(ALL_ICONS) },
    }),
    defineField({
      name: 'announcementLink',
      title: 'Enlace de la franja (opcional)',
      type: 'linkTarget',
      group: 'announcement',
      description: 'Si eliges un destino, la franja se puede tocar para ir allí.',
    }),

    // --- GOOGLE Y ESTADÍSTICAS (opcionales; vacíos = no se carga nada) ---
    defineField({
      name: 'googleSiteVerification',
      title: 'Verificación de Google Search Console (opcional)',
      type: 'string',
      group: 'stats',
      initialValue: '',
      description:
        'Para que Google confirme que la tienda es tuya. En Search Console elige "Etiqueta HTML" y pega aquí el código o la etiqueta completa. Ej.: <meta name="google-site-verification" content="abc123..." />',
      validation: (Rule) =>
        Rule.custom((value) =>
          !value?.trim() || normalizeSiteVerification(value)
            ? true
            : 'No reconocemos este código. Copia la etiqueta completa que te muestra Google.'
        ),
    }),
    defineField({
      name: 'googleAnalyticsId',
      title: 'Google Analytics 4 (opcional)',
      type: 'string',
      group: 'stats',
      initialValue: '',
      description:
        'Para ver cuántas personas visitan tu tienda. Es el "ID de medición" que empieza con G-. Ej.: G-ABC123XYZ. Déjalo vacío si no lo usas.',
      validation: (Rule) =>
        Rule.custom((value) =>
          !value?.trim() || normalizeGoogleAnalyticsId(value)
            ? true
            : 'Debe empezar con G- seguido de letras y números. Ej.: G-ABC123XYZ'
        ),
    }),
    defineField({
      name: 'metaPixelId',
      title: 'Píxel de Meta (Facebook e Instagram) (opcional)',
      type: 'string',
      group: 'stats',
      initialValue: '',
      description:
        'Para medir tus anuncios de Facebook e Instagram. Es el "Identificador del píxel", solo números. Ej.: 123456789012345. Déjalo vacío si no lo usas.',
      validation: (Rule) =>
        Rule.custom((value) =>
          !value?.trim() || normalizeMetaPixelId(value)
            ? true
            : 'Escribe solo los números del identificador. Ej.: 123456789012345'
        ),
    }),

    // --- CAMPOS ANTERIORES (ocultos) ---
    legacyField('themePreset'),
    legacyField('searchPlaceholder'),
    legacyField('whatsappCtaText'),
    legacyField('floatingWhatsAppTooltip'),
    legacyField('emptyStateText'),
    legacyField('footerText', 'text'),
  ],
  preview: {
    select: {
      title: 'storeName',
      subtitle: 'whatsappNumber',
      media: 'logo',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title || 'Configuración de Tienda',
        subtitle: subtitle ? `WhatsApp: +${subtitle}` : 'Sin número configurado',
        media,
      };
    },
  },
});
