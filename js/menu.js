// Telas de menu desenhadas no canvas:
//   'carregando' -> título + barra de progresso
//   'pronto'     -> título + "Pressione ENTER para jogar"
//   'gameover'   -> "GAME OVER" + pontuação + "jogar novamente"
//
// O menu tem o seu próprio laço de animação, que só roda enquanto
// ele está aberto (o jogo em si usa o laço da classe Animacao).
function Menu(context) {
   this.context = context;
   this.ativo = false;
   this.modo = 'carregando';
   
   this.alvo = 0;          // progresso real do carregamento (0 a 1)
   this.progresso = 0;     // progresso mostrado (suavizado)
   this.pontuacao = 0;     // mostrada na tela de Game Over
   
   this.camadas = null;    // camadas de fundo (depois de carregadas)
   this.imgNave = null;    // spritesheet da nave (enfeite do título)
   
   this.idLoop = null;
   this.ultimoQuadro = 0;
   this.inicio = 0;        // instante em que a tela atual abriu
   
   // Estrelas desenhadas por código, para ter fundo já no carregamento
   // (posições em fração da tela, para valer em qualquer tamanho)
   this.estrelas = [];
   for (var i = 0; i < 140; i++) {
      this.estrelas.push({
         x: Math.random(),
         y: Math.random(),
         v: 0.01 + Math.random() * 0.05,
         tamanho: Math.random() < 0.15 ? 2 : 1,
         fase: Math.random() * 6.28
      });
   }
}
Menu.prototype = {
   abrir: function(modo) {
      this.modo = modo;
      if (modo == 'carregando') {
         this.alvo = 0;
         this.progresso = 0;
      }
      this.ativo = true;
      this.ultimoQuadro = 0;
      this.inicio = new Date().getTime();
      
      // Garante que exista só um laço rodando
      if (this.idLoop) cancelAnimationFrame(this.idLoop);
      var menu = this;
      this.idLoop = requestAnimationFrame(function() {
         menu.quadro();
      });
   },
   fechar: function() {
      this.ativo = false;
      if (this.idLoop) cancelAnimationFrame(this.idLoop);
      this.idLoop = null;
   },
   quadro: function() {
      if (! this.ativo) return;
      
      var agora = new Date().getTime();
      var decorrido = this.ultimoQuadro ? 
         Math.min(agora - this.ultimoQuadro, 100) : 16;
      this.ultimoQuadro = agora;
      
      this.atualizar(decorrido, agora);
      this.desenhar(decorrido, agora);
      
      var menu = this;
      this.idLoop = requestAnimationFrame(function() {
         menu.quadro();
      });
   },
   atualizar: function(decorrido, agora) {
      // A barra "persegue" o valor real, para encher de forma suave
      this.progresso += 
         (this.alvo - this.progresso) * Math.min(1, decorrido / 150);
      
      // Terminou de carregar: troca para a tela inicial
      if (this.modo == 'carregando' && this.alvo >= 1 && 
          this.progresso > 0.995) {
         this.progresso = 1;
         this.modo = 'pronto';
         this.inicio = agora;
      }
   },
   desenhar: function(decorrido, agora) {
      var ctx = this.context;
      var W = ctx.canvas.width;
      var H = ctx.canvas.height;
      var cx = W / 2;
      
      this.desenharFundo(decorrido, agora, W, H);
      
      // Escurece um pouco para o texto ter boa leitura
      ctx.fillStyle = 'rgba(0, 0, 12, 0.35)';
      ctx.fillRect(0, 0, W, H);
      
      ctx.save();
      
      // Entrada suave (fade-in) sempre que a tela troca
      ctx.globalAlpha = Math.min(1, (agora - this.inicio) / 600);
      
      // ----- Título -----
      var tam = Math.max(28, Math.min(W * 0.085, H * 0.14, 110));
      if (this.modo == 'gameover') {
         this.titulo('GAME OVER', null, cx, H * 0.26, tam * 0.9,
                     '#ffe1e1', '#ff4d5e', '#ff2d45');
      }
      else {
         this.titulo('VANGUARDA', 'ESTELAR', cx, H * 0.22, tam,
                     '#ffffff', '#5ec8ff', '#2bb4ff');
      }
      
      // ----- Centro: nave (título) ou pontuação (Game Over) -----
      if (this.modo == 'gameover') {
         this.texto('PONTUAÇÃO', cx, H * 0.47, 18, '#9fb4d0', 6);
         this.texto(String(this.pontuacao), cx, H * 0.47 + tam * 0.75,
                    tam * 0.8, '#ffffff', 4);
      }
      else {
         this.desenharNave(cx, H * 0.5, agora);
      }
      
      // ----- Parte de baixo: barra ou convite para jogar -----
      if (this.modo == 'carregando')
         this.desenharBarra(cx, H * 0.74, W);
      else
         this.desenharConvite(cx, H * 0.74, W, agora);
      
      // ----- Comandos -----
      if (this.modo != 'carregando') {
         this.texto('SETAS  MOVER        ESPAÇO  ATIRAR        ENTER  PAUSAR',
                    cx, H - 40, Math.max(11, Math.min(15, W * 0.012)), 
                    '#7d93b3', 2);
      }
      
      ctx.restore();
   },
   desenharFundo: function(decorrido, agora, W, H) {
      var ctx = this.context;
      
      // Fundo do jogo (camadas com parallax), quando já carregado
      if (this.camadas) {
         this.camadas[0].animacao.decorrido = decorrido;
         for (var i in this.camadas) {
            this.camadas[i].atualizar();
            this.camadas[i].desenhar();
         }
         return;
      }
      
      // Enquanto carrega: degradê + estrelas desenhadas por código
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#02020a');
      g.addColorStop(1, '#0b0b24');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      
      ctx.save();
      ctx.fillStyle = 'white';
      for (var i in this.estrelas) {
         var e = this.estrelas[i];
         e.y += e.v * decorrido / 1000;
         if (e.y > 1) e.y = 0;
         
         // Cintilar
         ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(agora / 700 + e.fase));
         ctx.fillRect(Math.floor(e.x * W), Math.floor(e.y * H), 
                      e.tamanho, e.tamanho);
      }
      ctx.restore();
   },
   titulo: function(linha1, linha2, cx, y, tam, corTopo, corBase, brilho) {
      var ctx = this.context;
      var linhas = linha2 ? [linha1, linha2] : [linha1];
      
      ctx.save();
      ctx.shadowColor = brilho;
      ctx.shadowBlur = tam * 0.35;
      
      for (var i = 0; i < linhas.length; i++) {
         var yLinha = y + i * tam * 1.05;
         var g = ctx.createLinearGradient(0, yLinha - tam / 2, 
                                          0, yLinha + tam / 2);
         g.addColorStop(0, corTopo);
         g.addColorStop(1, corBase);
         this.texto(linhas[i], cx, yLinha, tam, g, tam * 0.08);
      }
      ctx.restore();
   },
   desenharNave: function(cx, y, agora) {
      var img = this.imgNave;
      if (! img || ! img.complete || ! img.naturalWidth) return;
      
      // Quadro central (nave reta) do spritesheet de 5 quadros
      var largura = img.naturalWidth / 5;
      var altura = img.naturalHeight;
      var escala = 4;
      var balanco = Math.sin(agora / 500) * 8;
      
      this.context.drawImage(img, 2 * largura, 0, largura, altura,
                             Math.round(cx - largura * escala / 2), 
                             Math.round(y + balanco), 
                             largura * escala, altura * escala);
   },
   desenharBarra: function(cx, y, W) {
      var ctx = this.context;
      var w = Math.min(440, W * 0.7);
      var h = 16;
      var x = cx - w / 2;
      
      this.texto('CARREGANDO  ' + Math.round(this.progresso * 100) + '%',
                 cx, y - 26, 14, '#9fb4d0', 4);
      
      // Moldura
      this.retanguloArredondado(x, y, w, h, 8);
      ctx.fillStyle = 'rgba(10, 20, 50, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(120, 200, 255, 0.85)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Preenchimento (cortado nas bordas arredondadas)
      var largura = (w - 8) * this.progresso;
      if (largura > 0) {
         ctx.save();
         this.retanguloArredondado(x + 4, y + 4, w - 8, h - 8, 4);
         ctx.clip();
         
         var g = ctx.createLinearGradient(x, 0, x + w, 0);
         g.addColorStop(0, '#2b7bff');
         g.addColorStop(1, '#5ee0ff');
         ctx.fillStyle = g;
         ctx.fillRect(x + 4, y + 4, largura, h - 8);
         
         // Divisões para lembrar o estilo pixel art
         ctx.fillStyle = 'rgba(0, 0, 20, 0.3)';
         for (var d = x + 16; d < x + 4 + largura; d += 12)
            ctx.fillRect(d, y + 4, 2, h - 8);
         
         ctx.restore();
      }
   },
   desenharConvite: function(cx, y, W, agora) {
      var ctx = this.context;
      var tam = Math.max(16, Math.min(26, W * 0.03));
      var texto = this.modo == 'gameover' ? 
         'PRESSIONE ENTER PARA JOGAR NOVAMENTE' : 
         'PRESSIONE ENTER PARA JOGAR';
      
      // Texto pulsando
      ctx.save();
      ctx.globalAlpha *= 0.55 + 0.45 * Math.sin(agora / 350);
      ctx.shadowColor = '#2bb4ff';
      ctx.shadowBlur = 12;
      this.texto(texto, cx, y, tam, '#ffffff', 4);
      ctx.restore();
      
      this.texto('ou clique na tela', cx, y + tam * 1.6, 
                 Math.max(11, tam * 0.55), '#9fb4d0', 2);
   },
   texto: function(texto, x, y, tamanho, cor, espacamento) {
      var ctx = this.context;
      ctx.font = 'bold ' + tamanho + 'px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Espaço entre letras (não existe em navegadores muito antigos)
      if ('letterSpacing' in ctx)
         ctx.letterSpacing = (espacamento || 0) + 'px';
      
      ctx.fillStyle = cor;
      ctx.fillText(texto, x, y);
   },
   retanguloArredondado: function(x, y, w, h, r) {
      var ctx = this.context;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
   }
}
