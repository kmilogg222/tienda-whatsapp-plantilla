/**
 * Textos visibles de la tienda que la dueña puede cambiar desde el panel
 * (Configuración → Textos). Única fuente de verdad: de aquí salen los campos
 * del esquema de Sanity y los valores por defecto de la web.
 * Los valores por defecto son los textos que la web mostraba antes de ser editables.
 */

export interface LabelDefinition {
  title: string;
  description: string;
  default: string;
  /** Texto largo (campo de varias líneas en el panel) */
  multiline?: boolean;
}

export const LABEL_SECTIONS = [
  { name: 'header', title: 'Encabezado y botón flotante' },
  { name: 'home', title: 'Portada' },
  { name: 'catalog', title: 'Catálogo y búsqueda' },
  { name: 'product', title: 'Ficha de producto' },
  { name: 'cart', title: 'Carrito y pedido' },
  { name: 'footer', title: 'Pie de página' },
  { name: 'status', title: 'Avisos' },
  { name: 'seo', title: 'Google y vista previa al compartir' },
] as const;

type LabelSection = (typeof LABEL_SECTIONS)[number]['name'];

export const LABEL_DEFINITIONS = {
  contactButton: {
    section: 'header',
    title: 'Botón de contacto del encabezado',
    description: 'Ej.: Contacto, Escríbenos, Asesoría',
    default: 'Contacto',
  },
  skipToContent: {
    section: 'header',
    title: 'Enlace "saltar al contenido"',
    description: 'Solo aparece al navegar con el teclado o lector de pantalla. Ej.: Ir al contenido',
    default: 'Saltar al contenido',
  },
  floatingButtonTooltip: {
    section: 'header',
    title: 'Ayuda del botón flotante de WhatsApp',
    description: 'Aparece al pasar el mouse por el botón redondo. Ej.: ¿Dudas con tu tono? Escríbenos',
    default: '¿Tienes preguntas? Escríbenos por WhatsApp',
  },
  viewAllLink: {
    section: 'home',
    title: 'Enlace "ver todo" de los estantes',
    description: 'Aparece junto al título de cada estante de productos. Ej.: Ver todo, Ver más',
    default: 'Ver todo',
  },
  homeHeroButton: {
    section: 'home',
    title: 'Botón de la portada automática',
    description:
      'Solo se ve si aún no armaste tu portada (Portada → Secciones). Va debajo del nombre de la tienda. Ej.: Ver productos',
    default: 'Ver catálogo',
  },
  homeCategoriesTitle: {
    section: 'home',
    title: 'Título de categorías en la portada automática',
    description: 'Solo se ve si aún no armaste tu portada. Ej.: Compra por categoría',
    default: 'Compra por categoría',
  },
  homeNewArrivalsTitle: {
    section: 'home',
    title: 'Título de novedades en la portada automática',
    description: 'Solo se ve si aún no armaste tu portada. Ej.: Lo nuevo, Recién llegados',
    default: 'Novedades',
  },
  searchPlaceholder: {
    section: 'catalog',
    title: 'Texto dentro del buscador',
    description: 'Ej.: Busca labiales, marcas o tonos…',
    default: 'Buscar por nombre, categoría o especificaciones...',
  },
  allCategories: {
    section: 'catalog',
    title: 'Botón "todas las categorías"',
    description: 'Ej.: Todos, Ver todo',
    default: 'Todos',
  },
  allProductsTitle: {
    section: 'catalog',
    title: 'Título del listado completo',
    description: 'Ej.: Todos los productos, Nuestro catálogo',
    default: 'Todos los Productos',
  },
  searchResultsTitle: {
    section: 'catalog',
    title: 'Título al buscar',
    description: 'Va seguido de lo que escribió el cliente. Ej.: Resultados para',
    default: 'Resultados para',
  },
  noResultsTitle: {
    section: 'catalog',
    title: 'Título cuando no hay resultados',
    description: 'Ej.: No encontramos ese producto',
    default: 'Sin productos encontrados',
  },
  noResultsText: {
    section: 'catalog',
    title: 'Mensaje cuando no hay resultados',
    description: 'Ej.: Prueba con otra palabra o escríbenos y te ayudamos a encontrarlo.',
    default:
      'No encontramos coincidencias para los criterios seleccionados. Intenta con otra palabra clave o restablece los filtros.',
    multiline: true,
  },
  resetFilters: {
    section: 'catalog',
    title: 'Botón para quitar filtros',
    description: 'Ej.: Ver todo el catálogo',
    default: 'Ver todo el catálogo',
  },
  filterButton: {
    section: 'catalog',
    title: 'Botón para abrir los filtros (celular)',
    description: 'Ej.: Filtrar, Filtros',
    default: 'Filtrar',
  },
  filtersTitle: {
    section: 'catalog',
    title: 'Título del panel de filtros',
    description: 'Ej.: Filtros, Refina tu búsqueda',
    default: 'Filtros',
  },
  showResults: {
    section: 'catalog',
    title: 'Botón para cerrar los filtros y ver productos (celular)',
    description: 'Va seguido del número de productos. Ej.: Ver productos',
    default: 'Ver productos',
  },
  clearFilters: {
    section: 'catalog',
    title: 'Botón para quitar todos los filtros',
    description: 'Ej.: Limpiar todo, Borrar filtros',
    default: 'Limpiar todo',
  },
  filterBrandTitle: {
    section: 'catalog',
    title: 'Título del filtro de marcas',
    description: 'Ej.: Marca, Marcas',
    default: 'Marca',
  },
  filterPriceTitle: {
    section: 'catalog',
    title: 'Título del filtro de precio',
    description: 'Ej.: Precio, Rango de precio',
    default: 'Precio',
  },
  filterPriceMin: {
    section: 'catalog',
    title: 'Casilla de precio mínimo',
    description: 'Ej.: Mínimo, Desde',
    default: 'Mínimo',
  },
  filterPriceMax: {
    section: 'catalog',
    title: 'Casilla de precio máximo',
    description: 'Ej.: Máximo, Hasta',
    default: 'Máximo',
  },
  priceFrom: {
    section: 'catalog',
    title: 'Texto antes de un precio "desde"',
    description:
      'Se ve en productos con opciones de distinto precio y en el filtro de precio. Ej.: Desde, A partir de',
    default: 'Desde',
  },
  priceUpTo: {
    section: 'catalog',
    title: 'Texto antes de un precio máximo',
    description: 'Se ve en el filtro de precio elegido. Ej.: Hasta',
    default: 'Hasta',
  },
  filterOffers: {
    section: 'catalog',
    title: 'Filtro de ofertas',
    description: 'Ej.: Solo ofertas, En descuento',
    default: 'Solo ofertas',
  },
  filterTagsTitle: {
    section: 'catalog',
    title: 'Título del filtro de etiquetas',
    description: 'Agrupa las etiquetas de tus productos (vegano, piel grasa…). Ej.: Ideal para, Características',
    default: 'Características',
  },
  filterAvailable: {
    section: 'catalog',
    title: 'Filtro de disponibles',
    description: 'Ej.: Solo disponibles, Con entrega inmediata',
    default: 'Solo disponibles',
  },
  sortLabel: {
    section: 'catalog',
    title: 'Texto junto al orden',
    description: 'Ej.: Ordenar por',
    default: 'Ordenar por',
  },
  sortFeatured: {
    section: 'catalog',
    title: 'Orden: destacados',
    description: 'Tu orden manual del panel. Ej.: Destacados, Recomendados',
    default: 'Destacados',
  },
  sortNewest: {
    section: 'catalog',
    title: 'Orden: novedades',
    description: 'Ej.: Novedades, Lo más nuevo',
    default: 'Novedades',
  },
  sortPriceAsc: {
    section: 'catalog',
    title: 'Orden: precio de menor a mayor',
    description: 'Ej.: Menor precio',
    default: 'Menor precio',
  },
  sortPriceDesc: {
    section: 'catalog',
    title: 'Orden: precio de mayor a menor',
    description: 'Ej.: Mayor precio',
    default: 'Mayor precio',
  },
  sortNameAsc: {
    section: 'catalog',
    title: 'Orden: por nombre',
    description: 'Ej.: Nombre (A-Z)',
    default: 'Nombre (A-Z)',
  },
  sortDiscount: {
    section: 'catalog',
    title: 'Orden: mayor descuento',
    description: 'Ej.: Mayor descuento, Mejores ofertas',
    default: 'Mayor descuento',
  },
  loadMore: {
    section: 'catalog',
    title: 'Botón para ver más productos',
    description: 'Aparece al final de la lista cuando hay más productos. Ej.: Cargar más, Ver más productos',
    default: 'Cargar más',
  },
  productCountOne: {
    section: 'catalog',
    title: 'Contador de productos (uno)',
    description: 'Va después del número cuando hay un solo producto. Ej.: producto, artículo',
    default: 'producto',
  },
  productCountMany: {
    section: 'catalog',
    title: 'Contador de productos (varios)',
    description: 'Va después del número. Ej.: productos, artículos',
    default: 'productos',
  },
  variantsCount: {
    section: 'catalog',
    title: 'Texto junto al número de opciones',
    description: 'Se ve en la tarjeta de productos con tonos o tamaños. Ej.: tonos, colores, opciones',
    default: 'opciones',
  },
  soldOutBadge: {
    section: 'catalog',
    title: 'Etiqueta de producto agotado',
    description: 'Aparece sobre la foto en la tarjeta y junto a los tonos agotados en la ficha. Ej.: Agotado, Sin stock',
    default: 'Agotado',
  },
  orderButton: {
    section: 'product',
    title: 'Botón de pedido',
    description: 'Aparece en tarjetas y fichas. Ej.: Pedir por WhatsApp, Lo quiero',
    default: 'Pedir por WhatsApp',
  },
  backToCatalog: {
    section: 'product',
    title: 'Enlace para volver',
    description: 'Ej.: Volver al catálogo, Seguir comprando',
    default: 'Volver al catálogo',
  },
  inStock: {
    section: 'product',
    title: 'Texto de producto disponible',
    description: 'Ej.: Disponible, Envío inmediato',
    default: 'Disponible para entrega inmediata',
  },
  outOfStock: {
    section: 'product',
    title: 'Texto de producto agotado',
    description: 'Ej.: Agotado, Próximamente',
    default: 'Agotado temporalmente',
  },
  skuPrefix: {
    section: 'product',
    title: 'Texto antes de la referencia',
    description: 'Va antes del código del producto. Ej.: Ref:, Código:',
    default: 'Ref:',
  },
  featuresTitle: {
    section: 'product',
    title: 'Título de las características',
    description: 'Ej.: Beneficios, Lo que amarás',
    default: 'Características Destacadas',
  },
  quantityLabel: {
    section: 'product',
    title: 'Texto junto a la cantidad',
    description: 'Ej.: Cantidad',
    default: 'Cantidad a solicitar',
  },
  savingsPrefix: {
    section: 'product',
    title: 'Texto antes del porcentaje de descuento',
    description: 'Ej.: Ahorras, Descuento de',
    default: 'Ahorras',
  },
  variantLabelFallback: {
    section: 'product',
    title: 'Nombre de las opciones (si el producto no lo indica)',
    description:
      'Se usa en productos con opciones cuando no llenaste "Cómo se llaman las opciones". Ej.: Opción, Presentación',
    default: 'Opción',
  },
  askAvailabilityButton: {
    section: 'product',
    title: 'Botón de producto agotado',
    description: 'Reemplaza al botón de pedido cuando el producto o el tono elegido está agotado. Ej.: Preguntar disponibilidad, Avísame cuando llegue',
    default: 'Preguntar disponibilidad',
  },
  askAvailabilityMessage: {
    section: 'product',
    title: 'Mensaje de WhatsApp para preguntar por un agotado',
    description: 'Va antes del nombre del producto y el tono. Ej.: ¡Hola! ¿Cuándo vuelve a llegar este producto?',
    default: '¡Hola! Quisiera saber cuándo vuelve a estar disponible:',
    multiline: true,
  },
  shareButton: {
    section: 'product',
    title: 'Botón para compartir',
    description: 'Abre las apps del celular para enviar el enlace del producto. Ej.: Compartir, Enviar a una amiga',
    default: 'Compartir',
  },
  linkCopied: {
    section: 'product',
    title: 'Aviso de enlace copiado',
    description: 'Aparece si el navegador no puede abrir las apps para compartir y se copia el enlace. Ej.: ¡Enlace copiado!',
    default: '¡Enlace copiado!',
  },
  relatedTitle: {
    section: 'product',
    title: 'Título de productos relacionados',
    description: 'Ej.: Completa tu rutina, También te puede gustar',
    default: 'También te podría interesar',
  },
  addToCart: {
    section: 'cart',
    title: 'Botón para agregar al carrito',
    description: 'Aparece en la ficha del producto. Ej.: Agregar al carrito, Lo quiero',
    default: 'Agregar al carrito',
  },
  cartTitle: {
    section: 'cart',
    title: 'Título del carrito',
    description: 'Ej.: Tu carrito, Tu pedido, Tu bolsa',
    default: 'Tu carrito',
  },
  cartEmpty: {
    section: 'cart',
    title: 'Mensaje de carrito vacío',
    description: 'Ej.: Aún no has agregado productos',
    default: 'Tu carrito está vacío',
  },
  cartEmptyButton: {
    section: 'cart',
    title: 'Botón del carrito vacío',
    description: 'Lleva al catálogo. Ej.: Ver productos, Ir a comprar',
    default: 'Ver productos',
  },
  cartRemove: {
    section: 'cart',
    title: 'Botón para quitar un producto',
    description: 'Ej.: Quitar, Eliminar',
    default: 'Quitar',
  },
  cartSubtotal: {
    section: 'cart',
    title: 'Texto del subtotal',
    description: 'Ej.: Subtotal, Total de productos',
    default: 'Subtotal',
  },
  cartTotal: {
    section: 'cart',
    title: 'Palabra "Total" en el mensaje de WhatsApp',
    description: 'Va antes de la suma del pedido. Ej.: Total, Total a pagar (sin envío)',
    default: 'Total',
  },
  freeShippingMissing: {
    section: 'cart',
    title: 'Aviso de cuánto falta para el envío gratis',
    description:
      'Solo se ve si escribiste un monto de envío gratis. Va antes del valor que falta. Ej.: Te faltan, Agrega',
    default: 'Te faltan',
  },
  freeShippingMissingEnd: {
    section: 'cart',
    title: 'Final del aviso de envío gratis',
    description: 'Va después del valor que falta. Ej.: para el envío gratis',
    default: 'para el envío gratis',
  },
  freeShippingReached: {
    section: 'cart',
    title: 'Aviso de envío gratis alcanzado',
    description: 'Ej.: ¡Tu pedido tiene envío gratis!',
    default: '¡Tu pedido tiene envío gratis!',
  },
  cartPriceChanged: {
    section: 'cart',
    title: 'Aviso de precio cambiado',
    description: 'Se ve junto a un producto cuyo precio cambió desde que se agregó. Ej.: El precio cambió',
    default: 'El precio de este producto cambió',
  },
  cartItemsRemoved: {
    section: 'cart',
    title: 'Aviso de productos quitados',
    description: 'Se ve si un producto del carrito ya no está en la tienda. Ej.: Quitamos productos que ya no están disponibles',
    default: 'Quitamos del carrito productos que ya no están en la tienda.',
  },
  customerTitle: {
    section: 'cart',
    title: 'Título de los datos del cliente',
    description: 'Va sobre las casillas de nombre, ciudad y notas. Ej.: Tus datos para el envío',
    default: 'Tus datos',
  },
  customerName: {
    section: 'cart',
    title: 'Casilla de nombre',
    description: 'También encabeza el nombre en el mensaje de WhatsApp. Ej.: Nombre, Tu nombre',
    default: 'Nombre',
  },
  customerCity: {
    section: 'cart',
    title: 'Casilla de ciudad o barrio',
    description: 'Ej.: Ciudad o barrio, Dirección de entrega',
    default: 'Ciudad o barrio',
  },
  customerNotes: {
    section: 'cart',
    title: 'Casilla de notas',
    description: 'Ej.: Notas, Comentarios, ¿Es para regalo?',
    default: 'Notas',
  },
  cartSend: {
    section: 'cart',
    title: 'Botón para enviar el pedido',
    description: 'Ej.: Enviar pedido por WhatsApp, Finalizar pedido',
    default: 'Enviar pedido por WhatsApp',
  },
  cartMessageGreeting: {
    section: 'cart',
    title: 'Saludo del mensaje del carrito',
    description: 'Primera línea del mensaje con todo el pedido. Ej.: ¡Hola! Quiero hacer este pedido:',
    default: '¡Hola! Quiero hacer este pedido:',
    multiline: true,
  },
  cartCompacted: {
    section: 'cart',
    title: 'Aviso de pedido largo',
    description:
      'Se ve cuando el pedido tiene muchos productos y se envía sin los enlaces de cada uno. Ej.: Tu pedido es largo: lo enviaremos sin enlaces.',
    default: 'Tu pedido es largo: lo enviaremos sin los enlaces de cada producto.',
    multiline: true,
  },
  cartSentQuestion: {
    section: 'cart',
    title: 'Pregunta después de enviar',
    description: 'Aparece al volver de WhatsApp. Ej.: ¿Ya enviaste tu pedido?',
    default: '¿Ya enviaste tu pedido?',
  },
  cartClear: {
    section: 'cart',
    title: 'Botón para vaciar el carrito',
    description: 'Ej.: Vaciar carrito, Sí, vaciar',
    default: 'Vaciar carrito',
  },
  cartKeep: {
    section: 'cart',
    title: 'Botón para conservar el carrito',
    description: 'Ej.: Conservar, Todavía no',
    default: 'Conservar',
  },
  footerText: {
    section: 'footer',
    title: 'Texto del pie de página',
    description: 'Si lo dejas vacío se muestra tu eslogan. Ej.: Productos originales con envío a todo el país.',
    default: '',
    multiline: true,
  },
  footerContactLabel: {
    section: 'footer',
    title: 'Texto del enlace de WhatsApp en el pie',
    description: 'Va seguido del número. Ej.: Atención al cliente',
    default: 'Atención al cliente',
  },
  footerContactTitle: {
    section: 'footer',
    title: 'Título de la columna de contacto',
    description: 'Ej.: Contacto, Escríbenos',
    default: 'Contacto',
  },
  footerSocialTitle: {
    section: 'footer',
    title: 'Título de las redes sociales',
    description: 'Ej.: Síguenos, Encuéntranos en',
    default: 'Síguenos',
  },
  copyrightText: {
    section: 'footer',
    title: 'Texto final (derechos)',
    description: 'Va después de "© año Nombre de tu tienda." Ej.: Todos los derechos reservados.',
    default: 'Catálogo digital con pedidos directos vía WhatsApp.',
  },
  loadErrorTitle: {
    section: 'status',
    title: 'Título si la tienda no carga',
    description: 'Se muestra si hay un problema temporal. Ej.: Volvemos en un momento',
    default: 'No pudimos cargar el catálogo',
  },
  loadErrorText: {
    section: 'status',
    title: 'Mensaje si la tienda no carga',
    description: 'Ej.: Intenta recargar la página en unos minutos.',
    default: 'Estamos teniendo un problema temporal. Intenta recargar la página en unos minutos.',
    multiline: true,
  },
  retryButton: {
    section: 'status',
    title: 'Botón para reintentar',
    description: 'Ej.: Reintentar, Volver a cargar',
    default: 'Reintentar',
  },
  notFoundTitle: {
    section: 'status',
    title: 'Título de página no encontrada',
    description: 'Se muestra si el enlace no existe o el producto ya no está. Ej.: Ups, no encontramos esta página',
    default: 'No encontramos esta página',
  },
  notFoundText: {
    section: 'status',
    title: 'Mensaje de página no encontrada',
    description: 'Ej.: Puede que el producto ya no esté disponible. Mira el resto del catálogo.',
    default: 'Es posible que el producto ya no esté disponible o que el enlace tenga un error.',
    multiline: true,
  },
  emptyStoreTitle: {
    section: 'status',
    title: 'Título de tienda sin productos',
    description: 'Solo se ve mientras no hayas publicado productos. Ej.: Muy pronto',
    default: 'Tu tienda aún no tiene productos',
  },
  emptyStoreText: {
    section: 'status',
    title: 'Mensaje de tienda sin productos',
    description: 'Ej.: Estamos preparando el catálogo. Vuelve pronto.',
    default: 'Entra al panel de administración para crear tus categorías y publicar tu primer producto.',
    multiline: true,
  },
  emptyStoreButton: {
    section: 'status',
    title: 'Botón de tienda sin productos',
    description: 'Lleva al panel. Ej.: Ir al panel',
    default: 'Ir al panel',
  },
  seoTitleSuffix: {
    section: 'seo',
    title: 'Texto después del nombre de la tienda',
    description:
      'Se ve en la pestaña del navegador, en Google y al compartir la portada: "Mi tienda | Pedidos por WhatsApp". Ej.: Maquillaje y cuidado de la piel',
    default: 'Pedidos Directos por WhatsApp',
  },
  seoDescription: {
    section: 'seo',
    title: 'Descripción para Google y al compartir',
    description:
      'Se usa si el eslogan está vacío. Ideal: una o dos frases de hasta 160 letras. Ej.: Maquillaje, skincare y fragancias originales con envío a todo el país.',
    default: 'Catálogo interactivo con pedidos directos por WhatsApp.',
    multiline: true,
  },
} as const satisfies Record<string, LabelDefinition & { section: LabelSection }>;

export type LabelKey = keyof typeof LABEL_DEFINITIONS;
export type StoreLabels = Record<LabelKey, string>;

export const DEFAULT_LABELS = Object.fromEntries(
  Object.entries(LABEL_DEFINITIONS).map(([key, def]) => [key, def.default])
) as StoreLabels;
