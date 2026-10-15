// Gera as ilustrações (SVG) usadas enquanto não há fotografias reais.
// São imagens ILUSTRATIVAS: não representam o imóvel da Romira.
// Uso: npm run ilustracoes
import { writeFileSync, mkdirSync } from 'node:fs';

const OUT = new URL('../public/imagens/ilustracoes/', import.meta.url);
mkdirSync(OUT, { recursive: true });

let semente = 7;
const rnd = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
const entre = (a, b) => a + rnd() * (b - a);
const f = (n) => Number(n.toFixed(1));

const P = {
  noite: '#1f2619',
  oliva: '#2e3824',
  oliva2: '#3f4a2f',
  oliva3: '#56613f',
  folha: '#4b5634',
  bege: '#efe5d3',
  areia: '#d9c6a5',
  bronze: '#b98a55',
  bronzeClaro: '#e2b98a',
  luz: '#ffd9a0',
  agua1: '#5f8f8a',
  agua2: '#2f5653',
  agua3: '#9cc3bb',
  pedra: '#cdbb9b',
  madeira: '#7a5434',
};

// ---------------------------------------------------------------------------
//  Componentes
// ---------------------------------------------------------------------------
const graos = (id = 'grao', opacidade = 0.09) => `
  <filter id="${id}" x="0" y="0" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 .15  0 0 0 0 .13  0 0 0 0 .08  0 0 0 ${opacidade} 0"/>
  </filter>`;

const brilho = (id, desvio = 18) => `
  <filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${desvio}"/></filter>`;

// Folha de palmeira (fronde) com folíolos, desenhada como silhueta
function fronde(x, y, angulo, comprimento, queda, cor, espessura = 1) {
  const rad = (angulo * Math.PI) / 180;
  const ex = x + Math.cos(rad) * comprimento;
  const ey = y + Math.sin(rad) * comprimento + queda;
  const cx = x + Math.cos(rad) * comprimento * 0.55;
  const cy = y + Math.sin(rad) * comprimento * 0.55 - queda * 0.35;
  const ponto = (t) => [
    (1 - t) ** 2 * x + 2 * (1 - t) * t * cx + t ** 2 * ex,
    (1 - t) ** 2 * y + 2 * (1 - t) * t * cy + t ** 2 * ey,
  ];
  let folios = '';
  const n = Math.round(comprimento / 7);
  for (let i = 2; i < n; i++) {
    const t = i / n;
    const [px, py] = ponto(t);
    const [qx, qy] = ponto(Math.min(1, t + 0.02));
    const tang = Math.atan2(qy - py, qx - px);
    const tam = comprimento * 0.3 * Math.sin(Math.PI * Math.min(1, t * 1.15)) * espessura + 4;
    for (const lado of [-1, 1]) {
      const a = tang + lado * 1.05 + 0.35; // folíolos pendem para baixo
      const lx = px + Math.cos(a) * tam;
      const ly = py + Math.sin(a) * tam + tam * 0.35;
      folios += `M${f(px)} ${f(py)}Q${f((px + lx) / 2)} ${f((py + ly) / 2 - tam * 0.12)} ${f(lx)} ${f(ly)}`;
    }
  }
  return `<path d="M${f(x)} ${f(y)}Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke="${cor}" stroke-width="${f(3 * espessura)}" fill="none" stroke-linecap="round"/>
    <path d="${folios}" stroke="${cor}" stroke-width="${f(2.6 * espessura)}" fill="none" stroke-linecap="round"/>`;
}

function palmeira(x, base, altura, inclinacao, cor, escala = 1) {
  const topoX = x + inclinacao;
  const topoY = base - altura;
  const largura = 14 * escala;
  const tronco = `<path d="M${f(x - largura / 2)} ${f(base)}Q${f(x + inclinacao * 0.25)} ${f(base - altura * 0.55)} ${f(topoX - largura * 0.28)} ${f(topoY)}L${f(topoX + largura * 0.28)} ${f(topoY)}Q${f(x + inclinacao * 0.25 + largura)} ${f(base - altura * 0.55)} ${f(x + largura / 2)} ${f(base)}Z" fill="${cor}"/>`;
  let aneis = '';
  for (let i = 1; i < 18; i++) {
    const t = i / 18;
    const ax = x + (topoX - x) * t * t * 0.6 + (topoX - x) * t * 0.4;
    const ay = base - altura * t;
    const w = largura * (1 - t * 0.45) * 0.5;
    aneis += `M${f(ax - w)} ${f(ay)}l${f(w * 2)} ${f(-2 * escala)}`;
  }
  const angulos = [-172, -150, -128, -100, -70, -45, -22, -2, 18, 160, 196];
  const frondes = angulos
    .map((a) => {
      const comp = entre(120, 175) * escala;
      const queda = (Math.abs(Math.cos((a * Math.PI) / 180)) * 60 + 20) * escala;
      return fronde(topoX, topoY, a, comp, queda, cor, escala);
    })
    .join('');
  return `<g>${tronco}<path d="${aneis}" stroke="rgba(0,0,0,.18)" stroke-width="${f(1.4 * escala)}"/>${frondes}<circle cx="${f(topoX)}" cy="${f(topoY)}" r="${f(9 * escala)}" fill="${cor}"/></g>`;
}

// Folha tropical larga (primeiro plano)
function folhaLarga(x, y, angulo, comp, larg, cor, nervura = 'rgba(255,255,255,.08)') {
  let fendas = '';
  for (let i = 1; i < 9; i++) {
    const t = i / 9;
    fendas += `M${f(comp * t)} 0L${f(comp * t + larg * 0.25)} ${f(-larg * 0.5 * Math.sin(Math.PI * t) - 4)}M${f(comp * t)} 0L${f(comp * t + larg * 0.25)} ${f(larg * 0.5 * Math.sin(Math.PI * t) + 4)}`;
  }
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${angulo})">
    <path d="M0 0C${f(comp * 0.25)} ${f(-larg)} ${f(comp * 0.75)} ${f(-larg * 0.9)} ${f(comp)} 0C${f(comp * 0.75)} ${f(larg * 0.9)} ${f(comp * 0.25)} ${f(larg)} 0 0Z" fill="${cor}"/>
    <path d="M0 0L${f(comp)} 0" stroke="${nervura}" stroke-width="2"/>
    <path d="${fendas}" stroke="${nervura}" stroke-width="1.2"/>
  </g>`;
}

function cadeira(x, y, e, cor) {
  return `<g transform="translate(${x} ${y}) scale(${e})" fill="${cor}">
    <rect x="0" y="-46" width="5" height="62" rx="2"/><rect x="0" y="-6" width="34" height="5" rx="2"/>
    <rect x="29" y="-4" width="5" height="20" rx="2"/></g>`;
}

function mesa(x, y, e, cor) {
  return `<g transform="translate(${x} ${y}) scale(${e})" fill="${cor}">
    <rect x="-70" y="-6" width="140" height="7" rx="3"/><rect x="-60" y="0" width="5" height="40"/><rect x="55" y="0" width="5" height="40"/></g>`;
}

function luzes(x1, y1, x2, y2, quantidade, flecha, idBrilho) {
  let fio = `<path d="M${x1} ${y1}Q${(x1 + x2) / 2} ${(y1 + y2) / 2 + flecha} ${x2} ${y2}" stroke="rgba(40,30,20,.55)" stroke-width="1.5" fill="none"/>`;
  let pontos = '';
  let halos = '';
  for (let i = 1; i < quantidade; i++) {
    const t = i / quantidade;
    const cx = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * ((x1 + x2) / 2) + t ** 2 * x2;
    const cy = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + flecha) + t ** 2 * y2;
    pontos += `<circle cx="${f(cx)}" cy="${f(cy + 6)}" r="3.4" fill="#fff1d6"/>`;
    halos += `<circle cx="${f(cx)}" cy="${f(cy + 6)}" r="14" fill="${P.luz}" opacity=".55"/>`;
  }
  return `${fio}<g filter="url(#${idBrilho})">${halos}</g>${pontos}`;
}

function ondas(x, y, l, a, quantidade, cor, opacidade = 0.35) {
  let d = '';
  for (let i = 0; i < quantidade; i++) {
    const yy = y + (a * i) / quantidade;
    const x0 = x + entre(0, l * 0.6);
    const comp = entre(40, 140) * (0.5 + i / quantidade);
    d += `M${f(x0)} ${f(yy)}q${f(comp / 4)} -4 ${f(comp / 2)} 0t${f(comp / 2)} 0`;
  }
  return `<path d="${d}" stroke="${cor}" stroke-width="2" fill="none" opacity="${opacidade}" stroke-linecap="round"/>`;
}

const svg = (l, a, conteudo, titulo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${a}" width="${l}" height="${a}" role="img" aria-label="${titulo}">
<title>${titulo} (ilustração)</title>
${conteudo}
</svg>
`;

// ---------------------------------------------------------------------------
//  Cenas
// ---------------------------------------------------------------------------
function hero() {
  const L = 1920, A = 1080;
  return svg(L, A, `
<defs>
  <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a3324"/><stop offset=".38" stop-color="#6d6a4c"/>
    <stop offset=".62" stop-color="#d49a62"/><stop offset=".78" stop-color="#f0c48f"/>
  </linearGradient>
  <radialGradient id="sol" cx=".72" cy=".5" r=".45">
    <stop offset="0" stop-color="#ffe2b0" stop-opacity=".95"/><stop offset=".35" stop-color="#f6bd7f" stop-opacity=".45"/><stop offset="1" stop-color="#f6bd7f" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d9a774"/><stop offset=".18" stop-color="${P.agua1}"/><stop offset="1" stop-color="${P.agua2}"/>
  </linearGradient>
  <linearGradient id="deck" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7ad86"/><stop offset="1" stop-color="#8d7255"/></linearGradient>
  <linearGradient id="interior" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8f"/><stop offset="1" stop-color="#c98a52"/></linearGradient>
  ${brilho('b1', 10)}${brilho('b2', 40)}${graos('grao', 0.1)}
</defs>
<rect width="${L}" height="${A}" fill="url(#ceu)"/>
<rect width="${L}" height="${A}" fill="url(#sol)"/>
<circle cx="1390" cy="560" r="64" fill="#ffe7bf" opacity=".9"/>
<!-- vegetação ao fundo -->
<path d="M0 640 C120 600 220 610 330 590 S560 600 700 575 S980 590 1100 560 S1400 585 1560 560 S1800 580 1920 565 V760 H0Z" fill="#4c5737" opacity=".85"/>
<path d="M0 690 C160 650 300 670 480 640 S820 660 980 630 S1300 650 1500 625 S1800 650 1920 630 V780 H0Z" fill="#3a4429"/>
${palmeira(560, 700, 330, -30, '#33402a', 0.85)}
${palmeira(1640, 690, 380, 40, '#2f3a26', 0.95)}
${palmeira(1780, 700, 300, -20, '#36422b', 0.75)}
<!-- área coberta -->
<g>
  <rect x="1020" y="470" width="760" height="34" fill="#efe1c8"/>
  <rect x="1020" y="500" width="760" height="10" fill="#bda27d"/>
  <rect x="1060" y="510" width="680" height="210" fill="url(#interior)" opacity=".92"/>
  <rect x="1060" y="510" width="680" height="210" fill="#3a2a1a" opacity=".18"/>
  <rect x="1040" y="504" width="22" height="226" fill="#3b3a2c"/><rect x="1300" y="504" width="18" height="226" fill="#3b3a2c"/>
  <rect x="1540" y="504" width="18" height="226" fill="#3b3a2c"/><rect x="1752" y="504" width="22" height="226" fill="#3b3a2c"/>
  <rect x="1580" y="560" width="120" height="160" fill="#8b5b38"/><rect x="1600" y="590" width="80" height="50" rx="40" fill="#5c3a22"/>
  <circle cx="1640" cy="616" r="10" fill="#ffb562" filter="url(#b1)"/>
  ${mesa(1250, 650, 1.1, '#3b2b1d')}${cadeira(1150, 660, 1, '#3b2b1d')}${cadeira(1335, 660, 1, '#3b2b1d')}
  ${mesa(1450, 655, 0.9, '#3b2b1d')}${cadeira(1390, 665, 0.85, '#3b2b1d')}
  ${luzes(1060, 520, 1740, 520, 18, 34, 'b1')}
</g>
<!-- deck -->
<path d="M0 720 H1920 V1080 H0Z" fill="url(#deck)"/>
<path d="M0 724 H1920" stroke="#e6d2b0" stroke-width="3"/>
<!-- piscina -->
<path d="M120 780 L1820 780 L1920 960 L1920 1080 L0 1080 L0 960Z" fill="url(#agua)"/>
<path d="M120 780 L1820 780" stroke="#efe1c8" stroke-width="10"/>
<g opacity=".55" filter="url(#b1)">
  <rect x="1060" y="790" width="680" height="70" fill="#ffcf8f" opacity=".55"/>
  <ellipse cx="1390" cy="800" rx="140" ry="16" fill="#ffe2b0"/>
</g>
${ondas(160, 800, 1700, 260, 46, '#f5dcb6', 0.35)}
${ondas(200, 860, 1600, 200, 30, '#ffffff', 0.12)}
<!-- espreguiçadeira -->
<g transform="translate(1560 742)">
  <path d="M0 26 L170 26 L230 -34 L246 -26 L186 34 L0 34Z" fill="#e6d5b8"/>
  <rect x="10" y="34" width="8" height="20" fill="#4a3a28"/><rect x="160" y="34" width="8" height="20" fill="#4a3a28"/>
  <ellipse cx="70" cy="18" rx="46" ry="12" fill="#c9a26e"/><ellipse cx="70" cy="12" rx="26" ry="10" fill="#b48a55"/>
</g>
<!-- primeiro plano -->
${palmeira(120, 1100, 760, 70, '#1c2316', 1.25)}
${folhaLarga(1980, 1090, -150, 420, 90, '#1f2818')}
${folhaLarga(1960, 980, -170, 360, 70, '#28321e')}
${folhaLarga(-40, 1060, -25, 360, 80, '#1c2316')}
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Área de lazer com piscina e palmeiras ao entardecer');
}

function areaCoberta() {
  const L = 1200, A = 1500;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e7d2"/><stop offset="1" stop-color="#e0cba8"/></linearGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.agua3}"/><stop offset="1" stop-color="${P.agua1}"/></linearGradient>
  ${brilho('b1', 8)}${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
<path d="M0 620 C200 560 360 600 520 560 S860 590 1200 540 V900 H0Z" fill="#a9b08f"/>
${palmeira(980, 900, 520, 30, '#6b7651', 1)}
${palmeira(160, 920, 460, -40, '#7b8660', 0.85)}
<rect x="0" y="420" width="${L}" height="60" fill="#f8f1e4"/>
<rect x="0" y="478" width="${L}" height="14" fill="#cdb894"/>
<rect x="60" y="490" width="26" height="560" fill="#5a5a45"/><rect x="1110" y="490" width="26" height="560" fill="#5a5a45"/>
${luzes(80, 500, 1120, 500, 16, 46, 'b1')}
<rect x="0" y="1040" width="${L}" height="460" fill="#cbb38d"/>
<path d="M0 1040 H1200" stroke="#f4e8d4" stroke-width="6"/>
${mesa(600, 960, 2.4, '#5b4129')}
${cadeira(330, 980, 2, '#6d4e33')}${cadeira(800, 980, 2, '#6d4e33')}
<g transform="translate(860 980) scale(-2 2)" fill="#6d4e33"><rect x="0" y="-46" width="5" height="62" rx="2"/><rect x="0" y="-6" width="34" height="5" rx="2"/><rect x="29" y="-4" width="5" height="20" rx="2"/></g>
<rect x="470" y="905" width="40" height="40" rx="6" fill="#f3e3c8"/><rect x="560" y="890" width="22" height="55" rx="8" fill="#a06d3a"/><circle cx="690" cy="930" r="18" fill="#e9d3ae"/>
<path d="M0 1230 H1200 V1500 H0Z" fill="url(#agua)"/>
<path d="M0 1230 H1200" stroke="#f6eddc" stroke-width="14"/>
${ondas(30, 1260, 1140, 220, 26, '#ffffff', 0.35)}
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Área coberta com mesa e cadeiras ao lado da piscina');
}

function churrasqueira() {
  const L = 1200, A = 1200;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f4a2f"/><stop offset="1" stop-color="#232a1c"/></linearGradient>
  <radialGradient id="fogo" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#ffcf7a"/><stop offset=".5" stop-color="#e2803e"/><stop offset="1" stop-color="#e2803e" stop-opacity="0"/></radialGradient>
  ${brilho('b1', 30)}${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
${folhaLarga(-60, 240, 10, 480, 110, '#2e3824')}
${folhaLarga(1260, 160, 170, 520, 120, '#34402a')}
<rect x="300" y="250" width="600" height="780" fill="#a5714a"/>
<g stroke="#8a5a37" stroke-width="4">${Array.from({ length: 19 }, (_, i) => `<path d="M300 ${290 + i * 40} H900"/>`).join('')}
${Array.from({ length: 19 }, (_, i) => `<path d="M${(i % 2 ? 360 : 420) + 0} ${250 + i * 40} v40 M${(i % 2 ? 540 : 600)} ${250 + i * 40} v40 M${(i % 2 ? 720 : 780)} ${250 + i * 40} v40"/>`).join('')}</g>
<path d="M360 250 L600 90 L840 250Z" fill="#8a5a37"/>
<rect x="390" y="560" width="420" height="250" rx="10" fill="#2a1c12"/>
<ellipse cx="600" cy="760" rx="220" ry="90" fill="url(#fogo)" filter="url(#b1)"/>
<g fill="#ffb15e">${Array.from({ length: 14 }, (_, i) => `<circle cx="${430 + i * 26}" cy="${770 + (i % 3) * 8}" r="${6 + (i % 4)}"/>`).join('')}</g>
<g stroke="#c9b7a0" stroke-width="5">${Array.from({ length: 12 }, (_, i) => `<path d="M${410 + i * 34} 690 v40"/>`).join('')}<path d="M400 690 H800"/></g>
<rect x="250" y="1010" width="700" height="40" fill="#e8d7b9"/>
<rect x="0" y="1050" width="${L}" height="150" fill="#1a2014"/>
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Churrasqueira de tijolos com brasa acesa');
}

function aniversario() {
  const L = 1200, A = 1500;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5634"/><stop offset="1" stop-color="#2a3220"/></linearGradient>
  ${brilho('b1', 22)}${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
${luzes(-20, 160, 1220, 200, 22, 120, 'b1')}
${folhaLarga(1240, 520, 200, 460, 110, '#3a4429')}
${folhaLarga(-40, 600, -15, 420, 100, '#3a4429')}
<rect x="0" y="1020" width="${L}" height="480" fill="#d9c3a0"/>
<path d="M0 1020 H1200" stroke="#f1e3c8" stroke-width="8"/>
<ellipse cx="600" cy="1030" rx="300" ry="40" fill="#bfa47c"/>
<rect x="590" y="960" width="20" height="70" fill="#d6b88f"/>
<ellipse cx="600" cy="960" rx="250" ry="34" fill="#f3e7d2"/>
<rect x="380" y="700" width="440" height="250" rx="20" fill="#f5ead6"/>
<rect x="380" y="770" width="440" height="22" fill="#d9a46e"/>
<path d="M380 720 q36 40 72 0 t72 0 t72 0 t72 0 t72 0 t72 0 v-20 H380Z" fill="#e9c897"/>
<rect x="440" y="520" width="320" height="190" rx="18" fill="#efe1c8"/>
<rect x="440" y="580" width="320" height="18" fill="#c99a63"/>
${[510, 600, 690].map((x) => `<rect x="${x - 7}" y="440" width="14" height="80" rx="5" fill="#f3d9b2"/><ellipse cx="${x}" cy="424" rx="10" ry="18" fill="#ffcf7a"/><ellipse cx="${x}" cy="424" rx="34" ry="44" fill="#ffd9a0" opacity=".55" filter="url(#b1)"/>`).join('')}
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Bolo de aniversário com velas acesas sobre a mesa');
}

function familia() {
  const L = 1200, A = 1500;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9dcc3"/><stop offset="1" stop-color="#cdb38c"/></linearGradient>
  ${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
${palmeira(1040, 760, 520, -20, '#7b8660', 0.95)}
${palmeira(140, 780, 420, 30, '#8b9570', 0.8)}
<path d="M0 640 C220 600 420 640 600 610 S980 640 1200 600 V760 H0Z" fill="#a9b08f"/>
<!-- mesa vista de cima, em perspectiva -->
<path d="M150 820 H1050 L1180 1500 H20Z" fill="#efe3cc"/>
<path d="M150 820 H1050" stroke="#d8c3a0" stroke-width="6"/>
${[[330, 930], [870, 930], [260, 1180], [940, 1180], [200, 1420], [1000, 1420]]
  .map(([x, y], i) => {
    const e = 0.75 + (y - 900) / 1300;
    return `<g transform="translate(${x} ${y}) scale(${f(e)})"><ellipse rx="92" ry="44" fill="#fbf6ec"/><ellipse rx="62" ry="28" fill="#e7d5b6"/><ellipse rx="${i % 2 ? 40 : 34}" ry="16" fill="${i % 3 ? '#a8b07f' : '#c78f58'}"/>
    <rect x="${i % 2 ? -150 : 120}" y="-38" width="12" height="76" rx="6" fill="#c9b49a"/></g>`;
  })
  .join('')}
<g transform="translate(600 1150)"><ellipse rx="170" ry="70" fill="#f8f1e4"/><ellipse rx="140" ry="54" fill="#c4874f"/><ellipse cx="-40" cy="-6" rx="40" ry="18" fill="#a9653a"/><ellipse cx="40" cy="10" rx="44" ry="18" fill="#b57442"/><ellipse cx="10" cy="-24" rx="34" ry="14" fill="#9c5b33"/></g>
<g transform="translate(600 920)"><ellipse rx="70" ry="30" fill="#f8f1e4"/><circle cx="-18" cy="-6" r="14" fill="#7f8b55"/><circle cx="16" cy="-2" r="16" fill="#97a26b"/><circle cx="0" cy="-16" r="10" fill="#d97b4f"/></g>
${[[450, 1010], [760, 1010], [380, 1290], [830, 1290]].map(([x, y]) => `<g transform="translate(${x} ${y})"><rect x="-14" y="-60" width="28" height="70" rx="10" fill="#f6eedf" opacity=".85"/><rect x="-14" y="-30" width="28" height="40" rx="8" fill="#e2a65f" opacity=".85"/></g>`).join('')}
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Mesa posta para um almoço em família ao ar livre');
}

function amigos() {
  const L = 1200, A = 1500;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0a46b"/><stop offset=".55" stop-color="#f1c894"/><stop offset="1" stop-color="#f6dfba"/></linearGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8b886"/><stop offset=".3" stop-color="${P.agua1}"/><stop offset="1" stop-color="${P.agua2}"/></linearGradient>
  ${brilho('b1', 16)}${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
<circle cx="820" cy="560" r="90" fill="#fff0d2" opacity=".85"/>
<path d="M0 700 C200 650 360 690 560 660 S900 690 1200 650 V820 H0Z" fill="#56613f"/>
${palmeira(260, 800, 560, 40, '#3f4a2f', 1)}
${palmeira(980, 790, 470, -30, '#4b5634', 0.85)}
<rect x="0" y="800" width="${L}" height="700" fill="url(#agua)"/>
<path d="M0 800 H1200" stroke="#f3e3c8" stroke-width="10"/>
${ondas(20, 830, 1160, 640, 40, '#fff3dc', 0.35)}
<!-- borda de pedra em primeiro plano -->
<path d="M0 1180 H1200 V1500 H0Z" fill="#d8c4a2"/><path d="M0 1180 H1200" stroke="#f3e6cf" stroke-width="10"/>
<path d="M0 1196 H1200" stroke="#b9a07c" stroke-width="3" opacity=".6"/>
<!-- copos brindando -->
<g transform="translate(600 1060) rotate(-8)">
  <path d="M-170 -260 L-80 -260 L-92 -20 Q-125 6 -158 -20Z" fill="#fff8ec" opacity=".55"/>
  <path d="M-164 -150 L-86 -150 L-92 -20 Q-125 6 -158 -20Z" fill="#e7a64f" opacity=".95"/>
  <rect x="-130" y="-4" width="10" height="120" fill="#fff8ec" opacity=".7"/><ellipse cx="-125" cy="120" rx="46" ry="10" fill="#fff8ec" opacity=".7"/>
</g>
<g transform="translate(640 1060) rotate(10)">
  <path d="M80 -260 L170 -260 L158 -20 Q125 6 92 -20Z" fill="#fff8ec" opacity=".55"/>
  <path d="M86 -170 L164 -170 L158 -20 Q125 6 92 -20Z" fill="#c9693f" opacity=".9"/>
  <rect x="120" y="-4" width="10" height="120" fill="#fff8ec" opacity=".7"/><ellipse cx="125" cy="120" rx="46" ry="10" fill="#fff8ec" opacity=".7"/>
</g>
<circle cx="610" cy="800" r="60" fill="#fff4dc" opacity=".8" filter="url(#b1)"/>
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Dois copos brindando à beira da piscina ao pôr do sol');
}

function bronze() {
  const L = 1500, A = 1200;
  return svg(L, A, `
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3dcb8"/><stop offset="1" stop-color="#e4c497"/></linearGradient>
  <radialGradient id="sol" cx=".78" cy=".22" r=".5"><stop offset="0" stop-color="#fff4dc"/><stop offset=".3" stop-color="#ffe0ad" stop-opacity=".7"/><stop offset="1" stop-color="#ffe0ad" stop-opacity="0"/></radialGradient>
  ${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#fundo)"/>
<rect width="${L}" height="${A}" fill="url(#sol)"/>
<circle cx="1170" cy="260" r="110" fill="#fff6e3"/>
<!-- sombra das folhas -->
<g opacity=".16">${folhaLarga(-60, 140, 20, 620, 120, '#3f4a2f', 'transparent')}${folhaLarga(-80, 360, 8, 520, 100, '#3f4a2f', 'transparent')}</g>
<rect x="0" y="760" width="${L}" height="440" fill="#d7b98f"/>
<path d="M0 760 H1500" stroke="#f3e3c8" stroke-width="6"/>
<!-- espreguiçadeira -->
<g transform="translate(330 760)">
  <path d="M0 40 L560 40 L760 -170 L800 -150 L610 70 L0 70Z" fill="#f6ecdb"/>
  <path d="M40 40 L560 40 L740 -150" stroke="#e1cfb0" stroke-width="6" fill="none"/>
  <rect x="30" y="70" width="18" height="70" fill="#7a5a3a"/><rect x="540" y="70" width="18" height="70" fill="#7a5a3a"/>
  <!-- toalha dobrada -->
  <path d="M120 10 H420 V40 H120Z" fill="#b98a55"/><path d="M120 10 H420 V20 H120Z" fill="#d1a473"/>
  <path d="M150 10 v30 M390 10 v30" stroke="#f3e3c8" stroke-width="4"/>
</g>
<!-- chapéu -->
<g transform="translate(1250 900)">
  <ellipse cx="0" cy="0" rx="190" ry="44" fill="#c99a63"/><ellipse cx="0" cy="-6" rx="150" ry="30" fill="#d9b07a"/>
  <path d="M-90 -6 C-90 -110 90 -110 90 -6Z" fill="#c99a63"/><path d="M-88 -30 C-40 -20 40 -20 88 -30 L90 -6 C40 2 -40 2 -90 -6Z" fill="#5c4a35"/>
</g>
<!-- óculos de sol e protetor -->
<g transform="translate(1030 1010)"><rect x="-30" y="-120" width="60" height="140" rx="16" fill="#f3e3c8"/><rect x="-18" y="-140" width="36" height="26" rx="6" fill="#a06d3a"/></g>
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Espreguiçadeira com toalha e chapéu sob o sol');
}

function galeriaPiscina() {
  const L = 1000, A = 1500;
  return svg(L, A, `
<defs>
  <linearGradient id="agua" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.agua3}"/><stop offset="1" stop-color="${P.agua1}"/></linearGradient>
  ${graos()}
</defs>
<rect width="${L}" height="${A}" fill="#d9c6a5"/>
<g stroke="#ccb592" stroke-width="3">${Array.from({ length: 30 }, (_, i) => `<path d="M0 ${i * 52} H${L}"/>`).join('')}</g>
<rect x="170" y="220" width="660" height="1060" rx="24" fill="#f4ead8"/>
<rect x="200" y="250" width="600" height="1000" rx="14" fill="url(#agua)"/>
${ondas(220, 290, 560, 920, 44, '#ffffff', 0.4)}
${ondas(220, 300, 560, 920, 30, '#2f5653', 0.18)}
<g transform="translate(720 270)" stroke="#f8f1e4" stroke-width="10" fill="none" stroke-linecap="round"><path d="M0 0 v140 M44 0 v140 M0 40 h44 M0 90 h44"/></g>
<!-- sombras de palmeira -->
<g opacity=".22">${palmeira(980, 1500, 500, -200, '#1f2619', 1.2)}</g>
${folhaLarga(1060, 120, 160, 420, 100, '#4b5634')}
${folhaLarga(-60, 1450, -30, 380, 90, '#56613f')}
<g transform="translate(70 760)"><rect x="0" y="0" width="90" height="230" rx="10" fill="#f3e9d8"/><rect x="0" y="0" width="90" height="70" rx="10" fill="#e6d5b8"/></g>
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Piscina vista de cima, com sombras de palmeiras');
}

function galeriaEntardecer() {
  const L = 1800, A = 900;
  return svg(L, A, `
<defs>
  <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f4a2f"/><stop offset=".45" stop-color="#b9875a"/><stop offset=".75" stop-color="#f3c88f"/><stop offset="1" stop-color="#f7dcb4"/></linearGradient>
  ${graos()}
</defs>
<rect width="${L}" height="${A}" fill="url(#ceu)"/>
<circle cx="1180" cy="640" r="120" fill="#fff0cf" opacity=".9"/>
<path d="M0 700 C300 650 520 690 800 660 S1300 690 1800 650 V900 H0Z" fill="#2e3824"/>
${palmeira(300, 760, 560, 40, '#1f2619', 1.05)}
${palmeira(520, 760, 430, -30, '#232b1b', 0.85)}
${palmeira(1450, 760, 600, -50, '#1f2619', 1.1)}
${palmeira(1650, 760, 420, 20, '#232b1b', 0.8)}
<rect x="0" y="780" width="${L}" height="120" fill="#1c2216"/>
<rect width="${L}" height="${A}" filter="url(#grao)"/>
`, 'Silhuetas de palmeiras ao entardecer');
}

const cenas = {
  'hero-piscina.svg': hero,
  'espaco-area-coberta.svg': areaCoberta,
  'espaco-churrasqueira.svg': churrasqueira,
  'ocasiao-aniversario.svg': aniversario,
  'ocasiao-familia.svg': familia,
  'ocasiao-amigos.svg': amigos,
  'bronzeamento.svg': bronze,
  'galeria-piscina.svg': galeriaPiscina,
  'galeria-entardecer.svg': galeriaEntardecer,
};
for (const [nome, gerar] of Object.entries(cenas)) {
  semente = 7;
  writeFileSync(new URL(nome, OUT), gerar());
}
console.log('Ilustrações geradas:', Object.keys(cenas).join(', '));
