import React from 'react';
import Link from 'next/link';
import { PackageOpen, CloudOff } from 'lucide-react';
import { DEFAULT_LABELS, type StoreLabels } from '@/lib/labels';

interface StoreStatusMessageProps {
  status: 'empty' | 'error';
  /** Textos editables de la tienda */
  labels?: StoreLabels;
}

/**
 * Mensaje que reemplaza al catálogo cuando la tienda real aún no tiene
 * productos o cuando Sanity no responde (nunca se muestran datos de ejemplo).
 */
export const StoreStatusMessage: React.FC<StoreStatusMessageProps> = ({ status, labels = DEFAULT_LABELS }) => {
  if (status === 'empty') {
    return (
      <section className="empty-state store-status">
        <div className="empty-state-icon" aria-hidden="true">
          <PackageOpen size={28} />
        </div>
        <h2>{labels.emptyStoreTitle}</h2>
        <p>{labels.emptyStoreText}</p>
        <Link href="/admin" className="btn-secondary" id="btn-go-admin">
          {labels.emptyStoreButton}
        </Link>
      </section>
    );
  }

  return (
    <section className="empty-state store-status" role="alert">
      <div className="empty-state-icon" aria-hidden="true">
        <CloudOff size={28} />
      </div>
      <h2>{labels.loadErrorTitle}</h2>
      <p>{labels.loadErrorText}</p>
      <a href="" className="btn-secondary" id="btn-retry-catalog">
        {labels.retryButton}
      </a>
    </section>
  );
};
