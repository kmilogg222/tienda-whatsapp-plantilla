import React from 'react';
import { BadgeCheck } from 'lucide-react';
import type { HomeSection } from '@/types/catalog';
import { Icon } from '../Icon';
import { SectionHeading } from './SectionHeading';

interface InfoBlocksProps {
  section: Extract<HomeSection, { type: 'infoBlocks' }>;
}

/** Bloques con ícono, título y texto (ej. "Pago contra entrega"). */
export const InfoBlocks: React.FC<InfoBlocksProps> = ({ section }) => {
  const headingId = `seccion-${section.key}`;
  // Columnas en computador: hasta 4 en una fila; 5 o 6 bloques quedan en filas de 3
  const columns = section.items.length <= 4 ? section.items.length : 3;

  return (
    <section className="home-section container" aria-labelledby={section.title ? headingId : undefined}>
      <SectionHeading id={headingId} title={section.title} />
      <ul className="info-blocks" data-columns={columns}>
        {section.items.map((item) => (
          <li key={item.key} className="info-block">
            <span className="info-block-icon" aria-hidden="true">
              <Icon name={item.icon} size={22} fallback={BadgeCheck} />
            </span>
            {section.title ? (
              <h3 className="info-block-title">{item.title}</h3>
            ) : (
              <h2 className="info-block-title">{item.title}</h2>
            )}
            {item.text && <p className="info-block-text">{item.text}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
};
