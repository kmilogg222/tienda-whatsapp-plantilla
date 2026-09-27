import React from 'react';
import { Clock, Mail, MapPin, MessageCircle } from 'lucide-react';
import { StoreSettings } from '@/types/catalog';
import { createGeneralWhatsAppUrl } from '@/lib/whatsapp';
import { SOCIAL_NETWORKS, socialUrl } from '@/lib/links';
import { SocialIcon } from './SocialIcon';

interface FooterProps {
  settings: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  const { labels } = settings;
  const currentYear = new Date().getFullYear();
  const about = labels.footerText || settings.tagline;

  const socials = SOCIAL_NETWORKS.map((network) => ({
    ...network,
    url: socialUrl(network.key, settings[network.key]),
  })).filter((network) => network.url);

  const hasContact =
    settings.whatsappNumber || settings.contactEmail || settings.address || settings.openingHours;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-about">
          <p className="footer-brand">{settings.storeName}</p>
          {about && <p className="footer-text">{about}</p>}
        </div>

        {hasContact && (
          <div className="footer-column">
            <h2 className="footer-heading">{labels.footerContactTitle}</h2>
            <ul className="footer-list">
              {settings.whatsappNumber && (
                <li>
                  <a
                    href={createGeneralWhatsAppUrl(settings)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-link"
                    id="btn-footer-whatsapp"
                  >
                    <MessageCircle size={18} aria-hidden="true" />
                    <span>
                      {labels.footerContactLabel} (+{settings.whatsappNumber})
                    </span>
                  </a>
                </li>
              )}
              {settings.contactEmail && (
                <li>
                  <a href={`mailto:${settings.contactEmail}`} className="footer-link">
                    <Mail size={18} aria-hidden="true" />
                    <span>{settings.contactEmail}</span>
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="footer-item">
                  <MapPin size={18} aria-hidden="true" />
                  <span>{settings.address}</span>
                </li>
              )}
              {settings.openingHours && (
                <li className="footer-item">
                  <Clock size={18} aria-hidden="true" />
                  <span>{settings.openingHours}</span>
                </li>
              )}
            </ul>
          </div>
        )}

        {socials.length > 0 && (
          <div className="footer-column">
            <h2 className="footer-heading">{labels.footerSocialTitle}</h2>
            <ul className="footer-social">
              {socials.map((network) => (
                <li key={network.key}>
                  <a
                    href={network.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    aria-label={network.name}
                  >
                    <SocialIcon network={network.key} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="container footer-copyright">
        © {currentYear} {settings.storeName}. {labels.copyrightText}
      </p>
    </footer>
  );
};
