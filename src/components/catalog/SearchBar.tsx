import React from 'react';
import { Search, X } from 'lucide-react';

/** Id del campo de búsqueda: destino de la lupa del encabezado (`/#buscar`). */
export const SEARCH_INPUT_ID = 'buscar';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => {
  return (
    <section className="search-filter-section" aria-label="Buscador del catálogo">
      <div className="search-bar-wrapper">
        <span className="search-icon-left" aria-hidden="true">
          <Search size={18} />
        </span>
        <input
          type="search"
          className="search-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          id={SEARCH_INPUT_ID}
          aria-label="Buscar productos"
          enterKeyHint="search"
        />
        {value.trim() !== '' && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={() => onChange('')}
            aria-label="Borrar búsqueda"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  );
};
