// Cena aérea ilustrada: imagem da cidade + camada com o contorno luminoso.
// As medidas vêm de scripts/gerar-cidade.mjs (npm run cidade).
import dados from './cena-aerea.dados.json' with { type: 'json' };

export function cenaAerea() {
  const { largura: L, altura: A, destaque: d } = dados;
  const origemX = (((d.x + d.w / 2) / L) * 100).toFixed(2);
  const origemY = (((d.y + d.h / 2) / A) * 100).toFixed(2);
  const perimetro = Math.round(2 * (d.w + d.h));
  return `<div class="aereo__tela" style="--alvo-x:${origemX}%;--alvo-y:${origemY}%;--perimetro:${perimetro}">
    <img class="aereo__cidade" src="/imagens/aereo/cidade-ilustrada.svg" alt="" width="${L}" height="${A}" loading="lazy" decoding="async">
    <svg class="aereo__sobreposicao" viewBox="0 0 ${L} ${A}" preserveAspectRatio="none">
      <defs>
        <filter id="brilho-contorno" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="7" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect class="aereo__area" x="${d.x.toFixed(1)}" y="${d.y.toFixed(1)}" width="${d.w.toFixed(1)}" height="${d.h.toFixed(1)}" rx="8"/>
      <rect class="aereo__contorno" x="${d.x.toFixed(1)}" y="${d.y.toFixed(1)}" width="${d.w.toFixed(1)}" height="${d.h.toFixed(1)}" rx="8" filter="url(#brilho-contorno)" pathLength="1000"/>
    </svg>
  </div>`;
}
