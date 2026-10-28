// Códigos de teclas - usando event.code (padrão moderno)
var TECLA_W = 'KeyW';
var TECLA_A = 'KeyA';
var TECLA_S = 'KeyS';
var TECLA_D = 'KeyD';

var SETA_ESQUERDA = 'ArrowLeft';
var SETA_ACIMA = 'ArrowUp';
var SETA_DIREITA = 'ArrowRight';
var SETA_ABAIXO = 'ArrowDown';
var ESPACO = 'Space';
var ENTER = 'Enter';

function Teclado(elemento) {
   this.elemento = elemento;

   // Array de teclas pressionadas
   this.pressionadas = [];

   // Array de teclas disparadas
   this.disparadas = [];

   // Funções de disparo registradas
   this.funcoesDisparo = [];

   var teclado = this;

   // Teclas que devem ter preventDefault para evitar scroll da página
   var teclasJogo = new Set([SETA_ESQUERDA, SETA_ACIMA, SETA_DIREITA, SETA_ABAIXO, ESPACO, ENTER]);

   elemento.addEventListener('keydown', function(evento) {
      var tecla = evento.code;
      teclado.pressionadas[tecla] = true;

      // Evita comportamento padrão (scroll, etc.) para teclas do jogo
      if (teclasJogo.has(tecla)) {
         evento.preventDefault();
      }

      // Disparar somente se for o primeiro keydown da tecla
      if (teclado.funcoesDisparo[tecla] && !teclado.disparadas[tecla]) {
         teclado.disparadas[tecla] = true;
         teclado.funcoesDisparo[tecla]();
      }
   });

   elemento.addEventListener('keyup', function(evento) {
      var tecla = evento.code;
      teclado.pressionadas[tecla] = false;
      teclado.disparadas[tecla] = false;
   });
}
Teclado.prototype = {
   pressionada: function(tecla) {
      return this.pressionadas[tecla];
   },
   disparou: function(tecla, callback) {
      this.funcoesDisparo[tecla] = callback;
   }
}
