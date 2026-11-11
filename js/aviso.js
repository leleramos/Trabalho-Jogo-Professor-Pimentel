// Texto grande que aparece no meio da tela por alguns segundos
// ("FASE 2", "ALERTA", ...). É um sprite como os outros: tem
// atualizar() e desenhar(), e some sozinho quando o tempo acaba.
function Aviso(context, texto, duracao, cor) {
   this.context = context;
   this.texto = texto;
   this.duracao = duracao;          // ms
   this.cor = cor || '#2bb4ff';
   this.tempo = 0;
}
Aviso.prototype = {
   atualizar: function() {
      this.tempo += this.animacao.decorrido;
      if (this.tempo >= this.duracao)
         this.animacao.excluirSprite(this);
   },
   desenhar: function() {
      var ctx = this.context;
      var canvas = ctx.canvas;
      var p = Math.min(this.tempo / this.duracao, 1);
      
      // Aparece rápido, fica, e some no final
      var alfa = 1;
      if (p < 0.15) alfa = p / 0.15;
      else if (p > 0.75) alfa = (1 - p) / 0.25;
      
      var tamanho = Math.max(24, Math.min(canvas.width * 0.07, 64));
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold ' + tamanho + 'px "Courier New", monospace';
      
      // Se o texto não couber na largura da tela, diminui a fonte
      var largura = ctx.measureText(this.texto).width;
      var maxima = canvas.width * 0.9;
      if (largura > maxima) {
         tamanho = Math.floor(tamanho * maxima / largura);
         ctx.font = 'bold ' + tamanho + 'px "Courier New", monospace';
      }
      
      ctx.shadowColor = this.cor;
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.texto, canvas.width / 2, canvas.height * 0.32);
      ctx.restore();
   }
}
