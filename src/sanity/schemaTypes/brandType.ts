import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';

export const brandType = defineType({
  name: 'brand',
  title: 'Marcas',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    // Orden manual (se cambia arrastrando en la lista de marcas)
    orderRankField({ type: 'brand' }),
    defineField({
      name: 'name',
      title: 'Nombre de la marca',
      type: 'string',
      description: 'Ej.: Maybelline, L’Oréal, Vogue, Mi Marca',
      validation: (Rule) => Rule.required().error('El nombre de la marca es obligatorio'),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador para la dirección web',
      type: 'slug',
      description: 'Se crea solo desde el nombre con el botón "Generate". Ej.: maybelline',
      options: { source: 'name', maxLength: 96 },
      validation: (Rule) => Rule.required().error('Haz clic en "Generate" para crearlo'),
    }),
    defineField({
      name: 'logo',
      title: 'Logo (opcional)',
      type: 'image',
      description: 'Preferible PNG con fondo transparente. Se usa en la sección "Marcas" de la portada.',
    }),
    defineField({
      name: 'description',
      title: 'Descripción corta (opcional)',
      type: 'string',
      description: 'Ej.: Maquillaje profesional libre de crueldad animal',
    }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'description', media: 'logo' },
  },
});
