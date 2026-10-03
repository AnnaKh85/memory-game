import '../css/style.css';

const app = document.querySelector('#app');
const cardSymbols = ['☀️', '🌙', '⭐', '🌈', '🍀', '🍓', '🎈', '🎧'];
const RESULTS_STORAGE_KEY = 'memory-game-results';
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
        <p class="visually-hidden" data-game-status role="status" aria-live="polite"></p>
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
        <div class="records__table-wrap">
          <table class="records__table">
            <thead>
              <tr><th scope="col">#</th><th scope="col">Moves</th><th scope="col">Date</th></tr>
            </thead>
            <tbody data-results-list></tbody>
          </table>
        </div>
      </aside>
    </main>

    <footer class="footer container">
      <a class="footer__link" href="https://github.com/AnnaKh85" target="_blank" rel="noreferrer">© 2026 AnnaKh85</a>
      <a class="rss-logo" href="https://rs.school/" target="_blank" rel="noreferrer" aria-label="RS School">
        <span>RS</span><small>School</small>
      </a>
    </footer>

    <div class="modal" data-victory-modal hidden>
      <div class="modal__backdrop">
        <section class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="victory-title">
          <p class="modal__eyebrow">Game complete</p>
          <h2 id="victory-title">Excellent memory!</h2>
          <p class="modal__text">You found every pair in <strong data-final-moves>0</strong> moves.</p>
          <button class="button button--primary" type="button" data-play-again>Play again</button>
        </section>
      </div>
    </div>
  </div>
`;

const board = app.querySelector('[data-board]');
const movesOutput = app.querySelector('[data-moves]');
const newGameButton = app.querySelector('[data-new-game]');
const victoryModal = app.querySelector('[data-victory-modal]');
const finalMovesOutput = app.querySelector('[data-final-moves]');
const playAgainButton = app.querySelector('[data-play-again]');
const resultsList = app.querySelector('[data-results-list]');
const gameStatus = app.querySelector('[data-game-status]');

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

function announce(message) {
  gameStatus.textContent = message;
}

function getResults() {
  try {
    const savedResults = JSON.parse(localStorage.getItem(RESULTS_STORAGE_KEY) ?? '[]');

    if (!Array.isArray(savedResults)) {
      return [];
    }

    return savedResults.filter((result) => (
      Number.isInteger(result.moves)
      && result.moves > 0
      && typeof result.completedAt === 'string'
      && !Number.isNaN(Date.parse(result.completedAt))
    )).slice(0, 10);
  } catch {
    return [];
  }
}

function formatCompletionDate(completedAt) {
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(completedAt));
}

function renderResults() {
  const results = getResults();

  if (results.length === 0) {
    resultsList.innerHTML = '<tr><td class="records__empty" colspan="3">Your completed games will appear here.</td></tr>';
    return;
  }

  resultsList.innerHTML = results.map((result, index) => `
    <tr>
      <th scope="row">${index + 1}</th>
      <td>${result.moves}</td>
      <td>${formatCompletionDate(result.completedAt)}</td>
    </tr>
  `).join('');
}

function saveResult() {
  const result = {
    moves: state.moves,
    completedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify([result, ...getResults()].slice(0, 10)));
  } catch {
    // The game stays playable if browser storage is unavailable.
  }

  renderResults();
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
    announce('Matching pair found.');
  } else {
    firstCard.isFlipped = false;
    secondCard.isFlipped = false;
    announce('The cards do not match. Try again.');
  }

  resetTurn();
  renderBoard();

  if (state.matchedCards === state.deck.length) {
    saveResult();
    finalMovesOutput.textContent = state.moves;
    victoryModal.hidden = false;
    announce(`Game complete in ${state.moves} moves.`);
    playAgainButton.focus();
  }
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
    announce('One card selected. Choose another card.');
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
  victoryModal.hidden = true;
  updateMoves();
  renderBoard();
  announce('New game started. Find all eight matching pairs.');
}

board.addEventListener('click', handleCardClick);
newGameButton.addEventListener('click', startGame);
playAgainButton.addEventListener('click', () => {
  startGame();
  newGameButton.focus();
});
renderResults();
startGame();
