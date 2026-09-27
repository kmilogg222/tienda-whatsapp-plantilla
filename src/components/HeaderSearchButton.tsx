'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { CATALOG_PATH } from '@/lib/links';
import { SEARCH_INPUT_ID } from './catalog/SearchBar';

/**
 * Lupa del encabezado: en el catálogo lleva al buscador y lo activa;
 * en otras páginas abre el catálogo con el buscador activo.
 */
export const HeaderSearchButton: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    const input = document.getElementById(SEARCH_INPUT_ID);
    if (pathname === CATALOG_PATH && input) {
      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    } else {
      router.push(`${CATALOG_PATH}#${SEARCH_INPUT_ID}`);
    }
  };

  return (
    <button type="button" className="header-icon-btn" onClick={handleClick} aria-label="Buscar productos">
      <Search size={20} aria-hidden="true" />
    </button>
  );
};
