import '../styles/main.css';
import { iniciarCabecalho } from './cabecalho.js';
import { iniciarRevelacao } from './revelar.js';
import { iniciarGaleria } from './galeria.js';
import { iniciarAereo } from './aereo/index.js';

document.documentElement.classList.add('js');

iniciarCabecalho();
iniciarRevelacao();
iniciarGaleria();
iniciarAereo();
