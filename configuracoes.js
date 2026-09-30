document.addEventListener('DOMContentLoaded', async () => {
  try { await AppBackend.requireSession(); } catch (_) { return; }
  await AppBackend.applyBranding();
  document.getElementById('logout-button').addEventListener('click', () => AppBackend.signOut());
  document.getElementById('admin-menu-toggle').addEventListener('click', () => document.getElementById('admin-sidebar').classList.toggle('open'));

  const profile = await AppBackend.getOwnProfile() || await AppBackend.getProfile();
  const byId = id => document.getElementById(id);
  byId('s-name').value = profile?.name || '';
  byId('s-brand').value = profile?.brand_name || '';
  byId('s-initials').value = profile?.initials || '';
  byId('s-creci').value = profile?.creci || '';
  byId('s-whatsapp').value = profile?.whatsapp || '';
  byId('s-email').value = profile?.email || '';
  byId('s-city').value = profile?.city || '';
  byId('s-region').value = profile?.region || '';
  byId('s-avatar').value = profile?.avatar_url || '';
  byId('s-bio').value = profile?.bio || '';

  const status = byId('backend-status');
  const copy = byId('backend-copy');
  if (AppBackend.mode === 'supabase') {
    status.textContent = 'Banco de dados conectado';
    copy.textContent = 'Imóveis, leads, eventos, seleções e autenticação estão usando o Supabase com persistência online.';
  } else {
    status.textContent = 'Modo demonstração ativo';
    copy.textContent = 'Os dados ainda ficam neste navegador. Execute o SQL incluído no pacote e configure config.js para ativar o modo online.';
  }

  const form = byId('settings-form');
  const message = byId('settings-message');
  form.addEventListener('submit', async e => {
    e.preventDefault(); message.hidden = true;
    const button = form.querySelector('button[type="submit"]'); button.disabled = true; button.textContent = 'Salvando...';
    try {
      await AppBackend.saveProfile({
        name: byId('s-name').value.trim(), brand_name: byId('s-brand').value.trim(), initials: byId('s-initials').value.trim().toUpperCase(), creci: byId('s-creci').value.trim(),
        whatsapp: byId('s-whatsapp').value.replace(/\D/g,''), email: byId('s-email').value.trim(), city: byId('s-city').value.trim(), region: byId('s-region').value.trim(), avatar_url: byId('s-avatar').value.trim(), bio: byId('s-bio').value.trim()
      });
      message.textContent = 'Configurações salvas.'; message.className = 'form-message ok'; message.hidden = false;
      await AppBackend.applyBranding();
    } catch (err) { message.textContent = err.message; message.className = 'form-message error'; message.hidden = false; }
    finally { button.disabled = false; button.textContent = 'Salvar configurações'; }
  });
});
