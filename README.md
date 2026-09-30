# Portal Imobiliário DiCampos — Versão Final

Esta versão transforma o protótipo anterior em uma aplicação pronta para operar com **autenticação, banco de dados persistente, upload de imagens, CRUD de imóveis, leads e métricas** usando Supabase como backend.

O frontend continua estático e pode ser publicado no GitHub Pages, Cloudflare Pages, Netlify ou hospedagem convencional.

## O que já está implementado

### Portal público
- catálogo de imóveis com filtros;
- páginas individuais de imóvel;
- páginas por bairro;
- imóveis relacionados;
- WhatsApp contextualizado por imóvel;
- captação de proprietários;
- conteúdos imobiliários;
- seleções personalizadas para clientes;
- identidade do corretor carregada da base;
- rastreamento de visualizações, filtros e cliques no WhatsApp.

### Área administrativa
- login com e-mail e senha;
- recuperação e redefinição de senha via Supabase;
- dashboard com imóveis, visualizações, WhatsApp e leads;
- cadastro de imóvel;
- edição de imóvel;
- exclusão de imóvel;
- alteração rápida de status: Disponível / Reservado / Vendido / Alugado;
- upload de várias fotos;
- publicação/despublicação;
- destaque de imóvel;
- edição dos dados públicos do corretor;
- criação de seleção personalizada para um cliente;
- separação dos dados por conta de corretor via Row Level Security (RLS).

## Teste imediato sem backend

O pacote vem com `demoMode: true` em `config.js`, para que a interface possa ser testada antes de criar o Supabase.

Acesso de demonstração:

- E-mail: `demo@dicampos.com.br`
- Senha: `demo123`

Nesse modo, os dados ficam apenas no navegador (`localStorage`). Ele existe somente para apresentação/testes.

## Colocar em produção com Supabase

### 1. Criar o projeto

Crie um projeto no Supabase e aguarde a base ficar disponível.

### 2. Criar a estrutura do banco

No Supabase, abra **SQL Editor** e execute integralmente:

`supabase/schema.sql`

Esse arquivo cria:

- `profiles`
- `properties`
- `leads`
- `events`
- `selections`
- bucket `property-images`
- políticas RLS
- função segura para abrir seleções compartilhadas

### 3. Criar o usuário do corretor

No painel do Supabase:

**Authentication > Users > Add user**

Crie o usuário com o e-mail do corretor e uma senha inicial.

Copie o UUID criado.

### 4. Criar o perfil do corretor

Abra:

`supabase/profile-template.sql`

Substitua `USER_UUID` pelo UUID criado e personalize nome, CRECI, WhatsApp etc. Execute no SQL Editor.

O `slug` precisa ser igual ao `brokerSlug` usado em `config.js`.

### 5. Conectar o site ao Supabase

Em **Project Settings > API**, copie:

- Project URL
- `anon` / public key

Abra `config.js` e ajuste:

```js
window.APP_CONFIG = {
  supabaseUrl: 'https://seuprojeto.supabase.co',
  supabaseAnonKey: 'SUA_ANON_KEY',
  brokerSlug: 'joao-silva',
  demoMode: false,
  ...
};
```

> A `anon key` foi projetada para uso no frontend quando RLS está corretamente configurado. **Nunca coloque a `service_role` key no site.**

### 6. Configurar recuperação de senha

No Supabase, configure o domínio publicado em:

**Authentication > URL Configuration**

Adicione como Redirect URL a URL de:

`redefinir-senha.html`

Exemplo com domínio próprio:

`https://imoveis.exemplo.com.br/redefinir-senha.html`

### 7. Publicar

Suba todos os arquivos deste diretório para o repositório usado no GitHub Pages.

O portal público abre em `index.html`.

O corretor entra por:

`login.html`

## Estrutura principal

```text
index.html                 portal público
imovel.html                página de um imóvel
bairro.html                página por bairro
proprietario.html          captação de proprietários
conteudo.html              artigos
selecao.html               curadoria compartilhável

login.html                 login administrativo
recuperar-senha.html       solicitação de recuperação
redefinir-senha.html       nova senha
painel.html                dashboard
novo-imovel.html           cadastro + edição de imóvel
configuracoes.html         perfil e identidade do corretor

config.js                  URL/chave pública e slug do cliente
backend.js                 camada Supabase + modo demo
data.js                    dados de exemplo/fallback
style.css                  interface pública + administrativa

supabase/schema.sql        banco, storage e segurança
supabase/profile-template.sql
```

## Como funciona para vários corretores

A estrutura foi preparada para separar registros por `broker_id` e usar `auth.uid()` nas políticas RLS. Assim, cada corretor autenticado administra apenas seus próprios imóveis, leads, eventos e seleções.

Para uma operação simples da DiCampos, uma opção é manter um projeto/deploy por cliente e mudar apenas `brokerSlug`, domínio e identidade. Em uma etapa futura, a mesma base também pode evoluir para uma aplicação multi-tenant centralizada.

## Segurança

- páginas administrativas usam autenticação Supabase;
- operações de escrita exigem usuário autenticado;
- o corretor só pode alterar registros cujo `broker_id` seja o próprio `auth.uid()`;
- visitantes só podem ler imóveis publicados;
- visitantes podem enviar leads/eventos apenas para perfis ativos;
- upload de imagem só é permitido dentro da pasta do próprio usuário;
- seleções compartilhadas são abertas por token através de uma função SQL específica, sem liberar leitura geral da tabela.

## Observações antes de atender clientes reais

1. Configure domínio e HTTPS.
2. Teste o envio de recuperação de senha.
3. Personalize o conteúdo, CRECI e WhatsApp do corretor.
4. Defina política de privacidade e tratamento de dados adequada à operação.
5. Para tráfego pago, instale GA4/GTM/Meta Pixel de acordo com a conta do cliente.
6. Faça backup/exportação periódica do banco conforme a necessidade do negócio.

## Desenvolvido por

DiCampos Studio — Sites, SEO & Ads.
