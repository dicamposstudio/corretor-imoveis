document.addEventListener('DOMContentLoaded', async () => {
  try { await AppBackend.requireSession(); } catch (_) { return; }
  await AppBackend.applyBranding();
  document.getElementById('logout-button').addEventListener('click', () => AppBackend.signOut());
  document.getElementById('admin-menu-toggle').addEventListener('click', () => document.getElementById('admin-sidebar').classList.toggle('open'));

  const qs = new URLSearchParams(location.search);
  const editId = qs.get('id');
  let existing = null;
  let selectedFiles = [];
  let existingImages = [];
  const form = document.getElementById('property-form');
  const message = document.getElementById('property-message');
  const preview = document.getElementById('photo-preview');
  const fileInput = document.getElementById('p-files');
  const uploadZone = document.getElementById('upload-zone');

  const fields = {
    id: document.getElementById('p-id'), status: document.getElementById('p-status'), titulo: document.getElementById('p-title'),
    finalidade: document.getElementById('p-purpose'), tipo: document.getElementById('p-type'), bairro: document.getElementById('p-neighborhood'), cidade: document.getElementById('p-city'),
    valor: document.getElementById('p-value'), area: document.getElementById('p-area'), quartos: document.getElementById('p-bedrooms'), suites: document.getElementById('p-suites'), vagas: document.getElementById('p-parking'),
    condominio: document.getElementById('p-condo'), iptu: document.getElementById('p-iptu'), tags: document.getElementById('p-tags'), descricao: document.getElementById('p-description'), imagem: document.getElementById('p-image')
  };

  function showMessage(text, type='ok') { message.textContent = text; message.className = `form-message ${type}`; message.hidden = false; }
  function renderPhotos() {
    preview.innerHTML = '';
    existingImages.forEach((url,index) => preview.insertAdjacentHTML('beforeend', `<div class="photo-thumb"><img src="${AppBackend.safeUrl(url)}" alt="Foto ${index+1}"><span>${index===0?'Principal':'Salva'}</span><button type="button" data-remove-existing="${index}" aria-label="Remover">×</button></div>`));
    selectedFiles.forEach((file,index) => {
      const url = URL.createObjectURL(file);
      preview.insertAdjacentHTML('beforeend', `<div class="photo-thumb"><img src="${url}" alt="Nova foto ${index+1}"><span>Nova</span><button type="button" data-remove-new="${index}" aria-label="Remover">×</button></div>`);
    });
    preview.querySelectorAll('[data-remove-existing]').forEach(b => b.addEventListener('click', () => { existingImages.splice(Number(b.dataset.removeExisting),1); renderPhotos(); }));
    preview.querySelectorAll('[data-remove-new]').forEach(b => b.addEventListener('click', () => { selectedFiles.splice(Number(b.dataset.removeNew),1); renderPhotos(); }));
  }
  function addFiles(files) {
    const valid = Array.from(files).filter(f => /^image\/(jpeg|png|webp)$/.test(f.type));
    selectedFiles.push(...valid);
    renderPhotos();
  }
  fileInput.addEventListener('change', () => addFiles(fileInput.files));
  ['dragenter','dragover'].forEach(evt => uploadZone.addEventListener(evt, e => { e.preventDefault(); uploadZone.classList.add('dragging'); }));
  ['dragleave','drop'].forEach(evt => uploadZone.addEventListener(evt, e => { e.preventDefault(); uploadZone.classList.remove('dragging'); }));
  uploadZone.addEventListener('drop', e => addFiles(e.dataTransfer.files));

  if (editId) {
    existing = await AppBackend.getProperty(editId, { own: true });
    if (!existing) { showMessage('Imóvel não encontrado.', 'error'); return; }
    document.getElementById('property-page-title').textContent = 'Editar imóvel';
    document.getElementById('form-mode-title').textContent = `Editar ${existing.id}`;
    fields.id.value = existing.id; fields.id.readOnly = true; fields.id.title = 'O código do imóvel não é alterado após o cadastro.'; fields.status.value = existing.status; fields.titulo.value = existing.titulo; fields.finalidade.value = existing.finalidade; fields.tipo.value = existing.tipo; fields.bairro.value = existing.bairro; fields.cidade.value = existing.cidade;
    fields.valor.value = existing.valor; fields.area.value = existing.area; fields.quartos.value = existing.quartos; fields.suites.value = existing.suites; fields.vagas.value = existing.vagas; fields.condominio.value = existing.condominio || ''; fields.iptu.value = existing.iptu || '';
    fields.tags.value = (existing.tags || []).join(', '); fields.descricao.value = existing.descricao || ''; fields.imagem.value = existing.imagem || '';
    document.getElementById('p-featured').checked = Boolean(existing.destaque); document.getElementById('p-published').checked = existing.published !== false;
    existingImages = [...(existing.galeria || [])]; renderPhotos();
  }

  form.addEventListener('submit', async e => {
    e.preventDefault(); message.hidden = true;
    const button = document.getElementById('save-property'); button.disabled = true; button.textContent = 'Salvando...';
    try {
      const uploaded = selectedFiles.length ? await AppBackend.uploadPropertyImages(selectedFiles) : [];
      const gallery = [...existingImages, ...uploaded].filter(Boolean);
      const fallbackUrl = fields.imagem.value.trim();
      if (!gallery.length && fallbackUrl) gallery.push(fallbackUrl);
      if (!gallery.length) throw new Error('Adicione ao menos uma foto ou uma URL de imagem.');
      const payload = {
        id: fields.id.value.trim(), status: fields.status.value, titulo: fields.titulo.value.trim(), finalidade: fields.finalidade.value, tipo: fields.tipo.value,
        bairro: fields.bairro.value.trim(), cidade: fields.cidade.value.trim(), valor: Number(fields.valor.value), area: Number(fields.area.value), quartos: Number(fields.quartos.value || 0), suites: Number(fields.suites.value || 0), vagas: Number(fields.vagas.value || 0),
        condominio: Number(fields.condominio.value || 0), iptu: Number(fields.iptu.value || 0), tags: fields.tags.value.split(',').map(x=>x.trim()).filter(Boolean), descricao: fields.descricao.value.trim(),
        imagem: gallery[0], galeria: gallery, destaque: document.getElementById('p-featured').checked, published: document.getElementById('p-published').checked
      };
      const saved = editId ? await AppBackend.updateProperty(editId, payload) : await AppBackend.createProperty(payload);
      if (editId && existing?.galeria?.length) {
        const removed = existing.galeria.filter(url => !gallery.includes(url));
        if (removed.length) await AppBackend.removePropertyImages(removed);
      }
      showMessage(`Imóvel ${saved.id} salvo com sucesso.`);
      setTimeout(() => { location.href = 'painel.html#imoveis'; }, 900);
    } catch (err) { showMessage(err.message || 'Não foi possível salvar o imóvel.', 'error'); }
    finally { button.disabled = false; button.textContent = 'Salvar imóvel'; }
  });
});
