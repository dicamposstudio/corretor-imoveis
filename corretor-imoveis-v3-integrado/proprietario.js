document.addEventListener('DOMContentLoaded', () => {
  const { STORE, read, write, track } = window.DiCampos;
  const form = document.getElementById('owner-form');
  const success = document.getElementById('owner-success');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const lead = {
      id: `PROP-${Date.now().toString().slice(-6)}`,
      nome: document.getElementById('owner-name').value.trim(),
      telefone: document.getElementById('owner-phone').value.trim(),
      finalidade: document.getElementById('owner-purpose').value,
      tipo: document.getElementById('owner-type').value,
      bairro: document.getElementById('owner-neighborhood').value.trim(),
      area: Number(document.getElementById('owner-area').value || 0),
      valor: Number(document.getElementById('owner-value').value || 0),
      quartos: Number(document.getElementById('owner-bedrooms').value || 0),
      observacoes: document.getElementById('owner-notes').value.trim(),
      status: 'Novo',
      createdAt: new Date().toISOString()
    };
    const leads = read(STORE.leads, []);
    leads.unshift(lead);
    write(STORE.leads, leads);
    track('owner_lead', { bairro: lead.bairro, finalidade: lead.finalidade, tipo: lead.tipo });
    success.hidden = false;
    success.innerHTML = `<strong>Informações recebidas.</strong><p>O imóvel foi registrado no painel demonstrativo como lead de proprietário. Em uma versão comercial, daqui o corretor poderia iniciar o atendimento e acompanhar o estágio da captação.</p><a class="card-link" href="painel.html">Ver no painel →</a>`;
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
