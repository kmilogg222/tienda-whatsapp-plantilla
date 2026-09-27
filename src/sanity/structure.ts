import type { ComponentType } from 'react';
import type { StructureBuilder, StructureResolver, StructureResolverContext } from 'sanity/structure';
import { orderableDocumentListDeskItem } from '@sanity/orderable-document-list';
import { CogIcon } from '@sanity/icons/Cog';
import { HomeIcon } from '@sanity/icons/Home';
import { PackageIcon } from '@sanity/icons/Package';
import { FolderIcon } from '@sanity/icons/Folder';
import { TagIcon } from '@sanity/icons/Tag';
import { ThListIcon } from '@sanity/icons/ThList';
import { WarningOutlineIcon } from '@sanity/icons/WarningOutline';
import { EyeClosedIcon } from '@sanity/icons/EyeClosed';
import { StarIcon } from '@sanity/icons/Star';
import { SINGLETON_IDS } from './singletons';

const API_VERSION = '2024-01-01';

/**
 * Abre el documento único de un tipo. Si ya existe uno (p. ej. la configuración
 * creada antes de esta versión, con un ID aleatorio) se abre ese; si no, se crea
 * con el ID fijo. La web usa el mismo criterio (el más antiguo).
 */
function singletonItem(
  S: StructureBuilder,
  context: StructureResolverContext,
  type: keyof typeof SINGLETON_IDS,
  title: string,
  icon: ComponentType
) {
  return S.listItem()
    .id(type)
    .title(title)
    .icon(icon)
    .child(async () => {
      const client = context.getClient({ apiVersion: API_VERSION });
      const existingId = await client.fetch<string | null>(
        `*[_type == $type] | order(_createdAt asc) [0]._id`,
        { type }
      );
      const documentId = existingId ? existingId.replace(/^drafts\./, '') : SINGLETON_IDS[type];
      return S.document().schemaType(type).documentId(documentId).title(title);
    });
}

const productList = (S: StructureBuilder, id: string, title: string, filter: string, icon: ComponentType) =>
  S.listItem()
    .id(id)
    .title(title)
    .icon(icon)
    .child(
      S.documentList()
        .id(id)
        .title(title)
        .schemaType('product')
        .filter(`_type == "product" && ${filter}`)
        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
    );

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title('Panel de mi tienda')
    .items([
      singletonItem(S, context, 'storeSettings', 'Configuración de la tienda', CogIcon),
      singletonItem(S, context, 'homePage', 'Portada', HomeIcon),
      S.divider(),
      S.listItem()
        .id('productos')
        .title('Productos')
        .icon(PackageIcon)
        .child(
          S.list()
            .id('productos-menu')
            .title('Productos')
            .items([
              orderableDocumentListDeskItem({
                type: 'product',
                id: 'orderable-product',
                title: 'Todos (arrastra para ordenar)',
                icon: ThListIcon,
                S,
                context,
              }),
              S.divider(),
              productList(S, 'productos-agotados', 'Agotados', 'inStock == false', WarningOutlineIcon),
              productList(S, 'productos-ocultos', 'Ocultos', 'hidden == true', EyeClosedIcon),
              productList(
                S,
                'productos-en-oferta',
                'En oferta',
                'defined(originalPrice) && originalPrice > price',
                StarIcon
              ),
              S.listItem()
                .id('productos-por-categoria')
                .title('Por categoría')
                .icon(FolderIcon)
                .child(
                  S.documentTypeList('category')
                    .id('productos-por-categoria-lista')
                    .title('Elige una categoría')
                    .child((categoryId) =>
                      S.documentList()
                        .id(`productos-de-${categoryId}`)
                        .title('Productos')
                        .schemaType('product')
                        .filter('_type == "product" && category._ref == $categoryId')
                        .params({ categoryId })
                    )
                ),
            ])
        ),
      orderableDocumentListDeskItem({
        type: 'category',
        id: 'orderable-category',
        title: 'Categorías',
        icon: FolderIcon,
        S,
        context,
      }),
      orderableDocumentListDeskItem({
        type: 'brand',
        id: 'orderable-brand',
        title: 'Marcas',
        icon: TagIcon,
        S,
        context,
      }),
    ]);
