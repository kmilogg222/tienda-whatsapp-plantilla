'use client';

import React, { useEffect, useState } from 'react';
import { Check, Share2 } from 'lucide-react';

/** Tiempo que se ve el aviso "¡Enlace copiado!". */
const COPIED_MS = 2500;

interface ShareButtonProps {
  title: string;
  label: string;
  copiedLabel: string;
}

/** Copia un texto al portapapeles; con navegadores antiguos usa una caja de texto temporal. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/**
 * Compartir la ficha (con el tono elegido): abre las apps del celular
 * (Web Share) y, si el navegador no puede, copia el enlace.
 */
export const ShareButton: React.FC<ShareButtonProps> = ({ title, label, copiedLabel }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), COPIED_MS);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const share = async () => {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, url });
        return;
      } catch (error) {
        // La persona cerró el menú de compartir: no hacer nada más
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    if (await copyText(url)) setCopied(true);
  };

  return (
    <button type="button" className="btn-share" onClick={share} id="btn-share-product">
      {copied ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
};
