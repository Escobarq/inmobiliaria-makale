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
