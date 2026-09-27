import React, { useId } from 'react';
import { ArrowUpDown } from 'lucide-react';
import type { SortOption } from '@/lib/contentOptions';
import type { StoreLabels } from '@/lib/labels';

/** Texto de cada orden (editable en Configuración → Textos). */
export const SORT_LABELS: Record<SortOption, keyof StoreLabels> = {
  featured: 'sortFeatured',
  newest: 'sortNewest',
  'price-asc': 'sortPriceAsc',
  'price-desc': 'sortPriceDesc',
  'name-asc': 'sortNameAsc',
  discount: 'sortDiscount',
};

interface SortSelectProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  labels: StoreLabels;
}

/** Lista desplegable del orden (la del teléfono: cómoda con el dedo). */
export const SortSelect: React.FC<SortSelectProps> = ({ value, onChange, labels }) => {
  const id = useId();
  return (
    <div className="sort-select">
      <label htmlFor={id} className="sort-select-label">
        {labels.sortLabel}
      </label>
      <span className="sort-select-field">
        <ArrowUpDown size={15} aria-hidden="true" />
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as SortOption)}>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
            <option key={option} value={option}>
              {labels[SORT_LABELS[option]]}
            </option>
          ))}
        </select>
      </span>
    </div>
  );
};
