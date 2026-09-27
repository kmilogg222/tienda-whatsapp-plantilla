import { getProductsByIds } from '@/lib/sanity.client';
import { MAX_CART_LINES } from '@/lib/cart';

// Siempre datos frescos: el carrito compara precios y disponibilidad
export const dynamic = 'force-dynamic';

/**
 * Datos actuales de los productos del carrito: /api/carrito?ids=a,b,c
 * El carrito vive en el navegador; aquí solo se consultan precios, nombres y disponibilidad.
 */
export async function GET(request: Request) {
  const ids = [
    ...new Set(
      (new URL(request.url).searchParams.get('ids') ?? '')
        .split(',')
        .map((id) => id.trim())
        .filter((id) => /^[\w.-]{1,128}$/.test(id))
    ),
  ].slice(0, MAX_CART_LINES);

  try {
    const products = await getProductsByIds(ids);
    return Response.json({ products }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return Response.json({ products: null }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
