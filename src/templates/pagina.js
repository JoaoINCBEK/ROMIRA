// Monta o HTML estático da página a partir de src/content/site.js.
// É executado pelo Vite (no desenvolvimento e na compilação), então o HTML
// publicado já contém todo o texto — bom para SEO e para carregamento rápido.
import { negocio, site, navegacao, imagens, galeria, textos, localizacao, chegada } from '../content/site.js';
import { linkWhatsApp, linkComoChegar, linkInstagram, enderecoCompleto } from '../lib/links.js';
import { icone, iconeWhatsApp, iconeInstagram } from './icones.js';
import { cenaAerea } from './cena-aerea.js';

const esc = (t = '') =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ext = 'target="_blank" rel="noopener noreferrer"';

function srcset(img) {
  if (!img.larguras?.length) return '';
  const base = img.src.replace(/\.(\w+)$/, '');
  const tipo = img.src.split('.').pop();
  return `srcset="${img.larguras.map((w) => `${base}-${w}.${tipo} ${w}w`).join(', ')}"`;
}

// Com `larguras`, o arquivo real é nome-LARGURA.ext (gerado por npm run imagens)
function srcPrincipal(img) {
  if (!img.larguras?.length) return img.src;
  return img.src.replace(/\.(\w+)$/, `-${Math.max(...img.larguras)}.$1`);
}

function imagem(img, { classe = '', sizes = '100vw', prioridade = false } = {}) {
  return `<img class="${classe}" src="${esc(srcPrincipal(img))}" ${srcset(img)} sizes="${sizes}" alt="${esc(img.alt)}" ${
    prioridade ? 'fetchpriority="high"' : 'loading="lazy"'
  } decoding="async">`;
}

const seloIlustrativo = (img) => (img.ilustrativa ? '<span class="selo-ilustrativo">Imagem ilustrativa</span>' : '');

function botaoWhatsApp(rotulo, { tipo = 'reserva', classe = 'botao botao--primario', evento = 'reserva' } = {}) {
  return `<a class="${classe}" href="${linkWhatsApp(tipo)}" ${ext} data-whatsapp="${evento}">${iconeWhatsApp()}<span>${esc(rotulo)}</span></a>`;
}

const sobretitulo = (t) => `<p class="sobretitulo">${esc(t)}</p>`;

function logo(variante = 'escuro') {
  const arquivo = variante === 'claro' ? 'romira-logo-horizontal-claro.svg' : 'romira-logo-horizontal.svg';
  return `<img src="/marca/${arquivo}" alt="${esc(negocio.nome)}" width="289" height="72" class="logo__img">`;
}

// ---------------------------------------------------------------------------

function cabecalho() {
  const links = navegacao
    .map((n) => `<li><a href="#${n.alvo}" data-nav="${n.alvo}">${esc(n.rotulo)}</a></li>`)
    .join('');
  return `
<a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
<header class="cabecalho" data-cabecalho>
  <div class="container cabecalho__barra">
    <a class="logo" href="#inicio" aria-label="${esc(negocio.nome)} — início">
      <span class="logo__claro">${logo('claro')}</span><span class="logo__escuro">${logo('escuro')}</span>
    </a>
    <nav class="nav" aria-label="Principal">
      <ul class="nav__lista">${links}</ul>
    </nav>
    <a class="botao botao--primario botao--compacto cabecalho__cta" href="${linkWhatsApp()}" ${ext} data-whatsapp="cabecalho" aria-label="Reservar pelo WhatsApp">${iconeWhatsApp()}<span>Reservar<span class="cabecalho__cta-resto"> pelo WhatsApp</span></span></a>
    <button class="menu-botao" type="button" aria-expanded="false" aria-controls="menu-movel" data-menu-botao>
      <span class="menu-botao__linhas" aria-hidden="true"><span></span><span></span></span>
      <span class="sr-only" data-menu-rotulo>Abrir menu</span>
    </button>
  </div>
  <div class="menu-movel" id="menu-movel" data-menu hidden>
    <nav aria-label="Menu móvel">
      <ul>${links}</ul>
    </nav>
    <p class="menu-movel__endereco">${icone('pin')} ${esc(negocio.endereco.bairro)}, ${esc(negocio.endereco.cidade)}</p>
  </div>
</header>`;
}

function hero() {
  const t = textos.hero;
  const destaques = ['piscina', 'churrasqueira', 'coberta', 'musica']
    .map((id) => textos.comodidades.itens.find((i) => i.icone === id))
    .map((i) => `<li>${icone(i.icone)}<span>${esc(i.titulo)}</span></li>`)
    .join('');
  return `
<section class="hero" id="inicio" aria-labelledby="hero-titulo">
  <div class="hero__midia">
    ${imagem(imagens.hero, { classe: 'hero__img', prioridade: true })}
    <div class="hero__veu" aria-hidden="true"></div>
    <div class="hero__brilho" aria-hidden="true"></div>
  </div>
  <div class="container hero__conteudo">
    <p class="sobretitulo sobretitulo--claro revelar">${esc(t.sobretitulo)}</p>
    <h1 id="hero-titulo" class="hero__titulo revelar">${esc(t.titulo).replace('esse lugar.', '<em>esse lugar.</em>')}</h1>
    <p class="hero__slogan revelar">${esc(negocio.slogan)}</p>
    <p class="hero__texto revelar">${esc(t.texto)}</p>
    <div class="hero__acoes revelar">
      ${botaoWhatsApp(t.cta, { evento: 'hero' })}
      <a class="link-seta link-seta--claro" href="#espaco">Conhecer o espaço ${icone('seta')}</a>
    </div>
  </div>
  <ul class="hero__destaques container" aria-label="Destaques da estrutura">${destaques}</ul>
  ${seloIlustrativo(imagens.hero).replace('selo-ilustrativo', 'selo-ilustrativo selo-ilustrativo--hero')}
</section>`;
}

// Percurso da seção “Onde estamos”: vista aérea → rua → fachada. `fotos` vem
// do vite.config.js: { manifesto: { aerea: { largura, altura, larguras } }, previa } ou null.
// Só monta o percurso com as três fotos; sem elas, usa a ilustração da região.
function fotosDoPercurso(fotos) {
  const etapas = chegada.etapas.filter((e) => fotos?.manifesto?.[e.arquivo]).map((e) => ({ ...e, info: fotos.manifesto[e.arquivo] }));
  return etapas.length === chegada.etapas.length ? etapas : [];
}

function camadaFoto(e) {
  const { largura, altura, larguras } = e.info;
  const base = `/imagens/chegada/${e.arquivo}`;
  const c = e.contorno;
  return `<div class="percurso__camada" data-camada="${e.arquivo}">
        <div class="percurso__foto" style="--proporcao: ${(largura / altura).toFixed(4)}; --foco-x: ${e.foco?.x ?? 50}%; --foco-y: ${e.foco?.y ?? 50}%">
          <img src="${base}-${Math.max(...larguras)}.webp" srcset="${larguras.map((l) => `${base}-${l}.webp ${l}w`).join(', ')}" sizes="(min-width: 1440px) 1400px, 92vw" alt="${esc(e.alt)}" width="${largura}" height="${altura}" loading="lazy" decoding="async">
          ${c ? `<span class="percurso__contorno" style="left: ${c.x}%; top: ${c.y}%; width: ${c.largura}%; height: ${c.altura}%"><span>Romira</span></span>` : ''}
        </div>
      </div>`;
}

function imagemAerea(etapas) {
  if (!etapas.length) {
    return `<div class="aereo__cena" aria-hidden="true">
        <div class="aereo__plano">${cenaAerea()}</div>
        <div class="aereo__ceu"></div>
      </div>`;
  }
  return `<div class="percurso" aria-hidden="true">
      ${etapas.map(camadaFoto).join('')}
      </div>`;
}

function regiao(fotos) {
  const t = textos.regiao;
  const etapas = fotosDoPercurso(fotos);
  const aerea = etapas[0]?.info;
  return `
<section class="regiao" id="regiao" aria-labelledby="regiao-titulo">
  <div class="container regiao__intro">
    <div class="revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="regiao-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
    </div>
    <div class="regiao__lado revelar">
      <p>${esc(t.texto)}</p>
    </div>
  </div>
  <div class="aereo" data-aereo data-fonte="${aerea ? 'fotos' : 'ilustracao'}"${aerea ? ` style="--proporcao: ${(aerea.largura / aerea.altura).toFixed(4)}"` : ''}>
    <div class="aereo__palco">
      ${imagemAerea(etapas)}
      <div class="aereo__final">
        <div class="aereo__final-texto">
          <p class="aereo__final-nome">Romira</p>
          <p class="aereo__final-endereco">${esc(negocio.endereco.rua)} · ${esc(negocio.endereco.bairro)}</p>
        </div>
        <a class="botao botao--primario botao--compacto aereo__final-botao" href="${linkComoChegar()}" ${ext} data-maps="regiao">${icone('rota')}<span>Como chegar</span></a>
      </div>
    </div>
    <p class="aereo__legenda container" data-aereo-legenda>${esc(t.legenda)}${aerea ? '' : ` ${esc(t.legendaIlustracao)}`}</p>
    <p class="sr-only">A Romira fica na ${esc(enderecoCompleto())}, no portão cinza ao lado do número 13. Use o botão “Como chegar” para abrir a rota no Google Maps.</p>
  </div>
</section>`;
}

function espaco() {
  const t = textos.espaco;
  return `
<section class="espaco secao" id="espaco" aria-labelledby="espaco-titulo">
  <div class="container espaco__grade">
    <div class="espaco__texto revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="espaco-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
      ${t.paragrafos.map((p) => `<p>${esc(p)}</p>`).join('')}
    </div>
    <div class="espaco__imagens revelar">
      <figure class="moldura moldura--principal">${imagem(imagens.espaco, { sizes: '(min-width: 960px) 40vw, 90vw' })}${seloIlustrativo(imagens.espaco)}</figure>
      <figure class="moldura moldura--secundaria">${imagem(imagens.espacoDetalhe, { sizes: '(min-width: 960px) 22vw, 50vw' })}</figure>
    </div>
  </div>
</section>`;
}

function comodidades() {
  const t = textos.comodidades;
  const cards = t.itens
    .map(
      (i) => `<li class="comodidade revelar">
        <span class="comodidade__icone">${icone(i.icone)}</span>
        <h3>${esc(i.titulo)}</h3>
        <p>${esc(i.texto)}</p>
      </li>`
    )
    .join('');
  return `
<section class="comodidades secao" id="estrutura" aria-labelledby="estrutura-titulo">
  <div class="container">
    <div class="cabeca-secao revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="estrutura-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
    </div>
    <ul class="comodidades__grade">${cards}</ul>
  </div>
</section>`;
}

// Ponto da foto preservado no recorte (ex.: rostos)
const posicao = (img) => (img.posicao ? ` style="--posicao: ${esc(img.posicao)}"` : '');

function ocasioes() {
  const t = textos.ocasioes;
  const cards = t.itens
    .map((i) => {
      const img = imagens[i.imagem];
      return `<li class="ocasiao revelar">
        <figure class="ocasiao__midia"${posicao(img)}>${imagem(img, { sizes: img.sizes || '(min-width: 960px) 30vw, (min-width: 720px) 33vw, 90vw' })}${seloIlustrativo(img)}</figure>
        <div class="ocasiao__texto">
          <h3>${esc(i.titulo)}</h3>
          <p>${esc(i.texto)}</p>
        </div>
      </li>`;
    })
    .join('');
  const fotos = (t.fotos || [])
    .map((nome) => {
      const img = imagens[nome];
      return `<li class="ocasioes__foto revelar"><figure${posicao(img)}>${imagem(img, { sizes: '(min-width: 720px) 50vw, 90vw' })}${seloIlustrativo(img)}</figure></li>`;
    })
    .join('');
  return `
<section class="ocasioes secao" id="ocasioes" aria-labelledby="ocasioes-titulo">
  <div class="container">
    <div class="cabeca-secao revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="ocasioes-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
    </div>
    <ul class="ocasioes__grade">${cards}</ul>
    ${fotos ? `<ul class="ocasioes__fotos">${fotos}</ul>` : ''}
  </div>
</section>`;
}

function galeriaSecao() {
  const t = textos.galeria;
  const itens = galeria
    .map(
      (g, i) => `<li class="galeria__item ${g.formato ? `galeria__item--${g.formato}` : ''} revelar">
        <button type="button" class="galeria__abrir" data-galeria-indice="${i}" aria-label="Ampliar imagem: ${esc(g.legenda)}">
          ${imagem(g, { sizes: '(min-width: 960px) 33vw, 50vw' })}
          <span class="galeria__legenda">${esc(g.legenda)}</span>
          <span class="galeria__lupa" aria-hidden="true">${icone('expandir')}</span>
        </button>
      </li>`
    )
    .join('');
  const algumaIlustrativa = galeria.some((g) => g.ilustrativa);
  return `
<section class="galeria secao" id="galeria" aria-labelledby="galeria-titulo">
  <div class="container">
    <div class="cabeca-secao revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="galeria-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
      ${algumaIlustrativa ? `<p class="aviso">${esc(t.aviso)}</p>` : ''}
    </div>
    <ul class="galeria__grade">${itens}</ul>
  </div>
  <dialog class="visualizador" data-visualizador aria-label="Imagem ampliada">
    <figure>
      <img data-visualizador-img alt="">
      <figcaption data-visualizador-legenda></figcaption>
    </figure>
    <button type="button" class="visualizador__botao visualizador__fechar" data-visualizador-fechar aria-label="Fechar">${icone('fechar')}</button>
    <button type="button" class="visualizador__botao visualizador__anterior" data-visualizador-anterior aria-label="Imagem anterior">${icone('anterior')}</button>
    <button type="button" class="visualizador__botao visualizador__proximo" data-visualizador-proximo aria-label="Próxima imagem">${icone('proximo')}</button>
  </dialog>
  <script type="application/json" id="dados-galeria">${JSON.stringify(
    galeria.map((g) => ({ src: srcPrincipal(g), alt: g.alt, legenda: g.legenda, ilustrativa: !!g.ilustrativa }))
  ).replace(/</g, '\\u003c')}</script>
</section>`;
}

function bronzeamento() {
  const t = textos.bronzeamento;
  return `
<section class="bronze secao" id="bronzeamento" aria-labelledby="bronze-titulo">
  <div class="container bronze__grade">
    <figure class="bronze__midia revelar">${imagem(imagens.bronzeamento, { sizes: '(min-width: 960px) 40vw, 90vw' })}${seloIlustrativo(imagens.bronzeamento)}</figure>
    <div class="bronze__texto revelar">
      <span class="bronze__icone">${icone('sol')}</span>
      ${sobretitulo(t.sobretitulo).replace('sobretitulo', 'sobretitulo sobretitulo--claro')}
      <h2 id="bronze-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
      <p>${esc(t.texto)}</p>
      ${botaoWhatsApp(t.cta, { tipo: 'bronzeamento', classe: 'botao botao--contorno', evento: 'bronzeamento' })}
    </div>
  </div>
</section>`;
}

function depoimentos() {
  const t = textos.depoimentos;
  // Só renderiza com depoimentos reais cadastrados em site.js
  if (!t.ativo || !t.itens.length) return '';
  return `
<section class="depoimentos secao" id="depoimentos" aria-labelledby="depoimentos-titulo">
  <div class="container">
    <div class="cabeca-secao revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="depoimentos-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
    </div>
    <ul class="depoimentos__grade">
      ${t.itens
        .map(
          (d) => `<li class="depoimento revelar"><blockquote><p>${esc(d.texto)}</p></blockquote>
          <p class="depoimento__autor">${esc(d.autor)}${d.ocasiao ? ` · <span>${esc(d.ocasiao)}</span>` : ''}</p></li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

function contato() {
  const t = textos.localizacao;
  const e = negocio.endereco;
  return `
<section class="contato secao" id="localizacao" aria-labelledby="contato-titulo">
  <div class="container contato__grade">
    <div class="contato__texto revelar">
      ${sobretitulo(t.sobretitulo)}
      <h2 id="contato-titulo" class="titulo-secao">${esc(t.titulo)}</h2>
      <p>${esc(t.texto)}</p>
    </div>
    <div class="contato__cartao revelar">
      <address class="contato__endereco">
        <span class="contato__icone">${icone('pin')}</span>
        <span>
          <strong>${esc(e.rua)}</strong><br>
          ${esc(e.bairro)}<br>
          ${esc(e.cidade)} - ${esc(e.estado)}${e.cep ? `, ${esc(e.cep)}` : ''}
        </span>
      </address>
      <a class="botao botao--escuro botao--largo" href="${linkComoChegar()}" ${ext} data-maps="contato">${icone('rota')}<span>Como chegar</span></a>
      <ul class="contato__canais">
        <li><a href="${linkWhatsApp()}" ${ext} data-whatsapp="contato-numero">${iconeWhatsApp()}<span><small>WhatsApp</small>${esc(negocio.whatsapp.exibicao)}</span></a></li>
        <li><a href="${linkInstagram()}" ${ext} data-instagram="contato">${iconeInstagram()}<span><small>Instagram</small>@${esc(negocio.instagram.usuario)}</span></a></li>
      </ul>
    </div>
  </div>
</section>`;
}

function rodape() {
  const e = negocio.endereco;
  return `
<footer class="rodape" data-rodape>
  <div class="container rodape__grade">
    <div class="rodape__marca">
      <img src="/marca/romira-logo-horizontal-claro.svg" alt="${esc(negocio.nome)}" width="231" height="58" loading="lazy">
      <p class="rodape__slogan">${esc(negocio.slogan)}</p>
    </div>
    <div class="rodape__col">
      <h2 class="rodape__titulo">${esc(negocio.nome)}</h2>
      <address><span>${esc(e.rua)}</span> <span>${esc(e.bairro)}</span> <span>${esc(e.cidade)} - ${esc(e.estado)}</span></address>
    </div>
    <div class="rodape__col">
      <h2 class="rodape__titulo">Contato</h2>
      <ul class="rodape__links">
        <li><a href="${linkWhatsApp()}" ${ext} data-whatsapp="rodape">${iconeWhatsApp()} <span class="rodape__rotulo">WhatsApp </span>${esc(negocio.whatsapp.exibicao)}</a></li>
        <li><a href="${linkInstagram()}" ${ext} data-instagram="rodape">${iconeInstagram()} @${esc(negocio.instagram.usuario)}</a></li>
        <li><a href="${linkComoChegar()}" ${ext} data-maps="rodape">${icone('rota')} Como chegar</a></li>
      </ul>
    </div>
  </div>
  <div class="container rodape__base">
    <p>© <span data-ano>${new Date().getFullYear()}</span> ${esc(negocio.nome)}</p>
    <p>Imagens marcadas como ilustrativas não são fotografias do local.</p>
  </div>
</footer>`;
}

export function renderizarPagina({ fotosChegada = null } = {}) {
  return `${cabecalho()}
<main id="conteudo">
${hero()}
${regiao(fotosChegada)}
${espaco()}
${comodidades()}
${ocasioes()}
${galeriaSecao()}
${bronzeamento()}
${depoimentos()}
${contato()}
</main>
${rodape()}`;
}

// ---------------------------------------------------------------------------
//  <head>: SEO, compartilhamento e dados estruturados
// ---------------------------------------------------------------------------
export function renderizarHead() {
  const url = site.url;
  const imagemAbs = url ? `${url}${site.imagemCompartilhamento}` : site.imagemCompartilhamento;
  const e = negocio.endereco;
  // Dados estruturados apenas com informações confirmadas: sem horários,
  // preços, avaliações ou coordenadas não verificadas.
  const dados = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: negocio.nome,
    slogan: negocio.slogan,
    description: site.descricao,
    telephone: `+${negocio.whatsapp.numero}`,
    image: imagemAbs,
    address: {
      '@type': 'PostalAddress',
      streetAddress: e.rua,
      addressLocality: e.cidade,
      addressRegion: e.estado,
      addressCountry: e.pais,
      ...(e.cep ? { postalCode: e.cep } : {}),
    },
    areaServed: { '@type': 'City', name: 'Fortaleza' },
    sameAs: [negocio.instagram.url],
    amenityFeature: textos.comodidades.itens
      .filter((i) => i.icone !== 'familia')
      .map((i) => ({ '@type': 'LocationFeatureSpecification', name: i.titulo, value: true })),
    ...(url ? { url } : {}),
    ...(localizacao.verificada
      ? { geo: { '@type': 'GeoCoordinates', latitude: localizacao.latitude, longitude: localizacao.longitude } }
      : {}),
  };
  return `
    <title>${esc(site.titulo)}</title>
    <meta name="description" content="${esc(site.descricao)}">
    ${url ? `<link rel="canonical" href="${url}/">` : ''}
    <meta name="theme-color" content="#2E3824">
    <meta name="geo.region" content="BR-CE">
    <meta name="geo.placename" content="Fortaleza">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="pt_BR">
    <meta property="og:site_name" content="${esc(negocio.nome)}">
    <meta property="og:title" content="${esc(site.titulo)}">
    <meta property="og:description" content="${esc(site.descricao)}">
    <meta property="og:image" content="${esc(imagemAbs)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(negocio.nome)} — ${esc(negocio.slogan)}">
    ${url ? `<meta property="og:url" content="${url}/">` : ''}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(site.titulo)}">
    <meta name="twitter:description" content="${esc(site.descricao)}">
    <meta name="twitter:image" content="${esc(imagemAbs)}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preload" as="image" href="${esc(srcPrincipal(imagens.hero))}" ${imagens.hero.larguras ? `imagesrcset="${srcset(imagens.hero).slice(8, -1)}" imagesizes="100vw"` : ''} fetchpriority="high">
    <script type="application/ld+json">${JSON.stringify(dados).replace(/</g, '\\u003c')}</script>`;
}
