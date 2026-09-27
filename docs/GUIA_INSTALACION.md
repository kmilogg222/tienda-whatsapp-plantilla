# Guía de instalación: tu tienda en línea en una tarde

Esta guía te lleva de cero a tu tienda publicada en internet, con tu panel para cargar productos y recibir pedidos por WhatsApp. **No necesitas saber programar.** Solo sigue los pasos en orden.

Cada paso tiene:
- ✅ **Debes ver:** lo que aparece si todo salió bien.
- ❌ **Si ves…:** qué hacer si algo sale distinto.

> Las páginas de GitHub, Sanity, Vercel y Netlify están en inglés. En esta guía los botones aparecen **en negrita y tal como están escritos en la pantalla**, para que los encuentres fácil.

---

## 0. Antes de empezar

### Qué vas a lograr
- Una tienda en internet con dirección propia, por ejemplo `https://mitienda.vercel.app`.
- Un panel en `https://mitienda.vercel.app/admin` para cargar productos, fotos, precios, colores y textos.
- Pedidos que te llegan a tu WhatsApp.

### Qué necesitas
- Un **correo electrónico** al que puedas entrar ahora mismo (te van a llegar códigos de verificación).
- Tu **celular con WhatsApp** (el número al que llegarán los pedidos).
- Un **computador** (el celular sirve para usar la tienda, pero la instalación es más fácil en computador).
- Entre **45 y 60 minutos**.

### Cuánto cuesta
**$0.** Vas a usar tres servicios con plan gratuito:

| Servicio | Para qué sirve | Plan |
|---|---|---|
| **GitHub** | Guarda tu copia de la tienda | Gratis |
| **Sanity** | Guarda tus productos, fotos y ajustes (es tu panel) | Gratis |
| **Vercel** (o **Netlify**) | Publica la tienda en internet | Gratis |

Condiciones a tener en cuenta (sin alarma, pero léelas):
- **El plan gratis de Vercel (Hobby) es para uso personal, no comercial.** Si tu tienda vende en serio, usa **Netlify** (su plan gratis sí permite uso comercial) o paga **Vercel Pro**. La instalación con Netlify está en el [paso 10](#10-ruta-alternativa-publicar-con-netlify).
- Los planes gratis tienen límites de visitas, fotos y usuarios. Para una tienda pequeña o mediana alcanzan de sobra. Revisa los límites vigentes en las páginas oficiales (cambian con el tiempo): [Sanity](https://www.sanity.io/pricing) · [Vercel](https://vercel.com/pricing) · [Netlify](https://www.netlify.com/pricing/).

### Ten a mano un bloc de notas
Durante la guía vas a copiar tres datos. Anótalos aquí o en un papel:

| Dato | Lo obtienes en | Ejemplo |
|---|---|---|
| **Project ID** de Sanity | Paso 3 | `ab12cd34` |
| **Dirección de tu tienda** | Paso 4 | `https://mitienda.vercel.app` |
| **Tu número de WhatsApp** con código de país | Ya lo tienes | `573001234567` |

---

## 1. Crea tu cuenta en GitHub

GitHub es donde queda guardada tu copia de la tienda.

1. Entra a [github.com/signup](https://github.com/signup).
2. Escribe tu correo y toca **Continue**.
3. Crea una contraseña y toca **Continue**.
4. Elige un nombre de usuario (ej. `mitienda-belleza`) y toca **Continue**.
5. Resuelve el acertijo que te muestra (para comprobar que eres una persona).
6. Revisa tu correo: te llegó un código de 8 números. Escríbelo en la página.
7. Si te hace preguntas sobre cómo usarás GitHub, puedes tocar **Skip personalization**.

![captura](img/01-github-registro.png)

✅ **Debes ver:** tu página de inicio de GitHub, con tu foto o una silueta arriba a la derecha.

❌ **Si no llega el código:** revisa la carpeta de spam o "Promociones". Espera 2 minutos y toca **Resend code**.
❌ **Si te pide activar la verificación en dos pasos (2FA):** hazlo; es por seguridad. Elige **Authenticator app** si tienes una app como Google Authenticator, o **SMS** si prefieres mensajes de texto. Guarda los códigos de recuperación que te muestra.

---

## 2. Copia la plantilla de la tienda

Vas a crear **tu propia copia** de la tienda. Es tuya: nadie más puede cambiarla.

1. Entra a la página de la plantilla: **https://github.com/kmilogg222/tienda-whatsapp-plantilla**
2. Toca el botón verde **Use this template** y luego **Create a new repository**.
3. En **Repository name** escribe un nombre sin espacios, ej. `mitienda`.
4. Elige **Private** (privado) o **Public** (público). Los dos funcionan igual. **Private** es buena opción: tu tienda sigue siendo visible en internet, lo privado es solo el "código".
5. Toca **Create repository**.

![captura](img/02-github-use-this-template.png)

✅ **Debes ver:** una página con tu nombre de usuario y el nombre que elegiste arriba (ej. `mitienda-belleza / mitienda`) y una lista de carpetas y archivos.

❌ **Si no ves el botón "Use this template":** revisa que iniciaste sesión en GitHub (paso 1). Si sigue sin aparecer, escribe a quien te compartió la plantilla.

> Importante: tu copia **no recibe actualizaciones automáticas** de la plantilla. Si más adelante sale una versión nueva, pide ayuda para actualizarla.

---

## 3. Crea tu panel en Sanity

Sanity guarda tus productos, fotos y ajustes. Aquí creas el "cajón" donde vivirán.

### 3.1 Crea la cuenta y el proyecto
1. Entra a [sanity.io/manage](https://www.sanity.io/manage).
2. Toca **Continue with GitHub** (así no creas otra contraseña) y autoriza con **Authorize**. También puedes usar **Continue with Google**.
3. Si te pregunta por una organización o tu nombre, completa lo que pida.
4. Toca **Create new project** (a veces aparece como **New project**).
5. En el nombre del proyecto escribe el de tu tienda, ej. `Mi Tienda`.
6. Si te pregunta por el plan, elige el gratuito (**Free**).
7. Si te pregunta por una configuración de dataset, deja la que viene: **production**, **Public**.
8. Toca **Create project**.

![captura](img/03-sanity-crear-proyecto.png)

✅ **Debes ver:** la página de tu proyecto con su nombre arriba y un dato llamado **Project ID**: son 8 letras y números, ej. `ab12cd34`.

### 3.2 Copia el Project ID
1. Copia el **Project ID** y anótalo en tu bloc de notas.

![captura](img/04-sanity-project-id.png)

### 3.3 Revisa que el dataset sea público
1. En la página del proyecto, abre la pestaña **Datasets**.
2. Debe haber uno llamado **production** que diga **Public**.

✅ **Debes ver:** `production` · `Public`.

❌ **Si dice "Private":** toca el dataset, busca la opción de visibilidad y cámbiala a **Public**. (Público solo significa que la tienda puede leer tus productos para mostrarlos; nadie puede cambiarlos sin entrar a tu panel.)
❌ **Si no hay ningún dataset:** toca **Add dataset**, escribe `production`, elige **Public** y crea.

---

## 4. Publica tu tienda en Vercel

Vercel toma tu copia de GitHub y la publica en internet.

1. Entra a [vercel.com/signup](https://vercel.com/signup).
2. Elige **Hobby** (plan personal gratis) y escribe tu nombre. (Si vas a vender en serio, lee antes el [paso 10](#10-ruta-alternativa-publicar-con-netlify).)
3. Toca **Continue with GitHub** y autoriza.
4. Ya dentro, toca **Add New…** y luego **Project**.
5. En **Import Git Repository** busca tu repositorio (ej. `mitienda`) y toca **Import**.
   - ❌ **Si no aparece tu repositorio:** toca **Install** o **Adjust GitHub App Permissions**, elige tu usuario de GitHub, marca **All repositories** (o solo `mitienda`) y guarda. Vuelve a Vercel.
6. En **Project Name** puedes dejar el nombre o cambiarlo: **de aquí sale tu dirección** (`nombre.vercel.app`). Usa minúsculas y guiones, ej. `mitienda-belleza`.
7. **Framework Preset** debe decir **Next.js**. No toques nada más de esa sección.
8. Abre **Environment Variables** y agrega estas dos (escribe el nombre en **Key**, el valor en **Value** y toca **Add** en cada una):

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | tu Project ID (ej. `ab12cd34`) |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |

   Copia los nombres tal cual, con los guiones bajos y en mayúsculas.
9. Toca **Deploy** y espera 1 o 2 minutos.

![captura](img/05-vercel-importar.png)
![captura](img/06-vercel-variables.png)

✅ **Debes ver:** un mensaje de felicitaciones (**Congratulations!**) con una miniatura de tu tienda. Toca **Continue to Dashboard**. Arriba verás tu dirección, ej. `mitienda-belleza.vercel.app`. **Anótala.**

✅ Abre esa dirección: debes ver una tienda con el mensaje **"Tu tienda aún no tiene productos"**. Es normal: todavía está vacía.

❌ **Si ves "Modo demostración: estás viendo productos de ejemplo":** las variables del punto 8 no quedaron bien. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**, revisa los nombres y el Project ID, y luego vuelve a publicar: **Deployments** → menú **⋯** del primero de la lista → **Redeploy** → **Redeploy**.
❌ **Si el despliegue falla (letras rojas, "Error"):** toca **Redeploy** una vez. Si vuelve a fallar, copia las últimas líneas rojas y pide ayuda.

---

## 5. Autoriza tu tienda en Sanity (CORS)

Por seguridad, Sanity solo deja entrar al panel desde direcciones que tú autorices. Vas a autorizar la dirección de tu tienda.

1. Abre `https://TU-DIRECCION.vercel.app/admin` (tu dirección + `/admin`).
2. Aparece una pantalla que dice **Connect this Studio to your project**. Toca **Add CORS origin**. Se abre Sanity en otra pestaña con tu dirección ya escrita.
3. Marca la casilla **Allow credentials**. **Es obligatoria.**
4. Toca **Save** (o **Add CORS origin**).
5. Vuelve a la pestaña de tu tienda y recarga la página.

![captura](img/07-sanity-cors-aviso.png)
![captura](img/08-sanity-cors-allow-credentials.png)

**Otra forma (si no aparece la pantalla):** entra a [sanity.io/manage](https://www.sanity.io/manage) → tu proyecto → pestaña **API** → **CORS origins** → **Add CORS origin** → escribe tu dirección completa (ej. `https://mitienda-belleza.vercel.app`, sin `/admin` y sin barra al final) → marca **Allow credentials** → **Save**.

✅ **Debes ver:** una pantalla para iniciar sesión en el panel.

❌ **Si la pantalla de CORS vuelve a salir:** revisa en Sanity → **API** que la dirección esté escrita igual que la de tu tienda (con `https://`, sin `/admin`) y que diga **Allow credentials**.

---

## 6. Entra a tu panel y carga la tienda de ejemplo

1. En `https://TU-DIRECCION.vercel.app/admin` elige la misma opción con la que entraste a Sanity (**GitHub** o **Google**).
2. En la barra de arriba toca **Primeros pasos**. Se abre una página que dice **¡Bienvenida a tu panel! 👋** con una lista de tareas.
3. En **Tienda de ejemplo** toca **Cargar tienda de ejemplo** y confirma con **Sí, cargar**. Tarda cerca de un minuto.
4. Cuando diga **Listo: la tienda de ejemplo está cargada**, abre tu tienda (`https://TU-DIRECCION.vercel.app`) y recarga.

![captura](img/09-panel-primeros-pasos.png)
![captura](img/10-tienda-ejemplo.png)

✅ **Debes ver:** una tienda de belleza de ejemplo ("Glow Studio") con banner, categorías y productos. Ya puedes navegarla, abrir productos y probar el carrito.

❌ **Si la tienda sigue vacía:** espera un minuto y recarga. Revisa en el panel que **Primeros pasos** haya dicho "Listo".
❌ **Si el panel dice que no puede leer el estado de la tienda:** recarga la página del panel.

> La tienda de ejemplo sirve para que veas cómo queda todo. En el paso 8 la borras.

---

## 7. Configura lo esencial

Todo esto se hace en el panel → **Configuración de la tienda**. Después de cada cambio toca **Publish** (abajo a la derecha): **si no publicas, no se ve en la tienda.**

1. **🏷️ General**
   - **Nombre de la Tienda / Negocio**: el nombre de tu negocio.
   - **Eslogan o Subtítulo**: una frase corta, ej. "Maquillaje original con envío a todo el país".
   - **País para mostrar precios** y **Moneda**: ej. Colombia y Peso colombiano.
2. **📱 WhatsApp y pedidos**
   - **Número de WhatsApp para Pedidos**: con código de país, **sin +, sin espacios**. Ej.: Colombia `573001234567`, México `5215512345678`.
3. **🖼️ Marca**
   - **Logotipo de la Tienda**: sube tu logo (mejor PNG con fondo transparente).
   - **Imagen para compartir**: la foto que sale cuando compartes tu tienda por WhatsApp (ideal 1200 × 630 px).
4. **🎨 Apariencia**
   - **Paleta de colores**: elige la que más se parezca a tu marca.
   - **Tipografía**: elige el estilo de letra.
5. Toca **Publish**.
6. Abre tu tienda y **recarga la página**.

![captura](img/11-configuracion-general.png)
![captura](img/12-configuracion-apariencia.png)

✅ **Debes ver:** tu nombre, logo, colores y letra en la tienda. Toca el botón de WhatsApp de un producto: debe abrir un chat con **tu** número.

❌ **Si no ves los cambios:** ¿tocaste **Publish**? Si el botón dice **Published** (gris), ya está. Recarga la tienda; a veces tarda unos segundos.
❌ **Si el panel marca el número en rojo:** escribe solo números, con el código de país, entre 8 y 15 dígitos.
❌ **Si WhatsApp abre otro número:** revisa el número en **📱 WhatsApp y pedidos**, publica y recarga.

---

## 8. Borra el ejemplo y carga tus productos

1. Primero limpia la **Portada** (en el panel, a la izquierda): la del ejemplo usa fotos, categorías y productos de ejemplo. Borra sus secciones (menú **⋯** de cada una → **Remove**) o déjala para después; sin secciones la tienda muestra una portada automática con tus categorías y productos. Toca **Publish**.
2. En **Primeros pasos** toca **Borrar datos de ejemplo** y confirma con **Sí, borrar**. Se borran los productos, categorías, marcas y fotos de ejemplo. **Tu configuración no se borra** (ya la cambiaste en el paso 7; revisa también **🛡️ Confianza** y **📢 Franja superior**, que traen textos de ejemplo).
   - ❌ **Si dice que algunos elementos o fotos no se borraron:** es porque la portada todavía los usa. Quítalos de la **Portada**, publica y vuelve a tocar **Borrar datos de ejemplo**.
3. Ve a **Categorías** → botón **+** (crear) → escribe el nombre (ej. "Maquillaje") → en **Identificador URL (Slug)** toca **Generate** → **Publish**. Repite con tus demás categorías.
4. Ve a **Productos** → **+** → llena:
   - **Nombre del Producto**, y en el **Slug** toca **Generate**.
   - **Precio de venta** (solo números, ej. `45000`).
   - **Categoría**.
   - En la pestaña **📷 Fotos**, sube al menos una foto.
5. Toca **Publish**.
6. Cuando tengas tus productos, arma tu **Portada** con tus banners y estantes (opcional) y toca **Publish**.
7. Abre tu tienda y recarga.

![captura](img/13-crear-producto.png)

✅ **Debes ver:** tus productos en la tienda, con su foto y precio.

❌ **Si el botón Publish no se deja tocar:** falta un dato obligatorio (sale en rojo): nombre, slug, precio o categoría.
❌ **Si un producto no aparece:** revisa que esté publicado, que en **👁️ Visibilidad** no esté marcado como oculto y, si está agotado, cómo tienes configurados los agotados en **📱 WhatsApp y pedidos**.

¡Tu tienda ya está funcionando! 🎉 Los siguientes pasos son opcionales.

---

## 9. (Opcional) Usa tu propio dominio

Si compraste un dominio (ej. `mitienda.com`):

1. En Vercel, abre tu proyecto → **Settings** → **Domains** → escribe tu dominio → **Add**.
2. Vercel te muestra unos datos (**Type**, **Name**, **Value**). Cópialos en la página donde compraste el dominio, en la sección **DNS**. Si no sabes dónde está, pide ayuda al soporte de esa página y muéstrales lo que te dio Vercel.
3. Espera: puede tardar desde minutos hasta 48 horas. Vercel mostrará **Valid Configuration** cuando esté listo.
4. Autoriza el dominio nuevo en Sanity como en el [paso 5](#5-autoriza-tu-tienda-en-sanity-cors) (ej. `https://mitienda.com`, con **Allow credentials**).
5. Vuelve a publicar: **Deployments** → **⋯** del primero → **Redeploy**. Así los enlaces que se comparten por WhatsApp usan tu dominio.

✅ **Debes ver:** tu tienda en `https://mitienda.com` y el panel en `https://mitienda.com/admin`.

❌ **Si /admin muestra la pantalla de CORS:** falta el punto 4.

---

## 10. Ruta alternativa: publicar con Netlify

**Cuándo elegir Netlify:** si tu tienda es un negocio (uso comercial) y no quieres pagar Vercel Pro. El plan gratis de Netlify permite uso comercial. Todo lo demás de la guía es igual: este paso **reemplaza el paso 4**.

1. Entra a [app.netlify.com/signup](https://app.netlify.com/signup) y toca **GitHub** para crear la cuenta. Autoriza.
2. Si te hace preguntas de bienvenida, respóndelas o sáltalas.
3. Toca **Add new project** (o **Add new site**) → **Import an existing project**.
4. Toca **GitHub** y autoriza. Elige tu repositorio (ej. `mitienda`).
   - ❌ **Si no aparece:** toca **Configure the Netlify app on GitHub**, dale acceso a tu repositorio y vuelve.
5. En **Project name** escribe el nombre de tu tienda: tu dirección será `nombre.netlify.app`.
6. No cambies la configuración de compilación: Netlify reconoce la tienda sola.
7. Toca **Add environment variables** (o **Environment variables** → **New variable**) y agrega las mismas dos del paso 4:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SANITY_PROJECT_ID` | tu Project ID |
   | `NEXT_PUBLIC_SANITY_DATASET` | `production` |

8. Toca **Deploy** y espera 2 o 3 minutos.

![captura](img/14-netlify-importar.png)
![captura](img/15-netlify-variables.png)

✅ **Debes ver:** **Published** en verde y tu dirección (ej. `https://mitienda.netlify.app`). Ábrela: verás "Tu tienda aún no tiene productos".

Sigue con el [paso 5](#5-autoriza-tu-tienda-en-sanity-cors) usando tu dirección de Netlify.

❌ **Si ves "Modo demostración":** revisa las variables en **Project configuration** → **Environment variables** y vuelve a publicar: **Deploys** → **Trigger deploy** → **Deploy project**.
❌ **Cambiaste una variable y no pasa nada:** los cambios de variables solo se aplican al volver a publicar (**Trigger deploy**).

Para dominio propio en Netlify: **Domain management** → **Add a domain** y sigue sus instrucciones; luego autorízalo en Sanity y vuelve a publicar.

---

## 11. Cambiar la dirección e invitar a otra persona

### Cambiar la dirección `.vercel.app`
1. En Vercel: tu proyecto → **Settings** → **Domains**.
2. Junto a tu dirección `….vercel.app` toca **Edit**, escribe la nueva (ej. `glowstudio.vercel.app`) y guarda. Si ya está ocupada, prueba otra.
3. Autoriza la dirección nueva en Sanity ([paso 5](#5-autoriza-tu-tienda-en-sanity-cors)).
4. Vuelve a publicar (**Deployments** → **⋯** → **Redeploy**) para que los enlaces compartidos usen la dirección nueva.

(Cambiar el **Project Name** en **Settings** → **General** cambia el nombre en Vercel, pero no la dirección.)

### Invitar a alguien a tu panel
1. Entra a [sanity.io/manage](https://www.sanity.io/manage) → tu proyecto → **Members** → **Invite members**.
2. Escribe el correo de la persona y elige el rol:
   - **Editor**: puede cargar y cambiar productos y ajustes.
   - **Administrator**: además puede invitar personas y cambiar la configuración del proyecto.
3. Toca **Invite**. La persona recibe un correo, acepta y ya puede entrar a `https://TU-DIRECCION/admin`.

❌ **Si la persona no ve el panel:** revisa que haya aceptado la invitación y que entre con el mismo correo al que la invitaste. El plan gratis tiene un límite de personas; revísalo en [sanity.io/pricing](https://www.sanity.io/pricing).

---

## Problemas frecuentes

| Si ves… | Haz esto |
|---|---|
| "Modo demostración: estás viendo productos de ejemplo" | Faltan o están mal las variables del paso 4. Corrígelas y vuelve a publicar (**Redeploy**). |
| "Connect this Studio to your project" en /admin | Falta autorizar tu dirección en Sanity (paso 5), con **Allow credentials**. |
| "Tu tienda aún no tiene productos" | Todo está conectado. Carga la tienda de ejemplo (paso 6) o publica tus productos (paso 8). |
| Cambié algo en el panel y no se ve | Toca **Publish** y recarga la tienda. |
| Cambié una variable en Vercel/Netlify y no pasa nada | Hay que volver a publicar (**Redeploy** / **Trigger deploy**). |
| La tienda sale vacía aunque cargué productos | Revisa que el dataset sea **Public** (paso 3.3) y que la variable `NEXT_PUBLIC_SANITY_DATASET` diga `production`. |
| WhatsApp abre otro número | Revisa **📱 WhatsApp y pedidos** → número con código de país, sin + ni espacios. |

---

## Atajo para quien ya tiene experiencia

En lugar de los pasos 2 y 4 puedes usar estos botones: copian la plantilla a tu GitHub y te piden las variables en el mismo paso. (Solo funcionan cuando la plantilla es pública.)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fkmilogg222%2Ftienda-whatsapp-plantilla&env=NEXT_PUBLIC_SANITY_PROJECT_ID,NEXT_PUBLIC_SANITY_DATASET&envDescription=Project%20ID%20de%20Sanity%20y%20dataset%20(production)&project-name=mi-tienda&repository-name=mi-tienda)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kmilogg222/tienda-whatsapp-plantilla)

Después sigue desde el paso 5.

---

## Lista de capturas que debe tomar el mantenedor

Guardarlas en `docs/img/` con estos nombres (ancho recomendado: 1280 px; recortar datos personales):

| Archivo | Qué debe mostrar |
|---|---|
| `00-portada-readme.png` | La tienda de ejemplo en computador y celular, lado a lado (portada del README) |
| `01-github-registro.png` | Formulario de registro de GitHub |
| `02-github-use-this-template.png` | Botón **Use this template** → **Create a new repository** abierto |
| `03-sanity-crear-proyecto.png` | Formulario para crear proyecto en sanity.io/manage |
| `04-sanity-project-id.png` | Página del proyecto con el **Project ID** resaltado |
| `05-vercel-importar.png` | **Import Git Repository** con el repositorio y el botón **Import** |
| `06-vercel-variables.png` | **Environment Variables** con las dos variables llenas (Project ID de ejemplo) |
| `07-sanity-cors-aviso.png` | Pantalla **Connect this Studio to your project** en /admin |
| `08-sanity-cors-allow-credentials.png` | Formulario de CORS con **Allow credentials** marcado |
| `09-panel-primeros-pasos.png` | Herramienta **Primeros pasos** con el botón **Cargar tienda de ejemplo** |
| `10-tienda-ejemplo.png` | La tienda de ejemplo en el celular |
| `11-configuracion-general.png` | **Configuración de la tienda** → General con nombre y moneda |
| `12-configuracion-apariencia.png` | Apariencia con paleta y tipografía |
| `13-crear-producto.png` | Producto nuevo con nombre, slug, precio, categoría y **Publish** |
| `14-netlify-importar.png` | Netlify: **Import an existing project** con el repositorio |
| `15-netlify-variables.png` | Netlify: variables de entorno llenas |
