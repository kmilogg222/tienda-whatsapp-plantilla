import { defineArrayMember, defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { PRODUCT_BADGES, toSanityList } from '../../lib/contentOptions';
import { originalPriceAbovePrice } from './objects/validation';
import { formatPrice } from '../../lib/format';

export const productType = defineType({
  name: 'product',
  title: 'Productos',
  type: 'document',
  orderings: [orderRankOrdering],
  groups: [
    { name: 'basic', title: '🛍️ Datos básicos', default: true },
    { name: 'photos', title: '📷 Fotos' },
    { name: 'variants', title: '🎨 Tonos y opciones' },
    { name: 'info', title: '📝 Descripción e información' },
    { name: 'visibility', title: '👁️ Visibilidad' },
  ],
  fields: [
    // Orden manual (se cambia arrastrando en la lista de productos). Los nuevos quedan de primeros.
    orderRankField({ type: 'product', newItemPosition: 'before' }),

    // --- DATOS BÁSICOS ---
    defineField({
      name: 'name',
      title: 'Nombre del Producto',
      type: 'string',
      group: 'basic',
      description: 'Nombre comercial visible en el catálogo. Ej.: Labial Mate Larga Duración',
      validation: (Rule) => Rule.required().error('El nombre del producto es obligatorio'),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador URL (Slug)',
      type: 'slug',
      group: 'basic',
      description: 'Se crea solo desde el nombre con el botón "Generate". Ej.: labial-mate-larga-duracion',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('El slug es obligatorio'),
    }),
    defineField({
      name: 'price',
      title: 'Precio de venta',
      type: 'number',
      group: 'basic',
      description: 'Precio que paga el cliente, sin puntos ni símbolo. Ej.: 45000',
      validation: (Rule) => Rule.required().min(0).error('Ingresa un precio válido mayor o igual a 0'),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Precio antes (opcional)',
      type: 'number',
      group: 'basic',
      description: 'Si tiene descuento, el precio anterior. Se muestra tachado. Ej.: 60000',
      validation: (Rule) => Rule.min(0).custom(originalPriceAbovePrice).warning(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      group: 'basic',
      to: [{ type: 'category' }],
      description: 'Selecciona la categoría a la que pertenece este producto',
      validation: (Rule) => Rule.required().error('Debes asociar el producto a una categoría'),
    }),
    defineField({
      name: 'brand',
      title: 'Marca (opcional)',
      type: 'reference',
      group: 'basic',
      to: [{ type: 'brand' }],
      description: 'Crea las marcas en la sección "Marcas". Ej.: Maybelline',
    }),
    defineField({
      name: 'sku',
      title: 'Código SKU / Referencia (Opcional)',
      type: 'string',
      group: 'basic',
      description: 'Código interno del producto. Ej.: LAB-001',
    }),
    defineField({
      name: 'badge',
      title: 'Etiqueta o Insignia (Opcional)',
      type: 'string',
      group: 'basic',
      description: 'Se muestra sobre la foto. Ej.: Nuevo',
      options: { list: toSanityList(PRODUCT_BADGES) },
    }),
    defineField({
      name: 'tags',
      title: 'Etiquetas para filtrar (opcional)',
      type: 'array',
      group: 'basic',
      description: 'Escribe una y presiona Enter. Ej.: vegano, piel grasa, sin parabenos',
      of: [defineArrayMember({ type: 'string' })],
      options: { layout: 'tags' },
    }),

    // --- FOTOS ---
    defineField({
      name: 'images',
      title: 'Fotografías del Producto',
      type: 'array',
      group: 'photos',
      of: [
        defineArrayMember({
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              name: 'alt',
              title: 'Descripción de la foto (opcional)',
              type: 'string',
              description: 'Para lectores de pantalla y Google. Si la dejas vacía se usa el nombre del producto. Ej.: Labial rojo abierto sobre fondo rosa',
            }),
          ],
        }),
      ],
      description:
        'Sube una o varias fotos. La primera es la portada. Usa "Edit" en cada foto para marcar el punto importante (no se recortará).',
      validation: (Rule) => Rule.min(1).error('Debes subir al menos una imagen'),
    }),

    // --- TONOS Y OPCIONES ---
    defineField({
      name: 'variantLabel',
      title: 'Nombre de las opciones',
      type: 'string',
      group: 'variants',
      initialValue: 'Tono',
      description: 'Cómo se llaman las opciones de este producto. Ej.: Tono, Tamaño, Aroma',
    }),
    defineField({
      name: 'variants',
      title: 'Opciones (opcional)',
      type: 'array',
      group: 'variants',
      description:
        'Agrega una opción por cada tono, tamaño o aroma. Si el producto no tiene opciones, deja esto vacío.',
      of: [defineArrayMember({ type: 'productVariant' })],
    }),

    // --- DESCRIPCIÓN E INFORMACIÓN ---
    defineField({
      name: 'shortDescription',
      title: 'Resumen Corto',
      type: 'string',
      group: 'info',
      description: 'Frase breve para tarjetas y al compartir. Ej.: Color intenso que dura 12 horas',
    }),
    defineField({
      name: 'description',
      title: 'Descripción Detallada',
      type: 'text',
      rows: 4,
      group: 'info',
      description: 'Detalles completos del producto. Puedes usar saltos de línea.',
    }),
    defineField({
      name: 'features',
      title: 'Características Clave (Puntos Destacados)',
      type: 'array',
      group: 'info',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Lista de beneficios. Ej.: No reseca los labios',
    }),
    defineField({
      name: 'infoSections',
      title: 'Información adicional (opcional)',
      type: 'array',
      group: 'info',
      description: 'Secciones desplegables en la ficha. Ej.: Modo de uso, Ingredientes, Advertencias',
      of: [defineArrayMember({ type: 'infoSection' })],
    }),

    // --- VISIBILIDAD ---
    defineField({
      name: 'inStock',
      title: '¿Está Disponible en Stock?',
      type: 'boolean',
      group: 'visibility',
      initialValue: true,
      description: 'Desactiva esta opción si el producto se ha agotado temporalmente',
    }),
    defineField({
      name: 'hidden',
      title: 'Ocultar de la tienda',
      type: 'boolean',
      group: 'visibility',
      initialValue: false,
      description: 'Actívalo para que el producto no se vea en la tienda sin tener que borrarlo.',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      price: 'price',
      brand: 'brand.name',
      inStock: 'inStock',
      hidden: 'hidden',
      variants: 'variants',
      media: 'images.0',
    },
    prepare({ title, price, brand, inStock, hidden, variants, media }) {
      // La vista previa no puede leer la Configuración: usa el formato por defecto (Colombia, COP)
      const parts = [typeof price === 'number' ? formatPrice(price) : 'Sin precio'];
      if (brand) parts.push(brand);
      if (Array.isArray(variants) && variants.length > 0) parts.push(`${variants.length} opciones`);
      if (hidden) parts.push('🙈 Oculto');
      else if (inStock === false) parts.push('⚠️ Agotado');
      return { title: title || 'Producto sin nombre', subtitle: parts.join(' · '), media };
    },
  },
});
