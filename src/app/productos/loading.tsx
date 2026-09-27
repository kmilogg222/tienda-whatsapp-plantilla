/**
 * Esqueleto del catálogo mientras llegan los productos. Solo en páginas de listado:
 * en la ficha, un esqueleto haría que un producto inexistente respondiera
 * "200" en lugar de "404" (ver docs de Next: loading.js → Status Codes).
 */
export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true">
      <div className="skeleton skeleton-header" />
      <div className="container">
        <div className="skeleton skeleton-search" />
        <div className="skeleton-pills">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton skeleton-pill" />
          ))}
        </div>
        <div className="products-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton skeleton-media" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line is-short" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
