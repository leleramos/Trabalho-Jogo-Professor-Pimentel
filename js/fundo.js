// Camada de fundo que rola na vertical e se repete (mosaico) nos
// dois sentidos até cobrir a tela inteira, em qualquer tamanho.
// 'escala' amplia o pixel art (use número inteiro para ficar nítido).
function Fundo(context, imagem, escala) {
   this.context = context;
   this.imagem = imagem;
   this.escala = escala || 1;
   this.velocidade = 0;
   this.posicaoEmenda = 0;
}
Fundo.prototype = {
   atualizar: function() {
      var altura = this.imagem.height * this.escala;
      if (! altura) return;
      
      this.posicaoEmenda += 
         this.velocidade * this.animacao.decorrido / 1000;
      
      // Passou de uma imagem inteira: volta ao começo sem "pulo"
      if (this.posicaoEmenda >= altura)
         this.posicaoEmenda -= altura;
   },
   desenhar: function() {
      var ctx = this.context;
      var img = this.imagem;
      var w = img.width * this.escala;
      var h = img.height * this.escala;
      
      // Imagem ainda não carregou: evita laço infinito
      if (! w || ! h) return;
      
      // Posição inteira evita linhas finas entre as cópias
      var base = Math.round(this.posicaoEmenda);
      
      for (var y = base - h; y < ctx.canvas.height; y += h)
         for (var x = 0; x < ctx.canvas.width; x += w)
            ctx.drawImage(img, x, y, w, h);
   }
}
