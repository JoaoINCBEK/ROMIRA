// Estilo do mapa vetorial nas cores da Romira.
// Dados: OpenStreetMap (ODbL) via OpenMapTiles/OpenFreeMap — gratuito, sem chave.
// Créditos obrigatórios são exibidos automaticamente pelo MapLibre.

const C = {
  fundo: '#e9e0cf',
  quarteirao: '#e2d7c2',
  verde: '#b7bd98',
  verdeEscuro: '#9ea67c',
  agua: '#9fbcb6',
  rua: '#fbf7ef',
  ruaBorda: '#d2c4a8',
  principal: '#f7e7c9',
  predio: '#d4c3a6',
  predioTopo: '#cbb796',
  texto: '#4a4a3a',
  halo: 'rgba(251,248,242,0.9)',
  destaque: '#f0c98d',
};

// Endereço do serviço de mapas. Só os testes automatizados trocam por um
// servidor local (window.ROMIRA_MAPA_BASE); o site publicado usa o OpenFreeMap.
export const BASE_MAPA = (typeof window !== 'undefined' && window.ROMIRA_MAPA_BASE) || 'https://tiles.openfreemap.org';

export function estiloMapa({ predios3d = true, nomesDaRua = [] } = {}) {
  const filtroRua = ['in', ['get', 'name'], ['literal', nomesDaRua]];
  const larguraRua = (base) => ['interpolate', ['exponential', 1.6], ['zoom'], 12, base * 0.4, 15, base * 2, 18, base * 9];
  // Largura por classe da via (a expressão de zoom precisa ficar no nível de cima)
  const larguraPorClasse = (principal, media, menor) => [
    'interpolate', ['exponential', 1.6], ['zoom'],
    ...[[12, 0.4], [15, 2], [18, 9]].flatMap(([z, k]) => [
      z,
      ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], principal * k, ['secondary', 'tertiary'], media * k, menor * k],
    ]),
  ];

  const camadas = [
    { id: 'fundo', type: 'background', paint: { 'background-color': C.fundo } },
    {
      id: 'uso-do-solo', type: 'fill', source: 'omt', 'source-layer': 'landuse',
      paint: { 'fill-color': C.quarteirao, 'fill-opacity': 0.7 },
    },
    {
      id: 'vegetacao', type: 'fill', source: 'omt', 'source-layer': 'landcover',
      filter: ['in', ['get', 'class'], ['literal', ['grass', 'wood', 'farmland', 'wetland']]],
      paint: { 'fill-color': ['match', ['get', 'class'], 'wood', C.verdeEscuro, C.verde], 'fill-opacity': 0.75 },
    },
    {
      id: 'parques', type: 'fill', source: 'omt', 'source-layer': 'park',
      paint: { 'fill-color': C.verde, 'fill-opacity': 0.8 },
    },
    { id: 'agua', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': C.agua } },
    {
      id: 'ruas-borda', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': C.ruaBorda,
        'line-width': larguraPorClasse(4.2, 3.2, 2.2),
      },
    },
    {
      id: 'ruas', type: 'line', source: 'omt', 'source-layer': 'transportation',
      filter: ['in', ['get', 'class'], ['literal', ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor', 'service']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': ['match', ['get', 'class'], ['motorway', 'trunk', 'primary'], C.principal, C.rua],
        'line-width': larguraPorClasse(3.4, 2.5, 1.6),
      },
    },
    // Destaque luminoso da rua da Romira (somente se existir no OpenStreetMap)
    {
      id: 'rua-romira-brilho', type: 'line', source: 'omt', 'source-layer': 'transportation_name',
      filter: filtroRua, layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': C.destaque, 'line-width': larguraRua(8), 'line-blur': 12, 'line-opacity': 0 },
    },
    {
      id: 'rua-romira', type: 'line', source: 'omt', 'source-layer': 'transportation_name',
      filter: filtroRua, layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#f6d9a8', 'line-width': larguraRua(2.2), 'line-opacity': 0 },
    },
  ];

  if (predios3d) {
    camadas.push({
      id: 'predios', type: 'fill-extrusion', source: 'omt', 'source-layer': 'building', minzoom: 14,
      paint: {
        'fill-extrusion-color': ['interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 4], 0, C.predio, 40, C.predioTopo],
        'fill-extrusion-height': ['coalesce', ['get', 'render_height'], 4],
        'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
        'fill-extrusion-opacity': 0.9,
      },
    });
  } else {
    camadas.push({
      id: 'predios', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14,
      paint: { 'fill-color': C.predio, 'fill-opacity': 0.9 },
    });
  }

  camadas.push(
    {
      id: 'nomes-ruas', type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: 15,
      layout: {
        'symbol-placement': 'line', 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'],
        'text-size': 11, 'text-letter-spacing': 0.04,
      },
      paint: { 'text-color': C.texto, 'text-halo-color': C.halo, 'text-halo-width': 1.4 },
    },
    {
      id: 'bairros', type: 'symbol', source: 'omt', 'source-layer': 'place',
      filter: ['in', ['get', 'class'], ['literal', ['suburb', 'neighbourhood', 'quarter', 'city']]],
      layout: {
        'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'],
        'text-size': ['match', ['get', 'class'], 'city', 16, 12], 'text-transform': 'uppercase', 'text-letter-spacing': 0.12,
      },
      paint: { 'text-color': '#5d5a48', 'text-halo-color': C.halo, 'text-halo-width': 1.4 },
    }
  );

  return {
    version: 8,
    sources: { omt: { type: 'vector', url: `${BASE_MAPA}/planet` } },
    glyphs: `${BASE_MAPA}/fonts/{fontstack}/{range}.pbf`,
    layers: camadas,
  };
}
