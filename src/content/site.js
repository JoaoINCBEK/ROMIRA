// ============================================================================
//  CONTEÚDO DO SITE — ROMIRA BRONZE E EVENTOS
//  Edite aqui textos, contatos, links e imagens. Não é preciso mexer no
//  restante do código para alterar o que aparece na página.
//  Dica: mantenha as aspas e as vírgulas no final de cada linha.
// ============================================================================

export const negocio = {
  nome: 'Romira Bronze e Eventos',
  nomeCurto: 'Romira',
  slogan: 'Seu momento de lazer começa aqui.',
  // Endereço oficial informado pela Romira
  endereco: {
    rua: 'Rua Francisco Viléla, 15',
    bairro: 'Boa Vista-Castelão',
    cidade: 'Fortaleza',
    estado: 'CE',
    estadoNome: 'Ceará',
    // CEP do logradouro (Rua Francisco Vilela) segundo a base dos Correios.
    // Confirme com a Romira antes de exibir; enquanto vazio, não aparece no site.
    cep: '',
    pais: 'BR',
  },
  whatsapp: {
    // Somente números, com código do país (55) e DDD (85)
    numero: '5585989742714',
    exibicao: '(85) 98974-2714',
    mensagens: {
      reserva:
        'Olá! Gostaria de consultar a disponibilidade da Romira Bronze e Eventos para realizar um evento.',
      bronzeamento:
        'Olá! Gostaria de mais informações sobre o bronzeamento natural da Romira.',
    },
  },
  instagram: {
    usuario: 'romira_baloes',
    url: 'https://www.instagram.com/romira_baloes/',
  },
  capacidade: 'de 11 a 20 pessoas',
};

// ----------------------------------------------------------------------------
//  LOCALIZAÇÃO NO MAPA (efeito aéreo)
//  As coordenadas abaixo são APROXIMADAS (referência do IBGE para o CEP da
//  rua). Elas NÃO marcam o imóvel. Quando a Romira enviar o link do pin no
//  Google Maps, copie a latitude/longitude exatas e mude `verificada` para true.
// ----------------------------------------------------------------------------
export const localizacao = {
  verificada: false,
  latitude: -3.79778,
  longitude: -38.51639,
  // Nome da rua como aparece no OpenStreetMap, usado para destacar a rua no mapa
  nomesDaRuaNoMapa: ['Rua Francisco Vilela', 'Rua Francisco Viléla'],
  // Ponto de partida do sobrevoo (visão ampla de Fortaleza)
  inicio: { latitude: -3.765, longitude: -38.53, zoom: 11.6 },
};

// ----------------------------------------------------------------------------
//  FOTOS DA CHEGADA
//  Percurso automático da seção “Onde estamos”: vista aérea → rua → fachada,
//  em um único movimento contínuo (em loop). Usa as três fotos; se faltar
//  alguma, a seção mostra a ilustração da região.
//  As fotos são preparadas com `npm run chegada` (veja o README).
//
//  IMPORTANTE: publique apenas fotos próprias ou com autorização de uso.
//  Capturas do Google Maps, Street View ou Google Earth NÃO podem ir para o
//  site. Enquanto `fotosAutorizadas` for false, as fotos aparecem somente na
//  prévia local (npm run dev) e nunca entram no site publicado.
//
//  `contorno`: retângulo em % da foto { x, y, largura, altura } que destaca o
//  imóvel. Use null quando a foto não mostrar o imóvel com certeza.
//  `foco`: ponto (em % da foto) para onde a câmera se aproxima.
// ----------------------------------------------------------------------------
export const chegada = {
  fotosAutorizadas: false,
  etapas: [
    {
      arquivo: 'aerea',
      titulo: 'Vista aérea',
      texto: 'Chegando à Boa Vista-Castelão.',
      alt: 'Vista aérea de uma quadra residencial com telhados e a rua em frente',
      contorno: null,
      // ponto da rua para onde a câmera desce
      foco: { x: 47, y: 70 },
    },
    {
      arquivo: 'rua',
      titulo: 'A rua',
      texto: 'Rua Francisco Viléla.',
      alt: 'Vista da Rua Francisco Viléla ao nível da calçada',
      contorno: null,
      // a câmera avança pela calçada, em direção ao portão
      foco: { x: 66, y: 58 },
    },
    {
      arquivo: 'fachada',
      titulo: 'A fachada',
      texto: 'Portão cinza, ao lado do número 13.',
      alt: 'Fachada da Romira: muro com portão cinza de metal ao lado do número 13',
      // Confirmado pela Romira: o portão cinza ao lado do número 13
      contorno: { x: 26.6, y: 40.7, largura: 35.7, altura: 28.9 },
      foco: { x: 44, y: 56 },
    },
  ],
};

// ----------------------------------------------------------------------------
//  SITE E SEO
// ----------------------------------------------------------------------------
export const site = {
  // Endereço público definitivo do site, sem barra no final.
  // Ex.: 'https://romira.pages.dev' ou 'https://www.romira.com.br'.
  // Enquanto vazio, o site funciona normalmente, mas sem URL canônica/sitemap.
  url: '',
  titulo: 'Romira Bronze e Eventos | Espaço de lazer com piscina em Fortaleza',
  descricao:
    'Espaço de lazer com piscina e churrasqueira para aniversários, encontros familiares e pequenas comemorações no Boa Vista-Castelão, em Fortaleza (CE). Consulte disponibilidade pelo WhatsApp.',
  imagemCompartilhamento: '/imagens/compartilhamento.jpg',
};

export const navegacao = [
  { rotulo: 'Início', alvo: 'inicio' },
  { rotulo: 'O Espaço', alvo: 'espaco' },
  { rotulo: 'Bronzeamento', alvo: 'bronzeamento' },
  { rotulo: 'Localização', alvo: 'localizacao' },
];

// ----------------------------------------------------------------------------
//  IMAGENS
//  Cada imagem tem um nome fixo. Para usar uma foto real, coloque o arquivo em
//  public/imagens/fotos/ (veja o README) e troque o `src`. Mude `ilustrativa`
//  para false somente quando a imagem for uma fotografia real da Romira.
// ----------------------------------------------------------------------------
export const imagens = {
  hero: {
    src: '/imagens/ilustracoes/hero-piscina.svg',
    alt: 'Ilustração de uma área de lazer com piscina e palmeiras ao entardecer',
    ilustrativa: true,
  },
  espaco: {
    src: '/imagens/ilustracoes/espaco-area-coberta.svg',
    alt: 'Ilustração de uma área coberta com mesas ao lado da piscina',
    ilustrativa: true,
  },
  espacoDetalhe: {
    src: '/imagens/ilustracoes/espaco-churrasqueira.svg',
    alt: 'Ilustração de uma churrasqueira em área de lazer',
    ilustrativa: true,
  },
  // Ocasiões: fotos reais de decorações da Romira (originais em imagens-originais/ocasioes/).
  // `posicao`: ponto da foto que fica sempre visível no recorte (rostos e balões).
  aniversarios: {
    src: '/imagens/fotos/ocasiao-aniversario-14-anos.webp',
    larguras: [640, 1086],
    alt: 'Jovem sorrindo ao lado de um bolo rosa e de balões, na comemoração de 14 anos',
    posicao: '50% 40%',
    ilustrativa: false,
  },
  familia: {
    src: '/imagens/fotos/ocasiao-familia-76-anos.webp',
    larguras: [640, 1280, 1672],
    alt: 'Casal abraçado ao lado de balões dourados com o número 76',
    posicao: '46% 50%',
    // foto horizontal recortada no cartão vertical: pede uma versão maior para ficar nítida
    sizes: '(min-width: 960px) 67vw, (min-width: 720px) 75vw, 200vw',
    ilustrativa: false,
  },
  amigos: {
    src: '/imagens/fotos/ocasiao-arco-colorido.webp',
    larguras: [640, 1280, 1672],
    alt: 'Mulher sorrindo ao lado de um arco de balões laranja, roxos, azuis e amarelos',
    posicao: '36% 50%',
    // foto horizontal recortada no cartão vertical: pede uma versão maior para ficar nítida
    sizes: '(min-width: 960px) 67vw, (min-width: 720px) 75vw, 200vw',
    ilustrativa: false,
  },
  ocasiaoPaizao: {
    src: '/imagens/fotos/ocasiao-paizao.webp',
    larguras: [640, 1254],
    alt: 'Decoração com balões azuis e brancos e o letreiro “Paizão”',
    posicao: '50% 40%',
    ilustrativa: false,
  },
  ocasiao76Anos: {
    src: '/imagens/fotos/ocasiao-76-anos.webp',
    larguras: [640, 1280, 1672],
    alt: 'Mulher sorrindo atrás de balões dourados com o número 76',
    posicao: '50% 25%',
    ilustrativa: false,
  },
  bronzeamento: {
    src: '/imagens/ilustracoes/bronzeamento.svg',
    alt: 'Ilustração de espreguiçadeira, chapéu e toalha sob o sol',
    ilustrativa: true,
  },
};

// Galeria: troque pelos arquivos reais quando houver fotos do espaço.
export const galeria = [
  { src: '/imagens/ilustracoes/galeria-piscina.svg', alt: 'Ilustração da piscina vista de cima', legenda: 'Piscina', ilustrativa: true, formato: 'alto' },
  { src: '/imagens/ilustracoes/espaco-area-coberta.svg', alt: 'Ilustração de uma área coberta com mesas', legenda: 'Área coberta', ilustrativa: true },
  { src: '/imagens/ilustracoes/espaco-churrasqueira.svg', alt: 'Ilustração de uma churrasqueira', legenda: 'Churrasqueira', ilustrativa: true },
  { src: '/imagens/ilustracoes/galeria-entardecer.svg', alt: 'Ilustração de palmeiras ao entardecer', legenda: 'Fim de tarde', ilustrativa: true },
  { src: '/imagens/ilustracoes/ocasiao-familia.svg', alt: 'Ilustração de uma mesa posta', legenda: 'Mesas e cadeiras', ilustrativa: true },
];

// ----------------------------------------------------------------------------
//  TEXTOS DAS SEÇÕES
// ----------------------------------------------------------------------------
export const textos = {
  hero: {
    sobretitulo: 'Espaço de lazer em Fortaleza',
    titulo: 'Seu próximo momento especial merece esse lugar.',
    texto:
      'Piscina, churrasqueira e área coberta para aniversários, encontros em família e pequenas comemorações. Alugue por hora e aproveite com quem você gosta.',
    cta: 'Reservar pelo WhatsApp',
  },
  regiao: {
    sobretitulo: 'Onde estamos',
    titulo: 'Na Boa Vista-Castelão, em Fortaleza.',
    texto:
      'Veja de cima a região onde fica o nosso espaço. Toque em “Como chegar” para abrir a rota no Google Maps, direto no seu celular.',
    // Legenda curta abaixo da imagem aérea
    legenda: 'Conheça a região do nosso espaço.',
    // Acrescentada só quando a imagem é a ilustração (sem foto aérea autorizada)
    legendaIlustracao: 'Ilustração artística.',
  },
  espaco: {
    sobretitulo: 'O Espaço',
    titulo: 'Um lugar acolhedor para reunir quem você ama.',
    paragrafos: [
      'A Romira é um espaço de lazer com clima familiar, pensado para um dia leve e sem pressa com quem você gosta.',
    ],
  },
  comodidades: {
    sobretitulo: 'Estrutura',
    titulo: 'Tudo o que o seu encontro precisa.',
    itens: [
      { icone: 'piscina', titulo: 'Piscina', texto: 'Para refrescar e aproveitar o dia.' },
      { icone: 'churrasqueira', titulo: 'Churrasqueira', texto: 'Para o churrasco com a turma.' },
      { icone: 'mesas', titulo: 'Mesas e cadeiras', texto: 'Para acomodar seus convidados.' },
      { icone: 'coberta', titulo: 'Área coberta', texto: 'Sombra para o sol de Fortaleza.' },
      { icone: 'banheiros', titulo: 'Banheiros', texto: 'Conforto para todos.' },
      { icone: 'cozinha', titulo: 'Cozinha ou pia', texto: 'Apoio para preparar e servir.' },
      { icone: 'musica', titulo: 'Espaço para música', texto: 'Sua trilha sonora no encontro.' },
      { icone: 'familia', titulo: 'Ambiente familiar', texto: 'Acolhedor do começo ao fim.' },
    ],
  },
  ocasioes: {
    sobretitulo: 'Ocasiões',
    titulo: 'Para os dias que merecem ser lembrados.',
    itens: [
      { imagem: 'aniversarios', titulo: 'Aniversários', texto: 'Comemore mais um ano com piscina, churrasco e quem você ama.' },
      { imagem: 'familia', titulo: 'Encontros familiares', texto: 'Reúna a família para um dia de piscina e conversa boa.' },
      { imagem: 'amigos', titulo: 'Reuniões entre amigos', texto: 'Churrasco, música e a turma toda junta.' },
    ],
    // Fotos extras, exibidas abaixo dos cartões (sem texto)
    fotos: ['ocasiaoPaizao', 'ocasiao76Anos'],
  },
  galeria: {
    sobretitulo: 'Galeria',
    titulo: 'Inspire-se para o seu dia.',
    aviso: 'Imagens ilustrativas. Em breve, fotos reais do espaço.',
  },
  bronzeamento: {
    sobretitulo: 'Também na Romira',
    titulo: 'Bronzeamento natural.',
    texto:
      'Além do espaço de lazer, a Romira oferece bronzeamento natural. Fale com a gente pelo WhatsApp para saber como funciona e consultar horários.',
    cta: 'Saber mais pelo WhatsApp',
  },
  depoimentos: {
    // A seção só aparece quando houver depoimentos REAIS cadastrados abaixo.
    ativo: false,
    sobretitulo: 'Quem já veio',
    titulo: 'O que dizem sobre a Romira.',
    // Formato: { texto: '...', autor: 'Nome autorizado pelo cliente', ocasiao: 'Aniversário' }
    itens: [],
  },
  localizacao: {
    sobretitulo: 'Localização e contato',
    titulo: 'Vamos marcar o seu momento?',
    texto:
      'Disponibilidade e valores são informados pelo WhatsApp. A reserva é confirmada diretamente com a Romira.',
  },
};
