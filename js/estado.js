// ===== Máquina de estados do jogo =====
// MENU -> JOGANDO <-> PAUSADO ; JOGANDO -> GAMEOVER ; JOGANDO -> VITORIA
// Cada estado tem: transições permitidas, ao entrar e ao sair.
var Estado = {
   MENU: 'menu',
   JOGANDO: 'jogando',
   PAUSADO: 'pausado',
   GAMEOVER: 'gameover',
   VITORIA: 'vitoria'
};

function MaquinaEstados() {
   this.atual = null;
   this.transicoes = {};   // estado -> lista de estados permitidos
   this.aoEntrar = {};     // estado -> function(anterior, dados)
   this.aoSair = {};       // estado -> function(proximo, dados)
}
MaquinaEstados.prototype = {
   permitir: function(de, para) {
      this.transicoes[de] = para;
   },
   esta: function(estado) {
      return this.atual === estado;
   },
   // 'dados' é opcional (ex.: {reiniciar: true})
   mudar: function(novo, dados) {
      var antigo = this.atual;
      
      if (antigo !== null) {
         // Transição inválida: ignora (evita bugs como pausar no menu)
         if ((this.transicoes[antigo] || []).indexOf(novo) < 0)
            return false;
         if (this.aoSair[antigo]) this.aoSair[antigo](novo, dados);
      }
      
      this.atual = novo;
      if (this.aoEntrar[novo]) this.aoEntrar[novo](antigo, dados);
      return true;
   }
};
