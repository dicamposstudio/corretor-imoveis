document.addEventListener('DOMContentLoaded', () => {
  const { getProperties, cardTemplate, track } = window.DiCampos;
  const properties = getProperties();
  const form = document.getElementById('property-filters');
  const grid = document.getElementById('property-grid');
  const count = document.getElementById('result-count');
  const empty = document.getElementById('empty-state');
  const bairro = document.getElementById('filter-bairro');
  const tipo = document.getElementById('filter-tipo');
  const finalidade = document.getElementById('filter-finalidade');
  const quartos = document.getElementById('filter-quartos');
  const valor = document.getElementById('filter-valor');
  const clear = document.getElementById('clear-filters');
  const menu = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  [...new Set(properties.map(p => p.bairro))].sort().forEach(v => bairro.insertAdjacentHTML('beforeend', `<option>${v}</option>`));
  [...new Set(properties.map(p => p.tipo))].sort().forEach(v => tipo.insertAdjacentHTML('beforeend', `<option>${v}</option>`));

  function applyFilters() {
    const max = Number(valor.value || Infinity);
    const minBedrooms = Number(quartos.value || 0);
    const filtered = properties.filter(p => {
      if (['Vendido', 'Alugado'].includes(p.status)) return false;
      return (!finalidade.value || p.finalidade === finalidade.value)
        && (!bairro.value || p.bairro === bairro.value)
        && (!tipo.value || p.tipo === tipo.value)
        && (p.quartos >= minBedrooms)
        && (p.valor <= max);
    });

    grid.innerHTML = filtered.map(p => cardTemplate(p)).join('');
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;
    empty.hidden = filtered.length > 0;
    grid.hidden = filtered.length === 0;
    return filtered;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const result = applyFilters();
    track('filter_search', {
      finalidade: finalidade.value || 'todos', bairro: bairro.value || 'todos', tipo: tipo.value || 'todos',
      quartos: quartos.value || 'qualquer', valor: valor.value || 'sem limite', resultados: result.length
    });
  });

  [finalidade, bairro, tipo, quartos, valor].forEach(el => el.addEventListener('change', applyFilters));
  clear.addEventListener('click', () => {
    form.reset();
    applyFilters();
  });

  menu?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(isOpen));
    menu.textContent = isOpen ? '×' : '☰';
  });
  nav?.addEventListener('click', e => {
    if (e.target.matches('a')) {
      nav.classList.remove('open');
      menu?.setAttribute('aria-expanded', 'false');
      if (menu) menu.textContent = '☰';
    }
  });

  applyFilters();
});
