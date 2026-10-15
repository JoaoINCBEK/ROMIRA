// Mapa vetorial real com sobrevoo (carregado sob demanda).
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { estiloMapa, BASE_MAPA } from './estilo-mapa.js';

const TEMPO_MAXIMO_MS = 12000;

// Polígono circular (raio em metros) para a área aproximada
function circulo([lng, lat], raio, passos = 64) {
  const coords = [];
  const dLat = raio / 111320;
  const dLng = raio / (111320 * Math.cos((lat * Math.PI) / 180));
  for (let i = 0; i <= passos; i++) {
    const a = (i / passos) * 2 * Math.PI;
    coords.push([lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [coords] }, properties: {} };
}

// Ponto da geometria (linhas) mais próximo de uma referência
function pontoMaisProximo(features, [lng, lat]) {
  let melhor = null;
  let menor = Infinity;
  for (const f of features) {
    const g = f.geometry;
    const linhas = g.type === 'LineString' ? [g.coordinates] : g.type === 'MultiLineString' ? g.coordinates : [];
    for (const linha of linhas) {
      for (const [x, y] of linha) {
        const d = (x - lng) ** 2 + (y - lat) ** 2;
        if (d < menor) { menor = d; melhor = [x, y]; }
      }
    }
  }
  return melhor;
}

export function criarMapa(container, { localizacao, movel, reduzido, aoPosicionarMarcador, aoEncontrarRua }) {
  const alvo = [localizacao.longitude, localizacao.latitude];
  const inicio = {
    center: [localizacao.inicio.longitude, localizacao.inicio.latitude],
    zoom: localizacao.inicio.zoom,
    pitch: 20,
    bearing: -28,
  };
  const final = {
    center: alvo,
    zoom: movel ? 15.4 : 16,
    pitch: movel ? 48 : 60,
    bearing: 16,
  };

  const mapa = new maplibregl.Map({
    container,
    style: estiloMapa({ predios3d: !movel, nomesDaRua: localizacao.nomesDaRuaNoMapa }),
    ...(reduzido ? final : inicio),
    interactive: false, // não captura a rolagem da página nem toques
    attributionControl: false,
    pixelRatio: Math.min(window.devicePixelRatio || 1, movel ? 1.5 : 2),
    fadeDuration: 0,
    maxPitch: 70,
  });
  mapa.addControl(
    new maplibregl.AttributionControl({
      compact: true,
      customAttribution:
        '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">© OpenMapTiles</a> Dados <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© colaboradores do OpenStreetMap</a>',
    }),
    'bottom-left'
  );

  let pontoMarcador = alvo;
  const atualizarMarcador = () => {
    const p = mapa.project(pontoMarcador);
    aoPosicionarMarcador(p.x, p.y);
  };
  mapa.on('render', atualizarMarcador);

  function destacarRegiao() {
    const raio = localizacao.verificada ? 35 : 260;
    if (!mapa.getSource('area')) {
      mapa.addSource('area', { type: 'geojson', data: circulo(alvo, raio) });
      mapa.addLayer({ id: 'area-preenchimento', type: 'fill', source: 'area', paint: { 'fill-color': '#f0c98d', 'fill-opacity': 0 } });
      mapa.addLayer({
        id: 'area-contorno', type: 'line', source: 'area',
        paint: { 'line-color': '#f3cf98', 'line-width': 3, 'line-blur': 2, 'line-opacity': 0 },
      });
    }
    const transicao = { duration: reduzido ? 0 : 1200 };
    for (const [camada, prop, valor] of [
      ['area-preenchimento', 'fill-opacity', 0.22],
      ['area-contorno', 'line-opacity', 0.95],
      ['rua-romira', 'line-opacity', 0.95],
      ['rua-romira-brilho', 'line-opacity', 0.95],
    ]) {
      mapa.setPaintProperty(camada, `${prop}-transition`, transicao);
      mapa.setPaintProperty(camada, prop, valor);
    }
  }

  function localizarRua() {
    const ruas = mapa.querySourceFeatures('omt', {
      sourceLayer: 'transportation_name',
      filter: ['in', ['get', 'name'], ['literal', localizacao.nomesDaRuaNoMapa]],
    });
    if (!localizacao.verificada) {
      const ponto = ruas.length ? pontoMaisProximo(ruas, alvo) : null;
      if (ponto) pontoMarcador = ponto;
      aoEncontrarRua?.(!!ponto);
    }
    atualizarMarcador();
  }

  function voar(aoChegar = () => {}) {
    mapa.stop();
    if (reduzido) {
      mapa.jumpTo(final);
      destacarRegiao();
      mapa.once('idle', localizarRua);
      aoChegar();
      return;
    }
    mapa.jumpTo(inicio);
    mapa.flyTo({ ...final, duration: movel ? 5200 : 7000, curve: 1.25, essential: true });
    mapa.once('moveend', () => {
      aoChegar();
      destacarRegiao();
      mapa.once('idle', localizarRua);
    });
  }

  return new Promise((resolve, reject) => {
    const desistir = (erro) => {
      clearTimeout(tempo);
      try { mapa.remove(); } catch { /* o mapa pode ainda não ter terminado de iniciar */ }
      reject(erro);
    };
    const tempo = setTimeout(() => desistir(new Error('tempo esgotado ao carregar o mapa')), TEMPO_MAXIMO_MS);
    mapa.once('load', () => {
      clearTimeout(tempo);
      resolve({ mapa, voar });
    });
    mapa.on('error', (e) => {
      // Antes do carregamento, erros de estilo ou da descrição dos dados (TileJSON)
      // impedem o mapa de funcionar; erros de um bloco isolado do mapa, não.
      const descricao = `${e?.error?.message || ''} ${e?.error?.url || ''}`;
      if (!mapa.loaded() && (descricao.includes(`${BASE_MAPA}/planet`) || (!e.sourceId && !e.tile))) desistir(e.error || new Error('erro no mapa'));
    });
  });
}
