import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Regla de la plantilla: todo texto visible de la tienda sale de
 * `settings.labels` (editable en el panel). Esta prueba busca texto escrito
 * directamente dentro de etiquetas JSX en los componentes de la tienda.
 * Los textos para lectores de pantalla (aria-label) no se revisan aquí.
 */

const ROOT = join(__dirname, '../..');

/** Pantallas que ve solo la dueña, antes de configurar la tienda. */
const ALLOWED_FILES = new Set([
  'components/AdminSetupGuide.tsx', // guía para conectar Sanity (aún no hay panel)
  'components/DemoModeBanner.tsx', // solo en modo demostración
]);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return name.endsWith('.tsx') ? [path] : [];
  });
}

const LETTERS = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ¿¡]/;

function findHardcodedText(source: string): string[] {
  const found: string[] = [];
  const lines = source.split('\n');

  lines.forEach((line, i) => {
    // Texto entre etiquetas o antes de un dato: <span>Hola</span>, <span>Ref: {sku}</span>
    for (const match of line.matchAll(/(?<!=)>([^<>{}]+)(?:<\/|\{)/g)) {
      if (LETTERS.test(match[1])) found.push(`${i + 1}: ${match[1].trim()}`);
    }
    // Línea que solo contiene texto dentro de un bloque JSX
    const trimmed = line.trim();
    const previous = lines.slice(0, i).reverse().find((l) => l.trim() !== '')?.trim() ?? '';
    if (
      /^[A-Za-zÁÉÍÓÚÑáéíóúñ¿¡][^=;(){}<>]*$/.test(trimmed) &&
      previous.endsWith('>') &&
      !previous.startsWith('//') &&
      !trimmed.startsWith('*')
    ) {
      found.push(`${i + 1}: ${trimmed}`);
    }
  });
  return found;
}

const files = [...tsxFiles(join(ROOT, 'components')), ...tsxFiles(join(ROOT, 'app'))]
  .map((path) => relative(ROOT, path).replace(/\\/g, '/'))
  .filter((path) => !ALLOWED_FILES.has(path) && !path.startsWith('app/admin/'));

describe('textos visibles', () => {
  it('encuentra los archivos de la tienda', () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it.each(files)('%s no tiene textos escritos directamente', (file) => {
    expect(findHardcodedText(readFileSync(join(ROOT, file), 'utf8'))).toEqual([]);
  });

  it('detecta un texto escrito directamente (control de la prueba)', () => {
    expect(findHardcodedText('<span>Envíos Seguros</span>')).toHaveLength(1);
    expect(findHardcodedText('<h2>\n  Tu tienda aún no tiene productos\n</h2>')).toHaveLength(1);
    expect(findHardcodedText('<span>Ref: {product.sku}</span>')).toHaveLength(1);
    expect(findHardcodedText('<span>{labels.orderButton}</span>')).toEqual([]);
    expect(findHardcodedText('const f = (a) => { return a; }')).toEqual([]);
  });
});
