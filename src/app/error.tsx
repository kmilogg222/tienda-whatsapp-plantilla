'use client';

import { useEffect } from 'react';
import { CloudOff } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useStoreSettings } from '@/components/StoreSettingsProvider';

/** Pantalla amable si una página falla (ej. Sanity no responde). Textos: Configuración → Textos → Avisos. */
export default function ErrorPage({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  const settings = useStoreSettings();
  const { labels } = settings;

  useEffect(() => {
    console.error('[catálogo] Error al mostrar la página:', error);
  }, [error]);

  return (
    <>
      <Header settings={settings} />
      <main className="container" id="main-content">
        <section className="empty-state store-status" role="alert">
          <div className="empty-state-icon" aria-hidden="true">
            <CloudOff size={28} />
          </div>
          <h1>{labels.loadErrorTitle}</h1>
          <p>{labels.loadErrorText}</p>
          <button type="button" className="btn-secondary" onClick={() => retry()}>
            {labels.retryButton}
          </button>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
