document.addEventListener('DOMContentLoaded', () => {
  const { getProperty, getProperties, cardTemplate, money, trackView, trackWhatsApp, whatsappUrl, escapeHtml, safeUrl } = window.DiCampos;
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const p = getProperty(id);
  const heading = document.getElementById('detail-heading');
  const gallery = document.getElementById('detail-gallery');
  const main = document.getElementById('detail-main');
  const sidebar = document.getElementById('detail-sidebar');
  const related = document.getElementById('related-grid');

  if (!p) {
    document.title = 'Imóvel não encontrado | João Silva Imóveis';
    heading.innerHTML = `<span class="eyebrow">Catálogo</span><h1>Imóvel não encontrado.</h1><p>Este código não está disponível no catálogo demonstrativo.</p><a class="btn" href="index.html#imoveis">Voltar ao catálogo</a>`;
    gallery.hidden = main.hidden = sidebar.hidden = true;
    return;
  }

  document.title = `${p.titulo} | João Silva Imóveis`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = `${p.titulo} em ${escapeHtml(p.bairro)}, ${escapeHtml(p.cidade)}. ${p.area} m², ${p.quartos} quartos e ${p.vagas} vagas. Veja detalhes e fale diretamente com o corretor.`;
  trackView(p);

  heading.innerHTML = `
    <div class="breadcrumbs"><a href="index.html">Início</a><span>›</span><a href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">${escapeHtml(p.bairro)}</a><span>›</span><span>${escapeHtml(p.id)}</span></div>
    <span class="eyebrow">${escapeHtml(p.finalidade)} · ${escapeHtml(p.status)}</span>
    <h1>${escapeHtml(p.titulo)}</h1>
    <p>${escapeHtml(p.bairro)}, ${escapeHtml(p.cidade)} · Código ${escapeHtml(p.id)}</p>`;

  const images = (p.galeria && p.galeria.length ? p.galeria : [p.imagem]).slice(0, 4);
  gallery.innerHTML = images.map((src, i) => `<button class="gallery-item ${i === 0 ? 'gallery-main' : ''}" type="button" data-src="${safeUrl(src)}" aria-label="Ampliar foto ${i+1}"><img src="${safeUrl(src)}" alt="${escapeHtml(p.titulo)} - foto ${i+1}" ${i ? 'loading="lazy"' : ''}></button>`).join('');

  main.innerHTML = `
    <div class="detail-section">
      <div class="detail-title-row"><div><span class="property-id">${escapeHtml(p.id)}</span><h2>Sobre este imóvel</h2></div><span class="status-badge">${escapeHtml(p.status)}</span></div>
      <p class="detail-description">${escapeHtml(p.descricao)}</p>
      <div class="feature-grid">
        <div><strong>${p.area} m²</strong><span>Área</span></div>
        <div><strong>${p.quartos}</strong><span>Quartos</span></div>
        <div><strong>${p.suites}</strong><span>Suítes</span></div>
        <div><strong>${p.vagas}</strong><span>Vagas</span></div>
      </div>
    </div>
    <div class="detail-section"><h2>Diferenciais</h2><div class="tag-list">${(p.tags || []).map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div></div>
    <div class="detail-section"><h2>Localização</h2><p class="detail-description">${escapeHtml(p.bairro)}, ${escapeHtml(p.cidade)}. Por privacidade, o endereço exato pode ser informado pelo corretor durante o atendimento.</p><a class="card-link" href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">Ver outros imóveis em ${escapeHtml(p.bairro)} →</a></div>`;

  const text = `Olá! Tenho interesse no imóvel ${p.id} — ${p.titulo}, em ${p.bairro}, anunciado por ${money(p.valor, p.finalidade)}. Gostaria de mais informações.`;
  sidebar.innerHTML = `
    <div class="sidebar-card sticky-card">
      <span class="micro-label">${escapeHtml(p.finalidade)}</span>
      <strong class="detail-price">${money(p.valor, p.finalidade)}</strong>
      ${p.condominio ? `<p>Condomínio: ${money(p.condominio)}</p>` : ''}
      ${p.iptu ? `<p>IPTU anual: ${money(p.iptu)}</p>` : ''}
      <hr>
      <strong>Fale sobre este imóvel</strong>
      <p>O código e o imóvel já seguem na mensagem para tornar o atendimento mais objetivo.</p>
      <a id="detail-wa" class="btn full" href="${whatsappUrl(text)}" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>
      <a class="btn btn-outline full" href="bairro.html?bairro=${encodeURIComponent(p.bairro)}">Ver opções no bairro</a>
      <small class="fine-print">Disponibilidade e valores podem mudar. Confirme as condições com o corretor.</small>
    </div>`;
  document.getElementById('detail-wa').addEventListener('click', () => trackWhatsApp(p, 'pagina-imovel'));

  const relatedItems = getProperties()
    .filter(x => x.id !== p.id && !['Vendido','Alugado'].includes(x.status))
    .sort((a, b) => {
      const scoreA = (a.bairro === p.bairro ? 3 : 0) + (a.tipo === p.tipo ? 2 : 0) + (a.finalidade === p.finalidade ? 1 : 0);
      const scoreB = (b.bairro === p.bairro ? 3 : 0) + (b.tipo === p.tipo ? 2 : 0) + (b.finalidade === p.finalidade ? 1 : 0);
      return scoreB - scoreA || Math.abs(a.valor - p.valor) - Math.abs(b.valor - p.valor);
    }).slice(0, 3);
  related.innerHTML = relatedItems.map(x => cardTemplate(x, true)).join('');

  gallery.addEventListener('click', e => {
    const btn = e.target.closest('.gallery-item');
    if (!btn) return;
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.innerHTML = `<button aria-label="Fechar">×</button><img src="${btn.dataset.src}" alt="${escapeHtml(p.titulo)}">`;
    overlay.addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
  });
});
