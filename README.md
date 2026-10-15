# Romira Bronze e Eventos — landing page

Site de uma página da **Romira Bronze e Eventos** (Fortaleza, CE). O objetivo principal é levar o visitante a conversar pelo WhatsApp para consultar disponibilidade, valores e reservar.

> “Seu momento de lazer começa aqui.”

---

## Sumário

1. [O que tem no site](#o-que-tem-no-site)
2. [Como rodar no seu computador](#como-rodar-no-seu-computador)
3. [Como alterar textos, contatos e imagens](#como-alterar-textos-contatos-e-imagens)
4. [Trocar as ilustrações por fotos reais](#trocar-as-ilustrações-por-fotos-reais)
5. [O efeito aéreo da localização](#o-efeito-aéreo-da-localização)
6. [Testes](#testes)
7. [Publicação automática (GitHub + Cloudflare Pages)](#publicação-automática-github--cloudflare-pages)
8. [Custos](#custos)
9. [Estrutura dos arquivos](#estrutura-dos-arquivos)
10. [Pendências que dependem da Romira](#pendências-que-dependem-da-romira)

---

## O que tem no site

| Seção | Conteúdo |
| --- | --- |
| Cabeçalho fixo | Logotipo, menu (Início, O Espaço, Bronzeamento, Localização) e botão “Reservar pelo WhatsApp”. No celular, fica sempre visível ao rolar, com botão “Reservar” e menu compacto. |
| Abertura | Título, slogan, texto curto e botão principal de reserva. |
| Onde estamos | Imagem aérea da região com aproximação automática em loop e cartão com “Como chegar”. |
| O Espaço | Apresentação curta. |
| Estrutura | Piscina, churrasqueira, mesas e cadeiras, área coberta, banheiros, cozinha/pia, espaço para música e ambiente familiar. |
| Ocasiões | Aniversários, encontros familiares, reuniões entre amigos. |
| Galeria | Grade com ampliação da imagem (pronta para fotos reais). |
| Bronzeamento | Serviço secundário, com botão próprio para o WhatsApp. |
| Depoimentos | **Desativada.** Só aparece quando houver depoimentos reais cadastrados. |
| Localização e contato | Endereço, “Como chegar” (Google Maps), WhatsApp e Instagram. |
| Rodapé | Logotipo, nome, endereço, contatos e slogan. |

Os botões “Reservar pelo WhatsApp” ficam só no cabeçalho e na abertura. O bronzeamento tem o seu próprio “Saber mais”, e o contato e o rodapé mostram o número do WhatsApp.

**O que o site não inventa:** preços, horários, promoções, avaliações, depoimentos, coordenadas não verificadas ou serviços não confirmados (decoração, buffet etc.). As imagens atuais são **ilustrações** e estão marcadas como “Imagem ilustrativa”.

---

## Como rodar no seu computador

Pré-requisito: [Node.js](https://nodejs.org/) versão 20 ou mais nova (recomendado: 22).

```bash
npm install        # instala as dependências (só na primeira vez)
npm run dev        # abre o site em modo de edição: http://localhost:5173
```

Para ver a versão final, igual à publicada:

```bash
npm run build      # gera a pasta dist/
npm run preview    # abre http://localhost:4173
```

Para testar no celular, ligado na mesma rede Wi-Fi, use o endereço “Network” que aparece no terminal.

---

## Como alterar textos, contatos e imagens

Quase tudo fica em **um único arquivo**: [`src/content/site.js`](src/content/site.js).

- `negocio`: nome, slogan, endereço, WhatsApp (número e mensagens automáticas) e Instagram.
- `localizacao`: coordenadas usadas no efeito aéreo (leia a seção abaixo).
- `site`: título e descrição para o Google e para compartilhamento; `url` do site publicado.
- `imagens` e `galeria`: arquivo, texto alternativo e se a imagem é ilustrativa.
- `textos`: todos os textos das seções.

Salve o arquivo com `npm run dev` aberto e a página se atualiza sozinha.

**Mensagem do WhatsApp:** edite `negocio.whatsapp.mensagens.reserva`. A codificação para o link é automática.

**Depoimentos reais:** em `textos.depoimentos`, adicione itens no formato `{ texto: '...', autor: 'Nome autorizado', ocasiao: 'Aniversário' }` e mude `ativo` para `true`. Use apenas depoimentos reais, com autorização do cliente.

**Endereço do site (depois de publicado):** preencha `site.url` (ex.: `'https://romira.pages.dev'`). Isso ativa a URL canônica e o `sitemap.xml` para o Google.

---

## Trocar as ilustrações por fotos reais

1. Crie a pasta `imagens-originais/` (ou rode `npm run imagens` uma vez, que a cria).
2. Coloque as fotos com nomes claros, por exemplo: `hero.jpg`, `area-coberta.jpg`, `churrasqueira.jpg`, `piscina.jpg`.
3. Rode `npm run imagens`. As versões otimizadas (WebP em 640, 1280 e 1920 px) vão para `public/imagens/fotos/`.
4. O terminal mostra o trecho para colar em `src/content/site.js`, por exemplo:

```js
hero: {
  src: '/imagens/fotos/hero.webp',
  larguras: [640, 1280, 1920],
  alt: 'Piscina da Romira ao entardecer',
  ilustrativa: false, // agora é uma foto real
},
```

Dicas de enquadramento: abertura e galeria “Fim de tarde” na horizontal (16:9); “O Espaço” e “Ocasiões” na vertical (4:5); churrasqueira quadrada. As fotos originais **não** vão para o GitHub (estão no `.gitignore`).

Quando não houver mais nenhuma ilustração na galeria, o aviso “Imagens ilustrativas” some sozinho.

**Ocasiões:** já usa 5 fotos reais de decorações da Romira (originais em `imagens-originais/ocasioes/`, versões otimizadas `public/imagens/fotos/ocasiao-*.webp`). Três ficam nos cartões (Aniversários, Encontros familiares, Reuniões entre amigos) e duas logo abaixo (lista `textos.ocasioes.fotos`). Em cada foto, `posicao` em `src/content/site.js` define o ponto que fica sempre visível no recorte, para não cortar rostos.

### Logotipo

A proposta de logotipo (palmeira estilizada + “ROMIRA” + “BRONZE E EVENTOS”) está em `public/marca/` em SVG (vetorial): versões horizontal e vertical, clara e escura, e o símbolo. É uma **proposta**, não um logotipo oficial. Para usar o logotipo oficial, substitua os arquivos mantendo os mesmos nomes (sem distorcer a marca). Para regerar a proposta: `npm run logo`.

---

## A imagem aérea da localização

A seção “Onde estamos” mostra um quadro amplo, com cantos arredondados, e o cartão “Romira · endereço · **Como chegar**”. Com as três fotos (vista aérea, rua e fachada), ele faz sozinho um percurso contínuo de 19 segundos: a câmera desce sobre a rua na vista aérea, a foto da rua surge por cima enquanto a aproximação continua, avança em direção ao portão, a fachada surge e fica em destaque (com o contorno “Romira” no portão cinza) por cerca de 3 segundos, e o ciclo recomeça suavemente pela vista aérea. Sem as fotos, a ilustração faz uma aproximação em loop de 10 segundos. Não há botões nem controles: a animação é só CSS (`src/styles/main.css`, bloco “Região / efeito aéreo”) e o script `src/scripts/aereo/index.js` apenas a pausa quando a seção sai da tela e a retoma de onde parou. Com movimento reduzido ativado no aparelho, a imagem fica parada. Nada depende de serviços externos.

**Qual imagem aparece:**

- **Fotos próprias ou autorizadas** (`aerea`, `rua` e `fachada`, veja abaixo): formam o percurso. No computador, o quadro segue a proporção da vista aérea; no celular, as fotos são recortadas ao centro. Com movimento reduzido, aparece só a fachada, parada.
- **Sem as três fotos autorizadas:** o site publicado usa a **ilustração própria** da região (`public/imagens/aereo/cidade-ilustrada.svg`), com a legenda “Ilustração artística.”. Ela não reproduz o traçado real das ruas.

O botão **“Como chegar”** abre o Google Maps com o endereço completo e já é preciso hoje. Para regerar a cidade ilustrada: `npm run cidade`.

> Os arquivos `src/scripts/aereo/mapa.js` e `estilo-mapa.js` (mapa MapLibre + OpenFreeMap) não são mais usados pela página e ficaram guardados caso o mapa volte a ser útil.

### Fotos do percurso (vista aérea, rua e fachada)

**Regra de publicação:** só vão para o site fotos **próprias ou com autorização de uso**. Capturas do Google Maps, Street View ou Google Earth, mesmo editadas, não podem ser publicadas.

- **Prévia local (não publicada):** coloque as fotos em `imagens-originais/chegada/` com os nomes `aerea`, `rua` e `fachada` (.jpg, .png ou .webp) e rode `npm run chegada`. As versões otimizadas vão para `imagens-local/chegada/` (fora do Git). Elas aparecem só no `npm run dev` e **nunca** entram no `npm run build`.
- **Site publicado:** com fotos próprias (por exemplo, de drone e do celular), rode `npm run chegada -- --publicar` (gera `public/imagens/chegada/`) e mude `fotosAutorizadas` para `true` em `src/content/site.js`. O percurso passa a aparecer no site publicado no lugar da ilustração.
- **Ponto da aproximação e destaque:** em `src/content/site.js`, no bloco `chegada`, cada foto tem `foco` (em % da foto, para onde a câmera se aproxima) e a fachada tem `contorno` (retângulo em % que destaca o portão). O ritmo do percurso fica nos `@keyframes` `camada-*` e `camera-*` de `src/styles/main.css`.
- **Legenda:** em `textos.regiao.legenda` (“Conheça a região do nosso espaço.”).

---

## Testes

```bash
npm run test:instalar   # só na primeira vez: baixa o navegador de testes
npm test                # compila e testa em computador, Android e iPhone (simulados)
```

O que é verificado automaticamente:

- página sem erros de JavaScript; título, descrição, `lang`, imagem de compartilhamento;
- dados estruturados sem avaliações, preços, horários ou coordenadas não verificadas;
- todos os links de WhatsApp (número e mensagem codificada), Instagram e Google Maps;
- ausência de depoimentos, preços e promoções inventados;
- navegação do menu (computador e menu do celular);
- cabeçalho fixo e estável, com logotipo e botão de reserva visíveis ao rolar;
- só dois botões “Reservar” (cabeçalho e abertura) e textos removidos/ajustados;
- no celular, imagem de abertura inteira abaixo do cabeçalho;
- fotos de referência da chegada fora do site publicado;
- sem rolagem horizontal em 320, 360, 390, 414, 768, 1024, 1280 e 1920 px, e botões com pelo menos 44 px;
- localização: percurso aérea → rua → fachada nas três fotos, ilustração em loop de 10 s no site publicado, pausa fora da tela, ausência de botões e avisos de demonstração e versão estática (movimento reduzido);
- estilo do mapa válido;
- acessibilidade automática (axe, WCAG 2.1 A/AA);
- galeria com ampliação e tecla Esc.

---

## Publicação automática (GitHub + Cloudflare Pages)

**Hospedagem recomendada: Cloudflare Pages.**

| Pergunta | Resposta |
| --- | --- |
| Custo | Grátis para este site (plano Free). |
| Cartão de crédito | Não é exigido no plano gratuito. |
| Endereço provisório | `https://NOME-DO-PROJETO.pages.dev` (ex.: `romira.pages.dev`, se estiver livre). |
| Como publica | A cada envio (“push”) para o GitHub, a Cloudflare compila e publica sozinha em cerca de 1 a 2 minutos. |
| Domínio próprio | Sim, pode ser ligado depois (ex.: `romira.com.br`, registrado no Registro.br). |

Por que não o GitHub Pages: ele também é grátis, mas os termos do GitHub não permitem usá-lo principalmente para um negócio comercial. A Cloudflare permite e é igualmente simples.

### Passo a passo (uma vez só)

**1. Criar o repositório no GitHub**

1. Entre em <https://github.com/new>.
2. Nome: `romira-landing`. Pode ser **Private** (privado).
3. Não marque “Add a README” (o projeto já tem). Clique em **Create repository**.

**2. Enviar o projeto**

No terminal, dentro da pasta do projeto:

```bash
git init -b main          # (pule se a pasta já tiver git)
git add .
git commit -m "Primeira versão da landing page"
git remote add origin https://github.com/SEU-USUARIO/romira-landing.git
git push -u origin main
```

**3. Conectar à Cloudflare Pages**

1. Crie uma conta grátis em <https://dash.cloudflare.com/sign-up>.
2. Vá em **Workers & Pages → Create → Pages → Connect to Git** e autorize o GitHub.
3. Escolha o repositório `romira-landing`.
4. Configuração de build:
   - Framework preset: **None** (ou Vite)
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Variável de ambiente: `NODE_VERSION` = `22`
5. Clique em **Save and Deploy**. Em instantes o site estará em `https://romira-landing.pages.dev` (ou o nome escolhido).
6. Volte em `src/content/site.js`, preencha `site.url` com esse endereço e envie de novo.

**4. Dia a dia**

Edite os arquivos, depois:

```bash
git add .
git commit -m "Descreva a alteração"
git push
```

O GitHub roda os testes (aba **Actions**) e a Cloudflare publica a nova versão. Pedidos de mudança (“pull requests”) ganham um endereço de prévia antes de irem ao ar.

**5. Domínio próprio (opcional, quando quiser)**

Na Cloudflare: projeto → **Custom domains → Set up a custom domain**, e siga as instruções de DNS. O domínio `.com.br` é registrado no Registro.br (custo anual do registro).

---

## Custos

| Item | Custo |
| --- | --- |
| Hospedagem Cloudflare Pages | Grátis |
| GitHub (repositório e testes automáticos) | Grátis |
| Mapa (OpenFreeMap + OpenStreetMap) | Grátis, sem chave e sem cadastro; crédito obrigatório (já exibido) |
| Botões de WhatsApp, Instagram e Google Maps | Grátis (links simples, sem API) |
| Fontes (Playfair Display, Manrope) e ícones (Lucide) | Grátis, hospedados junto com o site |
| Domínio próprio (opcional) | Custo anual do registro (ex.: Registro.br) |

**Alternativas pagas, apenas para avaliação (nada foi contratado):**

- **Google Photorealistic 3D Tiles** (sobrevoo fotorrealista em 3D): 1.000 carregamentos grátis por mês e depois US$ 6 por 1.000. Exige conta no Google Cloud com cartão e chave de API. Fonte: <https://developers.google.com/maps/billing-and-pricing/pricing>.
- **Mapbox com imagem de satélite**: 50 mil carregamentos grátis por mês e depois cerca de US$ 5 por 1.000. Exige cartão.
- **Vídeo de drone do local**: é a opção mais fiel; tem custo único (filmagem) e nenhum custo mensal. Deve ser comprimido e carregado sob demanda.

---

## Estrutura dos arquivos

```
romira-landing/
├── index.html                  # esqueleto da página (o conteúdo é gerado a partir de site.js)
├── src/
│   ├── content/site.js         # ← TEXTOS, CONTATOS, LINKS E IMAGENS (edite aqui)
│   ├── lib/links.js            # monta os links de WhatsApp, Google Maps e Instagram
│   ├── templates/              # HTML de cada seção, ícones e cena aérea
│   ├── styles/main.css         # visual (cores e fontes no topo, em :root)
│   └── scripts/
│       ├── main.js             # ponto de entrada
│       ├── cabecalho.js        # menu fixo e menu do celular
│       ├── revelar.js          # aparição suave das seções
│       ├── galeria.js          # ampliação das imagens
│       └── aereo/              # aproximação aérea automática (pausa fora da tela)
├── public/
│   ├── marca/                  # logotipo (proposta) em SVG
│   ├── imagens/ilustracoes/    # ilustrações atuais (substituíveis)
│   ├── imagens/fotos/          # fotos reais otimizadas (npm run imagens)
│   ├── imagens/aereo/          # cidade ilustrada do efeito aéreo
│   ├── imagens/chegada/        # fotos AUTORIZADAS da chegada (npm run chegada -- --publicar)
│   └── imagens/compartilhamento.jpg  # imagem para WhatsApp/redes sociais
├── scripts/                    # geradores: logo, ilustrações, cidade, compartilhamento, otimização de fotos
├── tests/                      # testes automáticos (Playwright + axe)
└── .github/workflows/verificar.yml  # testes a cada envio ao GitHub
```

Tecnologias: HTML, CSS e JavaScript puros, com [Vite](https://vitejs.dev/) para compilar. O MapLibre (biblioteca de mapa, ~290 KB compactado) só é baixado na seção do mapa. O restante do JavaScript tem cerca de 4 KB compactado. Não há chaves, senhas ou credenciais no código.

Comandos auxiliares: `npm run logo`, `npm run ilustracoes`, `npm run cidade`, `npm run compartilhamento`, `npm run imagens`, `npm run chegada`.

---

## Pendências que dependem da Romira

- **Posição exata do imóvel** (link do pin no Google Maps) para o destaque preciso no mapa.
- **Fotos reais** do espaço e, se houver, do bronzeamento.
- **Fotos próprias da chegada** (vista aérea de drone, rua e fachada) para publicar a sequência; as capturas atuais servem só para a prévia local.
- **Número na fachada:** a placa ao lado do portão mostra “13”, e o endereço informado é “15”. Confirmar qual número usar.
- **Logotipo oficial**, se existir (o atual é uma proposta).
- **Grafia da rua:** o site usa “Rua Francisco Viléla”, como informado; na base dos Correios a rua aparece como “Rua Francisco Vilela”, CEP 60861-140. Confirmar a grafia e se o CEP deve aparecer no site (`negocio.endereco.cep`).
- **Depoimentos reais** autorizados, quando houver.
- **Criação das contas** no GitHub/Cloudflare e, se desejado, registro de domínio.
