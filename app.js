document.addEventListener('DOMContentLoaded', async () => {
  const profile = await AppBackend.applyBranding();
  const properties = await AppBackend.getProperties();
  const portfolioCount = document.getElementById('portfolio-count');
  if (portfolioCount) portfolioCount.textContent = properties.length;
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

  document.querySelectorAll('.track-whatsapp').forEach(link => {
    const existing = new URL(link.href);
    const text = existing.searchParams.get('text') || 'Olá! Gostaria de informações sobre os imóveis disponíveis.';
    link.href = AppBackend.whatsappUrl(profile?.whatsapp, text);
    link.addEventListener('click', () => AppBackend.trackEvent('whatsapp_click', { source: link.dataset.origem || AppBackend.getSource(), metadata: { origem: link.dataset.origem || 'portal' } }));
  });

  [...new Set(properties.map(p => p.bairro).filter(Boolean))].sort().forEach(v => bairro.insertAdjacentHTML('beforeend', `<option>${AppBackend.escapeHtml(v)}</option>`));
  [...new Set(properties.map(p => p.tipo).filter(Boolean))].sort().forEach(v => tipo.insertAdjacentHTML('beforeend', `<option>${AppBackend.escapeHtml(v)}</option>`));

  function applyFilters() {
    const max = Number(valor.value || Infinity);
    const minBedrooms = Number(quartos.value || 0);
    const filtered = properties.filter(p => (!finalidade.value || p.finalidade === finalidade.value) && (!bairro.value || p.bairro === bairro.value) && (!tipo.value || p.tipo === tipo.value) && p.quartos >= minBedrooms && p.valor <= max);
    grid.innerHTML = filtered.map(p => AppBackend.cardTemplate(p)).join('');
    count.textContent = `${filtered.length} ${filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}`;
    empty.hidden = filtered.length > 0; grid.hidden = filtered.length === 0;
    return filtered;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const result = applyFilters();
    AppBackend.trackEvent('filter_search', { metadata: { finalidade: finalidade.value || 'todos', bairro: bairro.value || 'todos', tipo: tipo.value || 'todos', quartos: quartos.value || 'qualquer', valor: valor.value || 'sem limite', resultados: result.length } });
  });
  [finalidade,bairro,tipo,quartos,valor].forEach(el => el.addEventListener('change', applyFilters));
  clear.addEventListener('click', () => { form.reset(); applyFilters(); });
  menu?.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', String(open)); menu.textContent = open ? '×' : '☰'; });
  nav?.addEventListener('click', e => { if (e.target.matches('a')) { nav.classList.remove('open'); menu?.setAttribute('aria-expanded','false'); if (menu) menu.textContent='☰'; } });
  applyFilters();
});
