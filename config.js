/*
 * Configuração pública do portal.
 * A chave anon do Supabase pode ficar no frontend quando RLS está habilitado.
 * Nunca coloque a service_role key aqui.
 */
window.APP_CONFIG = {
  // Após criar o projeto no Supabase, cole os valores abaixo e altere demoMode para false.
  supabaseUrl: 'https://SEU-PROJETO.supabase.co',
  supabaseAnonKey: 'SUA-CHAVE-ANON',
  brokerSlug: 'joao-silva',
  demoMode: true,

  fallbackProfile: {
    id: 'demo-broker',
    slug: 'joao-silva',
    name: 'João Silva',
    brand_name: 'João Silva Imóveis',
    initials: 'JS',
    creci: 'CRECI 00000-F',
    whatsapp: '5581999999999',
    email: 'contato@exemplo.com.br',
    city: 'Recife',
    region: 'Recife e Região Metropolitana',
    bio: 'Compra, aluguel, avaliação e investimento imobiliário.'
  }
};
