// Gera os arquivos vetoriais do logotipo (proposta) em public/marca/.
// O texto é convertido em curvas a partir da fonte Cormorant Garamond,
// para que o SVG tenha a mesma aparência em qualquer computador.
// Uso: npm run logo
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const fontFile = (name) =>
  require.resolve(`@fontsource/cormorant-garamond/files/${name}`);
const toArrayBuffer = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const fontTitulo = opentype.parse(toArrayBuffer(readFileSync(fontFile('cormorant-garamond-latin-500-normal.woff'))));
const fontAssinatura = opentype.parse(toArrayBuffer(readFileSync(fontFile('cormorant-garamond-latin-600-normal.woff'))));

const OUT = new URL('../public/marca/', import.meta.url);
mkdirSync(OUT, { recursive: true });

const CORES = {
  escuro: { texto: '#2E3824', simbolo: '#A06D3A', assinatura: '#7D5228' },
  claro: { texto: '#F5EFE4', simbolo: '#CFA272', assinatura: '#E3CFA9' },
};

// Símbolo: palmeira estilizada sob um arco de sol (caixa 64 x 64)
function simbolo(cor) {
  return `
    <path d="M14.6 30a19 19 0 0 1 38 0" fill="none" stroke="${cor}" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>
    <path d="M29.4 60c1.4-11.6 3-23.2 3.3-34.4h1.9c-.1 11.4-1.3 23-2.6 34.4z" fill="${cor}"/>
    <path d="M33.6 25.6c7.6-6.2 16.8-6 23.6.6-7-3.6-14.6-3.4-23.6-.6z" fill="${cor}"/>
    <path d="M33.6 25.6c-7.8-6.6-17.2-6.6-24.4 0 7.2-3.4 15.2-3.2 24.4 0z" fill="${cor}"/>
    <path d="M33.6 25.6c3.4-8.8 10.6-13.8 19.4-13.8-8 2-14 6.6-19.4 13.8z" fill="${cor}"/>
    <path d="M33.6 25.6c-3.6-9.4-11-14.6-20-14.4 8.2 2.2 14.6 7 20 14.4z" fill="${cor}"/>
    <path d="M33.6 25.6c7.4 1.8 13.2 7.4 15.4 15.2-4.2-6.4-9.2-11-15.4-15.2z" fill="${cor}"/>
    <path d="M33.6 25.6c-7.4 2-13 7.6-15 15.4 4.2-6.6 9-11.2 15-15.4z" fill="${cor}"/>
    <path d="M33.6 25.6c.8-7.4 3.4-12.6 8.4-16.6-3.6 4.6-6.2 10-8.4 16.6z" fill="${cor}"/>`;
}

// Serializa os comandos do opentype.js (o toPathData da v2 gera NaN em alguns glifos)
function paraDadosDeCaminho(comandos) {
  const n = (v) => Number(v.toFixed(2));
  return comandos
    .map((c) => {
      if (c.type === 'M' || c.type === 'L') return `${c.type}${n(c.x)} ${n(c.y)}`;
      if (c.type === 'Q') return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
      if (c.type === 'C') return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
      return 'Z';
    })
    .join('');
}

// Converte texto em caminho, com espaçamento entre letras (tracking em unidades da fonte)
function textoEmCurvas(font, texto, tamanho, tracking) {
  const opcoes = { kerning: true, letterSpacing: tracking / tamanho };
  const caminho = font.getPath(texto, 0, 0, tamanho, opcoes);
  const largura = font.getAdvanceWidth(texto, tamanho, opcoes) - tracking;
  return { d: paraDadosDeCaminho(caminho.commands), largura };
}

// Assinatura legível: fonte maior, espaçada para ocupar a mesma largura de ROMIRA
function assinaturaNaLargura(tamanho, largura) {
  const texto = 'BRONZE E EVENTOS';
  const semEspaco = textoEmCurvas(fontAssinatura, texto, tamanho, 0);
  const tracking = Math.max(1, (largura - semEspaco.largura) / (texto.length - 1));
  return textoEmCurvas(fontAssinatura, texto, tamanho, tracking);
}

function horizontal(cores) {
  const titulo = textoEmCurvas(fontTitulo, 'ROMIRA', 48, 4);
  const assinatura = assinaturaNaLargura(17, titulo.largura);
  const xTexto = 74;
  const largura = Math.ceil(xTexto + Math.max(titulo.largura, assinatura.largura) + 4);
  const xAss = xTexto + (titulo.largura - assinatura.largura) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} 72" role="img" aria-label="Romira Bronze e Eventos">
  <title>Romira Bronze e Eventos</title>
  <g transform="translate(0 4)">${simbolo(cores.simbolo)}</g>
  <path transform="translate(${xTexto} 42)" fill="${cores.texto}" fill-rule="evenodd" d="${titulo.d}"/>
  <path transform="translate(${xAss.toFixed(2)} 67)" fill="${cores.assinatura}" fill-rule="evenodd" d="${assinatura.d}"/>
</svg>
`;
}

function vertical(cores) {
  const titulo = textoEmCurvas(fontTitulo, 'ROMIRA', 56, 6);
  const assinatura = assinaturaNaLargura(19, titulo.largura);
  const largura = Math.ceil(Math.max(titulo.largura, assinatura.largura) + 8);
  const cx = largura / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${largura} 172" role="img" aria-label="Romira Bronze e Eventos">
  <title>Romira Bronze e Eventos</title>
  <g transform="translate(${(cx - 40).toFixed(2)} 0) scale(1.25)">${simbolo(cores.simbolo)}</g>
  <path transform="translate(${(cx - titulo.largura / 2).toFixed(2)} 134)" fill="${cores.texto}" fill-rule="evenodd" d="${titulo.d}"/>
  <path transform="translate(${(cx - assinatura.largura / 2).toFixed(2)} 164)" fill="${cores.assinatura}" fill-rule="evenodd" d="${assinatura.d}"/>
</svg>
`;
}

const simboloSvg = (cor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Romira">
  <title>Romira</title>${simbolo(cor)}
</svg>
`;

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#2E3824"/>
  <g transform="translate(4 2) scale(.875)">${simbolo('#D3A877')}</g>
</svg>
`;

const arquivos = {
  'romira-logo-horizontal.svg': horizontal(CORES.escuro),
  'romira-logo-horizontal-claro.svg': horizontal(CORES.claro),
  'romira-logo-vertical.svg': vertical(CORES.escuro),
  'romira-logo-vertical-claro.svg': vertical(CORES.claro),
  'romira-simbolo.svg': simboloSvg(CORES.escuro.simbolo),
  'romira-simbolo-claro.svg': simboloSvg(CORES.claro.simbolo),
};
for (const [nome, svg] of Object.entries(arquivos)) writeFileSync(new URL(nome, OUT), svg);
writeFileSync(new URL('../public/favicon.svg', import.meta.url), favicon);
console.log('Logotipos gerados em public/marca/:', Object.keys(arquivos).join(', '));
