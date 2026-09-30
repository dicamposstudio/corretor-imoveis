document.addEventListener('DOMContentLoaded', () => {
  const { getProperties, cardTemplate, track } = window.DiCampos;
  const params = new URLSearchParams(location.search);
  const ids = (params.get('ids') || '').split(',').map(x => x.trim()).filter(Boolean);
  const items = getProperties().filter(p => ids.includes(p.id));
  const grid = document.getElementById('selection-grid');
  const empty = document.getElementById('selection-empty');
  grid.innerHTML = items.map(p => cardTemplate(p)).join('');
  grid.hidden = items.length === 0;
  empty.hidden = items.length > 0;
  if (items.length) track('selection_view', { ids });
});
