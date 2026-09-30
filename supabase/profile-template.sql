-- 1) Crie o usuário do corretor em Authentication > Users no painel do Supabase.
-- 2) Copie o UUID do usuário e substitua USER_UUID abaixo.
-- 3) Personalize slug e dados públicos. O slug deve ser igual a APP_CONFIG.brokerSlug em config.js.

insert into public.profiles (
  id, slug, name, brand_name, initials, creci, whatsapp, email, city, region, bio
) values (
  'USER_UUID'::uuid,
  'joao-silva',
  'João Silva',
  'João Silva Imóveis',
  'JS',
  'CRECI 00000-F',
  '5581999999999',
  'corretor@exemplo.com.br',
  'Recife',
  'Recife e Região Metropolitana',
  'Compra, aluguel, avaliação e investimento imobiliário.'
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  brand_name = excluded.brand_name,
  initials = excluded.initials,
  creci = excluded.creci,
  whatsapp = excluded.whatsapp,
  email = excluded.email,
  city = excluded.city,
  region = excluded.region,
  bio = excluded.bio,
  active = true,
  updated_at = now();
