var SOM_EXPLOSAO = new Audio();
SOM_EXPLOSAO.src = 'snd/explosao.mp3';
SOM_EXPLOSAO.volume = 0.4;
SOM_EXPLOSAO.load();

// Recebe o CENTRO da explosão (cx, cy).
// Explosion_Medium: 1 linha x 8 quadros de 40x40, ampliado 2x
function Explosao(context, imagem, cx, cy, semSom) {
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
   
   // semSom: usado quando várias explosões acontecem juntas (boss),
   // para o mesmo som não tocar 5 vezes ao mesmo tempo e distorcer
   if (! semSom) {
      var som = SOM_EXPLOSAO.cloneNode();
      som.volume = SOM_EXPLOSAO.volume;
      som.muted = SOM_EXPLOSAO.muted;
      var p = som.play();
      if (p && p.catch) p.catch(function() {});
   }
}
Explosao.prototype = {
   atualizar: function() {
      
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   }
}