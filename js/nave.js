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
   this.grupo = 'jogador';
   
   // Começa com 3 vidas no total: a que está em uso + 2 extras
   this.vidasExtras = 2;
   
   this.destruida = false;   // true enquanto explode (evita perder 2 vidas)
   this.invulneravel = 0;    // ms restantes de proteção após renascer
   this.cadencia = 220;      // ms entre tiros enquanto ESPAÇO está pressionado
   this.recarga = 0;         // ms até poder atirar de novo
}
Nave.prototype = {
   atualizar: function() {
      var ms = this.animacao.decorrido;
      var incremento = this.velocidade * ms / 1000;
      var t = this.teclado;

      // Os tempos são descontados do 'decorrido' (e não do relógio),
      // por isso param quando o jogo está pausado
      if (this.invulneravel > 0) this.invulneravel -= ms;
      if (this.recarga > 0) this.recarga -= ms;

      // Calcula direção do movimento (normaliza diagonal)
      var dx = 0, dy = 0;
      if (t.pressionada(SETA_ESQUERDA) || t.pressionada(TECLA_A)) dx -= 1;
      if (t.pressionada(SETA_DIREITA) || t.pressionada(TECLA_D)) dx += 1;
      if (t.pressionada(SETA_ACIMA) || t.pressionada(TECLA_W)) dy -= 1;
      if (t.pressionada(SETA_ABAIXO) || t.pressionada(TECLA_S)) dy += 1;

      // Normaliza o vetor para evitar movimento mais rápido na diagonal
      if (dx !== 0 && dy !== 0) {
         var fator = 1 / Math.sqrt(2); // ~0.707
         dx *= fator;
         dy *= fator;
      }

      // Aplica movimento com clamp para não sair dos limites
      var canvas = this.context.canvas;
      if (dx !== 0) {
         this.x = Math.max(0, Math.min(canvas.width - this.largura, this.x + dx * incremento));
      }
      if (dy !== 0) {
         this.y = Math.max(0, Math.min(canvas.height - this.altura, this.y + dy * incremento));
      }

      // Segurar ESPAÇO = tiro automático (respeitando a cadência)
      if (t.pressionada(ESPACO) && this.recarga <= 0) {
         this.atirar();
         this.recarga = this.cadencia;
      }
   },
   desenhar: function() {
      // Quadro alvo: inclina ao virar, volta ao centro ao soltar
      var alvo = 2;
      var t = this.teclado;
      if (t.pressionada(SETA_ESQUERDA) || t.pressionada(TECLA_A)) 
         alvo = QUADRO_ESQUERDA;
      else if (t.pressionada(SETA_DIREITA) || t.pressionada(TECLA_D)) 
         alvo = QUADRO_DIREITA;
      
      // Passa um quadro de cada vez (inclinação suave)
      var agora = new Date().getTime();
      if (agora - this.ultimaTroca > 60) {
         if (this.quadro < alvo) this.quadro++;
         else if (this.quadro > alvo) this.quadro--;
         this.ultimaTroca = agora;
      }
      
      // Invulnerável: pisca (some e aparece a cada 100 ms)
      if (this.invulneravel > 0 && 
          Math.floor(this.invulneravel / 100) % 2 == 0)
         return;
      
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
      // O que machuca a nave: inimigos, o boss e os tiros inimigos
      var perigo = (outro instanceof Ovni) || (outro instanceof Boss) ||
                   (outro instanceof TiroInimigo);
      if (! perigo) return;
      
      // Já está explodindo, ou ainda protegida depois de renascer:
      // sem dano (e também não perde 2 vidas num mesmo quadro)
      if (this.destruida || this.invulneravel > 0) return;
      
      this.destruida = true;
      this.vidasExtras--;
      
      this.animacao.excluirSprite(this);
      this.colisor.excluirSprite(this);
      
      // Bater numa nave comum destrói a nave inimiga também
      // (sem pontos). O boss e os tiros não são afetados.
      if (outro instanceof Ovni) outro.destruir(false);
      
      var exp1 = new Explosao(this.context, this.imgExplosao,
                              this.x + this.largura / 2,
                              this.y + this.altura / 2);
      this.animacao.novoSprite(exp1);
      
      var nave = this;
      exp1.fimDaExplosao = function() {
         if (nave.vidasExtras < 0) {
            if (nave.acabaramVidas) nave.acabaramVidas();
         }
         else {
            // Recolocar a nave no engine, com proteção temporária
            nave.destruida = false;
            nave.invulneravel = 2000;
            nave.colisor.novoSprite(nave);
            nave.animacao.novoSprite(nave);
            
            nave.posicionar();
         }
      }
   },
   posicionar: function() {
      var canvas = this.context.canvas;
      this.x = canvas.width / 2 - this.largura / 2;
      this.y = canvas.height - this.altura;
   }
}
