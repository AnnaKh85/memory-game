import '../css/style.css';

const app = document.querySelector('#app');

app.innerHTML = `
  <main class="welcome">
    <div class="welcome__content">
      <p class="welcome__eyebrow">Memory Game</p>
      <h1 class="welcome__title">Find every matching pair</h1>
      <p class="welcome__text">The game is being prepared. Come back soon to test your memory.</p>
    </div>
  </main>
`;
