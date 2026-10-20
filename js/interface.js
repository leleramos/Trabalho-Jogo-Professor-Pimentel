// ===== Interface em DOM (fora do canvas) =====
// Overlays (menu, pausa, game over), HUD e botão de som.
// Os botões têm data-acao="..." e chamam Interface.aoAcao(acao),
// que é definida no index.html (assim a Interface não conhece o jogo).
var Interface = {
   telas: {},
   ultimo: {pontos: null, vidas: null, fase: null},
   aoAcao: null,
   
   iniciar: function() {
      this.telas[Estado.MENU] = document.getElementById('tela-menu');
      this.telas[Estado.PAUSADO] = document.getElementById('tela-pausa');
      this.telas[Estado.GAMEOVER] = document.getElementById('tela-gameover');
      this.hud = document.getElementById('hud');
      this.elPontos = document.getElementById('hud-pontos');
      this.elVidas = document.getElementById('hud-vidas');
      this.elFase = document.getElementById('hud-fase');
      this.elBarra = document.getElementById('barra-preenchida');
      this.elPercentual = document.getElementById('carregando-pct');
      this.elCarregando = document.getElementById('bloco-carregando');
      this.btnJogar = document.getElementById('btn-jogar');
      this.elFinal = document.getElementById('pontuacao-final');
      this.btnSom = document.getElementById('btn-som');
      
      var self = this;
      var botoes = document.querySelectorAll('[data-acao]');
      for (var i = 0; i < botoes.length; i++) {
         botoes[i].addEventListener('click', function() {
            // Tira o foco: senão ENTER/ESPAÇO "clicam" o botão de novo
            this.blur();
            if (self.aoAcao) self.aoAcao(this.getAttribute('data-acao'));
         });
      }
   },
   
   // Mostra só a tela do estado atual (JOGANDO = nenhuma tela)
   mostrarTela: function(estado) {
      for (var e in this.telas)
         this.telas[e].classList.toggle('visivel', e === estado);
      
      var comHud = (estado === Estado.JOGANDO || estado === Estado.PAUSADO);
      this.hud.classList.toggle('visivel', comHud);
      
      if (document.activeElement) document.activeElement.blur();
   },
   
   // ----- Carregamento (tela de menu) -----
   progresso: function(fracao) {
      var pct = Math.round(fracao * 100);
      this.elBarra.style.width = pct + '%';
      this.elPercentual.textContent = pct + '%';
   },
   liberarJogar: function() {
      this.elCarregando.classList.add('oculto');
      this.btnJogar.classList.remove('oculto');
   },
   
   // ----- HUD (só mexe no DOM quando o valor muda) -----
   atualizarHUD: function(pontos, vidas, fase) {
      var u = this.ultimo;
      if (pontos !== u.pontos) {
         this.elPontos.textContent = pontos;
         u.pontos = pontos;
      }
      if (vidas !== u.vidas) {
         var s = '';
         for (var i = 0; i < vidas; i++) s += '\u2665 ';
         this.elVidas.textContent = s || '-';
         u.vidas = vidas;
      }
      if (fase !== u.fase) {
         this.elFase.textContent = fase;
         u.fase = fase;
      }
   },
   
   pontuacaoFinal: function(pontos) {
      this.elFinal.textContent = pontos;
   },
   
   rotuloSom: function(ligado) {
      this.btnSom.textContent = ligado ? 'SOM: LIGADO' : 'SOM: DESLIGADO';
   }
};
