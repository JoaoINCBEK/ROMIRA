import { defineConfig } from 'vite';
import { resolve, join, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { existsSync, readFileSync, createReadStream } from 'node:fs';

const moduloLocal = (caminho) => import(/* @vite-ignore */ pathToFileURL(resolve(caminho)).href);

const PASTA_PUBLICA_CHEGADA = 'public/imagens/chegada';
const PASTA_PREVIA_CHEGADA = 'imagens-local/chegada'; // fora do Git e do site publicado

const lerManifesto = (pasta) => {
  const arquivo = join(pasta, 'manifesto.json');
  return existsSync(arquivo) ? JSON.parse(readFileSync(arquivo, 'utf8')) : null;
};

// Fotos da “Chegada à Romira”: no site publicado, só com fotosAutorizadas: true
// e arquivos em public/imagens/chegada. Na prévia local (npm run dev), também
// usa imagens-local/chegada, marcadas como prévia e nunca copiadas para o build.
function fotosDaChegada(chegada, emDesenvolvimento) {
  if (chegada.fotosAutorizadas) {
    const manifesto = lerManifesto(PASTA_PUBLICA_CHEGADA);
    if (manifesto) return { manifesto, previa: false };
  }
  if (emDesenvolvimento) {
    const manifesto = lerManifesto(PASTA_PREVIA_CHEGADA);
    if (manifesto) return { manifesto, previa: !chegada.fotosAutorizadas };
  }
  return null;
}

// Plugin que injeta no index.html o conteúdo gerado a partir de src/content/site.js
function paginaRomira() {
  let servidor;
  const carregar = async () =>
    servidor
      ? servidor.ssrLoadModule('/src/templates/pagina.js')
      : moduloLocal('src/templates/pagina.js');
  const carregarSite = async () =>
    servidor ? servidor.ssrLoadModule('/src/content/site.js') : moduloLocal('src/content/site.js');
  return {
    name: 'pagina-romira',
    configureServer(s) {
      servidor = s;
      s.watcher.on('change', (arquivo) => {
        if (/src[\\/](content|templates|lib)[\\/]/.test(arquivo)) s.ws.send({ type: 'full-reload' });
      });
      // Prévia local das fotos da chegada (não existe no site publicado)
      s.middlewares.use('/imagens/chegada', (req, res, next) => {
        const nome = basename(decodeURIComponent((req.url || '').split('?')[0]));
        const arquivo = join(PASTA_PREVIA_CHEGADA, nome);
        if (!/\.webp$/.test(nome) || existsSync(join(PASTA_PUBLICA_CHEGADA, nome)) || !existsSync(arquivo)) return next();
        res.setHeader('Content-Type', 'image/webp');
        res.setHeader('Cache-Control', 'no-store');
        createReadStream(arquivo).pipe(res);
      });
    },
    async transformIndexHtml(html) {
      const { renderizarHead, renderizarPagina } = await carregar();
      const { chegada } = await carregarSite();
      const fotos = fotosDaChegada(chegada, !!servidor);
      return html.replace('<!--head-->', renderizarHead()).replace('<!--pagina-->', renderizarPagina({ fotosChegada: fotos }));
    },
    async generateBundle() {
      const { site } = await moduloLocal('src/content/site.js');
      const linhas = ['User-agent: *', 'Allow: /'];
      if (site.url) {
        linhas.push(`Sitemap: ${site.url}/sitemap.xml`);
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site.url}/</loc></url>\n</urlset>\n`,
        });
      }
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: linhas.join('\n') + '\n' });
    },
  };
}

export default defineConfig({
  plugins: [paginaRomira()],
  build: {
    target: 'es2020',
    // O MapLibre (~800 KB) é carregado sob demanda, só na seção do mapa
    chunkSizeWarningLimit: 1100,
  },
  server: { host: true },
  preview: { host: true },
});
