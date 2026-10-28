// ===== Configuração das fases =====
// Tudo o que muda de uma fase para outra fica AQUI. Para deixar o jogo
// mais fácil ou mais difícil, basta mexer neste arquivo.
//
// Como funciona o jogo:
//   1. O jogador derruba um certo número de naves ("abates");
//   2. Aparece o boss da fase;
//   3. Derrotando o boss, começa a fase seguinte (mais difícil).

// Pastas de cenário dentro de img/fundos/ (o cenário troca a cada fase)
var CENARIOS = ['01_deep_blue_void', '04_toxic_green', '07_black_hole'];

function configFase(numero) {
   var n = numero - 1;           // 0 na primeira fase
   var d = Math.min(n, 8);       // dificuldade: para de subir na fase 9
   
   // Tipos de inimigo que aparecem e o "peso" (chance) de cada um.
   // Os tipos novos vão entrando conforme as fases avançam.
   var tipos = [ ['reto', 100] ];
   if (numero >= 2) tipos = [ ['reto', 60], ['zigue', 40] ];
   if (numero >= 3) tipos = [ ['reto', 40], ['zigue', 30], ['blindado', 30] ];
   if (numero >= 4) tipos = [ ['reto', 30], ['zigue', 25],
                              ['blindado', 20], ['atirador', 25] ];
   
   return {
      numero: numero,
      cenario: n % CENARIOS.length,
      tipos: tipos,
      
      // --- Naves comuns ---
      intervalo: 750 - d * 50,           // ms entre uma nave e outra
      velMin: 300 + d * 25,              // velocidade (px/s)
      velMax: 550 + d * 55,
      maxNaves: 6 + d,                   // limite de naves na tela
      maxAtiradores: 2 + Math.floor(d / 3),
      cadenciaAtirador: 1800 - d * 100,  // ms entre tiros do atirador
      velTiroInimigo: 300 + d * 20,      // velocidade dos tiros inimigos
      abates: Math.min(10 + n * 4, 40),  // naves a derrubar antes do boss
      
      // --- Boss ---
      vidaBoss: Math.min(30 + n * 15, 120),
      velBoss: 140 + d * 15,
      pontosBoss: 200 * numero
   };
}

// Sorteia o tipo de inimigo respeitando os pesos da fase
function sortearTipo(config) {
   var total = 0;
   for (var i = 0; i < config.tipos.length; i++)
      total += config.tipos[i][1];
   
   var sorteio = Math.random() * total;
   for (var i = 0; i < config.tipos.length; i++) {
      sorteio -= config.tipos[i][1];
      if (sorteio < 0) return config.tipos[i][0];
   }
   return config.tipos[0][0];
}

// Cria uma cópia colorida de uma imagem (mantém a transparência).
// Serve para diferenciar os tipos de inimigo usando um único sprite.
function tingir(imagem, cor) {
   var c = document.createElement('canvas');
   c.width = imagem.width;
   c.height = imagem.height;
   var g = c.getContext('2d');
   g.drawImage(imagem, 0, 0);
   g.globalCompositeOperation = 'source-atop';   // só pinta onde há pixel
   g.fillStyle = cor;
   g.fillRect(0, 0, c.width, c.height);
   return c;
}
