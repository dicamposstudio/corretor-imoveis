document.addEventListener('DOMContentLoaded', async () => {
  await AppBackend.applyBranding();
  const form=document.getElementById('owner-form'); const success=document.getElementById('owner-success');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const button=form.querySelector('button[type="submit"]'); button.disabled=true; button.textContent='Enviando...'; success.hidden=true;
    const payload={ finalidade:document.getElementById('owner-purpose').value, tipo:document.getElementById('owner-type').value, bairro:document.getElementById('owner-neighborhood').value.trim(), area:Number(document.getElementById('owner-area').value||0), valor:Number(document.getElementById('owner-value').value||0), quartos:Number(document.getElementById('owner-bedrooms').value||0), observacoes:document.getElementById('owner-notes').value.trim() };
    try {
      await AppBackend.createLead({ lead_type:'owner', name:document.getElementById('owner-name').value.trim(), phone:document.getElementById('owner-phone').value.trim(), message:payload.observacoes, source:AppBackend.getSource(), payload });
      await AppBackend.trackEvent('owner_lead',{metadata:{bairro:payload.bairro,finalidade:payload.finalidade,tipo:payload.tipo}});
      success.innerHTML='<strong>Informações recebidas.</strong><p>Seu cadastro foi enviado ao corretor. Ele já receberá os principais dados do imóvel organizados para continuar o atendimento.</p>'; success.hidden=false; form.reset(); success.scrollIntoView({behavior:'smooth',block:'center'});
    } catch(err) { success.innerHTML=`<strong>Não foi possível enviar.</strong><p>${AppBackend.escapeHtml(err.message)}</p>`; success.hidden=false; }
    finally { button.disabled=false; button.textContent='Enviar informações'; }
  });
});
