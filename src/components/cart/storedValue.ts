import { useSyncExternalStore } from 'react';

/**
 * Valor guardado en el navegador (localStorage) que React puede leer.
 * Si el navegador no deja guardar (modo privado, almacenamiento bloqueado),
 * el valor vive en memoria mientras la página esté abierta.
 * Se sincroniza entre pestañas con el evento "storage".
 */
export interface StoredValue<T> {
  get: () => T;
  set: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  serverValue: T;
}

export function createStoredValue<T>(
  key: string,
  parse: (raw: string | null) => T,
  serialize: (value: T) => string
): StoredValue<T> {
  const listeners = new Set<() => void>();
  let memory: string | null = null;
  let cache: { raw: string | null; value: T } | null = null;
  const serverValue = parse(null);

  const readRaw = (): string | null => {
    try {
      return window.localStorage.getItem(key) ?? memory;
    } catch {
      return memory;
    }
  };

  const get = () => {
    const raw = readRaw();
    if (!cache || cache.raw !== raw) cache = { raw, value: parse(raw) };
    return cache.value;
  };

  const set = (value: T) => {
    const raw = serialize(value);
    memory = raw;
    try {
      window.localStorage.setItem(key, raw);
    } catch {
      // Sin almacenamiento: queda en memoria
    }
    cache = { raw, value };
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  };

  return { get, set, subscribe, serverValue };
}

/** Lee el valor guardado. En el servidor (y al hidratar) devuelve el valor vacío. */
export function useStoredValue<T>(store: StoredValue<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, () => store.serverValue);
}
