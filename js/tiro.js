var SOM_TIRO = new Audio();
SOM_TIRO.src = 'snd/tiro.mp3';
SOM_TIRO.volume = 0.2;
SOM_TIRO.load();

// Triple_Shot_Blue: 1 linha x 2 quadros de 16x16, ampliado 2x
function Tiro(context, nave, imagem) {
   this.context = context;
   this.nave = nave;
   
   this.largura = 32;
   this.altura = 32;
   this.grupo = 'tiro-jogador';
   this.usado = false;    // true depois de acertar alguém (acerta só 1 alvo)
   
   // Posicionar o tiro no bico da nave (centralizado)
   this.x = nave.x + nave.largura / 2 - this.largura / 2;
   this.y = nave.y - this.altura + 12;
   this.velocidade = 600;
   
   this.spritesheet = new Spritesheet(context, imagem, 1, 2);
   this.spritesheet.escala = 2;
   this.spritesheet.intervalo = 80;
   
   SOM_TIRO.currentTime = 0.0;
   SOM_TIRO.play();
}
Tiro.prototype = {
   atualizar: function() {
      this.y -= 
         this.velocidade * this.animacao.decorrido / 1000;
      
      // Excluir o tiro quando sumir da tela
      if (this.y < -this.altura) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
      }
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      this.spritesheet.proximoQuadro();
   },
   retangulosColisao: function() {
      // Só a parte visível dos raios (sem a margem transparente)
      return [ {x: this.x + 8, y: this.y + 2, largura: 18,
                altura: 26} ];
   },
   colidiuCom: function(outro) {
   
   }
}
