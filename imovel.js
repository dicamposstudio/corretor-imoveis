document.addEventListener('DOMContentLoaded', async () => {
  const profile = await AppBackend.applyBranding();
  const id = new URLSearchParams(location.search).get('id');
  const p = await AppBackend.getProperty(id);
  const heading = document.getElementById('detail-heading');
  const gallery = document.getElementById('detail-gallery');
  const main = document.getElementById('detail-main');
  const sidebar = document.getElementById('detail-sidebar');
  const related = document.getElementById('related-grid');

  if (!p) {
    document.title = `Imóvel não encontrado | ${profile?.brand_name || 'Portal imobiliário'}`;
    heading.innerHTML = '<span class="eyebrow">Catálogo</span><h1>Imóvel não encontrado.</h1><p>Este imóvel não está disponível no catálogo.</p><a class="btn" href="index.html#imoveis">Voltar ao catálogo</a>';
    gallery.hidden = main.hidden = sidebar.hidden = true; return;
  }

  document.title = `${p.titulo} | ${profile?.brand_name || 'Portal imobiliário'}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = `${p.titulo} em ${p.bairro}, ${p.cidade}. ${p.area} m². Veja fotos, características e fale diretamente com o corretor.`;
  AppBackend.trackEvent('property_view', { property: p, metadata: { bairro: p.bairro, codigo: p.id } });

  heading.innerHTML = `<div class="breadcrumbs"><a href="index.html">Início</a><span>›</span><a href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">${AppBackend.escapeHtml(p.bairro)}</a><span>›</span><span>${AppBackend.escapeHtml(p.id)}</span></div><span class="eyebrow">${AppBackend.escapeHtml(p.finalidade)} · ${AppBackend.escapeHtml(p.status)}</span><h1>${AppBackend.escapeHtml(p.titulo)}</h1><p>${AppBackend.escapeHtml(p.bairro)}, ${AppBackend.escapeHtml(p.cidade)} · Código ${AppBackend.escapeHtml(p.id)}</p>`;

  const images = (p.galeria?.length ? p.galeria : [p.imagem]).filter(Boolean).slice(0,8);
  gallery.innerHTML = images.map((src,i) => `<button class="gallery-item ${i===0?'gallery-main':''}" type="button" data-src="${AppBackend.safeUrl(src)}" aria-label="Ampliar foto ${i+1}"><img src="${AppBackend.safeUrl(src)}" alt="${AppBackend.escapeHtml(p.titulo)} - foto ${i+1}" ${i?'loading="lazy"':''}></button>`).join('');
  main.innerHTML = `<div class="detail-section"><div class="detail-title-row"><div><span class="property-id">${AppBackend.escapeHtml(p.id)}</span><h2>Sobre este imóvel</h2></div><span class="status-badge">${AppBackend.escapeHtml(p.status)}</span></div><p class="detail-description">${AppBackend.escapeHtml(p.descricao)}</p><div class="feature-grid"><div><strong>${p.area} m²</strong><span>Área</span></div><div><strong>${p.quartos}</strong><span>Quartos</span></div><div><strong>${p.suites}</strong><span>Suítes</span></div><div><strong>${p.vagas}</strong><span>Vagas</span></div></div></div><div class="detail-section"><h2>Diferenciais</h2><div class="tag-list">${(p.tags||[]).map(t=>`<span>${AppBackend.escapeHtml(t)}</span>`).join('')}</div></div><div class="detail-section"><h2>Localização</h2><p class="detail-description">${AppBackend.escapeHtml(p.bairro)}, ${AppBackend.escapeHtml(p.cidade)}. Por privacidade, o endereço exato pode ser informado durante o atendimento.</p><a class="card-link" href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">Ver outros imóveis em ${AppBackend.escapeHtml(p.bairro)} →</a></div>`;

  const text = `Olá! Tenho interesse no imóvel ${p.id} — ${p.titulo}, em ${p.bairro}, anunciado por ${AppBackend.money(p.valor,p.finalidade)}. Gostaria de mais informações.`;
  sidebar.innerHTML = `<div class="sidebar-card sticky-card"><span class="micro-label">${AppBackend.escapeHtml(p.finalidade)}</span><strong class="detail-price">${AppBackend.money(p.valor,p.finalidade)}</strong>${p.condominio?`<p>Condomínio: ${AppBackend.money(p.condominio)}</p>`:''}${p.iptu?`<p>IPTU anual: ${AppBackend.money(p.iptu)}</p>`:''}<hr><strong>Fale sobre este imóvel</strong><p>O código já segue na mensagem para tornar o atendimento mais objetivo.</p><a id="detail-wa" class="btn full" href="${AppBackend.whatsappUrl(profile?.whatsapp,text)}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a><a class="btn btn-outline full" href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">Ver opções no bairro</a><small class="fine-print">Disponibilidade e valores podem mudar. Confirme as condições com o corretor.</small></div>`;
  document.getElementById('detail-wa').addEventListener('click', async () => {
    await AppBackend.trackEvent('whatsapp_click', { property:p, source:AppBackend.getSource(), metadata:{ origem:'pagina-imovel', bairro:p.bairro } });
  });

  const all = await AppBackend.getProperties();
  const relatedItems = all.filter(x=>x.id!==p.id).sort((a,b)=>{ const sa=(a.bairro===p.bairro?3:0)+(a.tipo===p.tipo?2:0)+(a.finalidade===p.finalidade?1:0); const sb=(b.bairro===p.bairro?3:0)+(b.tipo===p.tipo?2:0)+(b.finalidade===p.finalidade?1:0); return sb-sa || Math.abs(a.valor-p.valor)-Math.abs(b.valor-p.valor); }).slice(0,3);
  related.innerHTML = relatedItems.map(x=>AppBackend.cardTemplate(x,true)).join('');

  gallery.addEventListener('click', e => { const btn=e.target.closest('.gallery-item'); if(!btn)return; const overlay=document.createElement('div'); overlay.className='lightbox'; overlay.innerHTML=`<button aria-label="Fechar">×</button><img src="${btn.dataset.src}" alt="${AppBackend.escapeHtml(p.titulo)}">`; overlay.addEventListener('click',()=>overlay.remove()); document.body.appendChild(overlay); });
});
