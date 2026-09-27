import { defineField, defineType } from 'sanity';

export const infoSectionType = defineType({
  name: 'infoSection',
  title: 'Sección de información',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      description: 'Ej.: Modo de uso, Ingredientes, Advertencias',
      validation: (Rule) => Rule.required().error('Escribe un título'),
    }),
    defineField({
      name: 'body',
      title: 'Texto',
      type: 'text',
      rows: 5,
      description: 'Puedes usar saltos de línea. Ej.: Aplica sobre el rostro limpio con movimientos circulares.',
      validation: (Rule) => Rule.required().error('Escribe el contenido'),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'body' },
  },
});
