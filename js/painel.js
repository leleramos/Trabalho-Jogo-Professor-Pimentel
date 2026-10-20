// O painel continua sendo um sprite (assim a pontuação e a fase ficam
// aqui, onde o resto do jogo já as usa), mas quem DESENHA o HUD agora
// é a Interface, em DOM.
function Painel(context, nave) {
   this.context = context;
   this.nave = nave;
   this.pontuacao = 0;
   this.fase = 1;   // o GerenciadorFases atualiza ao mudar de fase
}
Painel.prototype = {
   atualizar: function() {
      
   },
   desenhar: function() {
      // vidasExtras = vidas de reserva; o HUD mostra a vida em uso + reservas
      var vidas = Math.max(0, this.nave.vidasExtras + 1);
      Interface.atualizarHUD(this.pontuacao, vidas, this.fase);
   }
}
