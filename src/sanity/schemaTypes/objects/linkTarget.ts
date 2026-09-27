import { defineField, defineType } from 'sanity';
import { LINK_TYPES, toSanityList } from '../../../lib/contentOptions';

type LinkParent = { linkType?: string } | undefined;
const unless = (type: string) => ({ parent }: { parent?: unknown }) => (parent as LinkParent)?.linkType !== type;

/** Destino de un botón o banner: categoría, marca, producto, catálogo o enlace externo. */
export const linkTargetType = defineType({
  name: 'linkTarget',
  title: 'Destino',
  type: 'object',
  fields: [
    defineField({
      name: 'linkType',
      title: '¿A dónde lleva?',
      type: 'string',
      initialValue: 'catalog',
      options: { list: toSanityList(LINK_TYPES), layout: 'radio' },
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'reference',
      to: [{ type: 'category' }],
      hidden: unless('category'),
    }),
    defineField({
      name: 'brand',
      title: 'Marca',
      type: 'reference',
      to: [{ type: 'brand' }],
      hidden: unless('brand'),
    }),
    defineField({
      name: 'product',
      title: 'Producto',
      type: 'reference',
      to: [{ type: 'product' }],
      hidden: unless('product'),
    }),
    defineField({
      name: 'url',
      title: 'Dirección web',
      type: 'url',
      description: 'Ej.: https://instagram.com/mitienda',
      hidden: unless('url'),
      validation: (Rule) => Rule.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
    }),
  ],
});
