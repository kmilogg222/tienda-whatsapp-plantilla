# Solución de problemas

Busca lo que estás viendo y sigue los pasos en orden. Casi siempre se resuelve con los primeros.

> Recuerda: los textos que ven tus clientes (como los de esta guía) se pueden cambiar en el panel, así que tu tienda puede decirlos con otras palabras.

---

## "Modo demostración: estás viendo productos de ejemplo"

La tienda no está conectada a tu Sanity y muestra una tienda de ejemplo que no es tuya.

1. En Vercel: tu proyecto → **Settings** → **Environment Variables**. (En Netlify: **Project configuration** → **Environment variables**.)
2. Revisa que existan estas dos, escritas exactamente así:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` = tu Project ID (8 letras y números, está en [sanity.io/manage](https://www.sanity.io/manage)).
   - `NEXT_PUBLIC_SANITY_DATASET` = `production`
3. Vuelve a publicar (ver [Cambié variables y no pasa nada](#cambié-variables-y-no-pasa-nada)).

---

## /admin muestra "Connect this Studio to your project" (CORS)

Sanity no reconoce la dirección desde la que abres el panel.

1. Toca **Add CORS origin**. Se abre Sanity con tu dirección ya escrita.
2. Marca **Allow credentials** y guarda.
3. Vuelve a la pestaña del panel y recarga.

Si no funciona: [sanity.io/manage](https://www.sanity.io/manage) → tu proyecto → **API** → **CORS origins**. La dirección debe ser **exactamente** la de tu tienda: con `https://`, sin `/admin` y sin barra al final (ej. `https://mitienda.vercel.app`), y con **Allow credentials**. Si usas dominio propio y también la dirección `.vercel.app`, autoriza las dos.

---

## No puedo iniciar sesión en /admin

1. Usa la misma opción con la que creaste tu cuenta de Sanity (**Google** o **GitHub**) y la misma cuenta.
2. Si otra persona te invitó, revisa que aceptaste la invitación del correo.
3. Prueba en una ventana de incógnito o en otro navegador: algunas extensiones bloquean el inicio de sesión.

---

## No veo mis cambios

1. ¿Tocaste **Publish** en el panel? Si el botón todavía está activo, el cambio sigue como borrador.
2. Recarga la tienda. Espera un minuto y vuelve a recargar.
3. Si es un producto: revisa en **👁️ Visibilidad** que no esté en **Ocultar de la tienda**, y si está agotado, cómo tienes **Productos agotados** en Configuración → 📱 WhatsApp y pedidos.
4. Si es la portada: revisa que hayas publicado **Portada** (es un documento aparte de la configuración).
5. En el celular, cierra la pestaña y ábrela de nuevo.

---

## "Tu tienda aún no tiene productos"

La tienda está bien conectada, pero no encuentra productos publicados.

1. Publica al menos un producto (con foto, precio y categoría) o carga la tienda de ejemplo en **Primeros pasos**.
2. Si ya tienes productos publicados y sigue saliendo: en [sanity.io/manage](https://www.sanity.io/manage) → tu proyecto → **Datasets**, revisa que `production` diga **Public**, y que la variable `NEXT_PUBLIC_SANITY_DATASET` diga `production`.

---

## "No pudimos cargar el catálogo"

La tienda no logró comunicarse con Sanity en ese momento.

1. Espera unos minutos y toca **Reintentar**.
2. Revisa [sanity-status.com](https://www.sanity-status.com) por si Sanity tiene un problema general.
3. Si pasa siempre: revisa que el Project ID de las variables sea el correcto y que no te hayas pasado del límite del plan gratis (sanity.io/manage → tu proyecto → **Usage**).

---

## "No encontramos esta página"

1. Si viene de un enlace de producto: el producto puede estar **oculto**, **borrado**, **agotado con "Ocultarlos del catálogo"** o le cambiaste el **slug** (la dirección).
2. Revisa el producto en el panel. Si cambiaste el slug, comparte el enlace nuevo.

---

## Las fotos no cargan

1. Revisa que la foto esté subida en el producto y que hayas tocado **Publish**.
2. Recarga la página. Si la subiste hace segundos, espera un minuto.
3. Si no se ve **ninguna** foto: revisa que el dataset sea **Public** (ver arriba) y [sanity-status.com](https://www.sanity-status.com).
4. Si la foto se ve cortada: en el producto → **📷 Fotos** → lápiz (**Edit**) → mueve el círculo del punto importante y publica. La forma de todas las fotos se cambia en **🎨 Apariencia → Forma de las fotos de producto**.
5. Usa fotos JPG, PNG o WEBP. Fotos muy pesadas (más de 10 MB) tardan en subir: achícalas antes.

---

## El botón de WhatsApp abre otro número

1. Configuración de la tienda → **📱 WhatsApp y pedidos** → **Número de WhatsApp para Pedidos**.
2. Debe tener el código de país, **sin +, sin espacios ni guiones**. Ej.: Colombia `573001234567`; México `5215512345678`.
3. Toca **Publish** y recarga la tienda.
4. Si sigue apareciendo el número de ejemplo, revisa que publicaste la **Configuración** (no solo que la cambiaste).

---

## El mensaje de WhatsApp llega incompleto o sin enlaces

- Si el pedido es muy largo, la tienda lo envía **sin los enlaces de cada producto** para que WhatsApp lo acepte (el carrito lo avisa). Es normal.
- Si falta el nombre o la ciudad: actívalos en **📱 WhatsApp y pedidos** (**Pedir nombre**, **Pedir ciudad o barrio**).

---

## Error al desplegar (publicar)

En Vercel (**Deployments**) o Netlify (**Deploys**) el último aparece en rojo (**Error** / **Failed**).

1. Vuelve a intentarlo una vez: Vercel → menú **⋯** → **Redeploy**; Netlify → **Trigger deploy** → **Deploy project**. A veces es un fallo pasajero.
2. Si vuelve a fallar: abre el despliegue, busca las líneas en rojo al final del registro (**Build Logs**), cópialas y pide ayuda.
3. Si el error apareció después de cambiar algo del código en GitHub, vuelve a publicar la versión anterior: Vercel → en un despliegue anterior que funcionaba → **⋯** → **Promote to Production** (Netlify: abre un despliegue anterior → **Publish deploy**).

---

## Cambié variables y no pasa nada

Las variables (Project ID, dataset, dirección) solo se aplican al **volver a publicar**:

- **Vercel:** **Deployments** → menú **⋯** del primero de la lista → **Redeploy** → **Redeploy**.
- **Netlify:** **Deploys** → **Trigger deploy** → **Deploy project**.

Espera a que termine (1 a 3 minutos) y recarga la tienda.

---

## Al compartir un enlace no sale la foto

1. Productos: revisa que tengan foto publicada.
2. Portada y catálogo: sube una **Imagen para compartir** en Configuración → **🖼️ Marca** y publica.
3. WhatsApp guarda la vista previa del primer envío de cada enlace: prueba con un enlace que no hayas compartido antes (por ejemplo, agregándole `?v=2` al final).

---

## Nada de esto funcionó

Anota: qué estabas haciendo, qué esperabas ver, qué viste (una captura ayuda mucho) y la dirección de tu tienda. Con eso quien te ayude lo resuelve más rápido.
