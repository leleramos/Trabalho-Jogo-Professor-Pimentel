// Se a nave inclinar para o lado errado, troque os dois valores
var QUADRO_ESQUERDA = 0;
var QUADRO_DIREITA = 4;

function Nave(context, teclado, imagem, imgExplosao, imgTiro) {
   this.context = context;
   this.teclado = teclado;
   this.imagem = imagem;
   this.x = 0;
   this.y = 0;
   this.velocidade = 0;
   // Spaceship_8: 1 linha x 5 quadros (0 = inclinada p/ um lado,
   // 2 = reta, 4 = inclinada p/ o outro lado)
   this.spritesheet = new Spritesheet(context, imagem, 1, 5);
   this.spritesheet.escala = 2;
   this.largura = 27 * 2;
   this.altura = 25 * 2;
   this.quadro = 2;
   this.ultimaTroca = 0;
   this.imgExplosao = imgExplosao;
   this.imgTiro = imgTiro;
   this.acabaramVidas = null;
   this.vidasExtras = 3;
}
Nave.prototype = {
   atualizar: function() {
      var incremento = 
          this.velocidade * this.animacao.decorrido / 1000;
      
      if (this.teclado.pressionada(SETA_ESQUERDA) && this.x > 0)
         this.x -= incremento;
         
      if (this.teclado.pressionada(SETA_DIREITA) && 
               this.x < this.context.canvas.width - this.largura)
         this.x += incremento;
         
      if (this.teclado.pressionada(SETA_ACIMA) && this.y > 0)
         this.y -= incremento;
         
      if (this.teclado.pressionada(SETA_ABAIXO) &&
               this.y < this.context.canvas.height - this.altura)
         this.y += incremento;
   },
   desenhar: function() {
      // Quadro alvo: inclina ao virar, volta ao centro ao soltar
      var alvo = 2;
      if (this.teclado.pressionada(SETA_ESQUERDA)) alvo = QUADRO_ESQUERDA;
      else if (this.teclado.pressionada(SETA_DIREITA)) alvo = QUADRO_DIREITA;
      
      // Passa um quadro de cada vez (inclinação suave)
      var agora = new Date().getTime();
      if (agora - this.ultimaTroca > 60) {
         if (this.quadro < alvo) this.quadro++;
         else if (this.quadro > alvo) this.quadro--;
         this.ultimaTroca = agora;
      }
      
      this.spritesheet.coluna = this.quadro;
      this.spritesheet.desenhar(this.x, this.y);
   },
   atirar: function() {
      var t = new Tiro(this.context, this, this.imgTiro);
      this.animacao.novoSprite(t);
      this.colisor.novoSprite(t);
   },
   retangulosColisao: function() {
      // Estes valores vão sendo ajustados aos poucos
      var rets = 
      [ 
         // Fuselagem central e as duas asas
         {x: this.x+20, y: this.y+8,  largura: 14, altura: 38},
         {x: this.x+6,  y: this.y+28, largura: 42, altura: 16}
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
      // Se colidiu com um Ovni...
      if (outro instanceof Ovni) {
         this.animacao.excluirSprite(this);
         this.animacao.excluirSprite(outro);
         this.colisor.excluirSprite(this);
         this.colisor.excluirSprite(outro);
         
         var exp1 = new Explosao(this.context, this.imgExplosao,
                                 this.x + this.largura / 2,
                                 this.y + this.altura / 2);
         var exp2 = new Explosao(this.context, this.imgExplosao,
                                 outro.x + outro.largura / 2,
                                 outro.y + outro.altura / 2);
         
         this.animacao.novoSprite(exp1);
         this.animacao.novoSprite(exp2);
         
         var nave = this;
         exp1.fimDaExplosao = function() {
            nave.vidasExtras--;
            
            if (nave.vidasExtras < 0) {
               if (nave.acabaramVidas) nave.acabaramVidas();
            }
            else {
               // Recolocar a nave no engine
               nave.colisor.novoSprite(nave);
               nave.animacao.novoSprite(nave);
               
               nave.posicionar();
            }
         }
      }
   },
   posicionar: function() {
      var canvas = this.context.canvas;
      this.x = canvas.width / 2 - this.largura / 2;
      this.y = canvas.height - this.altura;
   }
}
