document.addEventListener('DOMContentLoaded', async () => {
  await AppBackend.applyBranding();
  const user = await AppBackend.getCurrentUser();
  const qs = new URLSearchParams(location.search);
  const next = qs.get('next') || 'painel.html';
  if (user) { location.href = next; return; }

  if (AppBackend.mode === 'demo') document.getElementById('demo-credentials').hidden = false;
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.hidden = true;
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Entrando...';
    try {
      await AppBackend.signIn(document.getElementById('login-email').value.trim(), document.getElementById('login-password').value);
      location.href = next;
    } catch (err) {
      message.textContent = err.message || 'Não foi possível entrar.';
      message.className = 'form-message error';
      message.hidden = false;
    } finally {
      button.disabled = false;
      button.textContent = 'Entrar';
    }
  });
});
