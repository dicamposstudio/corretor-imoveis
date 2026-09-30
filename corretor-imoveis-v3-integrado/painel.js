document.addEventListener('DOMContentLoaded', () => {
  const { STORE, read, write, getProperties, money, track } = window.DiCampos;
  const metrics = document.getElementById('metrics');
  const table = document.getElementById('property-table');
  const ownerLeads = document.getElementById('owner-leads');
  const ownerLeadCount = document.getElementById('owner-lead-count');
  const neighborhoodBars = document.getElementById('neighborhood-bars');
  const sourceBars = document.getElementById('source-bars');
  const selectionOptions = document.getElementById('selection-options');
  const selectionResult = document.getElementById('selection-result');
  const properties = getProperties();

  function render() {
    const views = read(STORE.views, {});
    const clicks = read(STORE.clicks, {});
    const leads = read(STORE.leads, []);
    const events = read(STORE.events, []);
    const totalViews = Object.values(views).reduce((a, b) => a + b, 0);
    const totalClicks = Object.values(clicks).reduce((a, b) => a + b, 0);
    const active = properties.filter(p => !['Vendido', 'Alugado'].includes(p.status)).length;
    const conversion = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : '0,0';

    metrics.innerHTML = [
      ['Imóveis ativos', active, 'estoque público'],
      ['Visualizações', totalViews, 'fichas de imóvel'],
      ['Cliques WhatsApp', totalClicks, `${conversion}% das visualizações`],
      ['Proprietários', leads.length, 'leads captados']
    ].map(([label, value, note]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join('');

    table.innerHTML = properties.map(p => `<tr>
      <td><strong>${p.id}</strong><span>${p.titulo}</span></td>
      <td><span class="table-status">${p.status}</span></td>
      <td>${money(p.valor, p.finalidade)}</td>
      <td>${views[p.id] || 0}</td>
      <td>${clicks[p.id] || 0}</td>
    </tr>`).join('');

    ownerLeadCount.textContent = `${leads.length} ${leads.length === 1 ? 'lead' : 'leads'}`;
    ownerLeads.innerHTML = leads.length ? leads.map(l => `<article class="lead-item"><div><strong>${escapeHtml(l.nome)}</strong><span>${escapeHtml(l.tipo)} · ${escapeHtml(l.finalidade)} · ${escapeHtml(l.bairro)}</span></div><div class="lead-meta"><span>${l.area || 0} m²</span>${l.valor ? `<span>${money(l.valor, l.finalidade)}</span>` : ''}<span>${formatDate(l.createdAt)}</span></div></article>`).join('') : '<div class="empty-inline"><strong>Nenhum proprietário captado ainda.</strong><span>Use o formulário “Anuncie seu imóvel” para gerar um lead de demonstração.</span></div>';

    renderNeighborhoods(events, views);
    renderSources(events);
    selectionOptions.innerHTML = properties.filter(p => p.status === 'Disponível').map(p => `<label class="selection-option"><input type="checkbox" value="${p.id}"><span><strong>${p.id}</strong>${p.titulo}<small>${p.bairro} · ${money(p.valor, p.finalidade)}</small></span></label>`).join('');
  }

  function renderNeighborhoods(events, views) {
    const counts = {};
    properties.forEach(p => counts[p.bairro] = (counts[p.bairro] || 0) + (views[p.id] || 0));
    events.filter(e => e.type === 'filter_search' && e.payload.bairro && e.payload.bairro !== 'todos').forEach(e => counts[e.payload.bairro] = (counts[e.payload.bairro] || 0) + 1);
    renderBars(neighborhoodBars, counts, 'Sem dados de bairro ainda.');
  }

  function renderSources(events) {
    const counts = {};
    events.filter(e => e.type === 'whatsapp_click').forEach(e => {
      const source = e.payload.origem || 'direto';
      counts[source] = (counts[source] || 0) + 1;
    });
    renderBars(sourceBars, counts, 'Sem contatos rastreados ainda.');
  }

  function renderBars(container, counts, emptyText) {
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
    if (!entries.length || entries.every(([,v]) => v === 0)) {
      container.innerHTML = `<div class="empty-inline"><span>${emptyText}</span></div>`;
      return;
    }
    const max = Math.max(...entries.map(([,v]) => v), 1);
    container.innerHTML = entries.map(([label, value]) => `<div class="bar-row"><div><span>${escapeHtml(label)}</span><strong>${value}</strong></div><div class="bar-track"><span style="width:${Math.max(8, value / max * 100)}%"></span></div></div>`).join('');
  }

  function seedDemo() {
    const views = read(STORE.views, {});
    const clicks = read(STORE.clicks, {});
    const additions = {'JS-381': 32, 'JS-402': 14, 'JS-417': 23, 'JS-428': 11, 'JS-435': 7, 'JS-441': 5};
    const clickAdds = {'JS-381': 8, 'JS-402': 3, 'JS-417': 5, 'JS-428': 3, 'JS-435': 1, 'JS-441': 1};
    Object.entries(additions).forEach(([id, n]) => views[id] = (views[id] || 0) + n);
    Object.entries(clickAdds).forEach(([id, n]) => clicks[id] = (clicks[id] || 0) + n);
    write(STORE.views, views); write(STORE.clicks, clicks);
    const events = read(STORE.events, []);
    ['google-ads','instagram','google-organico','meta-ads','direto','instagram','google-ads','google-organico','google-ads','instagram'].forEach((origem, i) => events.unshift({ type:'whatsapp_click', payload:{ origem, id: i % 2 ? 'JS-417' : 'JS-381', bairro: i % 2 ? 'Graças' : 'Boa Viagem' }, at:new Date(Date.now()-i*3600000).toISOString() }));
    write(STORE.events, events.slice(0,250));
    if (!read(STORE.leads, []).length) {
      write(STORE.leads, [
        {id:'PROP-810221', nome:'Mariana Souza', telefone:'(81) 99999-0001', finalidade:'Venda', tipo:'Apartamento', bairro:'Boa Viagem', area:88, valor:720000, status:'Novo', createdAt:new Date().toISOString()},
        {id:'PROP-810104', nome:'Carlos Menezes', telefone:'(81) 99999-0002', finalidade:'Aluguel', tipo:'Flat', bairro:'Pina', area:44, valor:3200, status:'Novo', createdAt:new Date(Date.now()-86400000).toISOString()}
      ]);
    }
    track('demo_seeded');
    render();
  }

  function resetDemo() {
    [STORE.views, STORE.clicks, STORE.leads, STORE.events, STORE.properties].forEach(k => localStorage.removeItem(k));
    location.reload();
  }

  document.getElementById('seed-demo').addEventListener('click', seedDemo);
  document.getElementById('reset-demo').addEventListener('click', resetDemo);
  document.getElementById('generate-selection').addEventListener('click', () => {
    const ids = [...selectionOptions.querySelectorAll('input:checked')].map(x => x.value);
    if (!ids.length) {
      selectionResult.hidden = false;
      selectionResult.innerHTML = '<strong>Escolha pelo menos um imóvel.</strong><p>Marque as opções que deseja enviar ao cliente.</p>';
      return;
    }
    const url = `${location.origin}${location.pathname.replace(/painel\.html$/, 'selecao.html')}?ids=${encodeURIComponent(ids.join(','))}`;
    selectionResult.hidden = false;
    selectionResult.innerHTML = `<strong>Seleção pronta.</strong><p>Abra a página abaixo ou copie o endereço para compartilhar.</p><div class="inline-actions"><a class="card-link" href="selecao.html?ids=${encodeURIComponent(ids.join(','))}" target="_blank">Abrir seleção →</a><button type="button" class="text-button" id="copy-selection">Copiar link</button></div>`;
    document.getElementById('copy-selection').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(url); document.getElementById('copy-selection').textContent = 'Link copiado'; }
      catch (_) { prompt('Copie este link:', url); }
    });
    track('selection_created', { ids });
  });

  function formatDate(value) {
    try { return new Intl.DateTimeFormat('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'}).format(new Date(value)); }
    catch (_) { return ''; }
  }
  function escapeHtml(value='') {
    return String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }

  render();
});
