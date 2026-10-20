// O painel continua sendo um sprite (assim a pontuação e a fase ficam
// aqui, onde o resto do jogo já as usa), mas quem DESENHA o HUD agora
// é a Interface, em DOM.
function Painel(context, nave) {
   this.context = context;
   this.nave = nave;
   this.pontuacao = 0;
   this.fase = 1;   // a Pessoa 1 incrementa ao derrotar o boss
}
Painel.prototype = {
   atualizar: function() {
      
   },
   desenhar: function() {
      Interface.atualizarHUD(this.pontuacao, this.nave.vidasExtras, this.fase);
   }
}
