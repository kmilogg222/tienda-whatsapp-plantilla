import type { Metadata } from 'next';
import type { Brand, Category, HomePage as HomePageData } from '@/types/catalog';
import { pageMetadata } from '@/lib/catalog/seo';
import { getSiteUrl } from '@/lib/site';
import { getBrands, getCatalogData, getCategories, getHomePage, getStoreSettings } from '@/lib/sanity.client';
import { FloatingWhatsApp, Footer, Header, StoreStatusMessage } from '@/components';
import { DefaultHome, HomeSections } from '@/components/home';

// Render dinámico: lo publicado en Sanity se ve al recargar
export const dynamic = 'force-dynamic';

/** Título, descripción y vista previa por defecto, con la portada como dirección canónica. */
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata(await getStoreSettings(), getSiteUrl(), { path: '/' });
}

/**
 * Portada. Muestra las secciones armadas en el panel (Portada → Secciones);
 * si no hay ninguna, una portada automática con categorías y novedades.
 * Los enlaces antiguos con filtros (/?categoria=…) se redirigen a /productos (next.config.mjs).
 */
export default async function HomePage() {
  const settings = await getStoreSettings();
  // Si la portada no carga, se usa la automática (los productos pueden estar bien)
  const home: HomePageData = await getHomePage().catch(() => ({ sections: [] }));
  const hasSections = home.sections.length > 0;

  let content: React.ReactNode;
  if (hasSections) {
    const needs = (type: string) => home.sections.some((section) => section.type === type);
    const [categories, brands] = await Promise.all([
      needs('categoryGrid') ? getCategories().catch((): Category[] => []) : [],
      needs('brandStrip') ? getBrands().catch((): Brand[] => []) : [],
    ]);
    content = (
      <>
        {/* Título principal de la página (uno solo por página; visible para lectores de pantalla) */}
        <h1 className="sr-only">{settings.storeName}</h1>
        <HomeSections sections={home.sections} settings={settings} categories={categories} brands={brands} />
      </>
    );
  } else {
    const { products, categories, status } = await getCatalogData();
    content =
      status === 'ok' ? (
        <DefaultHome settings={settings} products={products} categories={categories} />
      ) : (
        <div className="container">
          <h1 className="sr-only">{settings.storeName}</h1>
          <StoreStatusMessage status={status} labels={settings.labels} />
        </div>
      );
  }

  return (
    <>
      <Header settings={settings} />
      <main id="main-content" className="home-main">
        {content}
      </main>
      <FloatingWhatsApp settings={settings} />
      <Footer settings={settings} />
    </>
  );
}
