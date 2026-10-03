import '../css/style.css';

const app = document.querySelector('#app');
const cardPlaceholders = Array.from({ length: 16 }, (_, index) => `
  <button class="card" type="button" disabled aria-label="Hidden card ${index + 1}">
    <span class="card__inner" aria-hidden="true">
      <span class="card__front">?</span>
    </span>
  </button>
`).join('');

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
            <output class="game-panel__value" aria-live="polite">0</output>
          </div>
          <button class="button button--primary" type="button">New game</button>
        </div>

        <div class="board" role="group" aria-label="Card deck">
          ${cardPlaceholders}
        </div>
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
