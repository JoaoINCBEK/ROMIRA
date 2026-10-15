// Cabeçalho fixo: fundo sólido após rolar, menu móvel acessível e item ativo.
export function iniciarCabecalho() {
  const cabecalho = document.querySelector('[data-cabecalho]');
  const botao = document.querySelector('[data-menu-botao]');
  const menu = document.querySelector('[data-menu]');
  const rotulo = document.querySelector('[data-menu-rotulo]');
  if (!cabecalho) return;

  const atualizarFundo = () => cabecalho.classList.toggle('cabecalho--solido', window.scrollY > 24);
  atualizarFundo();
  window.addEventListener('scroll', atualizarFundo, { passive: true });

  function definirMenu(aberto) {
    botao.setAttribute('aria-expanded', String(aberto));
    rotulo.textContent = aberto ? 'Fechar menu' : 'Abrir menu';
    menu.hidden = !aberto;
    document.body.classList.toggle('menu-aberto', aberto);
    if (aberto) menu.querySelector('a')?.focus();
  }
  botao?.addEventListener('click', () => definirMenu(botao.getAttribute('aria-expanded') !== 'true'));
  menu?.addEventListener('click', (e) => { if (e.target.closest('a')) definirMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && botao?.getAttribute('aria-expanded') === 'true') {
      definirMenu(false);
      botao.focus();
    }
  });
  // Fecha o menu se a tela crescer para o layout de computador
  window.matchMedia('(min-width: 960px)').addEventListener('change', (m) => { if (m.matches) definirMenu(false); });

  // Marca o item do menu da seção visível
  const links = [...document.querySelectorAll('[data-nav]')];
  const secoes = [...new Set(links.map((l) => l.dataset.nav))].map((id) => document.getElementById(id)).filter(Boolean);
  if (!('IntersectionObserver' in window)) return;
  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        for (const l of links) l.toggleAttribute('aria-current', l.dataset.nav === e.target.id);
        for (const l of links) if (l.dataset.nav === e.target.id) l.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );
  secoes.forEach((s) => obs.observe(s));
}
