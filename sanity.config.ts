import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { schemaTypes } from './src/sanity/schemaTypes';
import { structure } from './src/sanity/structure';
import { SINGLETON_TYPES } from './src/sanity/singletons';
import { primerosPasosTool } from './src/sanity/tools/PrimerosPasos';

// Identificadores de Sanity CMS
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'dummy-project-id';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

// Acciones permitidas en Configuración y Portada (no se pueden duplicar ni borrar)
const SINGLETON_ACTIONS = new Set(['publish', 'discardChanges', 'restore']);

export default defineConfig({
  basePath: '/admin',
  name: 'panel-tienda',
  title: 'Panel de mi tienda',
  projectId,
  dataset,
  plugins: [structureTool({ title: 'Contenido', structure })],
  tools: (prev) => [...prev, primerosPasosTool],
  schema: {
    types: schemaTypes,
  },
  document: {
    // Configuración y Portada no aparecen en el botón "Crear"
    newDocumentOptions: (prev, { creationContext }) =>
      creationContext.type === 'global' ? prev.filter((item) => !SINGLETON_TYPES.has(item.templateId)) : prev,
    actions: (prev, { schemaType }) =>
      SINGLETON_TYPES.has(schemaType) ? prev.filter(({ action }) => action && SINGLETON_ACTIONS.has(action)) : prev,
  },
});
