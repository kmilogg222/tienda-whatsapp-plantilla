import React from 'react';
import Link from 'next/link';

/** Franja discreta que avisa que se están viendo datos de ejemplo (sin credenciales de Sanity). */
export const DemoModeBanner: React.FC = () => (
  <div className="demo-mode-banner" role="note">
    <strong>Modo demostración:</strong> estás viendo productos de ejemplo.{' '}
    <Link href="/admin">Conecta tu tienda</Link>
  </div>
);
