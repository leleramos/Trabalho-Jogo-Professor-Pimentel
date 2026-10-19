function Ovni(context, imagem, imgExplosao) {
   this.context = context;
   this.imagem = imagem;
   this.x = 0;
   this.y = 0;
   this.velocidade = 0;
   this.imgExplosao = imgExplosao;
   
   // EnemyShip2: 1 linha x 5 quadros de 24x24, ampliado 2x
   this.spritesheet = new Spritesheet(context, imagem, 1, 5);
   this.spritesheet.escala = 2;
   this.spritesheet.intervalo = 100;
   this.largura = 24 * 2;
   this.altura = 24 * 2;
}
Ovni.prototype = {
   atualizar: function() {
      this.y += 
         this.velocidade * this.animacao.decorrido / 1000;
      
      if (this.y > this.context.canvas.height) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
      }
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   },
   retangulosColisao: function() {
      // Estes valores vão sendo ajustados aos poucos
      var rets = 
      [ 
         {x: this.x+6, y: this.y+8, largura: 36, altura: 34}
      ];
      
      // Desenhando os retângulos para visualização
      /*
      var ctx = this.context;
      
      for (var i in rets) {
         ctx.save();
         ctx.strokeStyle = 'yellow';
         ctx.strokeRect(rets[i].x, rets[i].y, rets[i].largura, 
                        rets[i].altura);
         ctx.restore();
      }
      */
      
      return rets;
   },
   colidiuCom: function(outro) {
      // Se colidiu com um Tiro, os dois desaparecem
      if (outro instanceof Tiro) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
         this.animacao.excluirSprite(outro);
         this.colisor.excluirSprite(outro);
         
         var explosao = new Explosao(this.context, this.imgExplosao, 
                                     this.x + this.largura / 2,
                                     this.y + this.altura / 2);
         this.animacao.novoSprite(explosao);
      }
   }
}
