# Changelog — Versão Final

## Backend e segurança
- integração opcional com Supabase;
- autenticação por e-mail/senha;
- recuperação de senha;
- RLS por corretor;
- banco persistente de imóveis, leads, eventos e seleções;
- Storage para fotos;
- modo demonstração local mantido para apresentação.

## Administração
- painel redesenhado como sistema profissional;
- CRUD completo de imóveis;
- upload de múltiplas imagens;
- edição de status diretamente no dashboard;
- publicação/despublicação;
- imóvel em destaque;
- pesquisa do estoque;
- exclusão com confirmação;
- configurações do perfil do corretor;
- geração de seleções para clientes.

## Portal público
- catálogo passa a ler banco online quando configurado;
- páginas de imóvel, bairro e conteúdo conectadas à camada de dados;
- dados do corretor carregados pelo perfil;
- rastreamento de eventos persistente;
- formulário de proprietário gera lead no painel;
- seleções compartilhadas por token.

## Qualidade
- compatível com GitHub Pages por não exigir servidor próprio;
- scripts verificados sintaticamente;
- referências locais e IDs HTML validados;
- fallback demonstrativo sem necessidade de conta externa.
