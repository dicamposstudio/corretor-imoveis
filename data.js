(function () {
  const DEFAULT_PROPERTIES = [
    {
      id: 'JS-381', finalidade: 'Venda', tipo: 'Apartamento', titulo: 'Apartamento 3 quartos em Boa Viagem',
      bairro: 'Boa Viagem', cidade: 'Recife', valor: 750000, area: 92, quartos: 3, suites: 1, vagas: 2,
      condominio: 980, iptu: 3200, destaque: true, status: 'Disponível',
      descricao: 'Apartamento bem localizado, próximo ao Shopping Recife, com varanda, duas vagas e área de lazer completa.',
      imagem: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=82',
      galeria: [
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=82',
        'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=82',
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82'
      ],
      tags: ['Varanda', 'Área de lazer', 'Próximo ao shopping']
    },
    {
      id: 'JS-402', finalidade: 'Venda', tipo: 'Casa', titulo: 'Casa ampla em Casa Forte',
      bairro: 'Casa Forte', cidade: 'Recife', valor: 1250000, area: 180, quartos: 4, suites: 2, vagas: 3,
      condominio: 0, iptu: 4100, destaque: true, status: 'Disponível',
      descricao: 'Casa ampla em localização estratégica da Zona Norte, perto de escolas, restaurantes e principais vias.',
      imagem: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=82',
      galeria: [
        'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=82',
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82',
        'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=82'
      ],
      tags: ['Zona Norte', 'Quintal', 'Rua tranquila']
    },
    {
      id: 'JS-417', finalidade: 'Venda', tipo: 'Apartamento', titulo: 'Apartamento nas Graças',
      bairro: 'Graças', cidade: 'Recife', valor: 520000, area: 74, quartos: 2, suites: 1, vagas: 1,
      condominio: 720, iptu: 2100, destaque: true, status: 'Disponível',
      descricao: 'Imóvel para quem busca mobilidade, conforto e valorização em uma das regiões mais tradicionais do Recife.',
      imagem: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=82',
      galeria: [
        'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=82',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=82'
      ],
      tags: ['Mobilidade', 'Elevador', 'Portaria']
    },
    {
      id: 'JS-428', finalidade: 'Aluguel', tipo: 'Flat', titulo: 'Flat mobiliado em Boa Viagem',
      bairro: 'Boa Viagem', cidade: 'Recife', valor: 2800, area: 42, quartos: 1, suites: 1, vagas: 1,
      condominio: 680, iptu: 0, destaque: false, status: 'Disponível',
      descricao: 'Flat mobiliado a poucos minutos da praia, ideal para quem busca praticidade e serviços no entorno.',
      imagem: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=82',
      galeria: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=82'],
      tags: ['Mobiliado', 'Perto da praia', 'Pronto para morar']
    },
    {
      id: 'JS-435', finalidade: 'Aluguel', tipo: 'Sala comercial', titulo: 'Sala comercial na Ilha do Leite',
      bairro: 'Ilha do Leite', cidade: 'Recife', valor: 1900, area: 36, quartos: 0, suites: 0, vagas: 1,
      condominio: 590, iptu: 0, destaque: false, status: 'Disponível',
      descricao: 'Sala em empresarial completo, próxima ao polo médico e com fácil acesso às principais vias.',
      imagem: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=82',
      galeria: ['https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=82'],
      tags: ['Empresarial', 'Polo médico', 'Recepção']
    },
    {
      id: 'JS-441', finalidade: 'Aluguel', tipo: 'Apartamento', titulo: 'Apartamento na Boa Vista',
      bairro: 'Boa Vista', cidade: 'Recife', valor: 2200, area: 68, quartos: 2, suites: 0, vagas: 1,
      condominio: 610, iptu: 0, destaque: false, status: 'Reservado',
      descricao: 'Apartamento funcional em região central, próximo à Unicap e corredores de transporte.',
      imagem: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=82',
      galeria: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1400&q=82'],
      tags: ['Centro', 'Mobilidade', 'Universidades']
    }
  ];

  const STORE = {
    properties: 'dicampos_properties_v3',
    views: 'dicampos_views_v3',
    clicks: 'dicampos_clicks_v3',
    leads: 'dicampos_owner_leads_v3',
    events: 'dicampos_events_v3',
    deleted: 'dicampos_deleted_properties_v4'
  };

  function safeParse(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }
  function read(key, fallback) { return safeParse(localStorage.getItem(key), fallback); }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function getCustomProperties() { return read(STORE.properties, []); }
  function getDeletedProperties() { return read(STORE.deleted, []); }
  function getProperties() {
    const custom = getCustomProperties();
    const customIds = new Set(custom.map(p => p.id));
    const deleted = new Set(getDeletedProperties());
    const defaults = DEFAULT_PROPERTIES.filter(p => !customIds.has(p.id) && !deleted.has(p.id));
    return [...custom, ...defaults];
  }
  function getProperty(id) { return getProperties().find(p => p.id === id); }
  function money(value, finalidade) {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value || 0);
    return finalidade === 'Aluguel' ? `${formatted}/mês` : formatted;
  }
  function count(storeKey, id) {
    const map = read(storeKey, {});
    map[id] = (map[id] || 0) + 1;
    write(storeKey, map);
  }
  function track(type, payload = {}) {
    const events = read(STORE.events, []);
    events.unshift({ type, payload, at: new Date().toISOString() });
    write(STORE.events, events.slice(0, 250));
  }
  function trackView(property) {
    if (!property) return;
    count(STORE.views, property.id);
    track('property_view', { id: property.id, bairro: property.bairro, origem: getSource() });
  }
  function trackWhatsApp(property, origem = 'portal') {
    if (property) count(STORE.clicks, property.id);
    track('whatsapp_click', { id: property?.id || null, bairro: property?.bairro || null, origem });
  }
  function getSource() {
    const qs = new URLSearchParams(location.search);
    return qs.get('utm_source') || sessionStorage.getItem('dicampos_source') || 'direto';
  }
  function initSource() {
    const qs = new URLSearchParams(location.search);
    const source = qs.get('utm_source');
    if (source) sessionStorage.setItem('dicampos_source', source);
  }
  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  }
  function safeUrl(value) {
    try { const u = new URL(value, location.href); return ['http:','https:'].includes(u.protocol) ? escapeHtml(u.href) : ''; } catch (_) { return ''; }
  }
  function cardTemplate(p, compact = false) {
    const sold = ['Vendido', 'Alugado'].includes(p.status);
    const image = safeUrl(p.imagem) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82';
    return `
      <article class="property-card${compact ? ' compact' : ''}">
        <a class="property-image" href="imovel.html?id=${encodeURIComponent(p.id)}" aria-label="Ver ${escapeHtml(p.titulo)}">
          <img src="${image}" alt="${escapeHtml(p.titulo)}" loading="lazy" width="900" height="600">
          <span class="status-badge ${sold ? 'inactive' : ''}">${escapeHtml(p.status)}</span>
          <span class="purpose-badge">${escapeHtml(p.finalidade)}</span>
        </a>
        <div class="property-body">
          <span class="property-id">${escapeHtml(p.id)} · ${escapeHtml(p.bairro)}</span>
          <h3><a href="imovel.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.titulo)}</a></h3>
          <p>${escapeHtml(p.descricao)}</p>
          <div class="specs">
            <span>${p.area} m²</span>
            ${p.quartos ? `<span>${p.quartos} quarto${p.quartos > 1 ? 's' : ''}</span>` : ''}
            ${p.vagas ? `<span>${p.vagas} vaga${p.vagas > 1 ? 's' : ''}</span>` : ''}
          </div>
          <div class="property-footer">
            <strong class="price">${money(p.valor, p.finalidade)}</strong>
            <a class="card-link" href="imovel.html?id=${encodeURIComponent(p.id)}">Detalhes →</a>
          </div>
        </div>
      </article>`;
  }
  function whatsappUrl(text) {
    return `https://wa.me/${window.PHONE_WHATSAPP}?text=${encodeURIComponent(text)}`;
  }
  function bindGlobalTracking() {
    document.addEventListener('click', e => {
      const link = e.target.closest('.track-whatsapp');
      if (!link) return;
      const id = link.dataset.imovel;
      trackWhatsApp(id ? getProperty(id) : null, link.dataset.origem || 'portal');
    });
  }

  window.PHONE_WHATSAPP = '5581999999999';
  window.DiCampos = {
    DEFAULT_PROPERTIES, STORE, read, write, getProperties, getProperty, getCustomProperties, getDeletedProperties,
    money, track, trackView, trackWhatsApp, getSource, initSource, cardTemplate, whatsappUrl,
    bindGlobalTracking, escapeHtml, safeUrl
  };

  initSource();
  document.addEventListener('DOMContentLoaded', bindGlobalTracking, { once: true });
})();
