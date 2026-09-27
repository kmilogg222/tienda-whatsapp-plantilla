'use client';

import { NextStudio } from 'next-sanity/studio';
import sanityConfig from '../../../../sanity.config';
import { isSanityConfigured } from '@/lib/sanity.client';
import { AdminSetupGuide } from '@/components';

export const dynamic = 'force-dynamic';

export default function AdminStudioPage() {
  // Si no se han configurado credenciales de Sanity, muestra la guía amigable paso a paso
  if (!isSanityConfigured) {
    return <AdminSetupGuide />;
  }

  // Si está configurado, monta el estudio interactivo completo
  return <NextStudio config={sanityConfig} />;
}
