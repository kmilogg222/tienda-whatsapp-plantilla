import React from 'react';
import type { HomeSection, StoreSettings } from '@/types/catalog';
import { SOCIAL_NETWORKS, socialUrl } from '@/lib/links';
import { SocialIcon } from '../SocialIcon';

interface SocialCtaProps {
  section: Extract<HomeSection, { type: 'socialCta' }>;
  settings: StoreSettings;
}

/**
 * Invitación a seguir la tienda. Los enlaces salen de Configuración → Redes y contacto;
 * si no hay ninguna red configurada, la sección no se muestra.
 */
export const SocialCta: React.FC<SocialCtaProps> = ({ section, settings }) => {
  const networks = SOCIAL_NETWORKS.map((network) => ({
    ...network,
    url: socialUrl(network.key, settings[network.key]),
  })).filter((network) => network.url);
  if (networks.length === 0) return null;
  const headingId = `seccion-${section.key}`;

  return (
    <section className="home-section container" aria-labelledby={headingId}>
      <div className="social-cta">
        <h2 id={headingId} className="social-cta-title">
          {section.title}
        </h2>
        {section.text && <p className="social-cta-text">{section.text}</p>}
        <ul className="social-cta-list">
          {networks.map((network) => (
            <li key={network.key}>
              <a href={network.url} target="_blank" rel="noopener noreferrer" className="social-cta-link">
                <SocialIcon network={network.key} />
                <span>{network.name}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
