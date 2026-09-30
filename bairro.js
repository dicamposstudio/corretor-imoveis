document.addEventListener('DOMContentLoaded', async () => {
  const profile = await AppBackend.applyBranding();
  const bairro = new URLSearchParams(location.search).get('bairro') || 'Boa Viagem';
  const all = await AppBackend.getProperties();
  const items = all.filter(p => p.bairro?.toLowerCase() === bairro.toLowerCase());
  document.title = `Imóveis em ${bairro} | ${profile?.brand_name || 'Portal imobiliário'}`;
  const desc=document.querySelector('meta[name="description"]'); if(desc) desc.content=`Veja imóveis disponíveis em ${bairro} para comprar ou alugar.`;
  document.getElementById('bairro-heading').innerHTML=`<span class="eyebrow">Explore por bairro</span><h1>Imóveis em ${AppBackend.escapeHtml(bairro)}</h1><p>${items.length?`Encontramos ${items.length} ${items.length===1?'opção disponível':'opções disponíveis'} nesta região.`:'Ainda não há imóveis públicos nesta região.'} Compare as oportunidades e abra a ficha completa antes de falar com o corretor.</p>`;
  const grid=document.getElementById('bairro-grid'); const empty=document.getElementById('bairro-empty'); grid.innerHTML=items.map(p=>AppBackend.cardTemplate(p)).join(''); empty.hidden=items.length>0; grid.hidden=items.length===0;
  AppBackend.trackEvent('neighborhood_view',{metadata:{bairro}});
});
