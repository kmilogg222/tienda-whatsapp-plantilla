'use client';

import React, { useId, useState } from 'react';
import type { StoreSettings } from '@/types/catalog';
import type { CatalogFacets, CatalogFilters } from '@/lib/catalog/filters';
import { normalizeText } from '@/lib/catalog/filters';
import { formatPrice } from '@/lib/format';

export type FilterChange = (patch: Partial<CatalogFilters>) => void;

/** Qué filtros se muestran: los activados en el panel y que tengan opciones en este catálogo. */
export function visibleFilterGroups(settings: StoreSettings, facets: CatalogFacets, filters: CatalogFilters) {
  const enabled = new Set(settings.enabledFilters);
  return {
    brand: enabled.has('brand') && (facets.brands.length >= 2 || (filters.brands?.length ?? 0) > 0),
    price: enabled.has('price') && facets.price !== null && facets.price.min < facets.price.max,
    offers: enabled.has('offers') && (facets.offersCount > 0 || !!filters.offers),
    tags: enabled.has('tags') && facets.tags.length > 0,
    availability: enabled.has('availability') && (facets.hasUnavailable || !!filters.available),
  };
}

export const hasVisibleFilters = (groups: ReturnType<typeof visibleFilterGroups>) => Object.values(groups).some(Boolean);

const toggle = (list: string[] | undefined, value: string) =>
  list?.includes(value) ? list.filter((v) => v !== value) : [...(list ?? []), value];

/** Casilla con texto y número de productos. */
const CheckOption: React.FC<{ checked: boolean; label: string; count?: number; onChange: () => void }> = ({
  checked,
  label,
  count,
  onChange,
}) => (
  <label className={`filter-check${checked ? ' is-checked' : ''}`}>
    <input type="checkbox" checked={checked} onChange={onChange} />
    <span className="filter-check-label">{label}</span>
    {count !== undefined && <span className="filter-check-count">{count}</span>}
  </label>
);

/** Precio mínimo y máximo. Se aplica al salir de la casilla o con Enter. */
const PriceFilter: React.FC<{
  filters: CatalogFilters;
  range: { min: number; max: number };
  settings: StoreSettings;
  onChange: FilterChange;
}> = ({ filters, range, settings, onChange }) => {
  const id = useId();
  const [min, setMin] = useState(filters.minPrice?.toString() ?? '');
  const [max, setMax] = useState(filters.maxPrice?.toString() ?? '');
  const { labels } = settings;

  const parse = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits ? Number(digits) : undefined;
  };
  const apply = () => {
    let minPrice = parse(min);
    let maxPrice = parse(max);
    if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
    if (minPrice !== filters.minPrice || maxPrice !== filters.maxPrice) onChange({ minPrice, maxPrice });
  };

  return (
    <form
      className="filter-price"
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <label htmlFor={`${id}-min`} className="filter-price-field">
        <span>{labels.filterPriceMin}</span>
        <input
          id={`${id}-min`}
          inputMode="numeric"
          autoComplete="off"
          value={min}
          placeholder={formatPrice(range.min, settings)}
          onChange={(e) => setMin(e.target.value)}
          onBlur={apply}
        />
      </label>
      <label htmlFor={`${id}-max`} className="filter-price-field">
        <span>{labels.filterPriceMax}</span>
        <input
          id={`${id}-max`}
          inputMode="numeric"
          autoComplete="off"
          value={max}
          placeholder={formatPrice(range.max, settings)}
          onChange={(e) => setMax(e.target.value)}
          onBlur={apply}
        />
      </label>
      {/* Enter en el teclado del celular aplica el precio */}
      <button type="submit" hidden />
    </form>
  );
};

interface FilterPanelProps {
  filters: CatalogFilters;
  facets: CatalogFacets;
  settings: StoreSettings;
  onChange: FilterChange;
}

/** Grupos de filtros con sus opciones y cuántos productos quedarían al elegir cada una. */
export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, facets, settings, onChange }) => {
  const { labels } = settings;
  const groups = visibleFilterGroups(settings, facets, filters);
  const selectedTags = new Set((filters.tags ?? []).map(normalizeText));

  return (
    <div className="filter-panel">
      {(groups.offers || groups.availability) && (
        <fieldset className="filter-group">
          <legend className="sr-only">{labels.filtersTitle}</legend>
          {groups.offers && (
            <CheckOption
              checked={!!filters.offers}
              label={labels.filterOffers}
              count={facets.offersCount}
              onChange={() => onChange({ offers: !filters.offers })}
            />
          )}
          {groups.availability && (
            <CheckOption
              checked={!!filters.available}
              label={labels.filterAvailable}
              count={facets.availableCount}
              onChange={() => onChange({ available: !filters.available })}
            />
          )}
        </fieldset>
      )}

      {groups.brand && (
        <fieldset className="filter-group">
          <legend className="filter-group-title">{labels.filterBrandTitle}</legend>
          {facets.brands.map((brand) => (
            <CheckOption
              key={brand.value}
              checked={!!filters.brands?.includes(brand.value)}
              label={brand.label}
              count={brand.count}
              onChange={() => onChange({ brands: toggle(filters.brands, brand.value) })}
            />
          ))}
        </fieldset>
      )}

      {groups.price && facets.price && (
        <fieldset className="filter-group">
          <legend className="filter-group-title">{labels.filterPriceTitle}</legend>
          <PriceFilter
            key={`${filters.minPrice}-${filters.maxPrice}`}
            filters={filters}
            range={facets.price}
            settings={settings}
            onChange={onChange}
          />
        </fieldset>
      )}

      {groups.tags && (
        <fieldset className="filter-group">
          <legend className="filter-group-title">{labels.filterTagsTitle}</legend>
          <div className="filter-tags">
            {facets.tags.map((tag) => {
              const checked = selectedTags.has(normalizeText(tag.value));
              return (
                <label key={tag.value} className={`filter-tag${checked ? ' is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() =>
                      onChange({
                        tags: checked
                          ? (filters.tags ?? []).filter((t) => normalizeText(t) !== normalizeText(tag.value))
                          : [...(filters.tags ?? []), tag.value],
                      })
                    }
                  />
                  <span>{tag.label}</span>
                  <span className="filter-tag-count">{tag.count}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
    </div>
  );
};
