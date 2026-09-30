# Portal Imobiliário DiCampos — V3 integrada

Protótipo funcional de portal próprio para corretores de imóveis, reconstruído sobre os arquivos originais do repositório `corretor-imoveis`.

## O que mudou em relação à V2

- Catálogo alimentado por uma única fonte de dados (`data.js`).
- Filtros funcionais por finalidade, bairro, tipo, quartos e valor.
- Página individual de imóvel com galeria, código, características, custos e CTA contextualizado.
- Imóveis semelhantes calculados automaticamente.
- Página dinâmica por bairro.
- Conteúdo editorial demonstrativo ligado a imóveis e bairros.
- Formulário específico para captação de proprietários.
- Painel demonstrativo com estoque, visualizações, cliques no WhatsApp, leads e origem dos contatos.
- Cadastro de novo imóvel sem editar HTML.
- Seleção personalizada de imóveis para compartilhar com um cliente.
- Menu mobile, CTA flutuante e melhorias de acessibilidade.
- Correção do `body{padding:24px}` que afetava toda a V2 e do espaçamento dos cards.
- Remoção dos antigos links de bairro que apontavam para arquivos inexistentes.

## Arquivos principais

- `index.html` — portal público e catálogo.
- `imovel.html?id=JS-381` — ficha dinâmica do imóvel.
- `bairro.html?bairro=Boa%20Viagem` — página dinâmica por bairro.
- `proprietario.html` — captação de imóveis/proprietários.
- `conteudo.html?artigo=boa-viagem` — conteúdo editorial demonstrativo.
- `painel.html` — painel do corretor.
- `novo-imovel.html` — cadastro de estoque.
- `selecao.html?ids=JS-381,JS-417` — curadoria personalizada.
- `data.js` — dados e funções compartilhadas.
- `style.css` — design system responsivo.

## Como testar

Abra `index.html` ou publique a pasta em um servidor estático. Para uma demonstração mais completa:

1. Abra `painel.html`.
2. Clique em **Gerar atividade de demonstração**.
3. Acesse alguns imóveis e clique no WhatsApp.
4. Use `proprietario.html` para cadastrar um lead.
5. Volte ao painel para ver os números e o lead.
6. Marque imóveis no bloco **Seleção para cliente** e gere a curadoria.
7. Use `novo-imovel.html` para cadastrar um novo imóvel; ele aparecerá no catálogo naquele navegador.

## Importante sobre esta V3

Esta é uma versão comercial demonstrativa. Para funcionar sem backend, novos imóveis, leads e métricas são armazenados no `localStorage` do navegador. Isso permite demonstrar a experiência completa sem criar infraestrutura antes da validação comercial.

Para a versão vendável, o próximo passo recomendado é migrar estes dados para um backend (por exemplo, Supabase/Postgres), implementar autenticação do corretor, upload e otimização de imagens, regras de acesso e integrações reais com GA4/GTM/Meta/CRM.

## Dados a substituir antes de publicar para um cliente

- Nome e CRECI do corretor.
- Número do WhatsApp em `data.js` (`PHONE_WHATSAPP`).
- Identidade visual e logotipo.
- Imóveis e imagens demonstrativas.
- Textos institucionais e conteúdo local.
- Domínio/canonical/analytics na versão comercial.

