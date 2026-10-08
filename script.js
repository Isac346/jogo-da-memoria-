// BANCO DE PERGUNTAS DO 6º ANO
const mathQuestions = [
    {
        id: "m1",
        icon: "📐",
        question: "Qual o perímetro de um quadrado com lado de 6 cm?",
        options: ["24 cm", "12 cm", "36 cm", "18 cm"],
        correctIndex: 0
    },
    {
        id: "m2",
        icon: "🍕",
        question: "Qual fração é equivalente a 1/2?",
        options: ["2/4", "3/5", "1/3", "4/6"],
        correctIndex: 0
    },
    {
        id: "m3",
        icon: "⚡",
        question: "Quanto é 2 elevado à 4ª potência (2⁴)?",
        options: ["16", "8", "6", "12"],
        correctIndex: 0
    },
    {
        id: "m4",
        icon: "🔢",
        question: "Qual é o M.M.C. (Mínimo Múltiplo Comum) entre 3 e 4?",
        options: ["12", "7", "6", "24"],
        correctIndex: 0
    },
    {
        id: "m5",
        icon: "💵",
        question: "Quanto dá a soma: R$ 2,50 + R$ 3,75?",
        options: ["R$ 6,25", "R$ 5,25", "R$ 6,00", "R$ 5,75"],
        correctIndex: 0
    },
    {
        id: "m6",
        icon: "➕",
        question: "Qual o resultado de: 10 + 5 × 2?",
        options: ["20", "30", "25", "17"],
        correctIndex: 0
    }
];

// ESTADO DO JOGO
let cards = [];
let flippedCards = [];
let score = 0;
let lives = 5;
let highScore = localStorage.getItem("math_memory_highscore") || 0;
let lockBoard = false;
let currentQuestion = null;
let currentPair = [];

// ELEMENTOS DO DOM
const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const highScoreElement = document.getElementById("high-score");
const restartBtn = document.getElementById("restart-btn");

const questionModal = document.getElementById("question-modal");
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const feedbackMsg = document.getElementById("feedback-msg");

const gameOverModal = document.getElementById("game-over-modal");
const gameOverTitle = document.getElementById("game-over-title");
const gameOverText = document.getElementById("game-over-text");
const gameOverIcon = document.getElementById("game-over-icon");
const finalScoreElement = document.getElementById("final-score");
const playAgainBtn = document.getElementById("play-again-btn");

// INICIALIZAR O JOGO
function initGame() {
    score = 0;
    lives = 5;
    flippedCards = [];
    lockBoard = false;

    scoreElement.textContent = score;
    livesElement.textContent = lives;
    highScoreElement.textContent = highScore;

    gameOverModal.classList.add("hidden");
    questionModal.classList.add("hidden");

    // Gerar Pares de Cartas
    const deck = [];
    mathQuestions.forEach(q => {
        deck.push({ ...q, cardId: q.id + "_a" });
        deck.push({ ...q, cardId: q.id + "_b" });
    });

    // Embaralhar as cartas
    cards = shuffleArray(deck);
    renderBoard();
}

// ALGORITMO FISHER-YATES PARA EMBARALHAR
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// RENDERIZAR O TABULEIRO
function renderBoard() {
    boardElement.innerHTML = "";
    cards.forEach((cardData, index) => {
        const cardNode = document.createElement("div");
        cardNode.classList.add("card");
        cardNode.dataset.index = index;

        cardNode.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">${cardData.icon}</div>
        `;

        cardNode.addEventListener("click", () => handleCardClick(cardNode, cardData));
        boardElement.appendChild(cardNode);
    });
}

// MANIPULAR CLIQUE NA CARTA
function handleCardClick(cardNode, cardData) {
    if (lockBoard) return;
    if (cardNode.classList.contains("flipped") || cardNode.classList.contains("matched")) return;

    cardNode.classList.add("flipped");
    flippedCards.push({ node: cardNode, data: cardData });

    if (flippedCards.length === 2) {
        checkMatch();
    }
}

// VERIFICAR PAR ENCONTRADO
function checkMatch() {
    lockBoard = true;
    const [card1, card2] = flippedCards;

    if (card1.data.id === card2.data.id) {
        // Encontrou um Par!
        currentPair = [card1.node, card2.node];
        currentQuestion = card1.data;
        setTimeout(() => {
            openQuestionModal(currentQuestion);
        }, 500);
    } else {
        // Errou o Par!
        setTimeout(() => {
            card1.node.classList.remove("flipped");
            card2.node.classList.remove("flipped");
            resetTurn();
        }, 1000);
    }
}

// ABRIR MODAL DA PERGUNTA COM OPÇÕES EMBARALHADAS
function openQuestionModal(qData) {
    questionText.textContent = qData.question;
    optionsContainer.innerHTML = "";
    feedbackMsg.classList.add("hidden");

    // Embaralhar opções mantendo o índice correto
    const shuffledOptions = qData.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === qData.correctIndex
    }));
    
    shuffleArray(shuffledOptions).forEach(option => {
        const btn = document.createElement("button");
        btn.classList.add("option-btn");
        btn.textContent = option.text;
        btn.addEventListener("click", () => handleAnswer(option.isCorrect, btn));
        optionsContainer.appendChild(btn);
    });

    questionModal.classList.remove("hidden");
}

// PROCESSAR A RESPOSTA DADA
function handleAnswer(isCorrect, selectedBtn) {
    const allBtns = optionsContainer.querySelectorAll(".option-btn");
    allBtns.forEach(btn => btn.style.pointerEvents = "none");

    if (isCorrect) {
        selectedBtn.classList.add("correct");
        score += 10;
        scoreElement.textContent = score;

        if (score > highScore) {
            highScore = score;
            localStorage.setItem("math_memory_highscore", highScore);
            highScoreElement.textContent = highScore;
        }

        currentPair.forEach(card => {
            card.classList.add("matched");
        });

        setTimeout(() => {
            questionModal.classList.add("hidden");
            resetTurn();
            checkWinCondition();
        }, 1200);

    } else {
        selectedBtn.classList.add("wrong");
        lives -= 1;
        livesElement.textContent = lives;

        setTimeout(() => {
            currentPair.forEach(card => card.classList.remove("flipped"));
            questionModal.classList.add("hidden");
            resetTurn();

            if (lives <= 0) {
                showGameOver(false);
            }
        }, 1200);
    }
}

// RESETAR TURNO
function resetTurn() {
    flippedCards = [];
    currentPair = [];
    lockBoard = false;
}

// VERIFICAR VITÓRIA
function checkWinCondition() {
    const matchedCards = document.querySelectorAll(".card.matched");
    if (matchedCards.length === cards.length) {
        showGameOver(true);
    }
}

// TELA FINAL (VITÓRIA OU GAME OVER)
function showGameOver(isWin) {
    if (isWin) {
        gameOverIcon.textContent = "🏆";
        gameOverTitle.textContent = "Excelente Trabalho!";
        gameOverText.textContent = "Você respondeu todas as perguntas do 6º Ano com sucesso!";
    } else {
        gameOverIcon.textContent = "💔";
        gameOverTitle.textContent = "Que Pena!";
        gameOverText.textContent = "Suas vidas acabaram. Treine mais um pouco e tente de novo!";
    }

    finalScoreElement.textContent = score;
    gameOverModal.classList.remove("hidden");
}

// EVENT LISTENERS
restartBtn.addEventListener("click", initGame);
playAgainBtn.addEventListener("click", initGame);

// INICIAR PRIMEIRA PARTIDA
initGame();
