import { defineField, defineType } from 'sanity';
import { HEX_COLOR, originalPriceAbovePrice } from './validation';

export const productVariantType = defineType({
  name: 'productVariant',
  title: 'Opción',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre de la opción',
      type: 'string',
      description: 'Ej.: Rojo Carmesí, 30 ml, Tono 02',
      validation: (Rule) => Rule.required().error('Escribe el nombre de la opción'),
    }),
    defineField({
      name: 'color',
      title: 'Color de muestra (opcional)',
      type: 'string',
      description: 'Código del color para mostrar un circulito. Ej.: #B0263A. Déjalo vacío si la opción no es un color.',
      validation: (Rule) =>
        Rule.regex(HEX_COLOR, { name: 'color' }).error('Usa un código como #B0263A (empieza con #)'),
    }),
    defineField({
      name: 'image',
      title: 'Foto de esta opción (opcional)',
      type: 'image',
      description: 'Si la subes, la ficha cambia a esta foto al elegir la opción.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Descripción de la foto',
          type: 'string',
          description: 'Para personas con lectores de pantalla y para Google. Ej.: Labial rojo carmesí abierto',
        }),
      ],
    }),
    defineField({
      name: 'price',
      title: 'Precio de esta opción (opcional)',
      type: 'number',
      description: 'Solo si cuesta distinto al precio del producto. Ej.: 52000',
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: 'originalPrice',
      title: 'Precio antes de esta opción (opcional)',
      type: 'number',
      description: 'Se muestra tachado. Ej.: 60000',
      validation: (Rule) => Rule.min(0).custom(originalPriceAbovePrice).warning(),
    }),
    defineField({
      name: 'sku',
      title: 'Código / referencia (opcional)',
      type: 'string',
      description: 'Ej.: LAB-ROJO-01',
    }),
    defineField({
      name: 'available',
      title: '¿Disponible?',
      type: 'boolean',
      initialValue: true,
      description: 'Apágalo si esta opción está agotada.',
    }),
  ],
  preview: {
    select: { title: 'name', available: 'available', price: 'price', media: 'image' },
    prepare({ title, available, price, media }) {
      const parts = [available === false ? 'Agotada' : 'Disponible'];
      if (typeof price === 'number') parts.push(`Precio propio: ${price}`);
      return { title: title || 'Opción sin nombre', subtitle: parts.join(' · '), media };
    },
  },
});
