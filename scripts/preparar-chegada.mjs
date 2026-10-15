// Prepara as fotos da sequência “Chegada à Romira” (vista aérea, rua e fachada).
//
//   npm run chegada              → prévia local (imagens-local/chegada/, NÃO vai para o site)
//   npm run chegada -- --publicar → site publicado (public/imagens/chegada/)
//
// Coloque os originais em imagens-originais/chegada/ com os nomes
// aerea, rua e fachada (.jpg, .jpeg, .png ou .webp).
// Use --publicar somente com fotos próprias ou com autorização de uso:
// capturas do Google Maps, Street View ou Google Earth não podem ser publicadas.
import sharp from 'sharp';
import { readdir, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const ORIGEM = 'imagens-originais/chegada';
const publicar = process.argv.includes('--publicar');
const DESTINO = publicar ? 'public/imagens/chegada' : 'imagens-local/chegada';
const NOMES = ['aerea', 'rua', 'fachada'];
const LARGURAS = [800, 1600];

if (!existsSync(ORIGEM)) {
  console.error(`Pasta ${ORIGEM}/ não encontrada. Crie-a e coloque as fotos aerea, rua e fachada.`);
  process.exit(1);
}

await mkdir(DESTINO, { recursive: true });
const arquivos = await readdir(ORIGEM);
const manifesto = {};

for (const nome of NOMES) {
  const arquivo = arquivos.find((a) => parse(a).name === nome && /\.(jpe?g|png|webp)$/i.test(a));
  if (!arquivo) {
    console.warn(`· ${nome}: não encontrada (etapa será omitida)`);
    continue;
  }
  const entrada = sharp(join(ORIGEM, arquivo)).rotate();
  const { width, height } = await entrada.metadata();
  const larguras = [...new Set(LARGURAS.map((l) => Math.min(l, width)))];
  for (const largura of larguras) {
    await sharp(join(ORIGEM, arquivo))
      .rotate()
      .resize({ width: largura, withoutEnlargement: true })
      // Sem metadados (EXIF/GPS) no arquivo publicado
      .webp({ quality: largura > 1000 ? 70 : 74, effort: 5 })
      .toFile(join(DESTINO, `${nome}-${largura}.webp`));
  }
  manifesto[nome] = { largura: width, altura: height, larguras };
  console.log(`✓ ${nome}: ${width}×${height} → ${larguras.map((l) => `${nome}-${l}.webp`).join(', ')}`);
}

await writeFile(join(DESTINO, 'manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n');
console.log(`\nPronto em ${DESTINO}/${publicar ? '' : ' (somente prévia local, não publicada)'}`);
