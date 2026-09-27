import React from 'react';
import { MessageCircle } from 'lucide-react';
import { StoreSettings } from '@/types/catalog';
import { createGeneralWhatsAppUrl } from '@/lib/whatsapp';

interface FloatingWhatsAppProps {
  settings: StoreSettings;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({ settings }) => {
  const whatsappUrl = createGeneralWhatsAppUrl(settings);

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-floating-btn"
      id="btn-floating-whatsapp"
      aria-label={settings.labels.floatingButtonTooltip}
      title={settings.labels.floatingButtonTooltip}
    >
      <MessageCircle size={28} aria-hidden="true" />
    </a>
  );
};
