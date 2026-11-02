const DOMUS_IMAGE = /https:\/\/pictures\.domus\.la\/inmobiliaria_228\/\d+_\d+_[^'"\s]+/;

function field(block, label) {
  const match = block.match(new RegExp(`<b>${label}:<\\/b>\\s*([^<]*)`));
  return match?.[1].trim() ?? '';
}

function amount(block, label) {
  return Number(field(block, label).replace(/\D/g, '')) || 0;
}

export function formatCOP(value) {
  return '$' + Number(String(value).replace(/\D/g, '')).toLocaleString('es-CO');
}

export function parseProperties(html) {
  const blocks = html.split(/<div class='container1'\s*>/).slice(1);
  const byId = new Map();

  for (const block of blocks) {
    const image = block.match(DOMUS_IMAGE)?.[0];
    const id = image?.match(/inmobiliaria_228\/(\d+)_/)?.[1];
    const city = field(block, 'Ciudad');
    const neighborhood = field(block, 'Barrio');
    const sale = amount(block, 'Precio');
    const rent = amount(block, 'Renta');
    const administration = amount(block, 'Administracion');
    const location = city.split(' - ')[0].trim();
    const name = neighborhood || location;

    if (!id || !image || !name || (sale <= 0 && rent <= 0)) continue;

    const type = rent > 0 && sale <= 0 ? 'Arriendo' : 'Venta';
    const price = type === 'Arriendo' ? rent : sale;

    byId.set(id, {
      id,
      title: `${type} en ${name}`,
      location,
      price: formatCOP(price),
      type,
      details: administration > 0 ? `Administración ${formatCOP(administration)}` : '',
      image,
      featured: false
    });
  }

  const properties = [...byId.values()].sort((a, b) => Number(b.id) - Number(a.id));
  for (const property of properties.slice(0, 6)) property.featured = true;
  return properties;
}
