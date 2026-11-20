# Grandmaster — World-Class Premium Chess Game

An elite, production-quality chess platform designed to combine the visual fidelity of a AAA strategy game, Apple Human Interface Design principles, and a professional chess engine.

---

## 🌟 Key Features

### 1. Dual 2D & 3D Visual Rendering
- **2D Mode**: Handcrafted SVG vector pieces with subtle bevels, luminous gradients, and silky spring physics animations powered by Framer Motion.
- **3D Mode**: High-fidelity Three.js & React Three Fiber procedural piece geometries, realistic PBR materials (ivory ceramic & midnight obsidian), soft contact shadows, studio 3-point lighting, and orbital camera controls.
- **Instant Toggle**: Switch between 2D and 3D seamlessly with a single click at any point in the match.

### 2. Four Luxury Board Themes
- **Royal Walnut & Maple**: Handcrafted rich dark walnut and golden maple with warm brass beveling.
- **Midnight Obsidian & Marble**: Sleek stealth obsidian, frosted Carrara marble, and ice-blue glow highlights.
- **Emerald Grandmaster**: Prestigious tournament styling with deep forest emerald green and tournament buff.
- **Imperial Gold & Onyx**: High-luxury jet black onyx and champagne gold luster.

### 3. Intelligent Chess AI (Stockfish / Minimax Engine)
- **6 Difficulty Tiers**:
  - **Beginner (ELO 600)**: Casual, quick moves with occasional tactical mistakes.
  - **Easy (ELO 1100)**: Focuses on basic captures and defense.
  - **Intermediate (ELO 1600)**: Positional awareness and solid tactical defense.
  - **Advanced (ELO 2000)**: Minimax with Alpha-Beta pruning, PeSTO piece-square evaluation.
  - **Expert (ELO 2400)**: Deep calculation, king safety, and aggressive pawn structures.
  - **Master (ELO 2800)**: Full-depth tactical prowess and relentless endgame technique.

### 4. Full Chess Rules & Move Validation
- Official FIDE rules powered by `chess.js`:
  - Legal move highlighting (subtle dots for moves, luminous brackets for captures).
  - Castling (kingside & queenside) with double piece animation.
  - En Passant capture validation.
  - Pawn Promotion Coronation modal (Queen, Rook, Bishop, Knight).
  - Check & Checkmate detection with crimson king alert and celebration confetti.
  - Stalemate, Threefold Repetition, 50-Move Rule, and Insufficient Material draws.
  - Resignation and draw detection.

### 5. Game Modes
- **vs Computer (AI)**: Play as White or Black against 6 AI difficulty tiers.
- **Pass & Play (Local 2-Player)**: Play against a friend on the same device with board flipping.
- **Tactics & Puzzles**: Interactive curated collection of tactical puzzles (Back-rank mates, knight forks, queen sacrifices, opposition endgames) with rating badges and move verification.
- **Master Openings Explorer**: Practice famous grandmaster openings (Najdorf, Ruy Lopez, Queen's Gambit, Italian Game, King's Indian, London System) with ECO codes, key strategic ideas, and move sequence playback.

### 6. Acoustic Sound Engine (Web Audio API)
- Pure synthesized acoustic sounds (zero external asset latency or broken links):
  - Crisp wooden tap on move.
  - Deep resonant impact on piece capture.
  - Dual slide on castling.
  - Warning harmonic ping on check.
  - Victorious orchestral arpeggio on checkmate.
  - Tactile UI click.
  - Full volume slider and mute controls.

### 7. Move History & Clocks
- Formatted algebraic notation table.
- Interactive time-travel: click any past move to view the exact historical board position, with stepping buttons (`|<<`, `<`, `>`, `>>|`).
- One-click PGN copy to clipboard.
- Digital clock timers with presets (1m Bullet, 3m/5m Blitz, 10m Rapid, 30m Classical, or Unlimited).
- Real-time positional Evaluation Bar with centipawn advantage score.

---

## 🚀 Getting Started

### Development Server
```bash
cd chess-game
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
cd chess-game
npm run build
npm run preview
```

---

## 🏗️ Architecture

```
chess-game/
├── src/
│   ├── components/
│   │   ├── chessboard/       # 2D & 3D Board renderers
│   │   ├── chess-pieces/      # 2D SVG & 3D Three.js pieces
│   │   ├── player/            # Player card, avatar, captured pieces & clock
│   │   ├── game-controls/     # Undo, Restart, Flip, 2D/3D, Sound, Settings
│   │   ├── move-history/      # PGN history table & stepping controls
│   │   ├── modals/            # Pawn promotion coronation & Game Over
│   │   └── ui/                # TopNav, EvaluationBar
│   ├── features/
│   │   ├── settings/          # Themes, AI difficulty, clocks & sound
│   │   ├── puzzles/           # Tactical puzzle trainer
│   │   └── openings/          # Grandmaster opening explorer
│   ├── engine/
│   │   ├── chess-engine/      # PeSTO evaluation & piece-square tables
│   │   └── stockfish/         # Minimax Alpha-Beta search & AI engine
│   ├── services/
│   │   ├── soundEngine.ts     # Web Audio API acoustic sound synthesizer
│   │   ├── puzzleBook.ts      # Tactical puzzles database
│   │   └── openingBook.ts     # Master openings database
│   ├── stores/
│   │   └── useChessStore.ts   # Zustand master game store
│   ├── constants/
│   │   └── themes.ts          # 4 Luxury board themes definitions
│   ├── types/
│   │   └── chess.ts           # TypeScript type definitions
│   ├── styles/
│   │   └── globals.css        # Luxury Tailwind utilities & glassmorphism
│   ├── App.tsx                # Master game view
│   └── main.tsx               # Entry point
```
