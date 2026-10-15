// Monta os links externos (WhatsApp, Google Maps, Instagram) a partir do conteúdo.
import { negocio } from '../content/site.js';

export function enderecoCompleto(e = negocio.endereco) {
  return `${e.rua} - ${e.bairro}, ${e.cidade} - ${e.estado}`;
}

// Link oficial de clique para conversar (wa.me), com a mensagem codificada.
export function linkWhatsApp(tipo = 'reserva') {
  const texto = negocio.whatsapp.mensagens[tipo] ?? negocio.whatsapp.mensagens.reserva;
  return `https://wa.me/${negocio.whatsapp.numero}?text=${encodeURIComponent(texto)}`;
}

// Rotas no Google Maps pelo endereço por extenso (URL pública documentada,
// não exige chave de API). O Google localiza o endereço com precisão.
export function linkComoChegar() {
  const destino = `${negocio.nome}, ${enderecoCompleto()}, Brasil`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;
}

export function linkMapa() {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${enderecoCompleto()}, Brasil`)}`;
}

export const linkInstagram = () => negocio.instagram.url;
