// Tiro disparado por inimigos e pelo boss.
// Diferente do Tiro da nave, ele anda em qualquer direção:
// (vx, vy) é a velocidade em px/s, e (x, y) é o CENTRO do tiro.
function TiroInimigo(context, x, y, vx, vy) {
   this.context = context;
   this.x = x;
   this.y = y;
   this.vx = vx;
   this.vy = vy;
   this.raio = 7;
   this.largura = this.raio * 2;
   this.altura = this.raio * 2;
   this.grupo = 'tiro-inimigo';
}
TiroInimigo.prototype = {
   atualizar: function() {
      var dt = this.animacao.decorrido / 1000;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      
      // Saiu da tela: remove
      var canvas = this.context.canvas;
      if (this.x < -20 || this.x > canvas.width + 20 ||
          this.y < -20 || this.y > canvas.height + 20)
         this.remover();
   },
   desenhar: function() {
      var ctx = this.context;
      ctx.save();
      // Halo, corpo e centro claro
      ctx.fillStyle = 'rgba(255, 60, 80, 0.30)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.raio * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff3b4e';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffd7db';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.raio * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
   },
   retangulosColisao: function() {
      // Um pouco menor que o desenho (perdoa quem passa "raspando")
      var r = this.raio * 0.7;
      return [ {x: this.x - r, y: this.y - r, largura: r * 2, altura: r * 2} ];
   },
   colidiuCom: function(outro) {
      // Ao tocar na nave o tiro some (quem tira a vida é a Nave)
      if (outro instanceof Nave) this.remover();
   },
   remover: function() {
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
   }
}
