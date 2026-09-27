import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { TrustBadge } from '@/types/catalog';
import { Icon } from '../Icon';

/** Sellos de confianza (Configuración → Confianza). Sin sellos no se muestra nada. */
export const TrustBadges: React.FC<{ badges: TrustBadge[] }> = ({ badges }) => {
  if (badges.length === 0) return null;
  return (
    <ul className="trust-badges-grid">
      {badges.map((badge, index) => (
        <li key={index} className="trust-badge-item">
          <Icon name={badge.icon} size={20} fallback={BadgeCheck} />
          <span>{badge.text}</span>
        </li>
      ))}
    </ul>
  );
};
