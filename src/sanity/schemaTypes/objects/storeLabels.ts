import { defineField, defineType } from 'sanity';
import { LABEL_DEFINITIONS, LABEL_SECTIONS, LabelDefinition } from '../../../lib/labels';

/** Todos los textos editables de la tienda, agrupados en secciones plegables. */
export const storeLabelsType = defineType({
  name: 'storeLabels',
  title: 'Textos de la tienda',
  type: 'object',
  fieldsets: LABEL_SECTIONS.map((section) => ({
    name: section.name,
    title: section.title,
    options: { collapsible: true, collapsed: true },
  })),
  fields: Object.entries(LABEL_DEFINITIONS).map(([name, def]: [string, LabelDefinition & { section: string }]) =>
    defineField({
      name,
      title: def.title,
      description: def.default ? `${def.description} · Por defecto: "${def.default}"` : def.description,
      type: def.multiline ? 'text' : 'string',
      ...(def.multiline ? { rows: 2 } : {}),
      fieldset: def.section,
      ...(def.default ? { initialValue: def.default } : {}),
    })
  ),
});
