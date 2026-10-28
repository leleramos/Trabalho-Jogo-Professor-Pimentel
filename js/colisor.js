// Quem pode colidir com quem (veja gruposHostis)
var GRUPOS_HOSTIS = {
   'jogador':      ['inimigo', 'tiro-inimigo'],
   'tiro-jogador': ['inimigo'],
   'inimigo':      ['jogador', 'tiro-jogador'],
   'tiro-inimigo': ['jogador']
};

function Colisor() {
   this.sprites = [];
   this.aoColidir = null;
   this.spritesExcluir = [];
}
Colisor.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
      sprite.colisor = this;
   },
   processar: function() {
      // Cada par de sprites é testado uma única vez (o j começa depois
      // do i). Assim não precisamos mais guardar quem já foi testado.
      for (var i = 0; i < this.sprites.length; i++) {
         for (var j = i + 1; j < this.sprites.length; j++) {
            var a = this.sprites[i];
            var b = this.sprites[j];
            
            // Só testa quem pode se machucar (ex.: dois inimigos ou
            // dois tiros não precisam ser comparados)
            if (! this.gruposHostis(a.grupo, b.grupo)) continue;
            
            // Abstrair a colisão
            this.testarColisao(a, b);
         }
      }
      
      this.processarExclusoes();
   },
   // Cada sprite pode ter uma propriedade 'grupo'. Só colidem entre si
   // os grupos listados aqui. Sprite sem grupo colide com tudo.
   gruposHostis: function(g1, g2) {
      if (! g1 || ! g2) return true;
      return (GRUPOS_HOSTIS[g1] || []).indexOf(g2) >= 0;
   },
   testarColisao: function(sprite1, sprite2) {
      // Obter os retângulos de colisão de cada sprite
      var rets1 = sprite1.retangulosColisao();
      var rets2 = sprite2.retangulosColisao();
      var colidiu = false;

      // Testar as colisões entre eles
      colisoes:
      for (var i in rets1) {
         for (var j in rets2) {
            // Abstraindo a fórmula!
            if (this.retangulosColidem(rets1[i], rets2[j])) {
               // Eles colidem, vamos notificá-los
               sprite1.colidiuCom(sprite2);
               sprite2.colidiuCom(sprite1);
               
               // Tratador geral
               if (this.aoColidir) this.aoColidir(sprite1, sprite2);
               
               // Não precisa terminar de ver todos os retângulos
               break colisoes;
            }
         }
      }
   },
   retangulosColidem: function(ret1, ret2) {
      // Fórmula de interseção de retângulos
      return (ret1.x + ret1.largura) > ret2.x &&
             ret1.x < (ret2.x + ret2.largura) &&
             (ret1.y + ret1.altura) > ret2.y &&
             ret1.y < (ret2.y + ret2.altura);
   },
   excluirSprite: function(sprite) {
      this.spritesExcluir.push(sprite);
   },
   processarExclusoes: function() {
      // Criar um novo array
      var novoArray = [];
      
      // Adicionar somente os elementos não excluídos
      for (var i = 0; i < this.sprites.length; i++) {
         if (this.spritesExcluir.indexOf(this.sprites[i]) == -1)
            novoArray.push(this.sprites[i]);
      }
      
      // Limpar o array de exclusões
      this.spritesExcluir = [];
      
      // Substituir o array velho pelo novo
      this.sprites = novoArray;
   }
}
