(function () {
  'use strict';

  const config = window.APP_CONFIG || {};
  const DEMO_SESSION_KEY = 'dicampos_demo_admin_session';
  const DEMO_PROFILE_KEY = 'dicampos_demo_profile';
  const DEMO_SELECTIONS_KEY = 'dicampos_demo_selections_v4';

  const configured = Boolean(
    !config.demoMode &&
    config.supabaseUrl && !config.supabaseUrl.includes('SEU-PROJETO') &&
    config.supabaseAnonKey && !config.supabaseAnonKey.includes('SUA-CHAVE') &&
    window.supabase?.createClient
  );

  const client = configured
    ? window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      })
    : null;

  const safeJson = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  };
  const localRead = (key, fallback) => safeJson(localStorage.getItem(key), fallback);
  const localWrite = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const nowIso = () => new Date().toISOString();
  const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));
  const fallbackProfile = () => ({ ...(config.fallbackProfile || {}), ...(localRead(DEMO_PROFILE_KEY, {}) || {}) });

  function getSource() {
    const qs = new URLSearchParams(location.search);
    return qs.get('utm_source') || qs.get('source') || sessionStorage.getItem('dicampos_source') || 'direto';
  }
  function initSource() {
    const qs = new URLSearchParams(location.search);
    const source = qs.get('utm_source') || qs.get('source');
    if (source) sessionStorage.setItem('dicampos_source', source);
  }
  function getSessionId() {
    let id = sessionStorage.getItem('dicampos_session_id');
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      sessionStorage.setItem('dicampos_session_id', id);
    }
    return id;
  }

  function mapProperty(row) {
    if (!row) return null;
    return {
      uuid: row.id || null,
      id: row.code || row.id,
      finalidade: row.purpose,
      tipo: row.property_type,
      titulo: row.title,
      bairro: row.neighborhood,
      cidade: row.city,
      valor: Number(row.price || 0),
      area: Number(row.area || 0),
      quartos: Number(row.bedrooms || 0),
      suites: Number(row.suites || 0),
      vagas: Number(row.parking_spaces || 0),
      condominio: Number(row.condo_fee || 0),
      iptu: Number(row.iptu || 0),
      destaque: Boolean(row.is_featured),
      status: row.status,
      descricao: row.description || '',
      imagem: row.cover_url || (row.image_urls || [])[0] || '',
      galeria: row.image_urls || (row.cover_url ? [row.cover_url] : []),
      tags: row.features || [],
      published: row.published !== false,
      created_at: row.created_at,
      updated_at: row.updated_at
    };
  }

  function propertyPayload(input, brokerId) {
    return {
      broker_id: brokerId,
      code: String(input.id || input.code || '').trim(),
      title: String(input.titulo || input.title || '').trim(),
      purpose: input.finalidade || input.purpose || 'Venda',
      property_type: input.tipo || input.property_type || 'Apartamento',
      status: input.status || 'Disponível',
      neighborhood: String(input.bairro || input.neighborhood || '').trim(),
      city: String(input.cidade || input.city || 'Recife').trim(),
      price: Number(input.valor ?? input.price ?? 0),
      area: Number(input.area || 0),
      bedrooms: Number(input.quartos ?? input.bedrooms ?? 0),
      suites: Number(input.suites || 0),
      parking_spaces: Number(input.vagas ?? input.parking_spaces ?? 0),
      condo_fee: Number(input.condominio ?? input.condo_fee ?? 0),
      iptu: Number(input.iptu || 0),
      description: String(input.descricao || input.description || '').trim(),
      features: Array.isArray(input.tags || input.features) ? (input.tags || input.features) : String(input.tags || input.features || '').split(',').map(v => v.trim()).filter(Boolean),
      cover_url: input.imagem || input.cover_url || '',
      image_urls: input.galeria || input.image_urls || (input.imagem ? [input.imagem] : []),
      is_featured: Boolean(input.destaque ?? input.is_featured),
      published: input.published !== false,
      updated_at: nowIso()
    };
  }

  async function getProfile() {
    if (!client) return fallbackProfile();
    const { data, error } = await client.from('profiles').select('*').eq('slug', config.brokerSlug).eq('active', true).maybeSingle();
    if (error) throw error;
    return data || fallbackProfile();
  }

  async function getOwnProfile() {
    if (!client) return fallbackProfile();
    const user = await getCurrentUser();
    if (!user) return null;
    const { data, error } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async function saveProfile(input) {
    if (!client) {
      const merged = { ...fallbackProfile(), ...input };
      localWrite(DEMO_PROFILE_KEY, merged);
      return merged;
    }
    const user = await requireSession();
    const payload = {
      name: input.name,
      brand_name: input.brand_name,
      initials: input.initials,
      creci: input.creci,
      whatsapp: String(input.whatsapp || '').replace(/\D/g, ''),
      email: input.email,
      city: input.city,
      region: input.region,
      bio: input.bio,
      avatar_url: input.avatar_url || null,
      updated_at: nowIso()
    };
    const { data, error } = await client.from('profiles').update(payload).eq('id', user.id).select().single();
    if (error) throw error;
    return data;
  }

  async function getProperties({ includeInactive = false, own = false } = {}) {
    if (!client) {
      const all = window.DiCampos?.getProperties?.() || [];
      return includeInactive ? all : all.filter(p => !['Vendido', 'Alugado'].includes(p.status));
    }
    let brokerId;
    if (own) {
      const user = await requireSession();
      brokerId = user.id;
    } else {
      const profile = await getProfile();
      brokerId = profile.id;
    }
    let query = client.from('properties').select('*').eq('broker_id', brokerId).order('created_at', { ascending: false });
    if (!own) query = query.eq('published', true);
    if (!includeInactive) query = query.not('status', 'in', '(Vendido,Alugado)');
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapProperty);
  }

  async function getProperty(identifier, { own = false } = {}) {
    if (!client) return window.DiCampos?.getProperty?.(identifier) || null;
    let query = client.from('properties').select('*');
    if (own) {
      const user = await requireSession();
      query = query.eq('broker_id', user.id);
    } else {
      const profile = await getProfile();
      query = query.eq('broker_id', profile.id).eq('published', true);
    }
    query = isUuid(identifier) ? query.eq('id', identifier) : query.eq('code', identifier);
    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    return mapProperty(data);
  }

  async function createProperty(input) {
    if (!client) {
      const custom = window.DiCampos?.getCustomProperties?.() || [];
      const item = { ...input, id: String(input.id || `JS-${Date.now().toString().slice(-4)}`) };
      if ((window.DiCampos?.getProperties?.() || []).some(p => p.id === item.id)) throw new Error('Já existe um imóvel com esse código.');
      custom.unshift(item);
      window.DiCampos.write(window.DiCampos.STORE.properties, custom);
      return item;
    }
    const user = await requireSession();
    const payload = { ...propertyPayload(input, user.id), created_at: nowIso() };
    const { data, error } = await client.from('properties').insert(payload).select().single();
    if (error) throw error;
    return mapProperty(data);
  }

  async function updateProperty(identifier, input) {
    if (!client) {
      const defaults = window.DiCampos?.DEFAULT_PROPERTIES || [];
      const custom = window.DiCampos?.getCustomProperties?.() || [];
      const existing = [...defaults, ...custom].find(p => p.id === identifier);
      if (!existing) throw new Error('Imóvel não encontrado.');
      const merged = { ...existing, ...input, id: input.id || existing.id };
      const nextCustom = custom.filter(p => p.id !== identifier);
      nextCustom.unshift(merged);
      window.DiCampos.write(window.DiCampos.STORE.properties, nextCustom);
      return merged;
    }
    const user = await requireSession();
    const payload = propertyPayload(input, user.id);
    let query = client.from('properties').update(payload).eq('broker_id', user.id);
    query = isUuid(identifier) ? query.eq('id', identifier) : query.eq('code', identifier);
    const { data, error } = await query.select().single();
    if (error) throw error;
    return mapProperty(data);
  }

  async function removePropertyImages(urls) {
    if (!client || !urls?.length) return;
    const user = await requireSession();
    const marker = '/storage/v1/object/public/property-images/';
    const paths = urls.map(url => {
      try {
        const pathname = new URL(url).pathname;
        const idx = pathname.indexOf(marker);
        if (idx < 0) return null;
        const path = decodeURIComponent(pathname.slice(idx + marker.length));
        return path.startsWith(`${user.id}/`) ? path : null;
      } catch (_) { return null; }
    }).filter(Boolean);
    if (paths.length) {
      const { error } = await client.storage.from('property-images').remove(paths);
      if (error) console.warn('Não foi possível remover uma ou mais imagens:', error.message);
    }
  }

  async function deleteProperty(identifier) {
    if (!client) {
      const custom = window.DiCampos?.getCustomProperties?.() || [];
      const next = custom.filter(p => p.id !== identifier);
      window.DiCampos.write(window.DiCampos.STORE.properties, next);
      const deleted = window.DiCampos?.getDeletedProperties?.() || [];
      if (!deleted.includes(identifier)) deleted.push(identifier);
      window.DiCampos.write(window.DiCampos.STORE.deleted, deleted);
      return true;
    }
    const user = await requireSession();
    const existing = await getProperty(identifier, { own: true });
    let query = client.from('properties').delete().eq('broker_id', user.id);
    query = isUuid(identifier) ? query.eq('id', identifier) : query.eq('code', identifier);
    const { error } = await query;
    if (error) throw error;
    if (existing) await removePropertyImages(existing.galeria || []);
    return true;
  }

  async function uploadPropertyImages(files) {
    const list = Array.from(files || []);
    if (!list.length) return [];
    if (!client) {
      const toDataUrl = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
      });
      const urls = [];
      for (const file of list) {
        if (file.size > 900000) throw new Error('No modo demonstração, use imagens menores que 900 KB ou uma URL. No Supabase, o limite configurado é 10 MB.');
        urls.push(await toDataUrl(file));
      }
      return urls;
    }
    const user = await requireSession();
    const urls = [];
    for (const file of list) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${user.id}/${Date.now()}-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await client.storage.from('property-images').upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type || undefined });
      if (error) throw error;
      const { data } = client.storage.from('property-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  }

  async function createLead(input) {
    if (!client) {
      const leads = window.DiCampos.read(window.DiCampos.STORE.leads, []);
      const item = { id: `L-${Date.now()}`, ...input, at: nowIso(), created_at: nowIso() };
      leads.unshift(item);
      window.DiCampos.write(window.DiCampos.STORE.leads, leads.slice(0, 500));
      return item;
    }
    const profile = await getProfile();
    const payload = {
      broker_id: profile.id,
      property_id: input.property_uuid || null,
      lead_type: input.lead_type || 'owner',
      name: input.name || input.nome || null,
      phone: input.phone || input.telefone || null,
      email: input.email || null,
      message: input.message || input.observacoes || null,
      source: input.source || getSource(),
      payload: input.payload || input,
      created_at: nowIso()
    };
    const { data, error } = await client.from('leads').insert(payload).select().single();
    if (error) throw error;
    return data;
  }

  async function getLeads() {
    if (!client) return window.DiCampos.read(window.DiCampos.STORE.leads, []);
    const user = await requireSession();
    const { data, error } = await client.from('leads').select('*').eq('broker_id', user.id).order('created_at', { ascending: false }).limit(500);
    if (error) throw error;
    return data || [];
  }

  async function trackEvent(eventName, { property = null, metadata = {}, source = null } = {}) {
    if (!client) {
      if (property && eventName === 'property_view') window.DiCampos.trackView(property);
      else if (property && eventName === 'whatsapp_click') window.DiCampos.trackWhatsApp(property, source || getSource());
      else window.DiCampos.track(eventName, { ...metadata, id: property?.id || null, bairro: property?.bairro || null, origem: source || getSource() });
      return;
    }
    try {
      const profile = await getProfile();
      await client.from('events').insert({
        broker_id: profile.id,
        property_id: property?.uuid || null,
        event_name: eventName,
        source: source || getSource(),
        page_path: location.pathname + location.search,
        session_id: getSessionId(),
        metadata,
        created_at: nowIso()
      });
    } catch (err) {
      console.warn('Tracking não registrado:', err.message);
    }
  }

  async function getDashboardData() {
    const properties = await getProperties({ includeInactive: true, own: true });
    if (!client) {
      const leads = await getLeads();
      const events = window.DiCampos.read(window.DiCampos.STORE.events, []);
      const views = window.DiCampos.read(window.DiCampos.STORE.views, {});
      const clicks = window.DiCampos.read(window.DiCampos.STORE.clicks, {});
      return { properties, leads, events, views, clicks };
    }
    const user = await requireSession();
    const [{ data: leads, error: leadsError }, { data: events, error: eventsError }] = await Promise.all([
      client.from('leads').select('*').eq('broker_id', user.id).order('created_at', { ascending: false }).limit(500),
      client.from('events').select('*').eq('broker_id', user.id).order('created_at', { ascending: false }).limit(2000)
    ]);
    if (leadsError) throw leadsError;
    if (eventsError) throw eventsError;
    const views = {};
    const clicks = {};
    const byUuid = Object.fromEntries(properties.filter(p => p.uuid).map(p => [p.uuid, p.id]));
    (events || []).forEach(e => {
      const key = byUuid[e.property_id] || e.property_id;
      if (!key) return;
      if (e.event_name === 'property_view') views[key] = (views[key] || 0) + 1;
      if (e.event_name === 'whatsapp_click') clicks[key] = (clicks[key] || 0) + 1;
    });
    return { properties, leads: leads || [], events: events || [], views, clicks };
  }

  async function createSelection({ clientName = '', propertyIds = [] }) {
    if (!client) {
      const token = Math.random().toString(36).slice(2, 10);
      const selections = localRead(DEMO_SELECTIONS_KEY, {});
      selections[token] = { token, client_name: clientName, property_ids: propertyIds, created_at: nowIso() };
      localWrite(DEMO_SELECTIONS_KEY, selections);
      return selections[token];
    }
    const user = await requireSession();
    const token = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '').slice(0, 16) : Math.random().toString(36).slice(2, 18);
    const props = await getProperties({ includeInactive: true, own: true });
    const uuids = propertyIds.map(id => props.find(p => p.id === id || p.uuid === id)?.uuid).filter(Boolean);
    const { data, error } = await client.from('selections').insert({ broker_id: user.id, token, client_name: clientName || null, property_ids: uuids, created_at: nowIso() }).select().single();
    if (error) throw error;
    return data;
  }

  async function getSelection(token) {
    if (!client) {
      const selections = localRead(DEMO_SELECTIONS_KEY, {});
      const sel = selections[token];
      if (!sel) return null;
      const all = window.DiCampos.getProperties();
      return { ...sel, properties: sel.property_ids.map(id => all.find(p => p.id === id)).filter(Boolean) };
    }
    const { data, error } = await client.rpc('get_public_selection', { p_token: token });
    if (error) throw error;
    const selection = Array.isArray(data) ? data[0] : data;
    if (!selection) return null;
    const { data: rows, error: pError } = await client.from('properties').select('*').in('id', selection.property_ids || []).eq('published', true);
    if (pError) throw pError;
    return { ...selection, properties: (rows || []).map(mapProperty) };
  }

  async function signIn(email, password) {
    if (!client) {
      if (email === 'demo@dicampos.com.br' && password === 'demo123') {
        localStorage.setItem(DEMO_SESSION_KEY, '1');
        return { id: 'demo-broker', email };
      }
      throw new Error('No modo demonstração use demo@dicampos.com.br / demo123.');
    }
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  }

  async function sendPasswordReset(email) {
    if (!client) throw new Error('A recuperação por e-mail fica disponível após conectar o Supabase.');
    const redirectTo = new URL('redefinir-senha.html', location.href).href;
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
    return true;
  }

  async function updatePassword(password) {
    if (!client) throw new Error('A alteração de senha fica disponível após conectar o Supabase.');
    const { data, error } = await client.auth.updateUser({ password });
    if (error) throw error;
    return data.user;
  }

  async function signOut() {
    if (!client) {
      localStorage.removeItem(DEMO_SESSION_KEY);
      location.href = 'login.html';
      return;
    }
    await client.auth.signOut();
    location.href = 'login.html';
  }

  async function getCurrentUser() {
    if (!client) return localStorage.getItem(DEMO_SESSION_KEY) ? { id: 'demo-broker', email: 'demo@dicampos.com.br' } : null;
    const { data, error } = await client.auth.getUser();
    if (error) return null;
    return data.user || null;
  }

  async function requireSession() {
    const user = await getCurrentUser();
    if (!user) {
      const next = encodeURIComponent(location.pathname.split('/').pop() + location.search);
      location.href = `login.html?next=${next}`;
      throw new Error('Sessão necessária.');
    }
    return user;
  }

  function money(value, purpose) {
    const formatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(Number(value || 0));
    return purpose === 'Aluguel' ? `${formatted}/mês` : formatted;
  }
  function escapeHtml(value = '') {
    return String(value).replace(/[&<>'\"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '\"': '&quot;' }[c]));
  }
  function safeUrl(value) {
    try {
      const u = new URL(value, location.href);
      return ['http:', 'https:', 'blob:'].includes(u.protocol) ? escapeHtml(u.href) : '';
    } catch (_) { return ''; }
  }
  function cardTemplate(p, compact = false) {
    const inactive = ['Vendido', 'Alugado'].includes(p.status);
    const image = safeUrl(p.imagem) || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=82';
    return `
      <article class="property-card${compact ? ' compact' : ''}">
        <a class="property-image" href="imovel.html?id=${encodeURIComponent(p.id)}" aria-label="Ver ${escapeHtml(p.titulo)}">
          <img src="${image}" alt="${escapeHtml(p.titulo)}" loading="lazy" width="900" height="600">
          <span class="status-badge ${inactive ? 'inactive' : ''}">${escapeHtml(p.status)}</span>
          <span class="purpose-badge">${escapeHtml(p.finalidade)}</span>
        </a>
        <div class="property-body">
          <span class="property-id">${escapeHtml(p.id)} · ${escapeHtml(p.bairro)}</span>
          <h3><a href="imovel.html?id=${encodeURIComponent(p.id)}">${escapeHtml(p.titulo)}</a></h3>
          <p>${escapeHtml(p.descricao || '')}</p>
          <div class="specs"><span>${p.area} m²</span>${p.quartos ? `<span>${p.quartos} quarto${p.quartos > 1 ? 's' : ''}</span>` : ''}${p.vagas ? `<span>${p.vagas} vaga${p.vagas > 1 ? 's' : ''}</span>` : ''}</div>
          <div class="property-footer"><strong class="price">${money(p.valor, p.finalidade)}</strong><a class="card-link" href="imovel.html?id=${encodeURIComponent(p.id)}">Detalhes →</a></div>
        </div>
      </article>`;
  }
  function whatsappUrl(number, text) {
    return `https://wa.me/${String(number || fallbackProfile().whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(text || '')}`;
  }

  async function applyBranding() {
    try {
      const p = await getProfile();
      if (!p) return;
      document.querySelectorAll('.brand-mark').forEach(el => { el.textContent = p.initials || (p.name || 'IM').split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase(); });
      document.querySelectorAll('.brand-copy strong, footer strong, [data-brand-name]').forEach(el => { el.textContent = p.brand_name || p.name || 'Portal Imobiliário'; });
      document.querySelectorAll('.brand-copy small, [data-creci]').forEach(el => { el.textContent = p.creci || ''; });
      document.querySelectorAll('[data-region]').forEach(el => { el.textContent = p.region || p.city || ''; });
      document.querySelectorAll('[data-profile-whatsapp]').forEach(el => {
        const text = el.dataset.message || 'Olá! Gostaria de mais informações sobre os imóveis.';
        el.href = whatsappUrl(p.whatsapp, text);
      });
      if (document.title.includes('João Silva')) document.title = document.title.replace(/João Silva(?: Imóveis)?/g, p.brand_name || p.name || 'Portal Imobiliário');
      return p;
    } catch (err) {
      console.warn('Branding padrão mantido:', err.message);
      return fallbackProfile();
    }
  }

  initSource();

  window.AppBackend = {
    client, configured, mode: configured ? 'supabase' : 'demo',
    getProfile, getOwnProfile, saveProfile,
    getProperties, getProperty, createProperty, updateProperty, deleteProperty, uploadPropertyImages,
    createLead, getLeads, trackEvent, getDashboardData, removePropertyImages,
    createSelection, getSelection,
    signIn, signOut, sendPasswordReset, updatePassword, getCurrentUser, requireSession,
    money, escapeHtml, safeUrl, cardTemplate, whatsappUrl, getSource, applyBranding
  };
})();
