document.addEventListener('DOMContentLoaded', async () => {
  const profile = await AppBackend.applyBranding();
  const params=new URLSearchParams(location.search); const token=params.get('token'); const ids=(params.get('ids')||'').split(',').filter(Boolean);
  let items=[]; let clientName='';
  if(token){ const selection=await AppBackend.getSelection(token); if(selection){ items=selection.properties||[]; clientName=selection.client_name||''; } }
  else if(ids.length){ const all=await AppBackend.getProperties(); items=all.filter(p=>ids.includes(p.id)); }
  const heading=document.getElementById('selection-heading'); if(heading && clientName) heading.querySelector('p')?.insertAdjacentText('afterbegin',`Seleção preparada para ${clientName}. `);
  const grid=document.getElementById('selection-grid'); const empty=document.getElementById('selection-empty'); grid.innerHTML=items.map(p=>AppBackend.cardTemplate(p)).join(''); grid.hidden=!items.length; empty.hidden=items.length>0;
  if(items.length) AppBackend.trackEvent('selection_view',{metadata:{token:token||null,ids:items.map(p=>p.id)}});
  document.title=`Seleção de imóveis | ${profile?.brand_name || 'Portal imobiliário'}`;
});
