import { defineArrayMember, defineField, defineType, type StringRule } from 'sanity';
import {
  CATEGORY_GRID_STYLES,
  CATEGORY_ICONS,
  PRODUCT_BADGES,
  SERVICE_ICONS,
  SHELF_SOURCES,
  toSanityList,
} from '../../../lib/contentOptions';

const titleField = (example: string, required = false) =>
  defineField({
    name: 'title',
    title: 'Título',
    type: 'string',
    description: `Ej.: ${example}`,
    ...(required ? { validation: (Rule: StringRule) => Rule.required().error('Escribe un título') } : {}),
  });

const imageWithAlt = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: 'image',
    description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: 'alt',
        title: 'Descripción de la imagen',
        type: 'string',
        description: 'Para lectores de pantalla y Google. Ej.: Modelo usando labial rojo',
      }),
    ],
  });

/* ---------- Banner principal ---------- */

export const heroSlideType = defineType({
  name: 'heroSlide',
  title: 'Diapositiva',
  type: 'object',
  fields: [
    imageWithAlt('image', 'Imagen para computador', 'Horizontal. Recomendado 1600 × 700 px.'),
    imageWithAlt(
      'mobileImage',
      'Imagen para celular (opcional)',
      'Vertical. Recomendado 800 × 1000 px. Si no la subes, se usa la de computador.'
    ),
    defineField({ name: 'title', title: 'Título', type: 'string', description: 'Ej.: Nueva colección de labiales' }),
    defineField({ name: 'subtitle', title: 'Subtítulo', type: 'string', description: 'Ej.: Tonos mate de larga duración' }),
    defineField({
      name: 'buttonText',
      title: 'Texto del botón',
      type: 'string',
      description: 'Ej.: Ver colección. Déjalo vacío para no mostrar botón.',
    }),
    defineField({ name: 'link', title: 'Destino del botón', type: 'linkTarget' }),
  ],
  validation: (Rule) =>
    Rule.custom((value: { image?: unknown } | undefined) => (value?.image ? true : 'Sube la imagen para computador')),
  preview: {
    select: { title: 'title', subtitle: 'subtitle', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: title || 'Diapositiva sin título', subtitle, media }),
  },
});

export const heroBannerType = defineType({
  name: 'heroBanner',
  title: 'Banner principal',
  type: 'object',
  fields: [
    defineField({
      name: 'slides',
      title: 'Diapositivas',
      type: 'array',
      description: 'Una o varias imágenes que se pasan como carrusel. Arrástralas para cambiar el orden.',
      of: [defineArrayMember({ type: 'heroSlide' })],
      validation: (Rule) => Rule.min(1).error('Agrega al menos una diapositiva'),
    }),
    defineField({
      name: 'autoplay',
      title: 'Pasar solas',
      type: 'boolean',
      initialValue: true,
      description: 'Las diapositivas avanzan cada pocos segundos.',
    }),
  ],
  preview: {
    select: { slides: 'slides', media: 'slides.0.image', firstTitle: 'slides.0.title' },
    prepare: ({ slides, media, firstTitle }) => ({
      title: '🖼️ Banner principal',
      subtitle: `${slides?.length ?? 0} diapositiva(s)${firstTitle ? ` · ${firstTitle}` : ''}`,
      media,
    }),
  },
});

/* ---------- Estante de productos ---------- */

type ShelfParent = { source?: string } | undefined;
const unlessSource =
  (source: string) =>
  ({ parent }: { parent?: unknown }) =>
    (parent as ShelfParent)?.source !== source;

export const productShelfType = defineType({
  name: 'productShelf',
  title: 'Estante de productos',
  type: 'object',
  fields: [
    titleField('Novedades, Lo más vendido, Ofertas de la semana', true),
    defineField({
      name: 'source',
      title: '¿Qué productos mostrar?',
      type: 'string',
      initialValue: 'newest',
      options: { list: toSanityList(SHELF_SOURCES) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'badge',
      title: 'Insignia',
      type: 'string',
      options: { list: toSanityList(PRODUCT_BADGES) },
      hidden: unlessSource('badge'),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'category' }],
      hidden: unlessSource('category'),
    }),
    defineField({
      name: 'brand',
      title: 'Marca',
      type: 'reference',
      to: [{ type: 'brand' }],
      hidden: unlessSource('brand'),
    }),
    defineField({
      name: 'products',
      title: 'Productos',
      type: 'array',
      description: 'Arrástralos para cambiar el orden.',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'product' }] })],
      hidden: unlessSource('manual'),
    }),
    defineField({
      name: 'limit',
      title: 'Cantidad máxima de productos',
      type: 'number',
      initialValue: 8,
      description: 'Ej.: 8',
      validation: (Rule) => Rule.min(1).max(24).integer(),
    }),
  ],
  preview: {
    select: { title: 'title', source: 'source' },
    prepare: ({ title, source }) => ({
      title: `🛍️ ${title || 'Estante de productos'}`,
      subtitle: SHELF_SOURCES.find((s) => s.value === source)?.title,
    }),
  },
});

/* ---------- Categorías y marcas ---------- */

export const categoryGridType = defineType({
  name: 'categoryGrid',
  title: 'Categorías',
  type: 'object',
  fields: [
    titleField('Compra por categoría'),
    defineField({
      name: 'style',
      title: 'Estilo',
      type: 'string',
      initialValue: 'circles',
      options: { list: toSanityList(CATEGORY_GRID_STYLES), layout: 'radio' },
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: `🗂️ ${title || 'Categorías'}`, subtitle: 'Muestra todas tus categorías' }),
  },
});

export const brandStripType = defineType({
  name: 'brandStrip',
  title: 'Marcas',
  type: 'object',
  fields: [titleField('Nuestras marcas')],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: `🏷️ ${title || 'Marcas'}`, subtitle: 'Muestra los logos de tus marcas' }),
  },
});

/* ---------- Bloques informativos ---------- */

export const infoBlockType = defineType({
  name: 'infoBlock',
  title: 'Bloque',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      initialValue: 'truck',
      options: { list: toSanityList([...SERVICE_ICONS, ...CATEGORY_ICONS]) },
    }),
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Ej.: Pago contra entrega',
      validation: (Rule) => Rule.required().error('Escribe un título'),
    }),
    defineField({ name: 'text', title: 'Texto', type: 'string', description: 'Ej.: Pagas cuando recibes tu pedido' }),
  ],
  preview: { select: { title: 'title', subtitle: 'text' } },
});

export const infoBlocksType = defineType({
  name: 'infoBlocks',
  title: 'Bloques informativos',
  type: 'object',
  fields: [
    titleField('¿Por qué comprar con nosotros?'),
    defineField({
      name: 'items',
      title: 'Bloques',
      type: 'array',
      description: 'Recomendado: 3 o 4. Ej.: Envíos a todo el país, Pago contra entrega, Productos originales.',
      of: [defineArrayMember({ type: 'infoBlock' })],
      validation: (Rule) => Rule.min(1).max(6),
    }),
  ],
  preview: {
    select: { title: 'title', items: 'items' },
    prepare: ({ title, items }) => ({
      title: `ℹ️ ${title || 'Bloques informativos'}`,
      subtitle: `${items?.length ?? 0} bloque(s)`,
    }),
  },
});

/* ---------- Banner de texto y redes ---------- */

export const textBannerType = defineType({
  name: 'textBanner',
  title: 'Banner de texto',
  type: 'object',
  fields: [
    titleField('Kit de temporada con 20% de descuento', true),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'text',
      rows: 3,
      description: 'Ej.: Solo hasta el domingo o hasta agotar existencias.',
    }),
    imageWithAlt('image', 'Imagen (opcional)', 'Se muestra al lado del texto.'),
    defineField({
      name: 'buttonText',
      title: 'Texto del botón',
      type: 'string',
      description: 'Ej.: Ver el kit. Déjalo vacío para no mostrar botón.',
    }),
    defineField({ name: 'link', title: 'Destino del botón', type: 'linkTarget' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'text', media: 'image' },
    prepare: ({ title, subtitle, media }) => ({ title: `📝 ${title || 'Banner de texto'}`, subtitle, media }),
  },
});

export const socialCtaType = defineType({
  name: 'socialCta',
  title: 'Invitación a redes sociales',
  type: 'object',
  fields: [
    titleField('Síguenos en Instagram', true),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'string',
      description: 'Los enlaces salen de Configuración → Redes y contacto. Ej.: Tutoriales y lanzamientos cada semana.',
    }),
  ],
  preview: {
    select: { title: 'title' },
    prepare: ({ title }) => ({ title: `📱 ${title || 'Redes sociales'}`, subtitle: 'Botones a tus redes' }),
  },
});

export const homeSectionTypes = [
  heroSlideType,
  heroBannerType,
  productShelfType,
  categoryGridType,
  brandStripType,
  infoBlockType,
  infoBlocksType,
  textBannerType,
  socialCtaType,
];

/** Tipos que se pueden agregar como sección de la portada. */
export const HOME_SECTION_NAMES = [
  'heroBanner',
  'productShelf',
  'categoryGrid',
  'brandStrip',
  'infoBlocks',
  'textBanner',
  'socialCta',
] as const;
