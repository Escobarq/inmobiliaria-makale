# Análisis técnico — Inmobiliaria Makale

**Fecha:** 2026-11-02
**Commit analizado:** `defba86` (rama `main`, árbol limpio)
**Alcance:** revisión de código, build, tests, render real en navegador y medición de layout a 13 anchos de pantalla.

---

## 1. Qué es el proyecto

Rediseño de la página de inicio de Inmobiliaria Makale: una **landing page estática de una sola ruta** construida con Astro, CSS y JavaScript vanilla. Sin backend, sin CMS, sin base de datos. El contenido de inmuebles vive en un archivo JS.

| Aspecto | Estado |
|---|---|
| Framework | Astro `7.4.4` (`output: static`) |
| Rutas | 1 (`/`) |
| Dependencias | 1 directa (`astro`), 184 paquetes instalados |
| Tests | 9, todos pasan (`npm test`) |
| Build | Correcto, ~4 s, genera `dist/` de 8 archivos |
| Vulnerabilidades | 0 (`npm audit`) |
| Despliegue | GitHub Actions → GitHub Pages en push a `main` |

**Estructura**

```
src/pages/index.astro      Homepage completa (304 líneas, todo el markup)
src/layouts/BaseLayout.astro  <head> y <html lang="es">
src/data/properties.js     4 inmuebles hardcodeados
src/styles/global.css      707 líneas, único stylesheet
src/scripts/site.js        44 líneas (menú móvil + feedback del buscador)
test/properties.test.mjs   9 tests
docs/superpowers/          Planes y specs de agentes (stale)
assets/, public/images/    Logo duplicado 3 veces
```

El proyecto **funciona**: instala, compila y renderiza. Es una base decente y con buena intención de accesibilidad (skip link, `aria-expanded`, `prefers-reduced-motion`, foco visible). Los problemas están en los detalles de ejecución.

---

## 2. Hallazgos críticos

### 2.1 La cabecera y el buscador se rompen entre 800 px y ~1000 px

El breakpoint de escritorio entra en `50rem` (800 px), pero el contenido necesita ~1000 px. Medido en navegador:

| Ancho | CTA "Hablar con un asesor" | Teléfono | Resultado |
|---|---|---|---|
| 801 px | **3 líneas** (104 px de alto) | **3 líneas** (54 px) | Cabecera deformada, CTA desborda el padding derecho |
| 900 px | **2 líneas** (65 px) | 2 líneas (36 px) | Sigue roto |
| 1024 px | 1 línea | 1 línea | Correcto |

Además, en ese rango los `<select>` del buscador quedan en 82–113 px y el texto de las opciones se corta ("Comp", "Todos", "Ciudad o ba"). Ver `docs/analisis/tablet-820.jpg`.

**Por qué importa:** es el ancho típico de tablets en horizontal y de muchas ventanas de portátil. Un usuario ahí ve la web rota.

**Causa:** `@media (max-width: 50rem)` en `global.css:550` es demasiado bajo para la densidad del nav (6 ítems + teléfono + logo + CTA) y del formulario de 4 columnas.

---

### 2.2 El mensaje "Más de 25 años…" está tapado por el buscador

`.hero-note` (el claim de trayectoria, abajo del hero) queda **completamente oculto** detrás del panel blanco del buscador en escritorio:

```
hero-note:   y = 682 → 700
search-panel: y = 679 → 846   ← lo cubre
```

`.hero-note` tiene `z-index: 1` y `.search-panel` tiene `z-index: 2` con `margin-top: -3.4375rem`. El texto se renderiza pero nadie lo ve. En móvil sí aparece, porque el panel pierde el margen negativo.

**Impacto:** se pierde el argumento de mayor autoridad de la marca ("25 años") justo en la primera pantalla.

---

### 2.3 Las tarjetas de propiedades enlazan a anclas que no existen

```html
<a class="property-image-link" href="#property-5087">   <!-- no existe en el DOM -->
```

Confirmado: `#property-5087`, `#property-5086` y `#property-5067` no existen. Tampoco hay páginas de detalle. **Hacer clic en una propiedad no hace nada** (el hash queda inválido y no hay navegación).

Relacionado: "Ver todas las propiedades" apunta a `#contacto`, no a un listado.

**Impacto:** el flujo principal del negocio —ver una propiedad— es un callejón sin salida. Y para SEO, cada inmueble debería tener su propia URL indexable.

---

### 2.4 El buscador no busca

El formulario imprime un mensaje ("Mostrando opciones disponibles cerca de Chico.") y hace scroll, pero **no filtra nada**: siguen las mismas 3 tarjetas antes y después. No hay `action`, no hay lógica de filtrado, no hay fallback sin JS.

Agrava el problema una inconsistencia de datos:

- El select ofrece **`Comprar` / `Arrendar`**.
- Los datos usan **`type: 'Venta'`** y los 4 inmuebles son de venta.

Elegir "Arrendar" es una consulta que nunca podrá devolver resultados, con o sin filtro.

**Detalle adicional:** al enviar, el panel crece 166.5 → 184.5 px (+18 px) y empuja todo el contenido. `.search-feedback` tiene `min-height: 0` en lugar de reservar la línea, así que el layout salta.

---

## 3. Accesibilidad

Lo implementado está bien: skip link funcional, `aria-expanded` + `aria-label` sincronizados, `aria-live` en el feedback, foco visible con `:focus-visible`, `prefers-reduced-motion` en CSS y JS, `scroll-margin-top`, menú cerrado con `visibility: hidden` (no recibe foco). Los contrastes declarados pasan AA (`.property-location` 4.59:1, `.property-details` 5.64:1). Eso está por encima de la media.

Quedan cuatro problemas reales, todos verificados en navegador:

**a) Se pierde el foco al navegar.** Al pulsar un enlace del menú:

```
clic en "Propiedades" → hash = #propiedades → document.activeElement = BODY
```

El enlace se oculta (`visibility: hidden`) y el foco cae al `<body>`. Un usuario de teclado o lector de pantalla vuelve al inicio del documento y tiene que tabular desde cero. Las secciones destino no tienen `tabindex="-1"`.

**b) La apertura del menú no mueve el foco.** `site.js:19` intenta `mainNav.querySelector('a')?.focus()`, pero se ejecuta antes de que el navegador aplique `visibility: visible`; el `focus()` falla en silencio. Medido: tras abrir, `activeElement` sigue en el botón. La línea es código muerto.

**c) Objetivos táctiles pequeños.** En escritorio los enlaces del nav miden 20 px de alto, el teléfono 18 px y "Volver arriba" 17 px. WCAG 2.2 AA (2.5.8) pide 24×24 px mínimo.

**d) Contraste sobre la foto del hero.** `.hero .eyebrow` es `#ffb1b5` sobre la imagen. Contra el fondo oscuro declarado da 10.4:1, pero el texto cae sobre el cielo claro de la foto (~2:1). En la captura de escritorio "BOGOTÁ · LA CALERA · CUNDINAMARCA" es prácticamente ilegible. El gradiente (`rgba(0,0,0,.7)` → `.16`) no protege esa zona.

**e) Textos alternativos incorrectos.** Dos imágenes tienen `alt="Interior de una propiedad Makale"` pero son fotos de la ciudad de Bogotá. También se pierde la descripción de los servicios en móvil (`display: none`).

---

## 4. Rendimiento

**Peso total medido: ~1.1 MB**, casi todo imágenes:

| Recurso | Peso |
|---|---|
| Foto "Nosotros" | 443 KB |
| Hero | 370 KB |
| Propiedad 5067 | 167 KB |
| Propiedad 5087 | 113 KB |
| Propiedad 5086 | 36 KB |
| CSS + logo + fuentes | ~11 KB |

**a) Cero imágenes responsive.** 0 atributos `srcset` en todo el HTML generado. Un móvil de 390 px descarga la misma imagen de 1950 px que un monitor 4K.

**b) La optimización de Astro infló el hero.** El log del build lo dice:

```
local-office-images-bogota-v02-1950x650.webp (before: 203kB, after: 360kB)  ← +78%
```

El JPEG original ya estaba comprimido; recomprimirlo a WebP con la calidad por defecto dio un archivo más grande. Lo mismo con la foto de "Nosotros" (1022 KB → 432 KB, aceptable pero sigue siendo enorme para una imagen decorativa).

**c) Google Fonts vía `@import` dentro del CSS.** Es la peor forma de cargar fuentes: el navegador descubre la hoja de Google recién después de descargar y parsear el CSS local. Sin `preconnect`, sin `preload`, y se piden 4 pesos de DM Sans + 2 de Playfair Display. Autohospedar 2 archivos variables ahorraría una cadena de peticiones y ~200 ms de bloqueo.

**d) Imágenes de terceros calientes.** Las fotos se sirven desde `pictures.domus.la` y el WordPress anterior (`www.inmobiliariamakale.com.co`). El build **falla si ese CDN cambia o cae**, y no hay control sobre el formato ni el peso. Conviene descargarlas al repo o a un storage propio.

**e) Una propiedad tiene fuente de baja resolución.** `5086` es 364×648 (retrato) y se declara como 1024×768 en el componente. Se muestra recortada en una caja apaisada y se verá borrosa en pantallas 2×.

---

## 5. SEO y metadatos

El `<head>` tiene 5 etiquetas: charset, viewport, description, theme-color y title. Falta todo lo demás:

| Elemento | Estado |
|---|---|
| `rel="icon"` (favicon) | ❌ — `GET /favicon.ico` devuelve 404 en cada visita |
| Open Graph / Twitter Card | ❌ — un enlace compartido por WhatsApp sale sin imagen ni título |
| `<link rel="canonical">` | ❌ |
| JSON-LD (`RealEstateAgent`, `Residence`) | ❌ — sin datos estructurados no hay resultados enriquecidos |
| `robots.txt` / `sitemap` | ❌ — ambos 404 |
| `initial-scale=1` en viewport | ❌ |
| `site` en `astro.config.mjs` | ❌ — sin esto no se puede generar canonical ni sitemap |

Para una inmobiliaria esto es caro: **el tráfico orgánico de una inmobiliaria llega por páginas de inmueble**, y aquí solo existe una URL. Sin `og:image`, cada propiedad compartida por WhatsApp (el canal principal en Colombia) se ve como un enlace pelado.

También falta lo básico de negocio: botón de WhatsApp, formulario de contacto real (solo hay `mailto:`), analítica y aviso de tratamiento de datos (Ley 1581 de 2012).

---

## 6. Calidad de código y mantenibilidad

**Bien:** el CSS está tokenizado (`--space-*`, `--duration-*`, `--ease-*`), usa `clamp()`/`min()` y breakpoints en `rem`, con `@supports` para `backdrop-filter`. Nada de `!important` fuera del bloque de movimiento reducido. Separación clara datos / presentación / interacción.

**A mejorar:**

| Problema | Detalle |
|---|---|
| Tests que no prueban comportamiento | Los 9 tests son `assert.match` sobre el **texto fuente** del CSS/JS/Astro (`/--muted:\s*#626262/`, `/class="skip-link" href="#main-content"/`). Ninguno abre un navegador. Ninguno habría detectado la cabecera rota a 820 px, el claim tapado, los enlaces muertos ni el foco perdido. Además se rompen si cambia un color o el formato del markup. |
| CI no ejecuta los tests | El workflow solo hace `build` y `deploy`. Un fallo de test nunca bloquea un despliegue. |
| Node sin versión fijada | Astro 7 exige `^20.19.0 \|\| >=22.12.0`; el workflow usa `node-version: "20"` genérico y no hay `engines` ni `.nvmrc`. |
| Assets duplicados | `assets/inmobiliaria-roja.png`, `public/images/logo-makale.png` y `src/assets/logo-makale.png` son **byte a byte idénticos** (mismo SHA-256). Dos no se usan; uno se copia a `dist/` sin referenciarse. |
| Logo raster | El logo es un PNG de 500×189 con el texto "Inmobiliaria" en gris claro que a 154 px de ancho queda ilegible. Debería ser SVG o una versión horizontal simplificada. |
| Docs obsoletos | `docs/superpowers/` son planes de agentes con los checkboxes sin marcar, y se contradicen: un plan dice "Tech Stack: Astro 5" y el otro "Astro 7". Confunde sobre el estado real del proyecto. |
| Sin README | No hay instrucciones de instalación, despliegue ni estructura. |
| Sin lint ni formato | No hay ESLint, Prettier ni editorconfig. |
| JS frágil | `site.js:17` hace `mainNav.classList.toggle` sin `?.` justo después de usar `menuToggle?.`; si falta el nav, lanza `TypeError`. |
| Datos pobres | 4 inmuebles, precios como strings (`'$990.000.000'`) — imposible ordenar, filtrar o formatear por moneda. |
| Año hardcodeado | `© 2026` fijo en el footer. |
| Nombre inconsistente | `package.json` dice `makale-redesign`, el repo dice `inmobiliaria-makale`. |

---

## 7. Lo que está bien

Conviene no perderlo en una refactorización:

- **Identidad visual sólida y coherente**: paleta rojo/crema/tinta, serif editorial (Playfair) contra sans (DM Sans), mucho aire. Se ve profesional.
- **Responsive real y sin overflow horizontal** en los 13 anchos probados (320 → 1920 px). El único problema es la franja 800–1000 px, no el sistema.
- **Accesibilidad por encima de la media**: skip link, landmarks, `aria-live`, foco visible, `prefers-reduced-motion` respetado en CSS y JS, menú cerrado correctamente con `visibility`.
- **Sistema de diseño en tokens** con escalas fluidas y fallbacks entre navegadores.
- **Build rápido** (~4 s) y sin dependencias superfluas. Astro resuelve imágenes, CSS y JS sin configuración extra.
- **Markup semántico** correcto: un solo `h1`, jerarquía de encabezados limpia, `<article>` por inmueble.

---

## 8. Plan de acción sugerido

### Ahora (1–2 días) — lo que un visitante nota

1. Subir el breakpoint de escritorio a `64rem` (1024 px) o añadir un rango intermedio 800–1024 px con nav simplificado y buscador en 2 filas.
2. Sacar `.hero-note` de detrás del panel (subir el `z-index`, o moverlo dentro del panel/flujo).
3. Resolver los enlaces de propiedad: crear páginas de detalle (`/propiedad/[id]`) o, como mínimo, un modal/`<dialog>` con la ficha.
4. Implementar el filtrado real del buscador contra `properties`, alineando `Comprar`/`Arrendar` con el `type` de los datos.
5. Reservar altura para `.search-feedback` (`min-height: 1.2em`) y evitar el salto de 18 px.

### Después (3–5 días) — SEO y conversión

6. Favicon, `robots.txt`, sitemap, `site` en `astro.config`, canonical, Open Graph con imagen por inmueble, JSON-LD de tipo inmobiliario.
7. Botón de WhatsApp y formulario de contacto con validación y backend (o Formspree/Netlify Forms).
8. Corregir los `alt` de las dos fotos de ciudad y el `initial-scale=1`.

### Rendimiento (2–3 días)

9. `srcset`/`sizes` en las 7 imágenes (Astro lo hace solo si se le pasan `widths`).
10. Comprimir el hero por debajo de 150 KB y bajarlo a AVIF; revisar la calidad del pipeline de Astro.
11. Autohospedar DM Sans y Playfair en WOFF2 con `preload` y `font-display: swap`; eliminar el `@import`.
12. Descargar las imágenes al repo o a un storage propio para no depender de `pictures.domus.la`.

### Accesibilidad (1 día)

13. Mover el foco a la sección destino al navegar (`tabindex="-1"` + `focus()`), o devolverlo al botón del menú.
14. Corregir el `focus()` muerto al abrir el menú (aplicar la clase y esperar un `requestAnimationFrame`).
15. Subir los objetivos táctiles a ≥24 px.
16. Reforzar el gradiente del hero o poner un fondo detrás del eyebrow.

### Higiene (medio día)

17. README con instalación y despliegue; fijar `engines`/`.nvmrc` en Node 22.
18. Borrar los dos logos duplicados; migrar a SVG.
19. Añadir `npm test` al workflow de CI.
20. Sustituir los tests de regex por tests de DOM renderizado (Playwright o `@astrojs/test`) que cubran el menú, el foco y el filtrado.

---

## 9. Conclusión

Es un **prototipo de homepage bien encaminado, no un sitio listo para producción**. La dirección de arte y las bases de accesibilidad están por encima de lo habitual en este tipo de proyecto; el build es limpio y el rendimiento no depende de dependencias pesadas.

Los tres bloqueantes son concretos y acotados: **la franja 800–1000 px rota**, **el claim de los 25 años invisible** y **las tarjetas de propiedad que no llevan a ninguna parte**. Los tres se resuelven en menos de dos días de trabajo.

El riesgo mayor no es técnico sino de producto: con una sola URL y sin buscador funcional, el sitio **no captura la demanda que justifica una inmobiliaria en internet**. Ahí es donde debería ir el esfuerzo después de estabilizar el layout.

---

### Evidencia

- `docs/analisis/escritorio-1440.jpg` — render completo a 1440 px
- `docs/analisis/tablet-820.jpg` — la cabecera rota en el rango 800–1000 px
- `docs/analisis/movil-390.jpg` — render completo a 390 px
- `docs/analisis/menu-movil.jpg` — menú móvil abierto

Las mediciones de layout, contraste, foco y peso se tomaron con Chrome DevTools Protocol sobre `astro preview`, emulando anchos de 320 a 1920 px.
