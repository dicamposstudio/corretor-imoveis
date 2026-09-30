document.addEventListener('DOMContentLoaded', () => {
  const { getProperties, cardTemplate, escapeHtml } = window.DiCampos;
  const params = new URLSearchParams(location.search);
  const bairro = params.get('bairro') || 'Boa Viagem';
  const heading = document.getElementById('bairro-heading');
  const grid = document.getElementById('bairro-grid');
  const empty = document.getElementById('bairro-empty');
  const items = getProperties().filter(p => p.bairro.toLowerCase() === bairro.toLowerCase() && !['Vendido','Alugado'].includes(p.status));

  document.title = `Imóveis em ${bairro} | João Silva Imóveis`;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.content = `Veja imóveis disponíveis em ${bairro}, Recife, para comprar ou alugar.`;

  heading.innerHTML = `<span class="eyebrow">Recife por bairro</span><h1>Imóveis em ${escapeHtml(bairro)}</h1><p>${items.length ? `Encontramos ${items.length} ${items.length === 1 ? 'opção disponível' : 'opções disponíveis'} nesta região.` : 'Ainda não há imóveis públicos nesta região.'} Compare as oportunidades e abra a ficha completa antes de falar com o corretor.</p>`;
  grid.innerHTML = items.map(p => cardTemplate(p)).join('');
  empty.hidden = items.length > 0;
  grid.hidden = items.length === 0;
});
