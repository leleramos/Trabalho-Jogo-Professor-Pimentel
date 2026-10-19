function Painel(context, nave) {
   this.context = context;
   this.nave = nave;
   // Ícone de vidas: quadro central (reto) da nave, sem ampliar
   this.spritesheet = new Spritesheet(context, nave.imagem, 1, 5);
   this.spritesheet.coluna = 2;
   this.pontuacao = 0;
}
Painel.prototype = {
   atualizar: function() {
      
   },
   desenhar: function() {
      var x = 10;
      var y = 10;
      
      // Uma mini-nave para cada vida extra
      for (var i = 1; i <= this.nave.vidasExtras; i++) {
         this.spritesheet.desenhar(x, y);
         x += 32;
      }
      
      // Pontuação
      var ctx = this.context;
      ctx.save();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(this.pontuacao, 110, 28);
      ctx.restore();   
   }
}
