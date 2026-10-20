// Controla o andamento do jogo. É um "processamento" da Animacao
// (tem processar(), chamado a cada quadro) e passa por estas etapas:
//
//   intro  -> mostra "FASE N" por uns instantes
//   combate-> cria naves até o jogador derrubar o número de abates da fase
//   alerta -> avisa que o boss vem aí
//   boss   -> luta contra o chefe
//   vitoria-> "FASE COMPLETA" e começa a fase seguinte
//
// Todo o tempo é somado a partir de animacao.decorrido, então tudo
// pausa certinho quando o jogador pausa o jogo.
function GerenciadorFases(context, imagens, nave, painel, colisor) {
   this.context = context;
   this.imagens = imagens;
   this.nave = nave;
   this.painel = painel;
   this.colisor = colisor;
   
   this.config = null;
   this.estado = 'intro';
   this.tempoEstado = 0;     // ms no estado atual
   this.tempoCriacao = 0;    // ms desde a última nave criada
   this.abatidos = 0;        // naves derrubadas nesta fase
   this.boss = null;
   
   // Definida no index.html: troca as camadas de fundo
   this.aoMudarCenario = null;
   
   // Uma versão colorida do inimigo para cada tipo
   this.imgOvni = {
      reto:     imagens.ovni,
      zigue:    tingir(imagens.ovni, 'rgba(255, 210, 0, 0.45)'),
      blindado: tingir(imagens.ovni, 'rgba(190, 80, 255, 0.50)'),
      atirador: tingir(imagens.ovni, 'rgba(255, 50, 60, 0.50)')
   };
}
GerenciadorFases.prototype = {
   // Volta para a fase 1 (usado ao começar uma partida nova)
   reiniciar: function() {
      this.boss = null;
      this.iniciarFase(1);
   },
   iniciarFase: function(numero) {
      this.config = configFase(numero);
      this.painel.fase = numero;
      this.abatidos = 0;
      this.tempoCriacao = 0;
      this.boss = null;
      this.mudarEstado('intro');
      
      if (this.aoMudarCenario) this.aoMudarCenario(this.config.cenario);
      this.aviso('FASE ' + numero, 2000);
   },
   mudarEstado: function(novo) {
      this.estado = novo;
      this.tempoEstado = 0;
   },
   aviso: function(texto, duracao, cor) {
      this.animacao.novoSprite(new Aviso(this.context, texto, duracao, cor));
   },
   
   processar: function() {
      var ms = this.animacao.decorrido;
      this.tempoEstado += ms;
      
      if (this.estado == 'intro') {
         if (this.tempoEstado >= 2000) this.mudarEstado('combate');
      }
      else if (this.estado == 'combate') {
         this.tempoCriacao += ms;
         if (this.tempoCriacao >= this.config.intervalo) {
            this.tempoCriacao = 0;
            this.novoOvni();
         }
         
         if (this.abatidos >= this.config.abates) {
            this.mudarEstado('alerta');
            this.aviso('ALERTA: CHEFE SE APROXIMA', 2400, '#ff4d5e');
         }
      }
      else if (this.estado == 'alerta') {
         if (this.tempoEstado >= 2500) {
            this.invocarBoss();
            this.mudarEstado('boss');
         }
      }
      else if (this.estado == 'vitoria') {
         if (this.tempoEstado >= 3500)
            this.iniciarFase(this.config.numero + 1);
      }
      // estado 'boss': espera o aoMorrer do boss
   },
   
   contar: function(tipo) {
      var total = 0;
      for (var i in this.animacao.sprites) {
         var s = this.animacao.sprites[i];
         if (s instanceof Ovni && (! tipo || s.tipo == tipo)) total++;
      }
      return total;
   },
   
   novoOvni: function() {
      var cfg = this.config;
      
      // Não deixa a tela lotar
      if (this.contar() >= cfg.maxNaves) return;
      
      var tipo = sortearTipo(cfg);
      // Limite de atiradores ao mesmo tempo
      if (tipo == 'atirador' && this.contar('atirador') >= cfg.maxAtiradores)
         tipo = 'reto';
      
      var canvas = this.context.canvas;
      var ovni = new Ovni(this.context, this.imgOvni[tipo], 
                          this.imagens.explosao, tipo);
      
      ovni.velocidade = Math.floor(
         cfg.velMin + Math.random() * (cfg.velMax - cfg.velMin + 1) );
      ovni.cadencia = cfg.cadenciaAtirador;
      ovni.velTiro = cfg.velTiroInimigo;
      ovni.alvo = this.nave;
      
      // Média de dois sorteios: as naves nascem mais perto do meio
      var sorteio = (Math.random() + Math.random()) / 2;
      ovni.x = Math.floor(sorteio * (canvas.width - ovni.largura + 1));
      ovni.xBase = ovni.x;
      ovni.y = -ovni.altura;
      
      // Quando morre: só conta (pontos e abates) se foi por tiro
      var gerenciador = this;
      ovni.aoMorrer = function(o, porTiro) {
         if (! porTiro) return;
         gerenciador.painel.pontuacao += o.pontos;
         gerenciador.abatidos++;
      };
      
      this.animacao.novoSprite(ovni);
      this.colisor.novoSprite(ovni);
   },
   
   invocarBoss: function() {
      var gerenciador = this;
      var boss = new Boss(this.context, this.imagens.boss,
                          this.imagens.explosao, this.config, this.nave);
      boss.aoMorrer = function() { gerenciador.bossDerrotado(); };
      this.boss = boss;
      
      this.animacao.novoSprite(boss);
      this.colisor.novoSprite(boss);
   },
   
   bossDerrotado: function() {
      this.painel.pontuacao += this.config.pontosBoss;
      this.boss = null;
      
      // Apaga os tiros inimigos que ainda estão na tela
      for (var i in this.animacao.sprites) {
         var s = this.animacao.sprites[i];
         if (s instanceof TiroInimigo) s.remover();
      }
      
      this.mudarEstado('vitoria');
      this.aviso('FASE ' + this.config.numero + ' COMPLETA', 3000);
   }
}
