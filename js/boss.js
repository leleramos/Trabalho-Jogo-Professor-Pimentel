// Chefe de fase. Ele:
//   - entra pelo alto da tela (e fica invulnerável enquanto entra);
//   - anda de um lado para o outro;
//   - alterna padrões de ataque (quanto mais avançada a fase,
//     mais padrões ele conhece);
//   - entra em "fúria" com menos da metade da vida (mais rápido).
//
// 'config' vem de configFase() e 'alvo' é a nave (para mirar).
function Boss(context, imagem, imgExplosao, config, alvo) {
   this.context = context;
   this.imgExplosao = imgExplosao;
   this.config = config;
   this.alvo = alvo;
   this.grupo = 'inimigo';
   
   var canvas = context.canvas;
   
   // boss-pixel.png: 1 linha x 5 quadros de 32x32
   this.escala = canvas.width < 700 ? 4 : 5;
   this.spritesheet = new Spritesheet(context, imagem, 1, 5);
   this.spritesheet.escala = this.escala;
   this.spritesheet.intervalo = 120;
   this.largura = 32 * this.escala;
   this.altura = 32 * this.escala;
   
   this.x = canvas.width / 2 - this.largura / 2;
   this.y = -this.altura;
   this.yAlvo = 60;             // altura em que ele "estaciona"
   
   this.vidaMax = config.vidaBoss;
   this.vida = this.vidaMax;
   
   this.entrou = false;
   this.morto = false;
   this.direcao = 1;            // 1 = direita, -1 = esquerda
   this.tempo = 0;              // segundos de vida
   this.brilho = 0;             // clarão ao levar tiro (ms)
   this.aoMorrer = null;
   
   // Padrões de ataque disponíveis (entram conforme a fase)
   this.padroes = ['leque'];
   if (config.numero >= 2) this.padroes.push('mirado');
   if (config.numero >= 3) this.padroes.push('varredura');
   this.indicePadrao = 0;
   this.tempoPadrao = 0;        // há quanto tempo está no padrão atual
   this.recarga = 1200;         // ms até o próximo disparo
}
Boss.prototype = {
   atualizar: function() {
      var ms = this.animacao.decorrido;
      var dt = ms / 1000;
      var canvas = this.context.canvas;
      
      this.tempo += dt;
      if (this.brilho > 0) this.brilho -= ms;
      
      // 1) Entrada: desce até a posição de combate
      if (! this.entrou) {
         this.y += 160 * dt;
         if (this.y >= this.yAlvo) {
            this.y = this.yAlvo;
            this.entrou = true;
         }
         return;
      }
      
      // 2) Movimento lateral (quica nas bordas)
      var furia = this.vida <= this.vidaMax / 2;
      var vel = this.config.velBoss * (furia ? 1.35 : 1);
      this.x += this.direcao * vel * dt;
      
      var minX = 10;
      var maxX = canvas.width - this.largura - 10;
      if (this.x <= minX) { this.x = minX; this.direcao = 1; }
      if (this.x >= maxX) { this.x = maxX; this.direcao = -1; }
      
      // Leve sobe-e-desce para não ficar "duro"
      this.y = this.yAlvo + Math.sin(this.tempo * 1.5) * 12;
      
      // 3) Troca de padrão a cada 4,5 s
      this.tempoPadrao += ms;
      if (this.tempoPadrao >= 4500) {
         this.tempoPadrao = 0;
         this.indicePadrao = (this.indicePadrao + 1) % this.padroes.length;
         this.recarga = 600;
      }
      
      // 4) Ataque
      this.recarga -= ms;
      if (this.recarga <= 0) this.recarga = this.atacar(furia);
   },
   // Dispara conforme o padrão atual e devolve o tempo (ms) até o
   // próximo disparo. Em fúria o intervalo diminui (x 0,7).
   atacar: function(furia) {
      var f = furia ? 0.7 : 1;
      var padrao = this.padroes[this.indicePadrao];
      var v = this.config.velTiroInimigo;
      var cx = this.x + this.largura / 2;
      var cy = this.y + 28 * this.escala;      // "barriga" do boss
      
      // Leque: vários tiros abertos para baixo
      if (padrao == 'leque') {
         var n = this.config.numero >= 3 ? 7 : 5;
         var abertura = 70;                      // graus no total
         for (var i = 0; i < n; i++) {
            var graus = 90 - abertura / 2 + abertura * i / (n - 1);
            this.dispararAngulo(cx, cy, graus, v);
         }
         return 1400 * f;
      }
      
      // Mirado: tiro direto na nave
      if (padrao == 'mirado') {
         var dx = this.alvo.x + this.alvo.largura / 2 - cx;
         var dy = this.alvo.y + this.alvo.altura / 2 - cy;
         var graus = Math.atan2(dy, dx) * 180 / Math.PI;
         this.dispararAngulo(cx, cy, graus, v * 1.15);
         return 450 * f;
      }
      
      // Varredura: tiros seguidos num ângulo que vai e volta
      var graus = 90 + 65 * Math.sin(this.tempo * 3.5);
      this.dispararAngulo(cx, cy, graus, v * 0.9);
      return 140 * f;
   },
   // 90 graus = para baixo, 0 = direita, 180 = esquerda
   dispararAngulo: function(x, y, graus, velocidade) {
      var rad = graus * Math.PI / 180;
      var tiro = new TiroInimigo(this.context, x, y,
                                 Math.cos(rad) * velocidade,
                                 Math.sin(rad) * velocidade);
      this.animacao.novoSprite(tiro);
      this.colisor.novoSprite(tiro);
   },
   desenhar: function() {
      this.spritesheet.desenhar(this.x, this.y);
      
      if (this.brilho > 0) {
         var ctx = this.context;
         ctx.save();
         ctx.globalCompositeOperation = 'lighter';
         ctx.globalAlpha = 0.5;
         this.spritesheet.desenhar(this.x, this.y);
         ctx.restore();
      }
      
      this.spritesheet.proximoQuadro();
      this.desenharBarra();
   },
   desenharBarra: function() {
      var ctx = this.context;
      var w = Math.min(420, ctx.canvas.width * 0.6);
      var h = 12;
      var x = (ctx.canvas.width - w) / 2;
      var y = 62;
      var fracao = Math.max(0, this.vida / this.vidaMax);
      var furia = this.vida <= this.vidaMax / 2;
      
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 12, 0.7)';
      ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
      ctx.fillStyle = furia ? '#ff4d5e' : '#ff9a3c';
      ctx.fillRect(x, y, w * fracao, h);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
      ctx.restore();
   },
   retangulosColisao: function() {
      var s = this.escala;
      return [
         // corpo central e asas (medidas no quadro de 32x32)
         {x: this.x + 11 * s, y: this.y + 5 * s,  largura: 10 * s, altura: 23 * s},
         {x: this.x + 6 * s,  y: this.y + 12 * s, largura: 20 * s, altura: 12 * s}
      ];
   },
   colidiuCom: function(outro) {
      if (! (outro instanceof Tiro) || this.morto || outro.usado) return;
      
      outro.usado = true;
      this.animacao.excluirSprite(outro);
      this.colisor.excluirSprite(outro);
      
      // Enquanto está entrando, o tiro é absorvido sem dano
      if (! this.entrou) return;
      
      this.vida--;
      this.brilho = 70;
      if (this.vida <= 0) this.morrer();
   },
   morrer: function() {
      if (this.morto) return;
      this.morto = true;
      
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
      
      // Várias explosões espalhadas pelo corpo
      for (var i = 0; i < 5; i++) {
         var ex = this.x + Math.random() * this.largura;
         var ey = this.y + Math.random() * this.altura;
         this.animacao.novoSprite(
            new Explosao(this.context, this.imgExplosao, ex, ey));
      }
      
      if (this.aoMorrer) this.aoMorrer(this);
   }
}
