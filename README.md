# 🛍️ Tienda en línea con pedidos por WhatsApp

Plantilla gratuita para tener **tu propia tienda en internet** —pensada para tiendas de belleza, pero sirve para cualquier catálogo— con un **panel para administrarla sin saber programar** y pedidos que **llegan a tu WhatsApp**.

![Vista de la tienda](docs/img/00-portada-readme.png)

### ¿Qué incluye?
- 📱 Tienda rápida y pensada primero para el celular.
- 🛒 Carrito que envía todo el pedido en un solo mensaje de WhatsApp (se puede apagar).
- 🎨 Colores, tipografía, formas, portada y todos los textos se cambian desde el panel.
- 💄 Tonos y opciones por producto, marcas, ofertas, filtros y buscador que no se enreda con las tildes.
- 🔎 Lista para Google y para compartir: cada producto sale con foto, nombre y precio.
- 💸 **Costo $0** con los planes gratuitos de Sanity y Vercel (o Netlify). Lee las condiciones en la guía.

## 👉 Empieza aquí

**[Guía de instalación paso a paso](docs/GUIA_INSTALACION.md)** — de cero a tu tienda publicada en unos 45-60 minutos, sin programar.

Atajo para quien ya tiene experiencia (copia la plantilla y publica en un paso; después sigue la guía desde el paso 5):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkmilogg222%2Ftienda-whatsapp-plantilla&env=NEXT_PUBLIC_SANITY_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET&envDescription=Project%20ID%20de%20Sanity%20y%20dataset%20(production)&project-name=mi-tienda&repository-name=mi-tienda)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kmilogg222/tienda-whatsapp-plantilla)

> Tu copia es independiente: no recibe actualizaciones automáticas de esta plantilla.

### Cuando ya tengas tu tienda
- 📖 **[Manual de uso](docs/MANUAL_DE_USUARIO.md)**: productos, tonos, portada, colores, textos, WhatsApp y carrito.
- ⚖️ **[Limitaciones y preguntas](docs/LIMITACIONES_Y_PREGUNTAS.md)**: lo que la tienda no hace y las condiciones de los planes gratis. Léelo antes de empezar.
- 🛠️ **[Solución de problemas](docs/SOLUCION_DE_PROBLEMAS.md)**: qué hacer si algo no se ve o no funciona.

## ¿Con qué está hecha?
- **Web:** Next.js 16 + React 19, estilos en CSS propio.
- **Panel y contenido:** Sanity (el panel vive en `/admin` de tu propia tienda).
- **Publicación:** Vercel o Netlify.

---

## Para desarrolladores

Requisitos: Node.js 22.12 o superior.

```bash
npm install
cp .env.example .env.local   # pega tu Project ID de Sanity (sin él, la tienda arranca en modo demostración)
npm run dev                  # http://localhost:3000 y el panel en http://localhost:3000/admin
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm run start` | Compilar y servir como en producción |
| `npm run check` | Lint + tipos + pruebas (Vitest) |
| `npx sanity schema validate` | Revisa los esquemas del panel |

- **Modo demostración:** si `NEXT_PUBLIC_SANITY_PROJECT_ID` está vacío, la tienda muestra productos de ejemplo y `/admin` una guía para conectarla. Con credenciales nunca se mezclan datos de ejemplo.
- **Variables:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` y, solo con dominio propio, `NEXT_PUBLIC_SITE_URL` (en Vercel y Netlify la dirección se detecta sola). Ver `.env.example`.
- **Fotos:** se redimensionan en el CDN de Sanity con un loader propio (`src/lib/imageLoader.ts`); no se usa la optimización de imágenes de Vercel ni de Netlify.
- **Textos:** todo texto visible sale de `src/lib/labels.ts` (editable en el panel). Hay pruebas que fallan si se escribe texto o colores fijos en los componentes o estilos.

Licencia [MIT](LICENSE).
