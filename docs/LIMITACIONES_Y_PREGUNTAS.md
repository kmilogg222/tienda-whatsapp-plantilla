# Limitaciones y preguntas frecuentes

Lo que tu tienda hace, lo que **no** hace y las condiciones de los servicios gratuitos que usa. Mejor saberlo desde el principio.

---

## Costos y condiciones de los servicios

### ¿De verdad cuesta $0?
Sí, mientras te mantengas dentro de los planes gratuitos de **Sanity** (tu panel y tus datos) y de **Vercel** o **Netlify** (la publicación). Para una tienda pequeña o mediana suelen alcanzar de sobra. Lo único que podrías pagar aparte es un dominio propio (ej. `mitienda.com`), que es opcional.

### ¿Puedo usar Vercel gratis para vender?
**El plan gratis de Vercel (Hobby) es solo para uso personal, no comercial**, según sus condiciones. Una tienda que vende es uso comercial. Tienes dos caminos:
- **Netlify** con su plan gratis, que sí permite uso comercial. La tienda funciona igual allí ([Guía de instalación, paso 10](GUIA_INSTALACION.md#10-ruta-alternativa-publicar-con-netlify)).
- **Vercel Pro**, que es de pago.

Vercel no suele cerrar una tienda sin avisar, pero lo correcto es cumplir sus condiciones. Revísalas en [vercel.com/docs/limits/fair-use-guidelines](https://vercel.com/docs/limits/fair-use-guidelines).

### ¿Qué límites tienen los planes gratis?
Cada servicio limita cosas como visitas, transferencia de datos, número de documentos, espacio para fotos, consultas y personas en el panel. **Las cifras cambian con el tiempo**, así que verifícalas a la fecha en las páginas oficiales:
- Sanity: [sanity.io/pricing](https://www.sanity.io/pricing)
- Vercel: [vercel.com/pricing](https://vercel.com/pricing)
- Netlify: [netlify.com/pricing](https://www.netlify.com/pricing/)

La tienda está hecha para gastar poco: las fotos se achican en el servidor de fotos de Sanity (no gastan la cuota de imágenes de Vercel ni de Netlify) y cada visita hace pocas consultas.

### ¿Qué pasa si me paso de un límite?
Cada servicio avisa por correo. Según el caso, te pedirán pasar a un plan de pago o limitarán el servicio hasta el mes siguiente. Revisa de vez en cuando el uso en el panel de cada servicio (**Usage**).

---

## Lo que la tienda no hace

| No hace | Qué pasa en cambio |
|---|---|
| **Pagos en línea** (tarjeta, PSE, PayPal) | El pedido llega por WhatsApp y tú acuerdas el pago con el cliente. |
| **Control de inventario automático** | Las ventas no descuentan unidades. Cuando algo se agote, apaga **¿Está Disponible en Stock?** (o **¿Disponible?** en el tono). |
| **Cuentas de clientes** | Nadie se registra ni inicia sesión. |
| **Correos automáticos** | No se envían confirmaciones ni avisos por correo. Todo el pedido pasa por WhatsApp. |
| **Guardar pedidos** | La tienda no guarda un historial de pedidos: quedan en tu WhatsApp. |
| **Cupones o códigos de descuento** | Los descuentos se ponen con el **Precio antes** de cada producto o tono. |
| **Costos de envío automáticos** | Solo se muestra cuánto falta para el envío gratis, si lo configuras. El costo lo acuerdas por WhatsApp. |

---

## Límites de tamaño y alcance

- **Pensada para catálogos de hasta unos 500 productos.** La búsqueda y los filtros funcionan en el navegador del cliente; con muchos más productos la página empieza a pesar.
- **Una sola moneda, un solo idioma (español) y un solo número de WhatsApp.**
- **El carrito vive en cada navegador**: si el cliente arma el carrito en el celular, no lo verá en su computador. Se conserva aunque cierre la página.
- **El panel de Sanity está en inglés** (botones como **Publish**, **Delete**, **History**). Los nombres de campos, ayudas y tu tienda sí están en español.
- Algunos textos para personas con lectores de pantalla (ej. "Cerrar", "Foto anterior") y los emojis del mensaje de WhatsApp son fijos.

---

## Actualizaciones de la plantilla

**Tu tienda no recibe actualizaciones automáticas.** Al usar **Use this template** creaste una copia independiente: si la plantilla mejora después, tu copia no cambia sola. Es a propósito: nadie puede cambiar tu tienda sin tu permiso.

Si quieres las mejoras de una versión nueva, pide ayuda a alguien con experiencia en GitHub: se pueden copiar a tu repositorio sin perder tus productos, porque **tus productos y ajustes viven en Sanity, no en el código**.

---

## Cambios de diseño

Todo lo que está en el panel (colores, letras, formas, fotos, textos, secciones de la portada) lo cambias tú sin programar. **Cambios fuera de eso** (otra distribución de la ficha, una sección nueva que no existe, otro tipo de filtro) **requieren programar**. Anota lo que te gustaría y pídelo a quien te ayude.

---

## Privacidad

- **La tienda no guarda datos de tus clientes.** El carrito y los datos del formulario (nombre, ciudad) se guardan solo en el navegador del cliente, para no escribirlos de nuevo. Al enviar el pedido, esos datos viajan en el mensaje de WhatsApp y los recibes tú.
- **Si activas Google Analytics o el Píxel de Meta** (Configuración → 📈 Google y estadísticas), esos servicios sí recogen datos de navegación de tus visitantes. Según tu país puede que necesites un aviso de privacidad o de cookies; la tienda no trae uno incluido. Si no los activas, no se carga nada de eso.

---

## Preguntas frecuentes

**¿Puedo tener varias tiendas?** Sí: repite la guía de instalación con otra copia de la plantilla y otro proyecto de Sanity.

**¿Puedo cambiar la dirección de mi tienda?** Sí, ver [Guía de instalación, paso 11](GUIA_INSTALACION.md#11-cambiar-la-dirección-e-invitar-a-otra-persona). También puedes usar un dominio propio (paso 9).

**¿Otra persona puede ayudarme a cargar productos?** Sí, invítala como **Editor** desde Sanity (paso 11 de la guía). Revisa cuántas personas permite el plan gratis.

**¿Qué pasa si borro algo por error?** Si fue un cambio, usa el historial del documento (ícono del reloj → **Restore**). Si borraste un producto completo, pide ayuda: Sanity guarda el historial por un tiempo que depende del plan, y si no alcanza se necesita un respaldo (ver [Manual, respaldo](MANUAL_DE_USUARIO.md#respaldo-de-tu-información)).

**¿Las fotos pierden calidad?** No se ven pixeladas: la tienda pide a Sanity cada foto del tamaño justo para cada pantalla. Sube fotos de buena calidad (al menos 1000 px de ancho).

**¿Por qué WhatsApp muestra una vista previa vieja?** WhatsApp guarda la vista previa de cada enlace la primera vez que se comparte. Los enlaces nuevos se ven bien.
