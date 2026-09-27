import React from 'react';
import { ChevronDown } from 'lucide-react';
import { InfoSection } from '@/types/catalog';

/**
 * Información extra del producto (Modo de uso, Ingredientes…) en secciones
 * desplegables. Usa <details>: funciona sin JavaScript y con teclado.
 */
export const InfoAccordion: React.FC<{ sections: InfoSection[] }> = ({ sections }) => {
  if (sections.length === 0) return null;
  return (
    <div className="info-accordion">
      {sections.map((section, index) => (
        // La primera sección se muestra abierta
        <details key={index} className="info-accordion-item" open={index === 0}>
          <summary className="info-accordion-summary">
            <span>{section.title}</span>
            <ChevronDown size={18} aria-hidden="true" className="info-accordion-icon" />
          </summary>
          <div className="info-accordion-body">{section.body}</div>
        </details>
      ))}
    </div>
  );
};
