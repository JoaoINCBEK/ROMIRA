// Gera a ilustração aérea estilizada usada como abertura/alternativa estática do
// efeito de localização (public/imagens/aereo/cidade-ilustrada.svg).
// É uma representação ARTÍSTICA: não reproduz o traçado real das ruas.
// Uso: npm run cidade
import { writeFileSync, mkdirSync } from 'node:fs';

const L = 2400; // largura
const A = 1500; // altura
const CX = L / 2;
const CY = A / 2;

let semente = 20240611;
const rnd = () => ((semente = (semente * 1664525 + 1013904223) % 4294967296) / 4294967296);
const entre = (a, b) => a + rnd() * (b - a);
const escolha = (lista) => lista[Math.floor(rnd() * lista.length)];

const COR = {
  solo: '#D8CBB1',
  rua: '#EFE7D8',
  avenida: '#F6F0E4',
  telhados: ['#B88A66', '#C49A78', '#A97B5B', '#E3D7C2', '#D5C8B0', '#BFB4A0', '#9F8D78'],
  arvores: ['#5E6A45', '#6B7651', '#52603C', '#7B8660'],
  piscina: '#7FA9A3',
  parque: '#A7B08A',
};

const partes = [];
const sombra = [];
const arvores = [];

// Grade de ruas levemente irregular
const colunas = [];
for (let x = -40; x < L + 200; x += entre(150, 210)) colunas.push(x);
const linhas = [];
for (let y = -40; y < A + 200; y += entre(120, 170)) linhas.push(y);
const larguraRua = 22;

partes.push(`<rect width="${L}" height="${A}" fill="${COR.solo}"/>`);

// Quarteirões
for (let i = 0; i < colunas.length - 1; i++) {
  for (let j = 0; j < linhas.length - 1; j++) {
    const x0 = colunas[i] + larguraRua / 2;
    const y0 = linhas[j] + larguraRua / 2;
    const w = colunas[i + 1] - colunas[i] - larguraRua;
    const h = linhas[j + 1] - linhas[j] - larguraRua;
    const centro = Math.abs(x0 + w / 2 - CX) < 120 && Math.abs(y0 + h / 2 - CY) < 100;
    // Praça / área verde ocasional (nunca no quarteirão central)
    if (!centro && rnd() < 0.07) {
      partes.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="6" fill="${COR.parque}"/>`);
      for (let k = 0; k < 14; k++) arvores.push([entre(x0 + 8, x0 + w - 8), entre(y0 + 8, y0 + h - 8), entre(7, 13)]);
      continue;
    }
    partes.push(`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="4" fill="#CBBD9F"/>`);
    // Lotes: duas fileiras de casas
    const fileiras = [y0 + 4, y0 + h / 2 + 2];
    for (const fy of fileiras) {
      let lx = x0 + 4;
      const fh = h / 2 - 6;
      while (lx < x0 + w - 18) {
        const lw = Math.min(entre(18, 34), x0 + w - 4 - lx);
        const altura = entre(2, 7);
        const cor = escolha(COR.telhados);
        sombra.push(`<rect x="${(lx + altura).toFixed(0)}" y="${(fy + altura).toFixed(0)}" width="${(lw - 3).toFixed(0)}" height="${(fh * 0.72).toFixed(0)}"/>`);
        partes.push(`<rect x="${lx.toFixed(0)}" y="${fy.toFixed(0)}" width="${(lw - 3).toFixed(0)}" height="${(fh * 0.72).toFixed(0)}" rx="1.5" fill="${cor}"/>`);
        // quintal com árvore ou piscina
        if (rnd() < 0.45) arvores.push([lx + lw / 2, fy + fh * 0.86, entre(5, 9)]);
        else if (rnd() < 0.08)
          partes.push(`<rect x="${(lx + 4).toFixed(0)}" y="${(fy + fh * 0.76).toFixed(0)}" width="${(lw * 0.5).toFixed(0)}" height="${(fh * 0.2).toFixed(0)}" rx="2" fill="${COR.piscina}"/>`);
        lx += lw;
      }
    }
  }
}

// Ruas por cima dos quarteirões (com bordas suaves)
const ruas = [];
for (const x of colunas) ruas.push(`<rect x="${x - larguraRua / 2}" y="-50" width="${larguraRua}" height="${A + 100}" fill="${COR.rua}"/>`);
for (const y of linhas) ruas.push(`<rect x="-50" y="${y - larguraRua / 2}" width="${L + 100}" height="${larguraRua}" fill="${COR.rua}"/>`);
// Avenida diagonal larga
ruas.push(`<path d="M-80 ${A * 0.95} L${L + 80} ${A * 0.18}" stroke="#CDBFA3" stroke-width="64"/>`);
ruas.push(`<path d="M-80 ${A * 0.95} L${L + 80} ${A * 0.18}" stroke="${COR.avenida}" stroke-width="54"/>`);
ruas.push(`<path d="M-80 ${A * 0.95} L${L + 80} ${A * 0.18}" stroke="#D9CDB6" stroke-width="2" stroke-dasharray="22 18"/>`);

// remove árvores que ficariam sobre a avenida diagonal
const naAvenida = ([x, y]) => {
  const y1 = A * 0.95, y2 = A * 0.18, x1 = -80, x2 = L + 80;
  const dist = Math.abs((y2 - y1) * x - (x2 - x1) * y + x2 * y1 - y2 * x1) / Math.hypot(y2 - y1, x2 - x1);
  return dist < 40;
};
for (let k = arvores.length - 1; k >= 0; k--) if (naAvenida(arvores[k])) arvores.splice(k, 1);

const copas = arvores
  .map(([x, y, r]) => `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(0)}" fill="${escolha(COR.arvores)}"/>`)
  .join('');
const sombrasCopas = arvores
  .map(([x, y, r]) => `<circle cx="${(x + r * 0.5).toFixed(0)}" cy="${(y + r * 0.5).toFixed(0)}" r="${r.toFixed(0)}"/>`)
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}">
<!-- Ilustração artística de bairro residencial. Não representa o traçado real das ruas. -->
${partes[0]}
<g>${partes.slice(1).filter((p) => p.includes('#CBBD9F') || p.includes(COR.parque)).join('')}</g>
<g fill="#6E5F48" opacity=".22">${sombra.join('')}</g>
<g>${partes.slice(1).filter((p) => !p.includes('#CBBD9F') && !p.includes(COR.parque)).join('')}</g>
<g>${ruas.join('')}</g>
<g fill="#4A4232" opacity=".2">${sombrasCopas}</g>
<g>${copas}</g>
</svg>
`;

mkdirSync(new URL('../public/imagens/aereo/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/imagens/aereo/cidade-ilustrada.svg', import.meta.url), svg);

// Contorno do quarteirão central (usado no destaque luminoso)
const ic = colunas.findIndex((x, i) => colunas[i + 1] > CX && x <= CX);
const jc = linhas.findIndex((y, j) => linhas[j + 1] > CY && y <= CY);
const destaque = {
  x: colunas[ic] + larguraRua / 2 - 6,
  y: linhas[jc] + larguraRua / 2 - 6,
  w: colunas[ic + 1] - colunas[ic] - larguraRua + 12,
  h: linhas[jc + 1] - linhas[jc] - larguraRua + 12,
};
writeFileSync(
  new URL('../src/templates/cena-aerea.dados.json', import.meta.url),
  JSON.stringify({ largura: L, altura: A, destaque }, null, 2)
);
console.log(`Cidade ilustrada gerada (${(svg.length / 1024).toFixed(0)} KB). Destaque:`, destaque);
