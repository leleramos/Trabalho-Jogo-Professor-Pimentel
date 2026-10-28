// ===== Sistema de Áudio =====
var musicaAcao, somLigado = true;

function tocar(audio) {
   var p = audio.play();
   if (p && p.catch) p.catch(function() {});
}

function pararMusica() {
   if (!musicaAcao) return;
   musicaAcao.pause();
   musicaAcao.currentTime = 0.0;
}

function alternarSom() {
   somLigado = !somLigado;
   if (musicaAcao) musicaAcao.muted = !somLigado;
   if (typeof SOM_TIRO !== 'undefined') SOM_TIRO.muted = !somLigado;
   if (typeof SOM_EXPLOSAO !== 'undefined') SOM_EXPLOSAO.muted = !somLigado;
   if (typeof Interface !== 'undefined') Interface.rotuloSom(somLigado);

   if (somLigado && typeof estado !== 'undefined' && estado.esta(Estado.JOGANDO)) {
      tocar(musicaAcao);
   }
}

function carregarMusicas() {
   musicaAcao = new Audio();
   musicaAcao.src = 'snd/musica-acao.mp3';
   musicaAcao.volume = 0.8;
   musicaAcao.loop = true;
   musicaAcao.load();
}