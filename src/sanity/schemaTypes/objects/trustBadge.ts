import { defineField, defineType } from 'sanity';
import { SERVICE_ICONS, toSanityList } from '../../../lib/contentOptions';

export const trustBadgeType = defineType({
  name: 'trustBadge',
  title: 'Sello de confianza',
  type: 'object',
  fields: [
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      initialValue: 'truck',
      options: { list: toSanityList(SERVICE_ICONS) },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'text',
      title: 'Texto',
      type: 'string',
      description: 'Ej.: Envíos a todo el país, Productos 100% originales, Pago contra entrega',
      validation: (Rule) => Rule.required().max(40).error('Escribe un texto corto (máx. 40 caracteres)'),
    }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'icon' },
  },
});
