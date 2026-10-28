// Inimigo comum. O parâmetro 'tipo' muda o comportamento:
//   'reto'     -> desce em linha reta (o inimigo original)
//   'zigue'    -> desce balançando de um lado para o outro
//   'blindado' -> maior, mais lento e aguenta 3 tiros
//   'atirador' -> para no alto da tela e atira na direção da nave
function Ovni(context, imagem, imgExplosao, tipo) {
   this.context = context;
   this.imagem = imagem;
   this.x = 0;
   this.y = 0;
   this.velocidade = 0;
   this.imgExplosao = imgExplosao;
   this.tipo = tipo || 'reto';
   this.grupo = 'inimigo';
   
   // Características de cada tipo
   var escala = 2;
   this.vida = 1;
   this.pontos = 10;
   if (this.tipo == 'zigue')    { this.pontos = 20; }
   if (this.tipo == 'blindado') { escala = 3; this.vida = 3; this.pontos = 40; }
   if (this.tipo == 'atirador') { this.vida = 2; this.pontos = 30; }
   
   // EnemyShip2: 1 linha x 5 quadros de 24x24
   this.escala = escala;
   this.spritesheet = new Spritesheet(context, imagem, 1, 5);
   this.spritesheet.escala = escala;
   this.spritesheet.intervalo = 100;
   this.largura = 24 * escala;
   this.altura = 24 * escala;
   
   // Controle interno (o tempo é somado com o 'decorrido' da animação,
   // então tudo pausa certinho quando o jogo é pausado)
   this.tempo = 0;          // segundos de vida
   this.xBase = 0;          // centro do balanço do 'zigue'
   this.brilho = 0;         // ms restantes do clarão de "levei tiro"
   this.morto = false;
   this.aoMorrer = null;    // function(ovni, porTiro) - definida na criação
   
   // Só do atirador
   this.alvo = null;        // a nave (para mirar)
   this.pairando = false;
   this.tempoPairando = 0;
   this.recarga = 0;
   this.cadencia = 1800;
   this.velTiro = 300;
}
Ovni.prototype = {
   atualizar: function() {
      var ms = this.animacao.decorrido;
      var dt = ms / 1000;
      var canvas = this.context.canvas;
      
      this.tempo += dt;
      if (this.brilho > 0) this.brilho -= ms;
      
      if (this.tipo == 'zigue') {
         this.y += this.velocidade * 0.7 * dt;
         var x = this.xBase + Math.sin(this.tempo * 3) * 90;
         this.x = Math.max(0, Math.min(x, canvas.width - this.largura));
      }
      else if (this.tipo == 'blindado') {
         this.y += this.velocidade * 0.5 * dt;
      }
      else if (this.tipo == 'atirador') {
         this.atualizarAtirador(ms);
      }
      else {
         this.y += this.velocidade * dt;
      }
      
      // Saiu pela parte de baixo da tela
      if (this.y > canvas.height) {
         this.animacao.excluirSprite(this);
         this.colisor.excluirSprite(this);
      }
   },
   atualizarAtirador: function(ms) {
      var dt = ms / 1000;
      var yParada = this.context.canvas.height * 0.18;
      
      // 1) Desce até o alto da tela
      if (! this.pairando) {
         this.y += this.velocidade * 0.5 * dt;
         if (this.y >= yParada) {
            this.pairando = true;
            this.recarga = 600;
         }
         return;
      }
      
      this.tempoPairando += ms;
      
      // 2) Paira seguindo a nave devagar e atirando
      if (this.tempoPairando < 4500) {
         if (this.alvo) {
            var alvoX = this.alvo.x + this.alvo.largura / 2 
                        - this.largura / 2;
            var passo = 90 * dt;
            var dif = alvoX - this.x;
            this.x += Math.max(-passo, Math.min(passo, dif));
         }
         this.recarga -= ms;
         if (this.recarga <= 0) {
            this.atirar();
            this.recarga = this.cadencia;
         }
      }
      // 3) Cansou: vai embora pela parte de baixo
      else {
         this.y += this.velocidade * dt;
      }
   },
   atirar: function() {
      if (! this.alvo) return;
      
      var cx = this.x + this.largura / 2;
      var cy = this.y + this.altura - 8;
      var dx = this.alvo.x + this.alvo.largura / 2 - cx;
      var dy = this.alvo.y + this.alvo.altura / 2 - cy;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      
      // Vetor unitário (dx/dist, dy/dist) x velocidade = tiro mirado
      var tiro = new TiroInimigo(this.context, cx, cy, 
                                 dx / dist * this.velTiro, 
                                 dy / dist * this.velTiro);
      this.animacao.novoSprite(tiro);
      this.colisor.novoSprite(tiro);
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      
      // Clarão rápido quando leva um tiro e ainda não morreu
      if (this.brilho > 0) {
         var ctx = this.context;
         ctx.save();
         ctx.globalCompositeOperation = 'lighter';
         ctx.globalAlpha = 0.6;
         this.spritesheet.desenhar(this.x, this.y);
         ctx.restore();
      }
      
      this.spritesheet.proximoQuadro();
   },
   retangulosColisao: function() {
      // Valores originais (para escala 2) multiplicados por k
      var k = this.escala / 2;
      var rets = 
      [ 
         {x: this.x + 6 * k, y: this.y + 8 * k, 
          largura: 36 * k, altura: 34 * k}
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
      // Só reage a tiros da nave. 'usado' evita que o MESMO tiro
      // acerte duas naves no mesmo quadro.
      if (! (outro instanceof Tiro) || this.morto || outro.usado) return;
      
      outro.usado = true;
      this.animacao.excluirSprite(outro);
      this.colisor.excluirSprite(outro);
      
      this.vida--;
      if (this.vida > 0) this.brilho = 90;
      else this.destruir(true);
   },
   // porTiro = true quando o jogador derrubou (vale pontos);
   // false quando a nave bateu nele.
   destruir: function(porTiro) {
      // 'morto' evita explodir duas vezes se duas colisões
      // acontecerem no mesmo quadro
      if (this.morto) return;
      this.morto = true;
      
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
      
      var explosao = new Explosao(this.context, this.imgExplosao, 
                                  this.x + this.largura / 2,
                                  this.y + this.altura / 2);
      this.animacao.novoSprite(explosao);
      
      if (this.aoMorrer) this.aoMorrer(this, porTiro);
   }
}
