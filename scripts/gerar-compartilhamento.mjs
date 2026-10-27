// Gera a imagem de compartilhamento (WhatsApp, Instagram, Facebook): 1200 x 630
// e o ícone para iPhone (apple-touch-icon). Uso: npm run compartilhamento
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';

const require = createRequire(import.meta.url);
const raiz = new URL('../', import.meta.url);
const ler = (rel) => readFileSync(new URL(rel, raiz));
const buf = (b) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const fonte = opentype.parse(buf(readFileSync(require.resolve('@fontsource/playfair-display/files/playfair-display-latin-400-italic.woff'))));

function texto(t, tamanho) {
  // glifo a glifo (o opentype.js não suporta algumas substituições desta fonte)
  const escala = tamanho / fonte.unitsPerEm;
  let x = 0;
  const comandos = [];
  for (const ch of t) {
    const g = fonte.charToGlyph(ch);
    comandos.push(...g.getPath(x, 0, tamanho).commands);
    x += g.advanceWidth * escala;
  }
  const d = comandos
    .map((c) => (c.type === 'Z' ? 'Z' : c.type === 'Q' ? `Q${c.x1.toFixed(2)} ${c.y1.toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}` : c.type === 'C' ? `C${c.x1.toFixed(2)} ${c.y1.toFixed(2)} ${c.x2.toFixed(2)} ${c.y2.toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}` : `${c.type}${c.x.toFixed(2)} ${c.y.toFixed(2)}`))
    .join('');
  return { d, largura: x };
}

const fundo = await sharp(ler('public/imagens/ilustracoes/hero-piscina.svg'), { density: 96 })
  .resize(1200, 630, { fit: 'cover', position: 'right' })
  .png()
  .toBuffer();

const logo = await sharp(ler('public/marca/romira-logo-vertical-claro.svg'), { density: 220 }).resize({ width: 380 }).png().toBuffer();
const meta = await sharp(logo).metadata();
const slogan = texto("Seu momento de lazer começa aqui.", 34);

const sobreposicao = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#1c2216" stop-opacity=".92"/><stop offset=".55" stop-color="#1c2216" stop-opacity=".6"/><stop offset="1" stop-color="#1c2216" stop-opacity=".15"/></linearGradient></defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <path transform="translate(90 540)" fill="#dcb98c" d="${slogan.d}"/>
</svg>`);

await sharp(fundo)
  .composite([
    { input: sobreposicao },
    { input: logo, left: 90, top: Math.round(270 - meta.height / 2) },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(fileURLToPath(new URL('public/imagens/compartilhamento.jpg', raiz)));

await sharp(ler('public/favicon.svg'), { density: 300 }).resize(180, 180).png().toFile(fileURLToPath(new URL('public/apple-touch-icon.png', raiz)));
console.log('Gerados: public/imagens/compartilhamento.jpg e public/apple-touch-icon.png');
