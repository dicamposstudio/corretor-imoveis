document.addEventListener('DOMContentLoaded', () => {
  const { STORE, read, write, getProperty, track } = window.DiCampos;
  const form = document.getElementById('property-form');
  const success = document.getElementById('property-success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const id = document.getElementById('p-id').value.trim().toUpperCase();
    if (getProperty(id)) {
      success.hidden = false;
      success.innerHTML = `<strong>Esse código já existe.</strong><p>Use um identificador único, como JS-451.</p>`;
      return;
    }
    const image = document.getElementById('p-image').value.trim();
    if (!/^https?:\/\//i.test(image)) {
      success.hidden = false;
      success.innerHTML = '<strong>URL de imagem inválida.</strong><p>Use um endereço iniciado por http:// ou https://.</p>';
      return;
    }
    const property = {
      id,
      status: document.getElementById('p-status').value,
      titulo: document.getElementById('p-title').value.trim(),
      finalidade: document.getElementById('p-purpose').value,
      tipo: document.getElementById('p-type').value,
      bairro: document.getElementById('p-neighborhood').value.trim(),
      cidade: document.getElementById('p-city').value.trim(),
      valor: Number(document.getElementById('p-value').value || 0),
      area: Number(document.getElementById('p-area').value || 0),
      quartos: Number(document.getElementById('p-bedrooms').value || 0),
      suites: Number(document.getElementById('p-suites').value || 0),
      vagas: Number(document.getElementById('p-parking').value || 0),
      condominio: Number(document.getElementById('p-condo').value || 0),
      iptu: 0,
      destaque: false,
      imagem: image,
      galeria: [image],
      descricao: document.getElementById('p-description').value.trim(),
      tags: document.getElementById('p-tags').value.split(',').map(x => x.trim()).filter(Boolean)
    };
    const custom = read(STORE.properties, []);
    custom.push(property);
    write(STORE.properties, custom);
    track('property_created', { id: property.id, bairro: property.bairro, finalidade: property.finalidade });
    success.hidden = false;
    success.innerHTML = `<strong>Imóvel ${property.id} cadastrado.</strong><p>Ele já aparece no catálogo deste navegador e no painel demonstrativo.</p><div class="inline-actions"><a class="card-link" href="imovel.html?id=${encodeURIComponent(property.id)}">Abrir imóvel →</a><a class="card-link" href="painel.html">Voltar ao painel →</a></div>`;
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
