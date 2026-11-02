# Scraping de propiedades Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar en la homepage los inmuebles publicados en `https://www.inmobiliariamakale.com.co/inmuebles/`, sin datos quemados.

**Architecture:** Un módulo puro parsea el HTML del listado y devuelve solo inmuebles completos. Un CLI lo descarga, ordena y escribe `src/data/properties.js`; el build de Astro consume ese módulo generado. GitHub Actions reconstruye el sitio a diario.

**Tech Stack:** Node 20, Astro 7, node:test.

**Spec:** `docs/superpowers/specs/2026-11-02-scraping-propiedades-design.md`

## Global Constraints

- No agregar dependencias.
- No mostrar inmuebles sin id, foto, ubicación o precio/canon.
- Máximo 6 inmuebles destacados; orden por id descendente.
- Si el scraping falla o devuelve cero inmuebles, no reemplazar `src/data/properties.js`.
- Campos de tarjeta: `id`, `title`, `location`, `price`, `type`, `details`, `image`, `featured`.

## Review Focus

- HTML de origen con bloques incompletos: deben descartarse sin romper el resto.
- HTML de origen con estructura cambiada: el parser devuelve 0 y el CLI aborta sin borrar el snapshot.
- Precio de venta en 0 y canon mayor a 0: debe clasificarse como `Arriendo`.
- Barrio vacío: usar la ciudad como ubicación visible.
- Detalles vacíos: la tarjeta no debe renderizar un párrafo vacío.

---

### Task 1: Parser y pruebas

**Files:**
- Create: `scripts/parse-properties.mjs`
- Test: `test/scrape-properties.test.mjs`

**Interfaces:**
- Produces: `parseProperties(html: string): Property[]`, `formatCOP(value: number | string): string`, `Property = { id, title, location, price, type, details, image, featured }`.

- [ ] **Step 1: Write the failing test**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProperties, formatCOP } from '../scripts/parse-properties.mjs';

const complete = `<div class='container1' ><img src='https://pictures.domus.la/inmobiliaria_228/5087_1_1792425851.jpg'><div class='styleTexto' ><b>Ciudad:</b> Bogotá - Bogota <br><b>Precio:</b> 990000000<br><b>Barrio:</b> El Chico <br><b>Renta:</b> 0 <br><b>Administracion:</b> 1802000 <br></div></div>`;
const incomplete = `<div class='container1' ><div class='styleTexto' ><b>Ciudad:</b> Bogotá <br><b>Precio:</b> 0<br><b>Barrio:</b> Sin foto <br><b>Renta:</b> 0 <br><b>Administracion:</b> 0 <br></div></div>`;

test('parsea solo inmuebles completos', () => {
  assert.deepEqual(parseProperties(complete + incomplete), [{
    id: '5087',
    title: 'Venta en El Chico',
    location: 'Bogotá',
    price: '$990.000.000',
    type: 'Venta',
    details: 'Administración $1.802.000',
    image: 'https://pictures.domus.la/inmobiliaria_228/5087_1_1792425851.jpg',
    featured: true
  }]);
});

test('clasifica arriendo cuando no hay precio de venta', () => {
  const html = complete.replace('5087_1', '5081_1').replace('990000000', '0').replace('<b>Renta:</b> 0', '<b>Renta:</b> 2400000');
  assert.equal(parseProperties(html)[0].type, 'Arriendo');
  assert.equal(parseProperties(html)[0].price, '$2.400.000');
});

test('ordena por id descendente y marca solo 6 destacados', () => {
  const html = Array.from({ length: 8 }, (_, i) => complete.replaceAll('5087', String(5000 + i))).join('');
  const result = parseProperties(html);
  assert.deepEqual(result.map((p) => p.id), ['5007', '5006', '5005', '5004', '5003', '5002', '5001', '5000']);
  assert.deepEqual(result.map((p) => p.featured), [true, true, true, true, true, true, false, false]);
});

test('formatea pesos colombianos', () => {
  assert.equal(formatCOP(990000000), '$990.000.000');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scrape-properties.test.mjs`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `scripts/parse-properties.mjs`**

`parseProperties` separa con `/<div class='container1'\s*>/`, extrae cada campo con regex sobre el bloque, descarta incompletos, deduplica por id, ordena descendente y marca `featured` en los primeros 6. `formatCOP` usa `Intl.NumberFormat('es-CO')` y antepone `$`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scrape-properties.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/parse-properties.mjs test/scrape-properties.test.mjs
git commit -m "feat: parsear inmuebles del listado publico"
```

---

### Task 2: Snapshot, carga y tarjeta

**Files:**
- Create: `scripts/scrape-properties.mjs`
- Modify: `src/data/properties.js` (generado por el scraper)
- Modify: `src/pages/index.astro`
- Modify: `package.json`

**Interfaces:**
- Consumes: `parseProperties` de Task 1.
- Produces: `properties` exportado desde `src/data/properties.js`.

- [ ] **Step 1: Implement `scripts/scrape-properties.mjs`**

Descarga `https://www.inmobiliariamakale.com.co/inmuebles/` con un `user-agent` de navegador, llama `parseProperties`, falla si no hay resultados y escribe el JSON en un temporal para renombrarlo solo al final.

- [ ] **Step 2: Ejecutar el scraper**

Run: `node scripts/scrape-properties.mjs`
Expected: imprime la cantidad de inmuebles y crea `src/data/properties.js`.

- [ ] **Step 3: Escribir el módulo generado en `src/data/properties.js`**

El CLI escribe `export const propertyTypes` y `export const properties` directamente, sin lectura de archivos en tiempo de build.

- [ ] **Step 4: Ocultar detalles vacíos en `src/pages/index.astro`**

Reemplazar el párrafo de detalles por `{property.details && <p class="property-details">{property.details}</p>}`.

- [ ] **Step 5: Añadir scripts en `package.json`**

```json
"scrape": "node scripts/scrape-properties.mjs",
"prebuild": "npm run scrape"
```

- [ ] **Step 6: Verificar pruebas y build**

Run: `npm test`
Expected: PASS.

Run: `npm run build`
Expected: build correcto con `src/data/properties.js` actualizado.

- [ ] **Step 7: Commit**

```bash
git add scripts/scrape-properties.mjs src/data/properties.js src/pages/index.astro package.json
git commit -m "feat: generar propiedades desde el sitio publico"
```

---

### Task 3: Actualización diaria

**Files:**
- Modify: `.github/workflows/astro.yml`

- [ ] **Step 1: Añadir el schedule**

Agregar bajo `on:`:

```yaml
  schedule:
    - cron: '0 5 * * *'
```

- [ ] **Step 2: Ejecutar el scraper antes del build**

Agregar un paso después de instalar dependencias:

```yaml
      - name: Actualizar inmuebles
        run: npm run scrape
        working-directory: ${{ env.BUILD_PATH }}
```

- [ ] **Step 3: Verificar el workflow**

Run: `npm test`
Expected: PASS.

Revisar que el YAML conserve `workflow_dispatch` y el job de deploy.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/astro.yml
git commit -m "ci: actualizar y publicar inmuebles a diario"
```
