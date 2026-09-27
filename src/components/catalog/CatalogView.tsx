'use client';

import React, { memo, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Category, CatalogStatus, Product, StoreSettings } from '@/types/catalog';
import { CATALOG_ANCHOR } from '@/lib/links';
import { filterAndSortProducts, getFacets, type CatalogFilters } from '@/lib/catalog/filters';
import { countActiveFilters, filtersKey, filtersToQuery, parseFilters } from '@/lib/catalog/urlState';
import { Header } from '../Header';
import { Footer } from '../Footer';
import { FloatingWhatsApp } from '../FloatingWhatsApp';
import { ProductCard } from '../ProductCard';
import { StoreStatusMessage } from '../StoreStatusMessage';
import { SearchBar, SEARCH_INPUT_ID } from './SearchBar';
import { CategoryCarousel } from './CategoryCarousel';
import { SortSelect } from './SortSelect';
import { FilterPanel, hasVisibleFilters, visibleFilterGroups, type FilterChange } from './FilterPanel';
import { FilterSheet } from './FilterSheet';
import { ActiveFilterChips } from './ActiveFilterChips';

/** Espera tras la última tecla antes de guardar la búsqueda en la dirección. */
const SEARCH_URL_DELAY_MS = 400;

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  status?: CatalogStatus;
}

/**
 * Catálogo con buscador, categorías, filtros, orden y "Cargar más".
 * La dirección es la única fuente de los filtros (useSearchParams) y se
 * actualiza con history.pushState, que Next integra con su enrutador
 * (ver docs: Linking and Navigating → Native History API).
 */
export const CatalogView: React.FC<CatalogViewProps> = ({ products, categories, settings, status = 'ok' }) => {
  const { labels } = settings;
  const searchParams = useSearchParams();

  // Filtros de la dirección; se ignoran categorías que ya no existen
  const urlFilters = useMemo(() => {
    const parsed = parseFilters(searchParams, settings.defaultSort);
    if (parsed.category && !categories.some((c) => c.slug === parsed.category)) parsed.category = undefined;
    return parsed;
  }, [searchParams, settings.defaultSort, categories]);

  // Búsqueda: el texto se ve al instante, la lista se actualiza justo después
  // (useDeferredValue) y la dirección al dejar de escribir
  const urlQuery = urlFilters.q ?? '';
  const [search, setSearch] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  // Última búsqueda que este mismo catálogo guardó en la dirección
  const [writtenQuery, setWrittenQuery] = useState(urlQuery);
  if (urlQuery !== syncedQuery) {
    // La dirección cambió (atrás/adelante, "Limpiar todo"): el buscador la sigue
    setSyncedQuery(urlQuery);
    if (urlQuery !== writtenQuery) setSearch(urlQuery);
  }
  const deferredSearch = useDeferredValue(search);

  const writeUrl = useCallback(
    (next: CatalogFilters, mode: 'push' | 'replace') => {
      setWrittenQuery(next.q?.trim() ?? '');
      const query = filtersToQuery(next, settings.defaultSort);
      const url = `${window.location.pathname}${query ? `?${query}` : ''}`;
      if (mode === 'push') window.history.pushState(null, '', url);
      else window.history.replaceState(null, '', url);
    },
    [settings.defaultSort],
  );

  useEffect(() => {
    if (search.trim() === urlQuery) return;
    const timer = window.setTimeout(() => writeUrl({ ...urlFilters, q: search }, 'replace'), SEARCH_URL_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [search, urlQuery, urlFilters, writeUrl]);

  // Llegó con la lupa del encabezado desde otra página (/productos#buscar): activar el buscador
  useEffect(() => {
    if (window.location.hash === `#${SEARCH_INPUT_ID}`) {
      document.getElementById(SEARCH_INPUT_ID)?.focus({ preventScroll: true });
    }
  }, []);

  // Filtros que ve la lista. No cambian con cada tecla, solo cuando la búsqueda diferida se actualiza
  const filters = useMemo<CatalogFilters>(() => ({ ...urlFilters, q: deferredSearch }), [urlFilters, deferredSearch]);
  const changeFilters = useCallback<FilterChange>(
    (patch) => writeUrl({ ...filters, ...patch }, 'push'),
    [filters, writeUrl],
  );
  const clearAll = useCallback(() => {
    setSearch('');
    writeUrl({ sort: filters.sort }, 'push');
  }, [filters.sort, writeUrl]);

  // Encabezado y pie no dependen de la búsqueda: no se vuelven a dibujar al escribir
  const header = useMemo(() => <Header settings={settings} />, [settings]);
  const footer = useMemo(
    () => (
      <>
        <FloatingWhatsApp settings={settings} />
        <Footer settings={settings} />
      </>
    ),
    [settings],
  );

  return (
    <>
      {header}

      <main className="container" id="main-content">
        {status !== 'ok' ? (
          <>
            <h1 className="sr-only">{settings.storeName}</h1>
            <StoreStatusMessage status={status} labels={labels} />
          </>
        ) : (
          <div id={CATALOG_ANCHOR} className="catalog-anchor">
            <SearchBar value={search} onChange={setSearch} placeholder={labels.searchPlaceholder} />
            <CatalogResults
              products={products}
              categories={categories}
              settings={settings}
              filters={filters}
              onChange={changeFilters}
              onClearAll={clearAll}
            />
          </div>
        )}
      </main>

      {footer}
    </>
  );
};

interface CatalogResultsProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  filters: CatalogFilters;
  onChange: FilterChange;
  onClearAll: () => void;
}

/** Categorías, filtros, orden y productos. Memorizado: escribir en el buscador no lo vuelve a dibujar. */
const CatalogResults = memo(function CatalogResults({
  products,
  categories,
  settings,
  filters,
  onChange,
  onClearAll,
}: CatalogResultsProps) {
  const { labels } = settings;
  const results = useMemo(() => filterAndSortProducts(products, filters), [products, filters]);
  const facets = useMemo(() => getFacets(products, filters), [products, filters]);
  const showFilters = hasVisibleFilters(visibleFilterGroups(settings, facets, filters));
  const activeCount = countActiveFilters(filters);

  // "Cargar más": vuelve a la primera página cuando cambian los filtros
  const key = filtersKey(filters);
  const [paging, setPaging] = useState({ key, pages: 1 });
  const pages = paging.key === key ? paging.pages : 1;
  const visible = results.slice(0, pages * settings.pageSize);

  const query = filters.q?.trim();
  const title = query
    ? `${labels.searchResultsTitle} "${query}"`
    : filters.category
      ? (categories.find((c) => c.slug === filters.category)?.name ?? labels.allProductsTitle)
      : filters.brands?.length === 1
        ? (facets.brands.find((b) => b.value === filters.brands![0])?.label ?? labels.allProductsTitle)
        : labels.allProductsTitle;

  const panel = <FilterPanel filters={filters} facets={facets} settings={settings} onChange={onChange} />;

  return (
    <>
      <CategoryCarousel
        categories={categories}
        selectedCategory={filters.category}
        onSelectCategory={(category) => onChange({ category })}
        totalProductsCount={products.length}
        allLabel={labels.allCategories}
      />

      <div className={`catalog-layout${showFilters ? ' has-sidebar' : ''}`}>
        {showFilters && (
          <aside className="filter-sidebar" aria-labelledby="filter-sidebar-title">
            <h2 id="filter-sidebar-title" className="filter-sidebar-title">
              {labels.filtersTitle}
            </h2>
            {panel}
          </aside>
        )}

        <section className="catalog-section" aria-labelledby="catalog-title">
          <div className="catalog-top">
            <div className="catalog-header-info">
              <h1 id="catalog-title">{title}</h1>
              <span className="catalog-count-badge" aria-live="polite">
                {results.length} {results.length === 1 ? labels.productCountOne : labels.productCountMany}
              </span>
            </div>

            <div className="catalog-toolbar">
              {showFilters && (
                <FilterSheet
                  labels={labels}
                  activeCount={activeCount}
                  resultCount={results.length}
                  onClearAll={onClearAll}
                >
                  {panel}
                </FilterSheet>
              )}
              <SortSelect
                value={filters.sort ?? settings.defaultSort}
                onChange={(sort) => onChange({ sort })}
                labels={labels}
              />
            </div>
          </div>

          <ActiveFilterChips
            filters={filters}
            facets={facets}
            settings={settings}
            onChange={onChange}
            onClearAll={onClearAll}
          />

          {results.length > 0 ? (
            <>
              <div className="products-grid">
                {visible.map((product, index) => (
                  <ProductCard key={product._id} product={product} settings={settings} priority={index < 2} />
                ))}
              </div>
              {visible.length < results.length && (
                <div className="catalog-load-more">
                  <button type="button" className="btn-secondary" onClick={() => setPaging({ key, pages: pages + 1 })}>
                    {labels.loadMore}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state" role="status">
              <div className="empty-state-icon" aria-hidden="true">
                <Search size={28} />
              </div>
              <h2>{labels.noResultsTitle}</h2>
              <p>{labels.noResultsText}</p>
              <button type="button" className="btn-secondary" onClick={onClearAll} id="btn-reset-filters">
                {labels.resetFilters}
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
});
