// Galeria com visualização ampliada (elemento <dialog> nativo).
export function iniciarGaleria() {
  const dialogo = document.querySelector('[data-visualizador]');
  const dadosEl = document.getElementById('dados-galeria');
  if (!dialogo || !dadosEl || typeof dialogo.showModal !== 'function') return;
  const itens = JSON.parse(dadosEl.textContent);
  const img = dialogo.querySelector('[data-visualizador-img]');
  const legenda = dialogo.querySelector('[data-visualizador-legenda]');
  let atual = 0;
  let origem = null;

  function mostrar(i) {
    atual = (i + itens.length) % itens.length;
    const it = itens[atual];
    img.src = it.src;
    img.alt = it.alt;
    legenda.textContent = `${it.legenda}${it.ilustrativa ? ' · imagem ilustrativa' : ''} (${atual + 1}/${itens.length})`;
  }

  document.querySelectorAll('[data-galeria-indice]').forEach((b) =>
    b.addEventListener('click', () => {
      origem = b;
      mostrar(Number(b.dataset.galeriaIndice));
      dialogo.showModal();
      document.body.classList.add('menu-aberto');
    })
  );
  dialogo.querySelector('[data-visualizador-fechar]').addEventListener('click', () => dialogo.close());
  dialogo.querySelector('[data-visualizador-anterior]').addEventListener('click', () => mostrar(atual - 1));
  dialogo.querySelector('[data-visualizador-proximo]').addEventListener('click', () => mostrar(atual + 1));
  dialogo.addEventListener('click', (e) => { if (e.target === dialogo) dialogo.close(); });
  dialogo.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') mostrar(atual + 1);
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
  });
  dialogo.addEventListener('close', () => {
    document.body.classList.remove('menu-aberto');
    origem?.focus();
  });
}
