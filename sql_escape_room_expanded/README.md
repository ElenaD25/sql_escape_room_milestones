# SQL Escape Room — The Missing Query (Milestone 1 + 2)

A browser-based, bilingual (English/Romanian) 2D SQL escape-room game.

## Run locally
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Run `python -m http.server 8000` in the project folder, or use VS Code Live Server.
4. Open `http://localhost:8000`.

No build step or backend is required. The Google Fonts import is optional.

## Controls
- WASD / Arrow keys: move the character.
- E: interact with the object in front of the character.
- Face an object and move close enough before interacting.
- Use the language button to switch English/Romanian.

## Included features
- Character selection: boy or girl, with a custom name.
- Three rooms: The Study, The Lab, The Archive.
- 12 SQL puzzles, with one digit unlocked for every correct puzzle answer.
- Final 12-digit keypad code required to escape.
- Multiple-choice questions and drag/drop SQL syntax builders (click-to-place is also supported).
- Five lives; each incorrect submitted answer costs one life.
- Hints available from the individual puzzle panels.
- Inventory, room map, room progress, score, countdown timer and animated interactions.
- Local leaderboard stored in the browser using localStorage.

## Notes
This is a front-end prototype. Scores are stored on the current browser/device only; there is no shared online leaderboard or account system. Room 2 uses a recolored version of the original room artwork to keep the visual identity consistent while differentiating the lab. The collision map is intentionally lightweight and can be refined against the final room art.
