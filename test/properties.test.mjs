import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { properties, propertyTypes } from '../src/data/properties.js';

const page = await readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const styles = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');
const script = await readFile(new URL('../src/scripts/site.js', import.meta.url), 'utf8');

test('la página tiene propiedades destacadas con la información mínima visible', () => {
  assert.ok(properties.length >= 3);
  for (const property of properties) {
    assert.ok(property.id);
    assert.ok(property.title);
    assert.ok(property.location);
    assert.ok(property.price);
    assert.ok(property.image);
  }
});

test('los tipos del buscador contienen compra y arriendo', () => {
  assert.deepEqual(propertyTypes, ['Comprar', 'Arrendar']);
});

test('la página incluye navegación accesible y un formulario identificable', () => {
  assert.match(page, /class="skip-link" href="#main-content"/);
  assert.match(page, /<main id="main-content">/);
  assert.match(page, /class="property-search"[\s\S]*id="property-search"[\s\S]*autocomplete="off"/);
  assert.match(page, /name="location"[^>]+autocomplete="address-level2"/);
  assert.match(page, /aria-label={`Ver \$\{property.title\}, \$\{property.type\}`}/);
});

test('la interfaz ofrece foco visible y respeta movimiento reducido', () => {
  assert.match(styles, /:focus-visible/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
  assert.match(styles, /scroll-margin-top/);
  assert.match(styles, /--muted:\s*#626262/);
  assert.match(styles, /\.contact-section \.eyebrow[\s\S]*color:\s*#fff/);
  assert.match(styles, /\.services-section \.eyebrow[\s\S]*color:\s*#a51d27/);
  assert.match(styles, /\.contact-details > p:first-child[\s\S]*color:\s*#fff/);
});

test('el CSS usa tokens y escalas fluidas para el layout responsive', () => {
  assert.match(styles, /--space-\w+:/);
  assert.match(styles, /--duration-\w+:/);
  assert.match(styles, /font-size:\s*clamp\(/);
  assert.doesNotMatch(styles, /@media \([^)]*:\s*\d+px/);
});

test('el menú comunica su estado y puede cerrarse con Escape', () => {
  assert.doesNotMatch(script, /mainNav\.setAttribute\('aria-hidden'/);
  assert.match(script, /setAttribute\('aria-expanded'/);
  assert.match(script, /event\.key === 'Escape'/);
  assert.match(script, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/);
});

test('el CSS ofrece fallbacks y mejoras opcionales entre navegadores', () => {
  assert.match(styles, /@supports\s*\(/);
  assert.match(styles, /overflow-wrap:\s*anywhere/);
  assert.match(styles, /backdrop-filter:/);
});

test('el CSS incorpora movimiento ligero y accesible', () => {
  assert.match(styles, /@keyframes\s+\w+/);
  assert.match(styles, /animation:\s*\w+/);
  assert.match(styles, /\.main-nav\.is-open[\s\S]*opacity:\s*1/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*animation:\s*none/);
  assert.match(styles, /prefers-reduced-motion: reduce[\s\S]*\.button:focus-visible[\s\S]*transform:\s*none/);
});

test('los enlaces del menú conservan un nombre accesible aunque estén ocultos', () => {
  for (const label of ['Inicio', 'Propiedades', 'Servicios', 'Nosotros', 'Contacto', 'Hablar con un asesor']) {
    assert.match(page, new RegExp(`aria-label="${label}"`));
  }
});

test('el menú actualiza su etiqueta accesible al cambiar de estado', () => {
  assert.match(script, /setAttribute\(['"]aria-label['"][\s\S]*Abrir menú/);
  assert.match(script, /setAttribute\(['"]aria-label['"][\s\S]*Cerrar menú/);
});
