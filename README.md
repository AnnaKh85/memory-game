# Memory Game

A browser-based card-matching game created for the [RS School Memory Game task](https://github.com/rolling-scopes-school/tasks/tree/master/tasks/memory-game).

Turn over two cards at a time, find all eight matching pairs, and aim to finish in as few moves as possible.

## Features

- a shuffled deck of 16 cards (8 pairs);
- animated card flips and match checking;
- move counter and a new-game control;
- result dialog after all pairs have been found;
- leaderboard modal with the top 10 results, stored in `localStorage`;
- responsive layout for screens from 320px wide;
- keyboard-friendly controls and reduced-motion support.

## Tech stack

- HTML
- CSS
- JavaScript
- Vite

## Run locally

### Prerequisites

Install a current LTS version of [Node.js](https://nodejs.org/).

### Installation and launch

1. Clone the repository:

   ```bash
   git clone https://github.com/AnnaKh85/memory-game.git
   ```

2. Open the project folder:

   ```bash
   cd memory-game
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

Vite will display a local address in the terminal. Open it in a browser to play.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the development server. |
| `npm run build` | Creates a production build in `dist`. |
| `npm run preview` | Previews the production build locally. |
