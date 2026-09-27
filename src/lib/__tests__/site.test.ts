import { describe, expect, it } from 'vitest';
import { getSiteUrl } from '@/lib/site';

describe('getSiteUrl', () => {
  it('prioriza la URL definida a mano', () => {
    expect(
      getSiteUrl({
        siteUrl: 'https://mitienda.com',
        vercelProductionUrl: 'mitienda.vercel.app',
        netlifyUrl: 'https://mitienda.netlify.app',
      })
    ).toBe('https://mitienda.com');
  });

  it('usa el dominio de producción de Vercel (viene sin protocolo)', () => {
    expect(getSiteUrl({ vercelProductionUrl: 'mitienda.vercel.app' })).toBe('https://mitienda.vercel.app');
  });

  it('usa la URL de Netlify si no hay otra', () => {
    expect(getSiteUrl({ netlifyUrl: 'https://mitienda.netlify.app' })).toBe('https://mitienda.netlify.app');
  });

  it('usa localhost si no hay ninguna variable', () => {
    expect(getSiteUrl({})).toBe('http://localhost:3000');
  });

  it('ignora valores vacíos y quita la barra final', () => {
    expect(getSiteUrl({ siteUrl: '  ', vercelProductionUrl: 'mitienda.vercel.app/' })).toBe(
      'https://mitienda.vercel.app'
    );
    expect(getSiteUrl({ siteUrl: 'http://localhost:3000/' })).toBe('http://localhost:3000');
  });
});
