/**
 * Esqueleto de la portada mientras cargan las secciones. Solo en la portada:
 * en la ficha, un esqueleto haría que un producto inexistente respondiera
 * "200" en lugar de "404" (ver docs de Next: loading.js → Status Codes).
 */
export default function Loading() {
  return (
    <div className="skeleton-page" aria-busy="true">
      <div className="skeleton skeleton-header" />
      <div className="container">
        <div className="skeleton skeleton-hero" />
        <div className="skeleton-circles">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton skeleton-circle" />
          ))}
        </div>
        <div className="skeleton skeleton-line skeleton-title" />
        <div className="products-grid">
          {Array.from({ length: 4 }, (_, i) => (
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
