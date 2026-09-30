document.addEventListener('DOMContentLoaded', async () => {
  try { await AppBackend.requireSession(); } catch (_) { return; }
  const profile = await AppBackend.getOwnProfile() || await AppBackend.getProfile();
  await AppBackend.applyBranding();
  document.getElementById('broker-first-name').textContent = (profile?.name || 'corretor').split(' ')[0];
  document.getElementById('admin-mode').textContent = AppBackend.mode === 'demo' ? 'Modo demonstração' : 'Dados online';
  if (AppBackend.mode === 'demo') document.getElementById('seed-demo').hidden = false;

  const toast = (message, type = 'ok') => {
    const el = document.getElementById('admin-toast');
    el.textContent = message;
    el.className = `toast ${type}`;
    el.hidden = false;
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => { el.hidden = true; }, 3200);
  };

  document.getElementById('logout-button').addEventListener('click', () => AppBackend.signOut());
  document.getElementById('admin-menu-toggle').addEventListener('click', () => document.getElementById('admin-sidebar').classList.toggle('open'));
  document.querySelectorAll('.admin-menu a').forEach(a => a.addEventListener('click', () => document.getElementById('admin-sidebar').classList.remove('open')));

  let snapshot = null;
  const propertyTable = document.getElementById('property-table');
  const search = document.getElementById('property-search');

  const sumMap = (obj) => Object.values(obj || {}).reduce((acc, n) => acc + Number(n || 0), 0);
  const eventSource = (e) => e.source || e.payload?.origem || e.payload?.source || 'direto';
  const eventNeighborhood = (e, props) => {
    if (e.metadata?.bairro) return e.metadata.bairro;
    if (e.payload?.bairro) return e.payload.bairro;
    const p = props.find(x => x.uuid === e.property_id || x.id === e.payload?.id);
    return p?.bairro || null;
  };

  function renderMetrics(data) {
    const active = data.properties.filter(p => !['Vendido','Alugado'].includes(p.status)).length;
    const views = sumMap(data.views);
    const clicks = sumMap(data.clicks);
    const leads = data.leads.length;
    const cards = [
      ['Imóveis ativos', active, 'estoque publicado'],
      ['Visualizações', views, 'páginas de imóveis'],
      ['Cliques no WhatsApp', clicks, 'interesses registrados'],
      ['Leads', leads, 'compradores e proprietários']
    ];
    document.getElementById('metrics').innerHTML = cards.map(([label,value,caption]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${caption}</small></article>`).join('');
  }

  function propertyRow(p, data) {
    return `<tr data-search="${AppBackend.escapeHtml(`${p.id} ${p.titulo} ${p.bairro}`.toLowerCase())}">
      <td><div class="table-property"><img src="${AppBackend.safeUrl(p.imagem)}" alt=""><div><strong>${AppBackend.escapeHtml(p.titulo)}</strong><small>${AppBackend.escapeHtml(p.id)} · ${AppBackend.escapeHtml(p.bairro)}</small></div></div></td>
      <td><select class="status-select" data-status-id="${AppBackend.escapeHtml(p.uuid || p.id)}"><option ${p.status==='Disponível'?'selected':''}>Disponível</option><option ${p.status==='Reservado'?'selected':''}>Reservado</option><option ${p.status==='Vendido'?'selected':''}>Vendido</option><option ${p.status==='Alugado'?'selected':''}>Alugado</option></select></td>
      <td><strong>${AppBackend.money(p.valor,p.finalidade)}</strong></td>
      <td>${data.views[p.id] || 0}</td><td>${data.clicks[p.id] || 0}</td>
      <td><div class="row-actions"><a href="imovel.html?id=${encodeURIComponent(p.id)}" target="_blank" rel="noopener" title="Ver">↗</a><a href="novo-imovel.html?id=${encodeURIComponent(p.uuid || p.id)}" title="Editar">✎</a><button type="button" data-delete-id="${AppBackend.escapeHtml(p.uuid || p.id)}" data-delete-title="${AppBackend.escapeHtml(p.titulo)}" title="Excluir">×</button></div></td>
    </tr>`;
  }

  function renderProperties(data) {
    propertyTable.innerHTML = data.properties.map(p => propertyRow(p, data)).join('');
    document.getElementById('property-empty').hidden = data.properties.length > 0;

    document.querySelectorAll('[data-status-id]').forEach(select => select.addEventListener('change', async () => {
      const p = data.properties.find(x => (x.uuid || x.id) === select.dataset.statusId);
      if (!p) return;
      select.disabled = true;
      try { await AppBackend.updateProperty(select.dataset.statusId, { ...p, status: select.value }); toast('Status atualizado.'); }
      catch (err) { toast(err.message, 'error'); select.value = p.status; }
      finally { select.disabled = false; }
    }));

    document.querySelectorAll('[data-delete-id]').forEach(button => button.addEventListener('click', async () => {
      if (!confirm(`Excluir “${button.dataset.deleteTitle}”? Esta ação não pode ser desfeita.`)) return;
      try { await AppBackend.deleteProperty(button.dataset.deleteId); toast('Imóvel excluído.'); await loadDashboard(); }
      catch (err) { toast(err.message, 'error'); }
    }));
  }

  function renderLeads(data) {
    const container = document.getElementById('lead-list');
    document.getElementById('lead-count').textContent = `${data.leads.length} recebidos`;
    if (!data.leads.length) { container.innerHTML = '<div class="empty-inline">Nenhum lead recebido ainda.</div>'; return; }
    container.innerHTML = data.leads.slice(0, 30).map(l => {
      const payload = l.payload || l;
      const type = l.lead_type || payload.lead_type || 'owner';
      const phone = l.phone || payload.telefone || payload.phone || '';
      const name = l.name || payload.nome || payload.name || 'Contato';
      const detail = type === 'owner'
        ? `${payload.finalidade || payload.purpose || 'Imóvel'} · ${payload.bairro || payload.neighborhood || ''}`
        : `${payload.imovel || payload.property_code || 'Interessado em imóvel'}`;
      return `<article class="lead-item"><div><span class="lead-type">${type === 'owner' ? 'Proprietário' : 'Comprador'}</span><strong>${AppBackend.escapeHtml(name)}</strong><span>${AppBackend.escapeHtml(detail)}</span><small>${new Date(l.created_at || l.at || Date.now()).toLocaleString('pt-BR')}</small></div>${phone ? `<a class="btn btn-small" target="_blank" rel="noopener" href="${AppBackend.whatsappUrl(phone, `Olá, ${name}. Recebi seu contato pelo meu portal imobiliário.`)}">WhatsApp</a>` : ''}</article>`;
    }).join('');
  }

  function renderBars(id, pairs) {
    const container = document.getElementById(id);
    if (!pairs.length) { container.innerHTML = '<div class="empty-inline">Ainda sem dados suficientes.</div>'; return; }
    const max = Math.max(...pairs.map(([,v]) => v), 1);
    container.innerHTML = pairs.slice(0,6).map(([label,value]) => `<div class="bar-item"><div><span>${AppBackend.escapeHtml(label)}</span><strong>${value}</strong></div><div class="bar-track"><i style="width:${Math.round(value/max*100)}%"></i></div></div>`).join('');
  }

  function renderInsights(data) {
    const neighborhood = {};
    const sources = {};
    (data.events || []).forEach(e => {
      if ((e.event_name || e.type) === 'property_view') {
        const b = eventNeighborhood(e, data.properties);
        if (b) neighborhood[b] = (neighborhood[b] || 0) + 1;
      }
      if ((e.event_name || e.type) === 'whatsapp_click') {
        const s = eventSource(e);
        sources[s] = (sources[s] || 0) + 1;
      }
    });
    renderBars('neighborhood-bars', Object.entries(neighborhood).sort((a,b) => b[1]-a[1]));
    renderBars('source-bars', Object.entries(sources).sort((a,b) => b[1]-a[1]));
  }

  function renderSelection(data) {
    const container = document.getElementById('selection-options');
    const active = data.properties.filter(p => !['Vendido','Alugado'].includes(p.status));
    container.innerHTML = active.slice(0,30).map(p => `<label class="selection-option"><input type="checkbox" value="${AppBackend.escapeHtml(p.uuid || p.id)}"><span><strong>${AppBackend.escapeHtml(p.id)} · ${AppBackend.escapeHtml(p.bairro)}</strong><small>${AppBackend.escapeHtml(p.titulo)}</small></span></label>`).join('');
  }

  async function loadDashboard() {
    document.getElementById('metrics').innerHTML = '<div class="loading-card">Carregando dados...</div>';
    snapshot = await AppBackend.getDashboardData();
    renderMetrics(snapshot); renderProperties(snapshot); renderLeads(snapshot); renderInsights(snapshot); renderSelection(snapshot);
  }

  search.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    propertyTable.querySelectorAll('tr').forEach(row => { row.hidden = term && !row.dataset.search.includes(term); });
  });
  document.getElementById('refresh-dashboard').addEventListener('click', loadDashboard);

  document.getElementById('generate-selection').addEventListener('click', async () => {
    const ids = [...document.querySelectorAll('#selection-options input:checked')].map(i => i.value);
    if (!ids.length) { toast('Selecione pelo menos um imóvel.', 'error'); return; }
    const clientName = document.getElementById('selection-client').value.trim();
    try {
      const result = await AppBackend.createSelection({ clientName, propertyIds: ids });
      const token = result.token;
      const url = new URL(`selecao.html?token=${encodeURIComponent(token)}`, location.href).href;
      const box = document.getElementById('selection-result');
      box.innerHTML = `<strong>Link criado</strong><input class="form-control" readonly value="${AppBackend.escapeHtml(url)}"><button class="text-button" id="copy-selection" type="button">Copiar link</button>`;
      box.hidden = false;
      document.getElementById('copy-selection').addEventListener('click', async () => { await navigator.clipboard.writeText(url); toast('Link copiado.'); });
    } catch (err) { toast(err.message, 'error'); }
  });

  document.getElementById('seed-demo').addEventListener('click', async () => {
    const props = snapshot?.properties || [];
    for (let i = 0; i < 18; i++) {
      const p = props[i % Math.max(props.length,1)];
      if (p) window.DiCampos.trackView(p);
    }
    for (let i = 0; i < 7; i++) {
      const p = props[i % Math.max(props.length,1)];
      if (p) window.DiCampos.trackWhatsApp(p, ['instagram','google','direto'][i%3]);
    }
    toast('Atividade demonstrativa criada.'); await loadDashboard();
  });

  try { await loadDashboard(); } catch (err) { toast(`Erro ao carregar painel: ${err.message}`, 'error'); }
});
