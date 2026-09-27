/**
 * Tienda de ejemplo (belleza). Fuente única para:
 *  - el modo demostración (web sin credenciales de Sanity), y
 *  - el botón "Cargar tienda de ejemplo" de "Primeros pasos" en el panel.
 * Las imágenes están en /public/demo (se generan con un script del repositorio de desarrollo).
 * Las marcas son ficticias.
 */
import type { CategoryIcon, IconName, ProductBadge } from '../contentOptions';

/** Nombre de archivo en /public/demo, sin extensión. */
export type DemoImage = string;

export const demoImageUrl = (file: DemoImage) => `/demo/${file}.webp`;

export interface DemoCategory {
  id: string;
  name: string;
  icon: CategoryIcon;
  image: DemoImage;
  description: string;
}

export interface DemoBrand {
  id: string;
  name: string;
  logo: DemoImage;
  description: string;
}

export interface DemoVariant {
  name: string;
  color?: string;
  image?: DemoImage;
  price?: number;
  originalPrice?: number;
  sku?: string;
  available?: boolean;
}

export interface DemoProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  sku: string;
  category: string;
  brand: string;
  badge?: ProductBadge;
  tags: string[];
  images: DemoImage[];
  shortDescription: string;
  description: string;
  features: string[];
  inStock: boolean;
  variantLabel?: string;
  variants?: DemoVariant[];
  infoSections?: { title: string; body: string }[];
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    id: 'maquillaje',
    name: 'Maquillaje',
    icon: 'palette',
    image: 'labial-rojo-carmesi',
    description: 'Labiales, bases, máscaras y paletas',
  },
  {
    id: 'cuidado-de-la-piel',
    name: 'Cuidado de la piel',
    icon: 'droplet',
    image: 'serum-vitamina-c',
    description: 'Sérums, cremas y protección solar',
  },
  { id: 'cabello', name: 'Cabello', icon: 'scissors', image: 'shampoo-reparador', description: 'Limpieza y tratamiento capilar' },
  { id: 'unas', name: 'Uñas', icon: 'sparkles', image: 'esmalte-rosa-pastel', description: 'Esmaltes y accesorios de manicure' },
  { id: 'fragancias', name: 'Fragancias', icon: 'flower-2', image: 'perfume-floral', description: 'Perfumes y body mists' },
];

export const DEMO_BRANDS: DemoBrand[] = [
  { id: 'lumiere', name: 'Lumière', logo: 'marca-lumiere', description: 'Maquillaje y fragancias de inspiración francesa' },
  { id: 'rosa-bella', name: 'Rosa Bella', logo: 'marca-rosa-bella', description: 'Color y cuidado a precio justo' },
  { id: 'botanica-pura', name: 'Botánica Pura', logo: 'marca-botanica-pura', description: 'Fórmulas con ingredientes naturales' },
  { id: 'velvet-studio', name: 'Velvet Studio', logo: 'marca-velvet-studio', description: 'Maquillaje profesional libre de crueldad' },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'labial-mate-larga-duracion',
    name: 'Labial Mate Larga Duración',
    price: 45000,
    originalPrice: 52000,
    sku: 'VS-LAB-01',
    category: 'maquillaje',
    brand: 'velvet-studio',
    badge: 'Oferta',
    tags: ['vegano', 'larga duración'],
    images: ['labial-rojo-carmesi'],
    shortDescription: 'Color intenso que dura hasta 12 horas',
    description:
      'Labial de acabado mate aterciopelado con pigmentos de alta intensidad.\nNo reseca ni se transfiere, ideal para todo el día.',
    features: ['Hasta 12 horas de duración', 'No reseca los labios', 'Libre de crueldad animal'],
    inStock: true,
    variantLabel: 'Tono',
    variants: [
      { name: 'Rojo Carmesí', color: '#B0263A', image: 'labial-rojo-carmesi', sku: 'VS-LAB-01-RC' },
      { name: 'Rosa Nude', color: '#C98B8B', image: 'labial-rosa-nude', sku: 'VS-LAB-01-RN' },
      { name: 'Coral', color: '#E4675A', image: 'labial-coral', sku: 'VS-LAB-01-CO' },
      { name: 'Vino', color: '#6E1A2D', image: 'labial-vino', sku: 'VS-LAB-01-VI', available: false },
    ],
    infoSections: [
      { title: 'Modo de uso', body: 'Aplica desde el centro hacia las comisuras.\nPara mayor intensidad, aplica una segunda capa.' },
      { title: 'Ingredientes', body: 'Cera de candelilla, aceite de jojoba, vitamina E, pigmentos minerales.' },
    ],
  },
  {
    id: 'base-liquida-cobertura-media',
    name: 'Base Líquida Cobertura Media',
    price: 68000,
    sku: 'LU-BAS-02',
    category: 'maquillaje',
    brand: 'lumiere',
    badge: 'Nuevo',
    tags: ['piel mixta', 'acabado natural'],
    images: ['base-beige'],
    shortDescription: 'Acabado natural con cobertura construible',
    description: 'Base ligera que unifica el tono sin sensación de máscara.\nContiene ácido hialurónico para mantener la piel hidratada.',
    features: ['Cobertura media construible', 'Con ácido hialurónico', 'No comedogénica'],
    inStock: true,
    variantLabel: 'Tono',
    variants: [
      { name: 'Marfil', color: '#F1D3B8', image: 'base-marfil' },
      { name: 'Beige', color: '#DDB48F', image: 'base-beige' },
      { name: 'Canela', color: '#B98563', image: 'base-canela' },
      { name: 'Café', color: '#8A5A3C', image: 'base-cafe' },
    ],
    infoSections: [
      { title: 'Modo de uso', body: 'Aplica con brocha o esponja húmeda desde el centro del rostro hacia afuera.' },
      { title: '¿Cómo elegir tu tono?', body: 'Prueba el tono en la línea de la mandíbula con luz natural. Si dudas, escríbenos y te asesoramos.' },
    ],
  },
  {
    id: 'mascara-de-pestanas-volumen',
    name: 'Máscara de Pestañas Volumen',
    price: 39000,
    sku: 'VS-MAS-03',
    category: 'maquillaje',
    brand: 'velvet-studio',
    badge: 'Popular',
    tags: ['a prueba de agua', 'rímel'],
    images: ['mascara'],
    shortDescription: 'Volumen extremo sin grumos',
    description: 'Cepillo de fibras que separa y da volumen desde la raíz. Fórmula a prueba de agua.',
    features: ['A prueba de agua', 'Cepillo de fibras', 'Se retira con desmaquillante bifásico'],
    inStock: true,
  },
  {
    id: 'paleta-de-sombras-nude',
    name: 'Paleta de Sombras Nude',
    price: 85000,
    originalPrice: 99000,
    sku: 'RB-PAL-04',
    category: 'maquillaje',
    brand: 'rosa-bella',
    badge: 'Oferta',
    tags: ['vegano'],
    images: ['paleta-nude'],
    shortDescription: '9 tonos neutros mate y satinados',
    description: 'Nueve tonos que combinan entre sí para looks de día y de noche. Alta pigmentación y fácil difuminado.',
    features: ['9 tonos', 'Acabados mate y satinado', 'Espejo incluido'],
    inStock: true,
  },
  {
    id: 'serum-vitamina-c',
    name: 'Sérum Vitamina C',
    price: 72000,
    sku: 'BP-SER-05',
    category: 'cuidado-de-la-piel',
    brand: 'botanica-pura',
    badge: 'Destacado',
    tags: ['antimanchas', 'sin parabenos', 'vegano'],
    images: ['serum-vitamina-c'],
    shortDescription: 'Ilumina y unifica el tono de la piel',
    description: 'Sérum con 15% de vitamina C estabilizada. Aporta luminosidad y ayuda a reducir manchas.',
    features: ['15% vitamina C', 'Textura ligera', 'Para todo tipo de piel'],
    inStock: true,
    variantLabel: 'Tamaño',
    variants: [
      { name: '15 ml', price: 42000, sku: 'BP-SER-05-15' },
      { name: '30 ml', sku: 'BP-SER-05-30' },
    ],
    infoSections: [
      { title: 'Modo de uso', body: 'Aplica 3 gotas en la mañana sobre la piel limpia.\nUsa siempre protector solar durante el día.' },
      { title: 'Advertencias', body: 'Uso externo. Evita el contacto con los ojos. Suspende su uso si hay irritación.' },
    ],
  },
  {
    id: 'crema-hidratante-acido-hialuronico',
    name: 'Crema Hidratante Ácido Hialurónico',
    price: 58000,
    sku: 'BP-CRE-06',
    category: 'cuidado-de-la-piel',
    brand: 'botanica-pura',
    tags: ['piel seca', 'sin parabenos'],
    images: ['crema-hidratante'],
    shortDescription: 'Hidratación profunda por 24 horas',
    description: 'Crema de textura gel-crema que hidrata sin engrasar. Ideal para rutina de día y de noche.',
    features: ['Hidratación 24 h', 'Textura gel-crema', 'Dermatológicamente probada'],
    inStock: true,
    infoSections: [{ title: 'Modo de uso', body: 'Aplica mañana y noche sobre rostro y cuello limpios.' }],
  },
  {
    id: 'protector-solar-fps-50',
    name: 'Protector Solar FPS 50',
    price: 49000,
    sku: 'LU-SOL-07',
    category: 'cuidado-de-la-piel',
    brand: 'lumiere',
    badge: 'Nuevo',
    tags: ['piel grasa', 'toque seco'],
    images: ['protector-solar'],
    shortDescription: 'Toque seco, sin brillo, sin residuo blanco',
    description: 'Protección UVA/UVB de amplio espectro con acabado invisible. Resistente al agua.',
    features: ['FPS 50', 'Toque seco', 'Resistente al agua'],
    inStock: true,
    infoSections: [{ title: 'Modo de uso', body: 'Aplica 15 minutos antes de la exposición al sol y reaplica cada 2 horas.' }],
  },
  {
    id: 'shampoo-reparador-sin-sulfatos',
    name: 'Shampoo Reparador Sin Sulfatos',
    price: 36000,
    sku: 'BP-SHA-08',
    category: 'cabello',
    brand: 'botanica-pura',
    tags: ['sin sulfatos', 'cabello teñido'],
    images: ['shampoo-reparador'],
    shortDescription: 'Limpia suave y repara las puntas',
    description: 'Fórmula sin sulfatos con keratina vegetal. Cuida el color y reduce el frizz.',
    features: ['Sin sulfatos', 'Con keratina vegetal', 'Apto para cabello teñido'],
    inStock: true,
    variantLabel: 'Tamaño',
    variants: [{ name: '250 ml' }, { name: '500 ml', price: 58000 }],
  },
  {
    id: 'aceite-capilar-de-argan',
    name: 'Aceite Capilar de Argán',
    price: 42000,
    originalPrice: 50000,
    sku: 'RB-ACE-09',
    category: 'cabello',
    brand: 'rosa-bella',
    badge: 'Oferta',
    tags: ['anti-frizz'],
    images: ['aceite-argan'],
    shortDescription: 'Brillo y suavidad sin peso',
    description: 'Aceite 100% de argán que controla el frizz y protege del calor de secador y plancha.',
    features: ['Control del frizz', 'Protección térmica', 'No engrasa'],
    inStock: true,
  },
  {
    id: 'esmalte-en-gel',
    name: 'Esmalte en Gel',
    price: 18000,
    sku: 'RB-ESM-10',
    category: 'unas',
    brand: 'rosa-bella',
    badge: 'Popular',
    tags: ['secado rápido'],
    images: ['esmalte-rosa-pastel'],
    shortDescription: 'Efecto gel sin lámpara, hasta 10 días',
    description: 'Esmalte de larga duración con brillo efecto gel. No necesita lámpara.',
    features: ['Hasta 10 días', 'Secado rápido', 'Sin lámpara'],
    inStock: true,
    variantLabel: 'Tono',
    variants: [
      { name: 'Rosa Pastel', color: '#F4A6B8', image: 'esmalte-rosa-pastel' },
      { name: 'Rojo Clásico', color: '#C1121F', image: 'esmalte-rojo-clasico' },
      { name: 'Nude', color: '#D8B4A0', image: 'esmalte-nude' },
      { name: 'Lila', color: '#B69BD6', image: 'esmalte-lila' },
      { name: 'Negro', color: '#1F1B24', image: 'esmalte-negro' },
    ],
  },
  {
    id: 'kit-de-manicure',
    name: 'Kit de Manicure',
    price: 55000,
    sku: 'VS-KIT-11',
    category: 'unas',
    brand: 'velvet-studio',
    tags: ['regalo'],
    images: ['kit-manicure'],
    shortDescription: 'Todo lo que necesitas en un estuche',
    description: 'Estuche con tijera, cortaúñas, lima, empujador de cutícula y pinza.',
    features: ['5 herramientas de acero inoxidable', 'Estuche con cierre', 'Ideal para regalo'],
    inStock: true,
  },
  {
    id: 'perfume-floral-eau-de-parfum',
    name: 'Perfume Floral Eau de Parfum',
    price: 165000,
    originalPrice: 189000,
    sku: 'LU-PER-12',
    category: 'fragancias',
    brand: 'lumiere',
    badge: 'Destacado',
    tags: ['regalo', 'floral'],
    images: ['perfume-floral'],
    shortDescription: 'Notas de rosa, peonía y almizcle',
    description: 'Fragancia floral y elegante con salida de pera, corazón de rosa y peonía y fondo de almizcle blanco.',
    features: ['Eau de Parfum', 'Larga duración', 'Frasco de vidrio'],
    inStock: true,
    variantLabel: 'Tamaño',
    variants: [
      { name: '30 ml', price: 110000, originalPrice: 125000 },
      { name: '50 ml' },
    ],
  },
  {
    id: 'body-mist-vainilla',
    name: 'Body Mist Vainilla',
    price: 38000,
    sku: 'RB-MIS-13',
    category: 'fragancias',
    brand: 'rosa-bella',
    tags: ['dulce'],
    images: ['body-mist-vainilla'],
    shortDescription: 'Aroma dulce y ligero para todos los días',
    description: 'Bruma corporal con notas de vainilla y coco. Refresca y perfuma suavemente.',
    features: ['Aroma ligero', 'Para cuerpo y cabello'],
    // Agotado a propósito para mostrar la lista "Agotados" en el panel
    inStock: false,
  },
];

/** Configuración de la tienda de ejemplo (campos v2 de storeSettings). */
export const DEMO_SETTINGS = {
  storeName: 'Glow Studio',
  tagline: 'Maquillaje y skincare original',
  locale: 'es-CO',
  currencyCode: 'COP',
  showDecimals: false,
  palette: 'blush-nude',
  backgroundTone: 'light',
  fontPairing: 'elegante',
  cornerStyle: 'soft',
  buttonStyle: 'pill',
  imageRatio: '4:5',
  mobileColumns: '2',
  cardOptions: { showBrand: true, showCategory: false, showQuickOrder: true },
  defaultMessage: '¡Hola! Vi este producto en tu tienda y quiero pedirlo:',
  messageClosing: '¿Me confirmas disponibilidad y el costo del envío?',
  cartEnabled: true,
  askCustomerName: true,
  askCustomerCity: true,
  askNotes: true,
  freeShippingThreshold: 150000,
  outOfStockBehavior: 'show',
  enabledFilters: ['brand', 'price', 'offers', 'tags', 'availability'],
  defaultSort: 'featured',
  pageSize: 24,
  trustBadges: [
    { icon: 'badge-check' as IconName, text: 'Productos 100% originales' },
    { icon: 'truck' as IconName, text: 'Envíos a todo el país' },
    { icon: 'banknote' as IconName, text: 'Pago contra entrega' },
  ],
  instagram: 'https://instagram.com',
  tiktok: 'https://tiktok.com',
  openingHours: 'Lunes a sábado de 9 a. m. a 7 p. m.',
  announcementEnabled: true,
  shippingNotice: 'Envío gratis desde $150.000 • Pago contra entrega',
  announcementIcon: 'truck' as IconName,
} as const;

/** Solo para el modo demostración: número ficticio. En Sanity la dueña escribe el suyo. */
export const DEMO_WHATSAPP_NUMBER = '573001234567';

/** Secciones de la portada de ejemplo, en orden. */
export type DemoHomeSection =
  | {
      type: 'heroBanner';
      slides: { image: DemoImage; mobileImage: DemoImage; title: string; subtitle: string; buttonText: string; category: string }[];
    }
  | { type: 'productShelf'; title: string; source: 'newest' | 'offers'; limit: number }
  | { type: 'categoryGrid'; title: string; style: 'circles' | 'cards' }
  | { type: 'brandStrip'; title: string }
  | { type: 'infoBlocks'; title: string; items: { icon: IconName; title: string; text: string }[] }
  | { type: 'textBanner'; title: string; text: string; image: DemoImage; buttonText: string; product: string }
  | { type: 'socialCta'; title: string; text: string };

export const DEMO_HOME: DemoHomeSection[] = [
  {
    type: 'heroBanner',
    slides: [
      {
        image: 'banner-labiales',
        mobileImage: 'banner-labiales-movil',
        title: 'Labiales que duran todo el día',
        subtitle: 'Nuevos tonos mate de Velvet Studio',
        buttonText: 'Ver maquillaje',
        category: 'maquillaje',
      },
      {
        image: 'banner-skincare',
        mobileImage: 'banner-skincare-movil',
        title: 'Tu rutina de skincare',
        subtitle: 'Hidratación, vitamina C y protección solar',
        buttonText: 'Ver cuidado de la piel',
        category: 'cuidado-de-la-piel',
      },
    ],
  },
  { type: 'categoryGrid', title: 'Compra por categoría', style: 'circles' },
  { type: 'productShelf', title: 'Novedades', source: 'newest', limit: 8 },
  {
    type: 'infoBlocks',
    title: '¿Por qué comprar con nosotros?',
    items: [
      { icon: 'badge-check', title: 'Productos originales', text: 'Trabajamos directo con las marcas' },
      { icon: 'truck', title: 'Envíos a todo el país', text: 'Gratis desde $150.000' },
      { icon: 'banknote', title: 'Pago contra entrega', text: 'Pagas cuando recibes tu pedido' },
    ],
  },
  { type: 'productShelf', title: 'Ofertas', source: 'offers', limit: 8 },
  {
    type: 'textBanner',
    title: 'Fleur, la fragancia de la temporada',
    text: 'Rosa, peonía y almizcle blanco. Ahora con precio especial.',
    image: 'perfume-floral',
    buttonText: 'Conocer Fleur',
    product: 'perfume-floral-eau-de-parfum',
  },
  { type: 'brandStrip', title: 'Nuestras marcas' },
  { type: 'socialCta', title: 'Síguenos en redes', text: 'Tutoriales, lanzamientos y promociones cada semana.' },
];
