var SOM_EXPLOSAO = new Audio();
SOM_EXPLOSAO.src = 'snd/explosao.mp3';
SOM_EXPLOSAO.volume = 0.4;
SOM_EXPLOSAO.load();

// Recebe o CENTRO da explosão (cx, cy).
// Explosion_Medium: 1 linha x 8 quadros de 40x40, ampliado 2x
function Explosao(context, imagem, cx, cy) {
   this.context = context;
   this.imagem = imagem;
   this.spritesheet = new Spritesheet(context, imagem, 1, 8);
   this.spritesheet.escala = 2;
   this.spritesheet.intervalo = 60;
   this.x = cx - 40;   // metade de 40 * 2
   this.y = cy - 40;
   this.animando = false;
   
   var explosao = this;
   this.fimDaExplosao = null;
   this.spritesheet.fimDoCiclo = function() {
      explosao.animacao.excluirSprite(explosao);
      if (explosao.fimDaExplosao) explosao.fimDaExplosao();
   }
   
   SOM_EXPLOSAO.currentTime = 0.0;
   SOM_EXPLOSAO.play();
}
Explosao.prototype = {
   atualizar: function() {
      
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   }
}