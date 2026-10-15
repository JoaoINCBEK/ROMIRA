// Otimiza fotografias reais para a web.
// 1. Coloque as fotos originais (JPG/PNG/HEIC convertido/WebP) em imagens-originais/
//    com o nome desejado, ex.: imagens-originais/hero.jpg
// 2. Rode: npm run imagens
// 3. Serão criadas versões WebP em public/imagens/fotos/ (ex.: hero-640.webp,
//    hero-1280.webp, hero-1920.webp) e o terminal mostrará o trecho para
//    colar em src/content/site.js.
import { readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';
import sharp from 'sharp';

const ENTRADA = 'imagens-originais';
const SAIDA = 'public/imagens/fotos';
const LARGURAS = [640, 1280, 1920];

if (!existsSync(ENTRADA)) {
  mkdirSync(ENTRADA);
  console.log(`Pasta ${ENTRADA}/ criada. Coloque as fotos nela e rode o comando de novo.`);
  process.exit(0);
}
mkdirSync(SAIDA, { recursive: true });
const arquivos = readdirSync(ENTRADA).filter((a) => /\.(jpe?g|png|webp|tiff?|avif)$/i.test(a));
if (!arquivos.length) console.log(`Nenhuma foto encontrada em ${ENTRADA}/.`);

for (const arquivo of arquivos) {
  const { name } = parse(arquivo);
  const nome = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const imagem = sharp(join(ENTRADA, arquivo)).rotate(); // respeita a orientação do celular
  const { width } = await imagem.metadata();
  const larguras = LARGURAS.filter((l) => l <= width);
  if (!larguras.length) larguras.push(width);
  for (const l of larguras) {
    await imagem.clone().resize({ width: l, withoutEnlargement: true }).webp({ quality: 78 }).toFile(join(SAIDA, `${nome}-${l}.webp`));
  }
  console.log(`✓ ${arquivo} → ${larguras.map((l) => `${nome}-${l}.webp`).join(', ')}`);
  console.log(`  Em site.js use: src: '/imagens/fotos/${nome}.webp', larguras: [${larguras.join(', ')}], ilustrativa: false,\n`);
}
