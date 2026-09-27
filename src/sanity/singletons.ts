/** ID fijo de los documentos únicos (Configuración y Portada). */
export const SINGLETON_IDS = { storeSettings: 'storeSettings', homePage: 'homePage' } as const;

/** Tipos de documento únicos: no se pueden crear, duplicar ni borrar desde el panel. */
export const SINGLETON_TYPES = new Set<string>(Object.keys(SINGLETON_IDS));
