import React from 'react';
import { X } from 'lucide-react';
import type { StoreSettings } from '@/types/catalog';
import type { CatalogFacets, CatalogFilters } from '@/lib/catalog/filters';
import { normalizeText } from '@/lib/catalog/filters';
import { formatPrice } from '@/lib/format';
import type { FilterChange } from './FilterPanel';

interface ActiveFilterChipsProps {
  filters: CatalogFilters;
  facets: CatalogFacets;
  settings: StoreSettings;
  onChange: FilterChange;
  onClearAll: () => void;
}

/** Filtros elegidos como etiquetas con "x" para quitarlos uno a uno, y "Limpiar todo". */
export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  facets,
  settings,
  onChange,
  onClearAll,
}) => {
  const { labels } = settings;
  const price = (value: number) => formatPrice(value, settings);
  const brandName = (slug: string) => facets.brands.find((b) => b.value === slug)?.label ?? slug;

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...(filters.brands ?? []).map((brand) => ({
      key: `marca-${brand}`,
      label: brandName(brand),
      remove: () => onChange({ brands: filters.brands!.filter((b) => b !== brand) }),
    })),
    ...(filters.tags ?? []).map((tag) => ({
      key: `etiqueta-${tag}`,
      label: tag,
      remove: () => onChange({ tags: filters.tags!.filter((t) => normalizeText(t) !== normalizeText(tag)) }),
    })),
  ];
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const { minPrice: min, maxPrice: max } = filters;
    chips.push({
      key: 'precio',
      label:
        min !== undefined && max !== undefined
          ? `${price(min)} – ${price(max)}`
          : min !== undefined
            ? `${labels.priceFrom} ${price(min)}`
            : `${labels.priceUpTo} ${price(max!)}`,
      remove: () => onChange({ minPrice: undefined, maxPrice: undefined }),
    });
  }
  if (filters.offers) chips.push({ key: 'oferta', label: labels.filterOffers, remove: () => onChange({ offers: false }) });
  if (filters.available) {
    chips.push({ key: 'disponible', label: labels.filterAvailable, remove: () => onChange({ available: false }) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="active-filters">
      <ul className="active-filters-list">
        {chips.map((chip) => (
          <li key={chip.key}>
            <button type="button" className="filter-chip" onClick={chip.remove} aria-label={`Quitar filtro: ${chip.label}`}>
              <span>{chip.label}</span>
              <X size={14} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="filter-clear-all" onClick={onClearAll}>
        {labels.clearFilters}
      </button>
    </div>
  );
};
