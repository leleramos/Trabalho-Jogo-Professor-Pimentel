// ===== Lógica Principal do Jogo =====
// canvas, context, ESCALA_FUNDO são definidos no index.html (inline script)
// Escala de dificuldade: referência 600px de altura para manter velocidade consistente
var DIFICULDADE_ESCALA = (typeof window !== 'undefined' && window.innerHeight)
   ? window.innerHeight / 600 : 1;

var imagens, animacao, teclado, colisor, nave, painel, gerenciador;
var camadasFundo = [];
var totalImagens = 0, carregadas = 0, carregado = false;
var TECLA_P = 'KeyP', TECLA_ESC = 'Escape';
var CAMADAS_FUNDO = ['layer1_far_stars.png', 'layer2_nebula.png',
                     'layer3_dust.png', 'layer4_celestial.png',
                     'layer5_near_stars.png'];
var VELOCIDADES_FUNDO = [10, 30, 60, 90, 160];

// ===== Interface + Máquina de estados =====
function iniciarJogo() {
   Interface.iniciar();
   estado = new MaquinaEstados();
   configurarEstados();
   estado.mudar(Estado.MENU);
}

Interface.aoAcao = function(acao) {
   if (acao == 'jogar')    estado.mudar(Estado.JOGANDO);
   if (acao == 'retomar')  estado.mudar(Estado.JOGANDO);
   if (acao == 'reiniciar') estado.mudar(Estado.JOGANDO, {reiniciar: true});
   if (acao == 'menu')     estado.mudar(Estado.MENU);
   if (acao == 'som')      alternarSom();
};

// Pausa sozinho se a aba perder o foco
document.addEventListener('visibilitychange', function() {
   if (document.hidden && estado.esta(Estado.JOGANDO))
      estado.mudar(Estado.PAUSADO);
});

function configurarEstados() {
   estado.permitir(Estado.MENU,     [Estado.JOGANDO]);
   estado.permitir(Estado.JOGANDO,  [Estado.PAUSADO, Estado.GAMEOVER, Estado.VITORIA]);
   estado.permitir(Estado.PAUSADO,  [Estado.JOGANDO, Estado.MENU]);
   estado.permitir(Estado.GAMEOVER, [Estado.JOGANDO, Estado.MENU]);
   estado.permitir(Estado.VITORIA,  [Estado.JOGANDO, Estado.MENU]);

   estado.aoEntrar[Estado.MENU] = function() {
      if (carregado) { animacao.desligar(); prepararPartida(); }
      pararMusica();
      Interface.mostrarTela(Estado.MENU);
      iniciarFundo();
   };

   estado.aoEntrar[Estado.JOGANDO] = function(anterior, dados) {
      // Menu, Game Over ou "Reiniciar" = partida nova; Pausa = retomar
      if (anterior != Estado.PAUSADO || (dados && dados.reiniciar)) {
         prepararPartida();
         if (musicaAcao) musicaAcao.currentTime = 0;
      }
      pararFundo();
      Interface.mostrarTela(Estado.JOGANDO);
      if (somLigado) tocar(musicaAcao);
      animacao.ligar();
   };

   estado.aoEntrar[Estado.PAUSADO] = function() {
      animacao.desligar();
      if (musicaAcao) musicaAcao.pause();
      Interface.mostrarTela(Estado.PAUSADO);
   };

   estado.aoEntrar[Estado.GAMEOVER] = function() {
      animacao.desligar();
      pararMusica();
      Interface.pontuacaoFinal(painel.pontuacao);
      prepararPartida();    // limpa a tela; nave pronta p/ nova partida
      Interface.mostrarTela(Estado.GAMEOVER);
      iniciarFundo();
   };

   estado.aoEntrar[Estado.VITORIA] = function() {
      animacao.desligar();
      pararMusica();
      Interface.vitoriaFinal(painel.pontuacao);
      Interface.mostrarTela(Estado.VITORIA);
      iniciarFundo();
   };
}

// Deixa tudo pronto para uma partida nova
function prepararPartida() {
   // Mantém só fundo, painel e nave (inimigos, tiros, explosões
   // e o futuro boss saem da tela)
   function manter(s) {
      return s === nave || s === painel || s instanceof Fundo;
   }
   animacao.sprites = animacao.sprites.filter(manter);
   colisor.sprites = colisor.sprites.filter(function(s) {
      return s === nave;
   });
   animacao.spritesExcluir = [];
   colisor.spritesExcluir = [];

   if (animacao.sprites.indexOf(nave) < 0) animacao.novoSprite(nave);
   if (colisor.sprites.indexOf(nave) < 0) colisor.novoSprite(nave);

   nave.vidasExtras = 2;       // 3 vidas no total
   nave.destruida = false;
   nave.invulneravel = 0;
   nave.recarga = 0;
   nave.quadro = 2;
   nave.posicionar();
   painel.pontuacao = 0;
   painel.ultimoExtraVida = 0;

   // Volta para a fase 1 (também zera painel.fase e o cenário)
   if (gerenciador) gerenciador.reiniciar();
}

// ===== Fundo animado enquanto há menu/game over =====
var idFundo = null, ultimoFundo = 0;
function iniciarFundo() {
   pararFundo();
   ultimoFundo = 0;
   idFundo = requestAnimationFrame(quadroFundo);
}
function pararFundo() {
   if (idFundo) cancelAnimationFrame(idFundo);
   idFundo = null;
}
function quadroFundo(agora) {
   var dt = ultimoFundo ? Math.min(agora - ultimoFundo, 100) : 16;
   ultimoFundo = agora;

   context.fillStyle = '#000';
   context.fillRect(0, 0, canvas.width, canvas.height);
   if (carregado) {
      animacao.decorrido = dt;
      for (var i = 0; i < camadasFundo.length; i++) {
         camadasFundo[i].atualizar();
         camadasFundo[i].desenhar();
      }
   }
   idFundo = requestAnimationFrame(quadroFundo);
}

// ===== Teclas =====
function teclaEnter() {
   if (estado.esta(Estado.JOGANDO)) estado.mudar(Estado.PAUSADO);
   else estado.mudar(Estado.JOGANDO);   // menu, pausa ou game over
}
function teclaPausa() {
   if (estado.esta(Estado.JOGANDO)) estado.mudar(Estado.PAUSADO);
   else if (estado.esta(Estado.PAUSADO)) estado.mudar(Estado.JOGANDO);
}
// (O tiro agora é tratado dentro da Nave: segurar ESPAÇO atira.)

// ===== Carregamento =====
function carregarImagens() {
   imagens = {
      nave:     'nave-pixel.png',
      ovni:     'inimigo-pixel.png',
      boss:     'boss-pixel.png',
      explosao: 'explosao-pixel.png',
      tiro:     'tiro-pixel.png'
   };
   // Camadas de fundo de todos os cenários: imagens['f0_0'] é o
   // cenário 0, camada 0; imagens['f1_3'] é o cenário 1, camada 3...
   for (var c = 0; c < CENARIOS.length; c++)
      for (var k = 0; k < CAMADAS_FUNDO.length; k++)
         imagens['f' + c + '_' + k] =
            'fundos/' + CENARIOS[c] + '/' + CAMADAS_FUNDO[k];
   for (var i in imagens) {
      var img = new Image();
      img.src = 'img/' + imagens[i];
      img.onload = carregando;
      totalImagens++;
      imagens[i] = img;
   }
}

function carregando() {
   carregadas++;
   Interface.progresso(carregadas / totalImagens);

   if (carregadas == totalImagens) {
      iniciarObjetos();
      carregado = true;
      teclado.disparou(ENTER, teclaEnter);
      teclado.disparou(TECLA_P, teclaPausa);
      teclado.disparou(TECLA_ESC, teclaPausa);
      Interface.liberarJogar();
   }
}

function iniciarObjetos() {
   animacao = new Animacao(context);
   teclado = new Teclado(document);
   // Clear pressed keys when window loses focus to prevent stuck keys
   window.addEventListener('blur', function() {
      teclado.pressionadas = [];
   });
   colisor = new Colisor();
   nave = new Nave(context, teclado, imagens.nave,
                   imagens.explosao, imagens.tiro);
   painel = new Painel(context, nave);

   // 5 camadas de fundo (cenário 0 no início; troca a cada fase)
   camadasFundo = [];
   for (var k = 0; k < CAMADAS_FUNDO.length; k++)
      camadasFundo.push(new Fundo(context, imagens['f0_' + k],
                                  ESCALA_FUNDO));
   for (var i = 0; i < camadasFundo.length; i++) animacao.novoSprite(camadasFundo[i]);
   animacao.novoSprite(painel);
   animacao.novoSprite(nave);

   colisor.novoSprite(nave);
   animacao.novoProcessamento(colisor);

   // O gerenciador cria os inimigos, chama o boss e troca de fase
   gerenciador = new GerenciadorFases(context, imagens, nave,
                                      painel, colisor);
   gerenciador.aoMudarCenario = trocarCenario;
   animacao.novoProcessamento(gerenciador);

   configuracoesIniciais();
}

function configuracoesIniciais() {
   for (var k = 0; k < camadasFundo.length; k++)
      camadasFundo[k].velocidade = VELOCIDADES_FUNDO[k];

   nave.posicionar();
   nave.velocidade = 400 * DIFICULDADE_ESCALA;

   // Game Over agora é uma transição da máquina de estados
   nave.acabaramVidas = function() {
      estado.mudar(Estado.GAMEOVER);
   }

   // (A pontuação agora é somada pelo próprio inimigo ao morrer:
   // cada tipo vale um número de pontos. Veja Ovni e Boss.)
}

// Troca o cenário de fundo (chamado pelo gerenciador a cada fase)
function trocarCenario(indice) {
   for (var k = 0; k < camadasFundo.length; k++)
      camadasFundo[k].imagem = imagens['f' + indice + '_' + k];
}