'use client';

import React, { useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import type { StoreLabels } from '@/lib/labels';

interface FilterSheetProps {
  labels: StoreLabels;
  /** Filtros elegidos (se muestra en el botón: "Filtrar (2)") */
  activeCount: number;
  /** Productos que quedan con los filtros actuales */
  resultCount: number;
  onClearAll: () => void;
  children: React.ReactNode;
}

/**
 * Celular y tableta: botón "Filtrar (n)" que abre un panel desde abajo.
 * Usa <dialog> del navegador: atrapa el foco, se cierra con Escape o tocando afuera.
 */
export const FilterSheet: React.FC<FilterSheetProps> = ({ labels, activeCount, resultCount, onClearAll, children }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        className="filter-open-btn"
        onClick={() => dialogRef.current?.showModal()}
        aria-haspopup="dialog"
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        <span>{labels.filterButton}</span>
        {activeCount > 0 && <span className="filter-open-count">{activeCount}</span>}
      </button>

      <dialog
        ref={dialogRef}
        className="filter-sheet"
        aria-labelledby="filter-sheet-title"
        onClick={(e) => {
          // Tocar el fondo oscuro (fuera del panel) lo cierra
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="filter-sheet-inner">
          <div className="filter-sheet-header">
            <h2 id="filter-sheet-title" className="filter-sheet-title">
              {labels.filtersTitle}
            </h2>
            <button type="button" className="filter-sheet-close" onClick={close} aria-label="Cerrar">
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="filter-sheet-body">{children}</div>
          <div className="filter-sheet-footer">
            {activeCount > 0 && (
              <button type="button" className="btn-secondary" onClick={onClearAll}>
                {labels.clearFilters}
              </button>
            )}
            <button type="button" className="btn-primary filter-sheet-apply" onClick={close}>
              {labels.showResults} ({resultCount})
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};
