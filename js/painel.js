// O painel continua sendo um sprite (assim a pontuação e a fase ficam
// aqui, onde o resto do jogo já as usa), mas quem DESENHA o HUD agora
// é a Interface, em DOM.
function Painel(context, nave) {
   this.context = context;
   this.nave = nave;
   this.pontuacao = 0;
   this.fase = 1;   // o GerenciadorFases atualiza ao mudar de fase
   this.ultimoExtraVida = 0;
   this.extraVidaAcada = 10000;
}
Painel.prototype = {
   atualizar: function() {

   },
   adicionarPontos: function(pontos) {
      this.pontuacao += pontos;
      var limiar = Math.floor(this.pontuacao / this.extraVidaAcada) * this.extraVidaAcada;
      if (limiar > this.ultimoExtraVida && this.nave.vidasExtras < 5) {
         this.nave.vidasExtras++;
         this.ultimoExtraVida = limiar;
      }
   },
   desenhar: function() {
      var vidas = Math.max(0, this.nave.vidasExtras + 1);
      Interface.atualizarHUD(this.pontuacao, vidas, this.fase);
   }
}