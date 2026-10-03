import '../css/style.css';

const app = document.querySelector('#app');
const cardSymbols = ['☀️', '🌙', '⭐', '🌈', '🍀', '🍓', '🎈', '🎧'];
const state = {
  deck: [],
  firstCardId: null,
  locked: false,
  matchedCards: 0,
  moves: 0,
  pendingTurnId: null,
};

app.innerHTML = `
  <div class="page">
    <header class="header container">
      <a class="brand" href="#top" aria-label="Memory Game home page">
        <span class="brand__icon" aria-hidden="true">M</span>
        <span>Memory Game</span>
      </a>
    </header>

    <main id="top" class="game container">
      <section class="game__intro" aria-labelledby="game-title">
        <p class="game__eyebrow">Challenge your memory</p>
        <h1 id="game-title">Find all matching pairs</h1>
        <p class="game__description">Turn over two cards at a time and match every symbol in as few moves as possible.</p>
      </section>

      <section class="game__workspace" aria-label="Memory game">
        <div class="game-panel">
          <div class="game-panel__stat">
            <span class="game-panel__label">Moves</span>
            <output class="game-panel__value" data-moves aria-live="polite">0</output>
          </div>
          <button class="button button--primary" type="button" data-new-game>New game</button>
        </div>

        <div class="board" role="group" aria-label="Card deck" data-board></div>
      </section>

      <aside class="records" aria-labelledby="records-title">
        <div class="records__heading">
          <p class="records__eyebrow">Best attempts</p>
          <h2 id="records-title">Last 10 games</h2>
        </div>
        <ol class="records__list">
          <li class="records__empty">Your completed games will appear here.</li>
        </ol>
      </aside>
    </main>

    <footer class="footer container">
      <a class="footer__link" href="https://github.com/AnnaKh85" target="_blank" rel="noreferrer">© 2026 AnnaKh85</a>
      <a class="rss-logo" href="https://rs.school/" target="_blank" rel="noreferrer" aria-label="RS School">
        <span>RS</span><small>School</small>
      </a>
    </footer>
  </div>
`;

const board = app.querySelector('[data-board]');
const movesOutput = app.querySelector('[data-moves]');
const newGameButton = app.querySelector('[data-new-game]');

function shuffle(cards) {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[randomIndex]] = [shuffledCards[randomIndex], shuffledCards[index]];
  }

  return shuffledCards;
}

function createDeck() {
  return shuffle(
    [...cardSymbols, ...cardSymbols].map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false,
    })),
  );
}

function renderBoard() {
  board.innerHTML = state.deck.map((card) => `
    <button class="card${card.isFlipped || card.isMatched ? ' card--flipped' : ''}${card.isMatched ? ' card--matched' : ''}"
      type="button"
      data-card-id="${card.id}"
      aria-label="${card.isFlipped || card.isMatched ? `Card ${card.symbol}` : 'Hidden card'}"
      ${card.isMatched ? 'disabled' : ''}>
      <span class="card__inner" aria-hidden="true">
        <span class="card__face card__face--front">${card.symbol}</span>
        <span class="card__face card__face--back">?</span>
      </span>
    </button>
  `).join('');
}

function updateMoves() {
  movesOutput.value = state.moves;
  movesOutput.textContent = state.moves;
}

function resetTurn() {
  state.firstCardId = null;
  state.locked = false;
  state.pendingTurnId = null;
}

function resolveTurn(firstCard, secondCard) {
  if (firstCard.symbol === secondCard.symbol) {
    firstCard.isMatched = true;
    secondCard.isMatched = true;
    state.matchedCards += 2;
  } else {
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;
  }

  resetTurn();
  renderBoard();
}

function handleCardClick(event) {
  const cardButton = event.target.closest('[data-card-id]');

  if (!cardButton || state.locked) {
    return;
  }

  const cardId = Number(cardButton.dataset.cardId);
  const selectedCard = state.deck.find((card) => card.id === cardId);

  if (!selectedCard || selectedCard.isFlipped || selectedCard.isMatched) {
    return;
  }

  selectedCard.isFlipped = true;
  renderBoard();

  if (state.firstCardId === null) {
    state.firstCardId = cardId;
    return;
  }

  const firstCard = state.deck.find((card) => card.id === state.firstCardId);

  if (!firstCard) {
    resetTurn();
    return;
  }

  state.moves += 1;
  updateMoves();
  state.locked = true;
  state.pendingTurnId = window.setTimeout(() => resolveTurn(firstCard, selectedCard), 800);
}

function startGame() {
  if (state.pendingTurnId !== null) {
    window.clearTimeout(state.pendingTurnId);
  }

  state.deck = createDeck();
  state.matchedCards = 0;
  state.moves = 0;
  resetTurn();
  updateMoves();
  renderBoard();
}

board.addEventListener('click', handleCardClick);
newGameButton.addEventListener('click', startGame);
startGame();
