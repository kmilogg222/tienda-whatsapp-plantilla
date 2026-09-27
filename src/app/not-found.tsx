import Link from 'next/link';
import { SearchX } from 'lucide-react';
import { getStoreSettings } from '@/lib/sanity.client';
import { CATALOG_PATH } from '@/lib/links';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

/** Página "no encontrada" (enlace roto o producto borrado/oculto). Textos: Configuración → Textos → Avisos. */
export default async function NotFound() {
  const settings = await getStoreSettings();
  const { labels } = settings;

  return (
    <>
      <Header settings={settings} />
      <main className="container" id="main-content">
        <section className="empty-state store-status">
          <div className="empty-state-icon" aria-hidden="true">
            <SearchX size={28} />
          </div>
          <h1>{labels.notFoundTitle}</h1>
          <p>{labels.notFoundText}</p>
          <Link href={CATALOG_PATH} className="btn-secondary">
            {labels.backToCatalog}
          </Link>
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
