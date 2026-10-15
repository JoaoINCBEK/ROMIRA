import { test, expect } from '@playwright/test';
import { negocio } from '../src/content/site.js';
import { bloquearMapa } from './mapa-falso.js';

const NUMERO = '5585989742714';
const MSG_RESERVA = 'Olá! Gostaria de consultar a disponibilidade da Romira Bronze e Eventos para realizar um evento.';
const ehMovel = (testInfo) => testInfo.project.name !== 'desktop';

test.beforeEach(async ({ page }) => {
  await bloquearMapa(page); // por padrão, sem internet de mapas (testa a alternativa)
});

test('carrega sem erros de JavaScript e com SEO básico', async ({ page }) => {
  const erros = [];
  page.on('pageerror', (e) => erros.push(e.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/Romira Bronze e Eventos/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Fortaleza/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /compartilhamento\.jpg/);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText('Seu próximo momento especial merece esse lugar.');

  // Dados estruturados sem avaliações, preços, horários ou coordenadas não verificadas
  const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
  expect(ld['@type']).toBe('LocalBusiness');
  expect(ld.address.streetAddress).toBe('Rua Francisco Viléla, 15');
  for (const proibido of ['aggregateRating', 'review', 'priceRange', 'openingHours', 'openingHoursSpecification', 'geo']) {
    expect(ld[proibido], proibido).toBeUndefined();
  }
  expect(erros).toEqual([]);
});

test('imagens têm texto alternativo e títulos seguem hierarquia', async ({ page }) => {
  await page.goto('/');
  const semAlt = await page.locator('img:not([alt])').count();
  expect(semAlt).toBe(0);
  const niveis = await page.locator('h1, h2, h3').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
  for (let i = 1; i < niveis.length; i++) expect(niveis[i] - niveis[i - 1]).toBeLessThanOrEqual(1);
});

test('todos os links de WhatsApp abrem a conversa certa com mensagem codificada', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('a[data-whatsapp]');
  const total = await links.count();
  expect(total).toBeGreaterThanOrEqual(4);
  for (let i = 0; i < total; i++) {
    const href = await links.nth(i).getAttribute('href');
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe(`https://wa.me/${NUMERO}`);
    const texto = url.searchParams.get('text');
    const tipo = await links.nth(i).getAttribute('data-whatsapp');
    if (tipo === 'bronzeamento') expect(texto).toContain('bronzeamento natural');
    else expect(texto).toBe(MSG_RESERVA);
    expect(href).not.toContain(' '); // codificação correta
    await expect(links.nth(i)).toHaveAttribute('target', '_blank');
    await expect(links.nth(i)).toHaveAttribute('rel', /noopener/);
  }
});

test('Instagram e Como chegar apontam para os destinos corretos', async ({ page }) => {
  await page.goto('/');
  const insta = page.locator('a[data-instagram]');
  expect(await insta.count()).toBeGreaterThanOrEqual(2);
  for (const href of await insta.evaluateAll((as) => as.map((a) => a.href))) {
    expect(href).toBe('https://www.instagram.com/romira_baloes/');
  }
  const mapas = page.locator('a[data-maps]');
  expect(await mapas.count()).toBeGreaterThanOrEqual(3);
  for (const href of await mapas.evaluateAll((as) => as.map((a) => a.href))) {
    const url = new URL(href);
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/dir/');
    expect(url.searchParams.get('api')).toBe('1');
    expect(url.searchParams.get('destination')).toContain('Rua Francisco Viléla, 15 - Boa Vista-Castelão, Fortaleza - CE');
  }
  await expect(page.getByText('Como chegar').first()).toBeVisible();
});

test('não há depoimentos, avaliações ou preços inventados', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#depoimentos')).toHaveCount(0);
  const texto = await page.locator('body').innerText();
  expect(texto).not.toMatch(/R\$\s?\d/);
  expect(texto).not.toMatch(/★|estrelas|avaliaç/i);
  expect(texto).not.toMatch(/desconto|promoç|oferta/i);
  expect(texto).toContain(negocio.whatsapp.exibicao);
});

test('navegação do menu leva às seções', async ({ page }, testInfo) => {
  await page.goto('/');
  const alvos = ['espaco', 'bronzeamento', 'localizacao', 'inicio'];
  for (const alvo of alvos) {
    if (ehMovel(testInfo)) {
      const botao = page.locator('[data-menu-botao]');
      await botao.click();
      await expect(botao).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#menu-movel')).toBeVisible();
      await page.locator(`#menu-movel a[data-nav="${alvo}"]`).click();
      await expect(botao).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#menu-movel')).toBeHidden();
    } else {
      await page.locator(`.nav a[data-nav="${alvo}"]`).click();
    }
    await expect(page.locator(`#${alvo}`)).toBeInViewport({ ratio: 0.2 });
    await expect(page).toHaveURL(new RegExp(`#${alvo}$`));
  }
});

test('cabeçalho fica estável e fixo durante a rolagem', async ({ page }) => {
  await page.goto('/');
  const cab = page.locator('[data-cabecalho]');
  const antes = await cab.boundingBox();
  await page.mouse.wheel(0, 2500);
  await page.waitForTimeout(400);
  const depois = await cab.boundingBox();
  expect(depois.y).toBe(0);
  expect(Math.round(depois.height)).toBe(Math.round(antes.height));
  await expect(cab).toHaveClass(/cabecalho--solido/);
  // menu e botão de reserva continuam visíveis depois de rolar
  await expect(page.locator('.cabecalho__cta')).toBeInViewport();
  await expect(page.locator('.cabecalho .logo')).toBeInViewport();
});

test('só há dois botões “Reservar”: cabeçalho e abertura', async ({ page }) => {
  await page.goto('/');
  const reservar = page.locator('a[data-whatsapp]').filter({ hasText: /Reservar/ });
  await expect(reservar).toHaveCount(2);
  expect(await reservar.evaluateAll((as) => as.map((a) => a.dataset.whatsapp))).toEqual(['cabecalho', 'hero']);
  await expect(page.locator('[data-flutuante], .whatsapp-flutuante')).toHaveCount(0);
});

test('textos removidos e ajustados', async ({ page }) => {
  await page.goto('/');
  const texto = await page.locator('main').innerText();
  expect(texto).not.toMatch(/11 a 20|aluguel flexível|Recebe grupos/);
  await expect(page.locator('#regiao-titulo')).toHaveText('Na Boa Vista-Castelão, em Fortaleza.');
});

test('no celular, a imagem de abertura aparece inteira abaixo do cabeçalho', async ({ page }, testInfo) => {
  test.skip(!ehMovel(testInfo), 'layout de celular');
  await page.goto('/');
  const cab = await page.locator('[data-cabecalho]').boundingBox();
  const midia = await page.locator('.hero__midia').boundingBox();
  expect(midia.y).toBeGreaterThanOrEqual(cab.y + cab.height - 1);
  expect(midia.width / midia.height).toBeCloseTo(16 / 9, 1); // mesma proporção da imagem
  await expect(page.locator('.hero .sobretitulo')).toBeHidden();
});

for (const largura of [320, 360, 390, 414, 768, 1024, 1280, 1920]) {
  test(`sem rolagem horizontal em ${largura}px`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'larguras testadas no projeto desktop');
    await page.setViewportSize({ width: largura, height: 800 });
    await page.goto('/');
    const larguraDoc = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(larguraDoc).toBeLessThanOrEqual(largura);
    // nenhum botão menor que 44px de altura (alvo de toque)
    const pequenos = await page.locator('a.botao, .menu-botao').evaluateAll((els) =>
      els.filter((e) => e.offsetParent && e.getBoundingClientRect().height < 44).map((e) => e.textContent.trim())
    );
    expect(pequenos).toEqual([]);
  });
}

test('aproximação aérea começa sozinha, em loop, sem controles de demonstração', async ({ page }) => {
  await page.goto('/');
  const aereo = page.locator('[data-aereo]');
  // sem foto aérea autorizada, o site publicado usa a ilustração identificada
  await expect(aereo).toHaveAttribute('data-fonte', 'ilustracao');
  await expect(page.locator('[data-aereo-legenda]')).toHaveText('Conheça a região do nosso espaço. Ilustração artística.');
  await expect(page.locator('[data-aereo-repetir], .chegada__progresso, .chegada__previa, [data-aereo-marcador]')).toHaveCount(0);
  await expect(page.locator('[data-aereo]')).not.toContainText(/Repetir|Prévia local|posição exata|aproximad/i);

  const camera = page.locator('.aereo__tela');
  await expect(camera).toHaveCSS('animation-name', 'camera-cena');
  await expect(camera).toHaveCSS('animation-iteration-count', 'infinite');
  await expect(camera).toHaveCSS('animation-duration', '10s');
  await expect(camera).toHaveCSS('animation-play-state', 'paused'); // fora da tela

  await aereo.scrollIntoViewIfNeeded();
  await expect(aereo).toHaveClass(/aereo--rodando/);
  await expect(camera).toHaveCSS('animation-play-state', 'running');
  const t0 = await camera.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(1200);
  expect(await camera.evaluate((e) => getComputedStyle(e).transform)).not.toBe(t0);

  // O botão "Como chegar" segue visível e clicável
  await expect(page.locator('a[data-maps="regiao"]')).toBeVisible();

  // ao sair da seção, pausa
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(aereo).not.toHaveClass(/aereo--rodando/);
});

test('com as três fotos, a seção monta o percurso aérea → rua → fachada', async () => {
  const { renderizarPagina } = await import('../src/templates/pagina.js');
  const info = { largura: 1600, altura: 900, larguras: [800, 1600] };
  const html = renderizarPagina({ fotosChegada: { manifesto: { aerea: info, rua: info, fachada: info }, previa: false } });
  const camadas = [...html.matchAll(/data-camada="(\w+)"/g)].map((m) => m[1]);
  expect(camadas).toEqual(['aerea', 'rua', 'fachada']);
  for (const nome of camadas) expect(html).toContain(`/imagens/chegada/${nome}-1600.webp`);
  expect(html).toContain('percurso__contorno');
  expect(html).not.toMatch(/Prévia local|data-segmento|Repetir/);
  // faltando uma foto, usa a ilustração
  const sem = renderizarPagina({ fotosChegada: { manifesto: { aerea: info, rua: info }, previa: false } });
  expect(sem).not.toContain('data-camada');
  expect(sem).toContain('aereo__cena');
});

test('com movimento reduzido, a imagem aérea fica estática', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('[data-aereo]').scrollIntoViewIfNeeded();
  await expect(page.locator('.aereo__tela')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('a[data-maps="regiao"]')).toBeVisible();
});

test('galeria abre a imagem ampliada e fecha com Esc', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-galeria-indice="0"]').click();
  const dialogo = page.locator('[data-visualizador]');
  await expect(dialogo).toBeVisible();
  await expect(dialogo.locator('figcaption')).toContainText('Piscina');
  await page.locator('[data-visualizador-proximo]').click();
  await expect(dialogo.locator('figcaption')).toContainText('(2/');
  await page.keyboard.press('Escape');
  await expect(dialogo).toBeHidden();
});

test('imagens ilustrativas estão identificadas', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.selo-ilustrativo').count()).toBeGreaterThanOrEqual(2);
  // Ocasiões usa fotos reais: sem selo de ilustração e com as 5 fotos otimizadas
  await expect(page.locator('#ocasioes .selo-ilustrativo')).toHaveCount(0);
  const fotos = await page.locator('#ocasioes img').evaluateAll((is) => is.map((i) => i.getAttribute('src')));
  expect(fotos).toHaveLength(5);
  for (const src of fotos) expect(src).toMatch(/^\/imagens\/fotos\/ocasiao-.+\.webp$/);
  await expect(page.getByText('Imagens ilustrativas. Em breve, fotos reais do espaço.')).toBeVisible();
});

test('fotos de referência da chegada não entram no site publicado', async ({ page, request }) => {
  await page.goto('/');
  // Sem fotos próprias/autorizadas: nenhum quadro de foto nem prévia
  await expect(page.locator('[data-chegada], .chegada__previa, [data-segmento]')).toHaveCount(0);
  expect(await page.content()).not.toContain('/imagens/chegada/');
  const resposta = await request.get('/imagens/chegada/fachada-800.webp');
  expect(resposta.headers()['content-type'] || '').not.toContain('image/webp');
});
