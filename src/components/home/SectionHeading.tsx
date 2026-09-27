import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  id: string;
  title?: string;
  /** Enlace "Ver todo" junto al título */
  action?: { href: string; label: string };
}

/** Título de una sección de la portada, con enlace opcional a la derecha. */
export const SectionHeading: React.FC<SectionHeadingProps> = ({ id, title, action }) => {
  if (!title && !action) return null;
  return (
    <div className="home-section-heading">
      {title && (
        <h2 id={id} className="home-section-title">
          {title}
        </h2>
      )}
      {action && (
        <Link href={action.href} className="home-view-all">
          <span>{action.label}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
};
