# Diseño: propiedades automáticas desde la página actual

## Intención
Dejar de mantener inmuebles escritos a mano en `src/data/properties.js`. La homepage debe mostrar los inmuebles publicados en `https://www.inmobiliariamakale.com.co/inmuebles/` y actualizarse sola cuando aparezcan nuevos.

## Objetivos
- Leer el listado público de inmuebles en cada build.
- Mostrar solo inmuebles con información suficiente: id, foto, ubicación y precio o canon.
- Ocultar los inmuebles incompletos para no ensuciar la página.
- Reconstruir y publicar el sitio automáticamente una vez al día.
- Conservar la última copia válida si la fuente falla.

## No objetivos
- No usar la API de Domus ni pedir token.
- No crear páginas de detalle por inmueble.
- No adivinar habitaciones, baños o área cuando la fuente no los trae.
- No mostrar los 85 inmuebles: la homepage mantiene una selección corta.

## Enfoques considerados
1. **Scraping del HTML público (elegido):** sin credenciales, datos disponibles de inmediato. Limitación: solo ciudad, barrio, precio/canon, administración, fotos y coordenadas.
2. **API oficial de Domus (descartado por ahora):** devuelve todos los campos estructurados, pero exige un token que la inmobiliaria debe solicitar a soporte.

## Diseño elegido
- `scripts/scrape-properties.mjs` descarga el listado, separa los bloques de inmueble y extrae:
  - id desde la primera foto (`inmobiliaria_228/<id>_1_...`);
  - ciudad, barrio, precio, canon y administración;
  - primera foto de la galería.
- Se descartan los bloques sin id, foto, ubicación o sin precio/canon.
- Se ordenan por id descendente (los más nuevos primero) y se marcan como `featured` los primeros 6.
- Campos derivados:
  - `type`: `Arriendo` si hay canon y no hay precio de venta; en otro caso `Venta`.
  - `title`: `<tipo> en <barrio>`.
  - `location`: ciudad sin el sufijo duplicado (`Bogotá - Bogota` → `Bogotá`).
  - `price`: valor de venta o canon, formateado como `$990.000.000`.
  - `details`: `Administración $1.802.000` cuando exista; si no, vacío y la tarjeta no lo muestra.
- El resultado se escribe directamente en `src/data/properties.js` como módulo generado, para que Astro no dependa de leer archivos en tiempo de build.
- Si la descarga o el parseo no producen inmuebles, el script falla sin reemplazar la copia anterior.
- `prebuild` ejecuta el scraper. El workflow de GitHub Pages añade un `schedule` diario y ejecuta el scraper antes del build.

## Archivos afectados
- `scripts/scrape-properties.mjs` (nuevo)
- `src/data/properties.js` (generado y versionado como última copia válida)
- `src/pages/index.astro` (oculta detalles vacíos)
- `package.json` (scripts `scrape` y `prebuild`)
- `.github/workflows/astro.yml` (schedule y paso de scraping)
- `test/scrape-properties.test.mjs` (nuevo, con fixture HTML)

## Verificación
- Probar el parser con un fixture que incluya un inmueble completo y uno incompleto.
- `npm test`.
- `npm run scrape` contra el sitio real.
- `npm run build` y revisar que el HTML generado muestre solo inmuebles completos.
