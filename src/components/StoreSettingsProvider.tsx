'use client';

import React, { createContext, useContext } from 'react';
import type { StoreSettings } from '@/types/catalog';
import { DEFAULT_SETTINGS } from '@/lib/settings';

const StoreSettingsContext = createContext<StoreSettings>(DEFAULT_SETTINGS);

/**
 * Deja la configuración de la tienda al alcance de las pantallas que no
 * pueden pedirla al servidor (la página de error es un componente de cliente).
 */
export const StoreSettingsProvider: React.FC<{ settings: StoreSettings; children: React.ReactNode }> = ({
  settings,
  children,
}) => <StoreSettingsContext.Provider value={settings}>{children}</StoreSettingsContext.Provider>;

export const useStoreSettings = () => useContext(StoreSettingsContext);
