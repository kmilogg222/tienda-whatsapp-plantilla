'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

interface AnalyticsProps {
  /** Ya validado por normalizeSettings (G-…); vacío = no se carga */
  googleAnalyticsId?: string;
  /** Ya validado por normalizeSettings (solo números); vacío = no se carga */
  metaPixelId?: string;
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4 y píxel de Meta, cargados con next/script después de que
 * la página ya se puede usar. Nunca se cargan en el panel (/admin).
 * Los IDs llegan validados (src/lib/tracking.ts): solo letras, números y guiones.
 */
export function Analytics({ googleAnalyticsId, metaPixelId }: AnalyticsProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  // El píxel cuenta la primera visita al cargarse; cada cambio de página
  // dentro de la tienda se cuenta aquí. (Google Analytics 4 los cuenta solo.)
  const firstPath = useRef(pathname);
  useEffect(() => {
    if (!metaPixelId || isAdmin || pathname === firstPath.current) return;
    firstPath.current = '';
    window.fbq?.('track', 'PageView');
  }, [pathname, metaPixelId, isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      {googleAnalyticsId && (
        <>
          <Script
            id="google-analytics-src"
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');`}
          </Script>
        </>
      )}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${metaPixelId}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
