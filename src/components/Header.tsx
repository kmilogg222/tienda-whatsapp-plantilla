import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, Truck } from 'lucide-react';
import { StoreSettings } from '@/types/catalog';
import { createGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { resolveLink } from '@/lib/links';
import { Icon } from './Icon';
import { HeaderSearchButton } from './HeaderSearchButton';
import { CartButton } from './cart/CartButton';

interface HeaderProps {
  settings: StoreSettings;
}

/** Franja superior: texto con ícono, y enlace si se eligió un destino en el panel. */
const AnnouncementBar: React.FC<{ settings: StoreSettings }> = ({ settings }) => {
  const { announcement } = settings;
  const link = resolveLink(announcement.link);
  const content = (
    <>
      <Icon name={announcement.icon} size={14} fallback={Truck} />
      <span>{announcement.text}</span>
    </>
  );

  return (
    <aside className="announcement-bar">
      {link ? (
        <Link
          href={link.href}
          className="announcement-link"
          {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {content}
        </Link>
      ) : (
        content
      )}
    </aside>
  );
};

export const Header: React.FC<HeaderProps> = ({ settings }) => {
  const whatsappUrl = createGeneralWhatsAppUrl(settings);

  return (
    <>
      {settings.announcement.enabled && <AnnouncementBar settings={settings} />}

      <header className="site-header">
        <div className="container site-header-inner">
          {/* Logo o nombre (no es <h1>: el título principal lo pone cada página) */}
          <Link href="/" className="header-brand" aria-label={settings.storeName}>
            {settings.logo ? (
              <Image
                src={settings.logo}
                alt={settings.storeName}
                width={280}
                height={76}
                className="brand-logo-image"
                priority
              />
            ) : (
              <span className="brand-text">
                <span className="brand-name">{settings.storeName}</span>
                {settings.tagline && <span className="brand-tagline">{settings.tagline}</span>}
              </span>
            )}
          </Link>

          <div className="header-actions">
            <HeaderSearchButton />

            {/* Carrito (solo si está activado en Configuración → WhatsApp y pedidos) */}
            {settings.cartEnabled && <CartButton />}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="header-cta-btn"
              id="btn-header-whatsapp"
            >
              <MessageCircle size={18} aria-hidden="true" />
              <span className="header-cta-text">{settings.labels.contactButton}</span>
            </a>
          </div>
        </div>
      </header>
    </>
  );
};
