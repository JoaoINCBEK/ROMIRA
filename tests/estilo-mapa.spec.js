import { test, expect } from '@playwright/test';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';
import { estiloMapa } from '../src/scripts/aereo/estilo-mapa.js';

// Um estilo inválido faz o mapa falhar em silêncio; este teste evita isso.
test('estilo do mapa é válido (computador e celular)', async ({}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'teste sem navegador, roda uma vez');
  for (const predios3d of [true, false]) {
    const erros = validateStyleMin(estiloMapa({ predios3d, nomesDaRua: ['Rua Francisco Vilela'] }));
    expect(erros.map((e) => e.message)).toEqual([]);
  }
});
