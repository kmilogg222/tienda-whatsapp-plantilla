import { defineArrayMember, defineField, defineType } from 'sanity';
import { HOME_SECTION_NAMES } from './objects/homeSections';

export const homePageType = defineType({
  name: 'homePage',
  title: 'Portada',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Secciones de la portada',
      type: 'array',
      description:
        'Agrega las secciones que quieres en tu página de inicio y arrástralas para ordenarlas. Si no agregas ninguna, se muestra una portada automática con tus categorías y novedades.',
      of: HOME_SECTION_NAMES.map((type) => defineArrayMember({ type })),
    }),
  ],
  preview: {
    select: { sections: 'sections' },
    prepare: ({ sections }) => ({
      title: 'Portada',
      subtitle: `${sections?.length ?? 0} sección(es)`,
    }),
  },
});
