// Servidor de mapa FALSO para testes: simula o OpenFreeMap com um bairro
// fictício e uma "Rua Francisco Vilela", permitindo testar o sobrevoo sem
// internet. Nada disto vai para o site publicado.
import GeoJSONVT from 'geojson-vt';
import vtpbf from 'vt-pbf';
import { createServer } from 'node:http';
import { localizacao } from '../src/content/site.js';

const { latitude: lat, longitude: lng } = localizacao;
const linha = (coords, props) => ({ type: 'Feature', properties: props, geometry: { type: 'LineString', coordinates: coords } });
const d = 0.004;
const ruas = [];
for (let i = -5; i <= 5; i++) {
  ruas.push(linha([[lng - d * 2, lat + i * d * 0.4], [lng + d * 2, lat + i * d * 0.4]], { class: 'minor' }));
  ruas.push(linha([[lng + i * d * 0.4, lat - d * 2], [lng + i * d * 0.4, lat + d * 2]], { class: 'minor' }));
}
// rua de destaque, um pouco deslocada da coordenada aproximada
const ruaRomira = linha([[lng - 0.002, lat + 0.0006], [lng + 0.002, lat + 0.0009]], { name: 'Rua Francisco Vilela', class: 'minor' });

const camadas = {
  transportation: new GeoJSONVT({ type: 'FeatureCollection', features: [...ruas, ruaRomira] }, { maxZoom: 14, indexMaxZoom: 0 }),
  transportation_name: new GeoJSONVT({ type: 'FeatureCollection', features: [ruaRomira] }, { maxZoom: 14, indexMaxZoom: 0 }),
};

// Servidor HTTP local (as requisições do mapa saem de um Web Worker, então
// são servidas de verdade em vez de interceptadas).
export async function usarMapaFalso(page) {
  const servidor = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const caminho = new URL(req.url, 'http://x').pathname;
    if (caminho === '/planet') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        tilejson: '3.0.0', minzoom: 0, maxzoom: 14, attribution: 'Mapa de teste',
        tiles: [`http://127.0.0.1:${servidor.address().port}/teste/{z}/{x}/{y}.pbf`],
      }));
    }
    res.setHeader('Content-Type', 'application/x-protobuf');
    if (caminho.startsWith('/teste/')) {
      const [z, x, y] = caminho.replace('.pbf', '').split('/').slice(-3).map(Number);
      const tiles = {};
      for (const [nome, indice] of Object.entries(camadas)) {
        const t = indice.getTile(z, x, y);
        if (t) tiles[nome] = t;
      }
      return res.end(Object.keys(tiles).length ? Buffer.from(vtpbf.fromGeojsonVt(tiles, { version: 2 })) : Buffer.alloc(0));
    }
    res.end(Buffer.alloc(0)); // fontes: vazias (rótulos não aparecem no teste)
  });
  await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${servidor.address().port}`;
  await page.addInitScript((b) => { window.ROMIRA_MAPA_BASE = b; }, base);
  return () => servidor.close();
}

// Simula a falta de acesso ao serviço de mapas (porta fechada)
export async function bloquearMapa(page) {
  await page.addInitScript(() => { window.ROMIRA_MAPA_BASE = 'http://127.0.0.1:9'; });
}
