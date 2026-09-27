import type { Metadata, Viewport } from 'next';
import { dataset, getStoreSettings, isSanityConfigured, projectId } from '@/lib/sanity.client';
import { cartStorageKey } from '@/lib/cart';
import { CartProvider } from '@/components/cart/CartProvider';
import { DemoModeBanner } from '@/components/DemoModeBanner';
import { StoreSettingsProvider } from '@/components/StoreSettingsProvider';
import { Analytics } from '@/components/Analytics';
import { buildTheme, getThemeMeta, themeToCss } from '@/lib/theme';
import { rootMetadata } from '@/lib/catalog/seo';
import { getSiteUrl } from '@/lib/site';
import { FONT_CLASSES } from './fonts';
import './styles/tokens.css';
import './styles/base.css';
import './styles/header.css';
import './styles/catalog.css';
import './styles/home.css';
import './styles/product.css';
import './styles/footer.css';
import './styles/cart.css';
import './styles/states.css';

// Render dinámico: lo publicado en Sanity se ve al recargar
export const dynamic = 'force-dynamic';

/**
 * Metadatos por defecto de todas las páginas: dirección base (getSiteUrl),
 * vista previa con la "Imagen para compartir" y verificación de Google.
 * Cada página puede reemplazar título, descripción y vista previa.
 */
export async function generateMetadata(): Promise<Metadata> {
  return rootMetadata(await getStoreSettings(), getSiteUrl());
}

// Sin maximumScale: la persona puede hacer zoom (accesibilidad)
export async function generateViewport(): Promise<Viewport> {
  const { themeColor, colorScheme } = getThemeMeta(await getStoreSettings());
  return {
    width: 'device-width',
    initialScale: 1,
    themeColor,
    colorScheme,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();

  // Colores, fuentes y formas del tema activo, calculados y validados en el servidor
  const themeCss = themeToCss(buildTheme(settings));

  return (
    <html lang="es" data-scroll-behavior="smooth" className={FONT_CLASSES[settings.fontPairing]}>
      <head>
        <style id="store-theme" dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          {settings.labels.skipToContent}
        </a>
        {!isSanityConfigured && <DemoModeBanner />}
        <StoreSettingsProvider settings={settings}>
          <CartProvider settings={settings} storageKey={cartStorageKey(projectId, dataset)}>
            {children}
          </CartProvider>
        </StoreSettingsProvider>
        {/* Google Analytics y píxel de Meta: solo si se configuraron en el panel */}
        <Analytics googleAnalyticsId={settings.googleAnalyticsId} metaPixelId={settings.metaPixelId} />
      </body>
    </html>
  );
}
