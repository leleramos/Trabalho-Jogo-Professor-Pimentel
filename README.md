# Projeto do Professor Pimentel 
## Fazer um jogo
Este projeto serve para que façamos um jogo com o que fomos ensinados durante as aulas Principais linguagens serão Html, Css e JavaScript

## Créditos
- Sprites (nave, inimigos, explosões, tiros): **Pixel Shooter Essentials Kit** (itch.io) — conferir a licença e o nome do autor na página do pack e preencher aqui.
- Fundos: **Pixel Space Backgrounds (Free Sample)** por REEBOO Labs — https://reebo0.itch.io/pixel-space-backgrounds (licença em `img/fundos/LICENSE.txt`).
- Sons e estrutura base do código: modelo do Professor Pimentel.

## Como o jogo funciona (Pessoa 1 — motor do jogo)
- O jogador derruba um número de naves (**abates**); depois aparece o **boss** da fase. Derrotando o boss, começa a fase seguinte (mais difícil, com outro cenário).
- Tipos de inimigo: **reto** (verde), **zigue-zague** (amarelo), **blindado** (roxo, 3 tiros) e **atirador** (vermelho, mira na nave). Eles vão entrando conforme as fases avançam.
- O boss tem barra de vida, 3 padrões de ataque (leque, mirado e varredura) e entra em fúria com menos da metade da vida.
- A nave começa com 3 vidas, renasce protegida por 2 s e atira automaticamente enquanto o ESPAÇO estiver pressionado.
- **Para ajustar a dificuldade, edite só `js/fases.js`** (intervalo entre naves, velocidades, abates por fase, vida do boss...).
- Arquivos novos: `fases.js`, `gerenciador.js`, `boss.js`, `tiroinimigo.js`, `aviso.js`.
