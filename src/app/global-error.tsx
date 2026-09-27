'use client';

import { DEFAULT_SETTINGS } from '@/lib/settings';
import { buildTheme, themeToCss } from '@/lib/theme';
import './styles/tokens.css';
import './styles/base.css';
import './styles/states.css';

/**
 * Último recurso si falla el propio diseño general de la tienda. Reemplaza al
 * layout, así que no puede leer la configuración: usa los textos y colores
 * por defecto.
 */
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const { labels } = DEFAULT_SETTINGS;

  return (
    <html lang="es">
      <head>
        <title>{labels.loadErrorTitle}</title>
        <style dangerouslySetInnerHTML={{ __html: themeToCss(buildTheme(DEFAULT_SETTINGS)) }} />
      </head>
      <body>
        <main className="container">
          <section className="empty-state store-status" role="alert">
            <h1>{labels.loadErrorTitle}</h1>
            <p>{labels.loadErrorText}</p>
            <button type="button" className="btn-secondary" onClick={() => retry()}>
              {labels.retryButton}
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
