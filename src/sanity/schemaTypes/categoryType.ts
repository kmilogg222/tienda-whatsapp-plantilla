import { defineField, defineType } from 'sanity';
import { orderRankField, orderRankOrdering } from '@sanity/orderable-document-list';
import { CATEGORY_ICONS, DEFAULT_CATEGORY_ICON, toSanityList } from '../../lib/contentOptions';

export const categoryType = defineType({
  name: 'category',
  title: 'Categorías',
  type: 'document',
  orderings: [orderRankOrdering],
  fields: [
    // Orden manual (se cambia arrastrando en la lista de categorías)
    orderRankField({ type: 'category' }),
    defineField({
      name: 'name',
      title: 'Nombre de la Categoría',
      type: 'string',
      description: 'Ej.: Labios, Rostro, Cuidado de la piel, Cabello',
      validation: (Rule) => Rule.required().error('El nombre de la categoría es obligatorio'),
    }),
    defineField({
      name: 'slug',
      title: 'Identificador URL (Slug)',
      type: 'slug',
      description: 'Se crea solo desde el nombre con el botón "Generate". Ej.: labios',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('El slug es obligatorio'),
    }),
    defineField({
      name: 'icon',
      title: 'Ícono',
      type: 'string',
      initialValue: DEFAULT_CATEGORY_ICON,
      description: 'Se muestra junto al nombre en los botones de categorías. Ej.: 🎨 Paleta para maquillaje',
      options: { list: toSanityList(CATEGORY_ICONS) },
    }),
    defineField({
      name: 'image',
      title: 'Foto (opcional)',
      type: 'image',
      description: 'Se usa en la sección "Categorías" de la portada. Recomendado: cuadrada, 600 × 600 px.',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Descripción (Opcional)',
      type: 'string',
      description: 'Ej.: Labiales, delineadores y bálsamos',
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'slug.current',
      media: 'image',
    },
  },
});
