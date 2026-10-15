// Aparição suave das seções ao rolar (desativada com movimento reduzido via CSS).
export function iniciarRevelacao() {
  const itens = document.querySelectorAll('.revelar');
  if (!('IntersectionObserver' in window)) {
    itens.forEach((el) => el.classList.add('visivel'));
    return;
  }
  const obs = new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('visivel');
        obs.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  itens.forEach((el, i) => {
    // pequeno escalonamento entre itens vizinhos (cartões)
    const irmaos = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains('revelar')) : [];
    const ordem = irmaos.indexOf(el);
    if (ordem > 0) el.style.transitionDelay = `${Math.min(ordem, 6) * 70}ms`;
    obs.observe(el);
  });
}
