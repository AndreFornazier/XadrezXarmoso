
// Não tem xeque, roque, en passant e essas coisas mais chatinhas.

const tabuleiroHTML = document.getElementById("tabuleiro");
const statusTexto = document.getElementById("status");
const reiniciarBtn = document.getElementById("reiniciarBtn");

//peças imagens 
const imagensDasPecas = {
  bP: "assets/bP.png",
  bT: "assets/bT.png",
  bC: "assets/bC.png",
  bB: "assets/bB.png",
  bR: "assets/bR.png",
  bRR: "assets/bRR.png",

  pP: "assets/pP.png",
  pT: "assets/pT.png",
  pC: "assets/pC.png",
  pB: "assets/pB.png",
  pR: "assets/pR.png",
  pRR: "assets/pRR.png"
};

// b = branca
// p = preta
// P = peão, T = torre, C = cavalo, B = bispo, R = rainha, RR = rei
let tabuleiro = [];

let vez = "b"; // começa nas brancas
let pecaSelecionada = null; // aqui guarda a peça que a pessoa clicou
let jogoAcabou = false; // isso aqui serve pra travar o jogo quando alguém ganhar 

function criarTabuleiroInicial() {
  // Essa função serve pra montar as peças no lugar inicial.
  // Deve funfar pq cada linha é uma parte do tabuleiro.
  tabuleiro = [
    ["pT", "pC", "pB", "pR", "pRR", "pB", "pC", "pT"],
    ["pP", "pP", "pP", "pP", "pP", "pP", "pP", "pP"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["bP", "bP", "bP", "bP", "bP", "bP", "bP", "bP"],
    ["bT", "bC", "bB", "bR", "bRR", "bB", "bC", "bT"]
  ];

  vez = "b";
  pecaSelecionada = null;
  jogoAcabou = false; // quando reinicia, o jogo volta a funcionar normal
  atualizarTextoDaVez();
  desenharTabuleiro();
}

function desenharTabuleiro() {
  // Essa função serve pra desenhar o tabuleiro na tela.
  // Toda vez que uma peça anda, eu limpo e desenho tudo de novo.
  tabuleiroHTML.innerHTML = "";

  for (let linha = 0; linha < 8; linha++) {
    for (let coluna = 0; coluna < 8; coluna++) {
      const casa = document.createElement("div");

      casa.classList.add("casa");

      // Isso aqui alterna casa clara e escura.
      // Se a soma da linha + coluna for par, fica clara.
      if ((linha + coluna) % 2 === 0) {
        casa.classList.add("clara");
      } else {
        casa.classList.add("escura");
      }

      casa.dataset.linha = linha;
      casa.dataset.coluna = coluna;

      const peca = tabuleiro[linha][coluna];

      if (peca !== "") {
        const img = document.createElement("img");
        img.src = imagensDasPecas[peca];
        img.alt = peca;
        img.classList.add("peca");
        casa.appendChild(img);
      }

      casa.addEventListener("click", clicarNaCasa);

      tabuleiroHTML.appendChild(casa);
    }
  }

  marcarCasaSelecionada();
}

function clicarNaCasa(evento) {
  // Essa função serve pra saber onde o jogador clicou.
  // currentTarget pega a casa certa, mesmo clicando na imagem da peça.

  // Se o jogo acabou, não deixa mexer mais nas peças.
  // Deve funfar pra travar tudo depois que o rei for capturado.
  if (jogoAcabou === true) {
    statusTexto.textContent = "O jogo já acabou. Clique em reiniciar.";
    return;
  }

  const casa = evento.currentTarget;
  const linha = Number(casa.dataset.linha);
  const coluna = Number(casa.dataset.coluna);
  const pecaClicada = tabuleiro[linha][coluna];

  // Se ainda não selecionei nada, tento selecionar uma peça.
  if (pecaSelecionada === null) {
    selecionarPeca(linha, coluna);
    return;
  }

  // Se eu cliquei em outra peça da minha cor, só troca a seleção.
  if (pecaClicada !== "" && pegarCor(pecaClicada) === vez) {
    selecionarPeca(linha, coluna);
    return;
  }

  // Se já tem peça selecionada, tento mover.
  moverPeca(linha, coluna);
}

function selecionarPeca(linha, coluna) {
  const peca = tabuleiro[linha][coluna];

  // Não deixa selecionar casa vazia.
  if (peca === "") {
    return;
  }

  // Não deixa mexer na peça do adversário.
  if (pegarCor(peca) !== vez) {
    mostrarMensagem("Não é a vez dessa peça.");
    return;
  }

  pecaSelecionada = { linha, coluna };
  desenharTabuleiro();
}

function moverPeca(linhaDestino, colunaDestino) {
  const linhaOrigem = pecaSelecionada.linha;
  const colunaOrigem = pecaSelecionada.coluna;
  const peca = tabuleiro[linhaOrigem][colunaOrigem];

  const movimentoPode = movimentoValido(
    peca,
    linhaOrigem,
    colunaOrigem,
    linhaDestino,
    colunaDestino
  );

  if (!movimentoPode) {
    mostrarMensagem("Movimento inválido, tenta outro.");
    pecaSelecionada = null;
    desenharTabuleiro();
    return;
  }

  // Aqui eu guardo a peça que estava no destino antes de mover.
  // Isso serve pra saber se a peça capturada foi o rei.
  // Acho que é o jeito mais simples de fazer a vitória.
  const pecaCapturada = tabuleiro[linhaDestino][colunaDestino];

  // Aqui move de verdade.
  tabuleiro[linhaDestino][colunaDestino] = peca;
  tabuleiro[linhaOrigem][colunaOrigem] = "";

  // Promoção simples: se o peão chegar no fim, vira rainha direto.
  // Acho que assim já resolve sem complicar muito.
  if (peca === "bP" && linhaDestino === 0) {
    tabuleiro[linhaDestino][colunaDestino] = "bR";
  }

  if (peca === "pP" && linhaDestino === 7) {
    tabuleiro[linhaDestino][colunaDestino] = "pR";
  }

  // Aqui eu vejo se alguém capturou o rei.
  // Se capturou o rei branco, as pretas ganham.
  // Se capturou o rei preto, as brancas ganham.
  if (pecaCapturada === "bRR") {
    jogoAcabou = true;
    pecaSelecionada = null;
    statusTexto.textContent = "Vitória das pretas! O rei branco foi capturado.";
    desenharTabuleiro();
    return;
  }

  if (pecaCapturada === "pRR") {
    jogoAcabou = true;
    pecaSelecionada = null;
    statusTexto.textContent = "Vitória das brancas! O rei preto foi capturado.";
    desenharTabuleiro();
    return;
  }

  pecaSelecionada = null;
  trocarVez();
  desenharTabuleiro();
}

function movimentoValido(peca, linhaOrigem, colunaOrigem, linhaDestino, colunaDestino) {
  // Essa função serve pra conferir se a peça pode andar desse jeito.
  // É a parte mais importante do JS, pq aqui fica a lógica do jogo.

  const destino = tabuleiro[linhaDestino][colunaDestino];

  // Se tiver uma peça da mesma cor no destino, não pode.
  if (destino !== "" && pegarCor(destino) === pegarCor(peca)) {
    return false;
  }

  const tipo = pegarTipo(peca);
  const diferencaLinha = linhaDestino - linhaOrigem;
  const diferencaColuna = colunaDestino - colunaOrigem;

  if (tipo === "P") {
    return movimentoPeao(peca, linhaOrigem, colunaOrigem, linhaDestino, colunaDestino);
  }

  if (tipo === "T") {
    // Torre anda reto. Ou muda linha, ou muda coluna.
    const andaReto = diferencaLinha === 0 || diferencaColuna === 0;
    return andaReto && caminhoLivre(linhaOrigem, colunaOrigem, linhaDestino, colunaDestino);
  }

  if (tipo === "B") {
    // Bispo anda na diagonal. A diferença da linha e coluna tem que bater.
    const andaDiagonal = Math.abs(diferencaLinha) === Math.abs(diferencaColuna);
    return andaDiagonal && caminhoLivre(linhaOrigem, colunaOrigem, linhaDestino, colunaDestino);
  }

  if (tipo === "R") {
    // Rainha anda igual torre + bispo.
    const andaReto = diferencaLinha === 0 || diferencaColuna === 0;
    const andaDiagonal = Math.abs(diferencaLinha) === Math.abs(diferencaColuna);
    return (andaReto || andaDiagonal) && caminhoLivre(linhaOrigem, colunaOrigem, linhaDestino, colunaDestino);
  }

  if (tipo === "RR") {
    // Rei anda só uma casinha pra qualquer lado.
    return Math.abs(diferencaLinha) <= 1 && Math.abs(diferencaColuna) <= 1;
  }

  if (tipo === "C") {
    // Cavalo anda em L.
    const movimento1 = Math.abs(diferencaLinha) === 2 && Math.abs(diferencaColuna) === 1;
    const movimento2 = Math.abs(diferencaLinha) === 1 && Math.abs(diferencaColuna) === 2;
    return movimento1 || movimento2;
  }

  return false;
}

function movimentoPeao(peca, linhaOrigem, colunaOrigem, linhaDestino, colunaDestino) {
  // Essa função serve só pro peão, pq ele é meio específico.
  const cor = pegarCor(peca);
  const direcao = cor === "b" ? -1 : 1;
  const linhaInicial = cor === "b" ? 6 : 1;

  const destino = tabuleiro[linhaDestino][colunaDestino];
  const diferencaLinha = linhaDestino - linhaOrigem;
  const diferencaColuna = colunaDestino - colunaOrigem;

  // Peão anda 1 casa pra frente se estiver vazio.
  if (diferencaColuna === 0 && diferencaLinha === direcao && destino === "") {
    return true;
  }

  // Peão anda 2 casas no primeiro movimento, se o caminho estiver livre.
  if (
    linhaOrigem === linhaInicial &&
    diferencaColuna === 0 &&
    diferencaLinha === direcao * 2 &&
    destino === ""
  ) {
    const linhaDoMeio = linhaOrigem + direcao;
    return tabuleiro[linhaDoMeio][colunaOrigem] === "";
  }

  // Peão captura na diagonal.
  if (
    Math.abs(diferencaColuna) === 1 &&
    diferencaLinha === direcao &&
    destino !== "" &&
    pegarCor(destino) !== cor
  ) {
    return true;
  }

  return false;
}

function caminhoLivre(linhaOrigem, colunaOrigem, linhaDestino, colunaDestino) {
  // Essa função serve pra ver se tem peça no meio do caminho.
  // Torre, bispo e rainha precisam disso. Cavalo não precisa pq ele pula.
  const passoLinha = Math.sign(linhaDestino - linhaOrigem);
  const passoColuna = Math.sign(colunaDestino - colunaOrigem);

  let linhaAtual = linhaOrigem + passoLinha;
  let colunaAtual = colunaOrigem + passoColuna;

  while (linhaAtual !== linhaDestino || colunaAtual !== colunaDestino) {
    if (tabuleiro[linhaAtual][colunaAtual] !== "") {
      return false;
    }

    linhaAtual += passoLinha;
    colunaAtual += passoColuna;
  }

  return true;
}

function pegarCor(peca) {
  // Essa função serve pra pegar a cor da peça.
  // Como o primeiro caractere é w ou b, fica fácil.
  return peca[0];
}

function pegarTipo(peca) {
  // Essa função serve pra pegar o tipo da peça.
  // O segundo caractere fala se é peão, torre, cavalo e etc.
  return peca[1];
}

function trocarVez() {
  // Essa função serve pra alternar a vez dos jogadores.
  vez = vez === "b" ? "p" : "b";
  atualizarTextoDaVez();
}

function atualizarTextoDaVez() {
  if (vez === "b") {
    statusTexto.textContent = "Vez das brancas";
  } else {
    statusTexto.textContent = "Vez das pretas";
  }
}

function mostrarMensagem(texto) {
  // Essa função só muda o texto lá em cima.
  // Fiz simples mesmo, sem pop-up.
  statusTexto.textContent = texto;

  setTimeout(() => {
    // Se o jogo ainda não acabou, volta a mostrar a vez normal.
    // Se acabou, não mexe na mensagem de vitória.
    if (jogoAcabou === false) {
      atualizarTextoDaVez();
    }
  }, 1200);
}

function marcarCasaSelecionada() {
  // Essa função serve pra pintar a casa selecionada.
  // Também marca alguns possíveis movimentos, pra ficar mais fácil de testar.
  if (pecaSelecionada === null) {
    return;
  }

  const casas = document.querySelectorAll(".casa");

  casas.forEach((casa) => {
    const linha = Number(casa.dataset.linha);
    const coluna = Number(casa.dataset.coluna);

    if (linha === pecaSelecionada.linha && coluna === pecaSelecionada.coluna) {
      casa.classList.add("selecionada");
      return;
    }

    const peca = tabuleiro[pecaSelecionada.linha][pecaSelecionada.coluna];

    if (movimentoValido(peca, pecaSelecionada.linha, pecaSelecionada.coluna, linha, coluna)) {
      casa.classList.add("movimento");
    }
  });
}

// Botão pra começar tudo de novo.
reiniciarBtn.addEventListener("click", criarTabuleiroInicial);

// Chama a função principal pra iniciar o jogo quando abre a página.
criarTabuleiroInicial();