// Percurso automático da seção “Onde estamos” (vista aérea → rua → fachada).
//
// A animação é só CSS (loop de 19 s; sem as fotos, a ilustração faz um loop
// de 10 s). Este script apenas a deixa rodar enquanto a seção está visível:
// fora da tela ela fica pausada e, ao voltar, continua do mesmo ponto.
// Com movimento reduzido, o CSS mostra a imagem parada.

export function iniciarAereo(raiz = document.querySelector('[data-aereo]')) {
  if (!raiz) return;
  const rodar = (visivel) => raiz.classList.toggle('aereo--rodando', visivel);

  if (!('IntersectionObserver' in window)) return rodar(true);
  new IntersectionObserver((entradas) => rodar(entradas[entradas.length - 1].isIntersecting), {
    threshold: 0.15,
  }).observe(raiz);
}
