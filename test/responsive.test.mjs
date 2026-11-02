import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const styles = await readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8');

test('el layout de tablet usa dos columnas y un buscador a ancho completo', () => {
  assert.match(styles, /@media \(min-width: 48rem\) and \(max-width: 63\.99rem\)/);
  assert.match(styles, /@media \(min-width: 48rem\)[\s\S]*?\.property-grid \{[\s\S]*?grid-template-columns: repeat\(2, 1fr\)/);
  assert.match(styles, /@media \(min-width: 48rem\)[\s\S]*?\.search-panel \{[\s\S]*?display: block/);
  assert.match(styles, /@media \(min-width: 48rem\)[\s\S]*?\.main-nav \{[\s\S]*?width: 20rem/);
});

test('el menú compacto cubre tablet y móvil con objetivos táctiles', () => {
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.menu-toggle \{[\s\S]*?padding: 0\.6875rem/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.main-nav a:not\(\.nav-cta\) \{[\s\S]*?padding: 0\.75rem 0/);
});

test('el menú acompaña al usuario en móvil y tablet', () => {
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.site-header \{[\s\S]*?position: sticky/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?scroll-margin-top: 5\.75rem/);
  assert.match(styles, /\.main-nav\.is-open \{[\s\S]*?box-shadow:/);
  assert.match(styles, /@media \(max-width: 63\.99rem\)[\s\S]*?\.main-nav \{[\s\S]*?overflow-y: auto/);
});

test('la página completa no se estira más de 1400px', () => {
  assert.match(styles, /--page-max:\s*87\.5rem/);
  assert.match(styles, /body \{[\s\S]*?max-width: var\(--page-max\)/);
  assert.match(styles, /\.site-header \{[\s\S]*?padding: 0 max\(2\.5rem, calc\(\(100% - var\(--content-max\)\) \/ 2\)\)/);
});

test('las tarjetas permiten que el título encoja sin tapar el precio', () => {
  assert.match(styles, /\.property-info \{[\s\S]*?gap: 1rem/);
  assert.match(styles, /\.property-info > div \{[\s\S]*?min-width: 0/);
});
