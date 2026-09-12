# 2048 Game

A clean, modern implementation of the classic 2048 puzzle game in vanilla HTML, CSS, and JavaScript.

## Features

- **Classic 2048 Gameplay** — Merge tiles to reach 2048 and beyond
- **Score Tracking** — Current score and best score (stored locally)
- **Responsive Design** — Works on desktop and mobile devices
- **Touch Support** — Swipe gestures on touch devices
- **Smooth Animations** — New tiles pop into view with a satisfying animation
- **Color-Coded Tiles** — Distinct colors for tile values (2 through 2048+)
- **Game Over Modal** — Clear notification when no moves remain

## How to Play

1. **Start the game** — Open `index.html` in your browser
2. **Move tiles** — Use arrow keys (desktop) or swipe (mobile)
   - **Arrow Up** — Move tiles upward
   - **Arrow Down** — Move tiles downward
   - **Arrow Left** — Move tiles leftward
   - **Arrow Right** — Move tiles rightward
3. **Merge tiles** — When two tiles with the same number touch, they merge into one with double the value
4. **Score points** — Earn points equal to the merged tile's value
5. **Reach 2048** — Combine tiles to reach the 2048 tile (and beyond!)
6. **Game Over** — When no empty cells and no merges remain, the game ends

## Quick Start

### Option 1: Direct File (Simplest)
```bash
# Double-click index.html in your file explorer
# or run:
start e:\2468\index.html
```

### Option 2: Python HTTP Server (Recommended)
```powershell
Set-Location -Path 'e:\2468'
python -m http.server 8000
# Open in browser: http://localhost:8000/index.html
```

### Option 3: Node HTTP Server
```powershell
Set-Location -Path 'e:\2468'
npx http-server -p 8000
# Open in browser: http://localhost:8000/index.html
```

## File Structure

```
e:\2468/
├── index.html      # Main game page
├── style.css       # Game styling and animations
├── script.js       # Game logic and interactivity
└── README.md       # This file
```

## Technical Details

### Game Logic (`script.js`)
- **Board State** — 4×4 grid stored as a 2D array
- **Move Handlers** — Arrow key and touch input mapped to tile movements
- **Merge Logic** — Tiles compress and combine when identical values touch
- **Random Tiles** — New tiles (2 or 4) spawn in empty cells after each move
- **Game Over Check** — Game ends when no empty cells and no valid merges

### Styling (`style.css`)
- **Responsive Layout** — Flexbox and CSS Grid for flexible sizing
- **Color Presets** — CSS classes for tiles 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048
- **Animations** — Pop animation for new tiles, smooth transitions for color changes
- **Modal Overlay** — Centered game-over dialog with restart option

### Persistence (`localStorage`)
- **Best Score** — Stored under key `2048_best`
- **Current Game** — Board state is not persisted; refresh starts a new game

## Browser Support

- **Chrome/Edge** — Full support
- **Firefox** — Full support
- **Safari** — Full support (including iOS)
- **Mobile Browsers** — Full support with touch swipe

## Controls

| Input | Action |
|-------|--------|
| ↑ Arrow Up | Move tiles up |
| ↓ Arrow Down | Move tiles down |
| ← Arrow Left | Move tiles left |
| → Arrow Right | Move tiles right |
| Swipe Up/Down/Left/Right | Move tiles (mobile) |
| Click Restart | Start a new game |

## Tips & Strategy

- **Plan ahead** — Think several moves ahead to avoid getting stuck
- **Keep corners safe** — Avoid filling all empty spaces
- **Build toward the center** — Create larger merges by moving strategically
- **Use the score** — Your best score is saved automatically

## Customization

You can easily modify the game:

- **Tile Colors** — Edit the `tile--v*` classes in `style.css`
- **Board Size** — Change `boardSize` constant in `script.js` (⚠️ requires HTML grid updates)
- **Spawn Rate** — Adjust the probability in `assignRandom()` (currently 10% chance of 4, 90% chance of 2)
- **Animation Speed** — Modify `pop` animation duration in `style.css` (currently 250ms)

## Known Limitations

- **No Undo** — Moves cannot be reversed
- **No Undo/Redo History** — Only current game state is tracked
- **No Network** — Single-player only; no multiplayer or online leaderboards
- **Tile Animations** — New tiles animate on spawn; tile movement is instant (no sliding animation)

## License

Public domain — feel free to use, modify, and share!

## Troubleshooting

### CSS not loading
- Use a local HTTP server (Python or Node) instead of opening the file directly
- Check your browser's DevTools → Network tab to confirm `style.css` loads

### Game feels slow on mobile
- The game should run smoothly on modern phones. If not, try:
  - Close other browser tabs
  - Update your browser

### Swipe not working
- Swipe must be on the game board container
- Minimum swipe distance is 30 pixels to trigger a move
- Some browsers may require a slight delay between swipes

### Best score not saved
- Check your browser's `localStorage` settings (DevTools → Application → Local Storage)
- Some private/incognito mode browsers don't allow `localStorage`

## Enjoy!

Challenge yourself to reach 2048 and beyond! 🎮
