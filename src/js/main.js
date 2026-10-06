import '../css/style.css';

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

function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const {
    classNames = [], text, attributes = {}, dataset = {},
  } = options;

  if (classNames.length > 0) {
    element.classList.add(...classNames);
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  Object.entries(dataset).forEach(([name, value]) => { element.dataset[name] = value; });

  return element;
}

function createButton(text, classNames = [], attributes = {}) {
  return createElement('button', {
    classNames: ['button', ...classNames],
    text,
    attributes: { type: 'button', ...attributes },
  });
}

function createModal({ eyebrow, title, titleId, wide = false, dismissible = false }) {
  const modal = createElement('div', { classNames: ['modal'] });
  const backdrop = createElement('div', { classNames: ['modal__backdrop'] });
  const dialog = createElement('section', {
    classNames: ['modal__dialog', ...(wide ? ['modal__dialog--wide'] : [])],
    attributes: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId, tabindex: '-1' },
  });
  const heading = createElement('div', { classNames: ['modal__heading'] });
  const eyebrowElement = createElement('p', { classNames: ['modal__eyebrow'], text: eyebrow });
  const titleElement = createElement('h2', { text: title, attributes: { id: titleId } });
  const content = createElement('div', { classNames: ['modal__content'] });
  const actions = createElement('div', { classNames: ['modal__actions'] });
  let lastFocusedElement = null;

  heading.append(eyebrowElement, titleElement);
  dialog.append(heading, content, actions);
  backdrop.append(dialog);
  modal.append(backdrop);
  modal.hidden = true;

  const hide = () => {
    modal.hidden = true;
    lastFocusedElement?.focus();
  };

  if (dismissible) {
    const closeButton = createButton('Close', ['button--secondary']);
    closeButton.addEventListener('click', hide);
    actions.append(closeButton);

    backdrop.addEventListener('click', (event) => {
      if (event.target === backdrop) {
        hide();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) {
        hide();
      }
    });
  }

  return {
    element: modal,
    content,
    actions,
    show(focusTarget = dialog) {
      lastFocusedElement = document.activeElement;
      modal.hidden = false;
      focusTarget.focus();
    },
    hide,
  };
}

function createLayout() {
  const page = createElement('div', { classNames: ['page'] });
  const header = createElement('header', { classNames: ['header', 'container'] });
  const brand = createElement('a', {
    classNames: ['brand'],
    attributes: { href: '#top', 'aria-label': 'Memory Game home page' },
  });
  const brandIcon = createElement('span', { classNames: ['brand__icon'], text: 'M', attributes: { 'aria-hidden': 'true' } });
  const brandText = createElement('span', { text: 'Memory Game' });
  const game = createElement('main', { classNames: ['game', 'container'], attributes: { id: 'top' } });
  const intro = createElement('section', { classNames: ['game__intro'], attributes: { 'aria-labelledby': 'game-title' } });
  const introEyebrow = createElement('p', { classNames: ['game__eyebrow'], text: 'Challenge your memory' });
  const introTitle = createElement('h1', { text: 'Find all matching pairs', attributes: { id: 'game-title' } });
  const introDescription = createElement('p', { classNames: ['game__description'], text: 'Turn over two cards at a time and match every symbol in as few moves as possible.' });
  const workspace = createElement('section', { classNames: ['game__workspace'], attributes: { 'aria-label': 'Memory game' } });
  const status = createElement('p', { classNames: ['visually-hidden'], attributes: { role: 'status', 'aria-live': 'polite' } });
  const panel = createElement('div', { classNames: ['game-panel'] });
  const stat = createElement('div', { classNames: ['game-panel__stat'] });
  const statLabel = createElement('span', { classNames: ['game-panel__label'], text: 'Moves' });
  const moves = createElement('output', { classNames: ['game-panel__value'], text: '0', attributes: { 'aria-live': 'polite' } });
  const controls = createElement('div', { classNames: ['game-panel__actions'] });
  const leaderboardButton = createButton('Leaderboard', ['button--secondary']);
  const newGameButton = createButton('New game', ['button--primary']);
  const board = createElement('div', { classNames: ['board'], attributes: { role: 'group', 'aria-label': 'Card deck' } });
  const footer = createElement('footer', { classNames: ['footer', 'container'] });
  const authorLink = createElement('a', {
    classNames: ['footer__link'],
    text: '© 2026 AnnaKh85',
    attributes: { href: 'https://github.com/AnnaKh85', target: '_blank', rel: 'noreferrer' },
  });
  const schoolLink = createElement('a', {
    classNames: ['rss-logo'],
    attributes: { href: 'https://rs.school/', target: '_blank', rel: 'noreferrer', 'aria-label': 'RS School' },
  });
  const schoolInitials = createElement('span', { text: 'RS' });
  const schoolName = createElement('small', { text: 'School' });

  brand.append(brandIcon, brandText);
  header.append(brand);
  intro.append(introEyebrow, introTitle, introDescription);
  stat.append(statLabel, moves);
  controls.append(leaderboardButton, newGameButton);
  panel.append(stat, controls);
  workspace.append(status, panel, board);
  game.append(intro, workspace);
  schoolLink.append(schoolInitials, schoolName);
  footer.append(authorLink, schoolLink);
  page.append(header, game, footer);

  return {
    page, board, moves, status, newGameButton, leaderboardButton,
  };
}

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

function sortResults(results) {
  return [...results].sort((firstResult, secondResult) => (
    firstResult.moves - secondResult.moves
    || Date.parse(firstResult.completedAt) - Date.parse(secondResult.completedAt)
  )).slice(0, 10);
}

function getResults() {
  try {
    const savedResults = JSON.parse(localStorage.getItem(RESULTS_STORAGE_KEY) ?? '[]');

    if (!Array.isArray(savedResults)) {
      return [];
    }

    const validResults = savedResults.filter((result) => (
      Number.isInteger(result.moves)
      && result.moves > 0
      && typeof result.completedAt === 'string'
      && !Number.isNaN(Date.parse(result.completedAt))
    ));

    return sortResults(validResults);
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

function createLeaderboardTable() {
  const table = createElement('table', { classNames: ['leaderboard__table'] });
  const tableHead = createElement('thead');
  const headerRow = createElement('tr');
  const body = createElement('tbody');

  ['#', 'Moves', 'Date'].forEach((label) => {
    headerRow.append(createElement('th', { text: label, attributes: { scope: 'col' } }));
  });

  tableHead.append(headerRow);
  table.append(tableHead, body);
  return { table, body };
}

function createCard(card) {
  const isFaceUp = card.isFlipped || card.isMatched;
  const cardButton = createElement('button', {
    classNames: ['card', ...(isFaceUp ? ['card--flipped'] : []), ...(card.isMatched ? ['card--matched'] : [])],
    attributes: { type: 'button', 'aria-label': isFaceUp ? `Card ${card.symbol}` : 'Hidden card' },
    dataset: { cardId: String(card.id) },
  });
  const cardInner = createElement('span', { classNames: ['card__inner'], attributes: { 'aria-hidden': 'true' } });
  const cardFront = createElement('span', { classNames: ['card__face', 'card__face--front'], text: card.symbol });
  const cardBack = createElement('span', { classNames: ['card__face', 'card__face--back'], text: '?' });

  if (card.isMatched) {
    cardButton.disabled = true;
  }

  cardInner.append(cardFront, cardBack);
  cardButton.append(cardInner);
  return cardButton;
}

const layout = createLayout();
const victoryModal = createModal({
  eyebrow: 'Game complete', title: 'Excellent memory!', titleId: 'victory-title', dismissible: false,
});
const leaderboardModal = createModal({
  eyebrow: 'Best attempts', title: 'Leaderboard', titleId: 'leaderboard-title', wide: true, dismissible: true,
});
const victoryText = createElement('p', { classNames: ['modal__text'] });
const finalMoves = createElement('strong', { text: '0' });
const playAgainButton = createButton('Play again', ['button--primary']);
const leaderboardTable = createLeaderboardTable();

victoryText.append('You found every pair in ', finalMoves, ' moves.');
victoryModal.content.append(victoryText);
victoryModal.actions.append(playAgainButton);
leaderboardModal.content.append(leaderboardTable.table);
document.body.append(layout.page, victoryModal.element, leaderboardModal.element);

function updateMoves() {
  layout.moves.value = state.moves;
  layout.moves.textContent = state.moves;
}

function announce(message) {
  layout.status.textContent = message;
}

function renderBoard() {
  const cards = state.deck.map(createCard);
  layout.board.replaceChildren(...cards);
}

function renderLeaderboard() {
  const results = getResults();
  const rows = [];

  if (results.length === 0) {
    const row = createElement('tr');
    const emptyCell = createElement('td', {
      classNames: ['leaderboard__empty'],
      text: 'Your completed games will appear here.',
      attributes: { colspan: '3' },
    });
    row.append(emptyCell);
    rows.push(row);
  } else {
    results.forEach((result, index) => {
      const row = createElement('tr');
      const rank = createElement('th', { text: String(index + 1), attributes: { scope: 'row' } });
      const moves = createElement('td', { text: String(result.moves) });
      const date = createElement('td', { text: formatCompletionDate(result.completedAt) });
      row.append(rank, moves, date);
      rows.push(row);
    });
  }

  leaderboardTable.body.replaceChildren(...rows);
}

function saveResult() {
  const result = {
    moves: state.moves,
    completedAt: new Date().toISOString(),
  };

  try {
    const topResults = sortResults([result, ...getResults()]);
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(topResults));
  } catch {
    // The game stays playable if browser storage is unavailable.
  }

  renderLeaderboard();
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
    finalMoves.textContent = state.moves;
    victoryModal.show(playAgainButton);
    announce(`Game complete in ${state.moves} moves.`);
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
  victoryModal.hide();
  updateMoves();
  renderBoard();
  announce('New game started. Find all eight matching pairs.');
}

layout.board.addEventListener('click', handleCardClick);
layout.newGameButton.addEventListener('click', startGame);
layout.leaderboardButton.addEventListener('click', () => {
  renderLeaderboard();
  leaderboardModal.show();
});
playAgainButton.addEventListener('click', () => {
  startGame();
  layout.newGameButton.focus();
});

renderLeaderboard();
startGame();
