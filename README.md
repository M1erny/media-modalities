# Media Modalities

An interactive scrollytelling essay and 3D explorer mapping **what an hour of human attention is worth** across **32 Mutually Exclusive, Collectively Exhaustive (MECE) consumer experiences** (~$1.67T in annual consumer & advertising spend and ~8.5T annual person-hours).

## MECE Architecture: 3 Modes → 6 Families → 32 Experiences

Every experience passes through an **ordered 6-gate waterfall decision tree** where the first question that answers **"Yes"** claims the experience. Explicit carve-outs (`includes` / `excludes` on every node) ensure zero double-counting of dollars or hours:

1. **Gate 1 — `Attend` (`Out-of-home` · 7 nodes):** *Do you have to be physically at a venue or event?*
   - Cinema · Live music, festivals & clubs · Live sports attendance · Theatre, comedy & performing arts · Theme & water parks · Museums, zoos & cultural sites · Escape rooms & immersive
2. **Gate 2 — `Play` (`Lean-forward` · 7 nodes):** *Do you act inside a rule-based system with state, score or stakes?*
   - Mobile games · Console games · PC games · VR & spatial games · Board, card & tabletop · Gamified learning & daily puzzles · Betting, iGaming & lotteries
3. **Gate 3 — `Converse` (`Lean-forward` · 3 nodes):** *Is the experience generated in reciprocal dialogue with people or AI?*
   - Messaging & communities · Dating & social discovery · AI chat & companions
4. **Gate 4 — `Watch` (`Lean-back` · 7 nodes):** *Is it moving images or a visual algorithmic feed?*
   - Short-video apps · Social networks · YouTube · Live creator streaming · Streaming TV & film · Linear & pay TV · Sports viewing
5. **Gate 5 — `Listen` (`Lean-back` · 4 nodes):** *Is it primarily sound and spoken word?*
   - Recorded music · Broadcast & satellite radio · Podcasts · Audiobooks & audio drama
6. **Gate 6 — `Read` (`Lean-back` · 4 nodes):** *Otherwise: static text and still-image publications.*
   - Books (print, e-books & web novels) · News & consumer magazines · Newsletters & independent writing · Comics, manga & webtoons

## Key Features

- **Executive Summary & Interactive MECE Explorer:** Upfront 5 Core Laws strip, 3-Mode summary cards, 6-Family waterfall cards with dual Money vs. Time bars, and an interactive **MECE Boundary & Node Spotlight** showing each node's exact `Includes` and `Excludes` carve-outs.
- **5 Scrollytelling Chapters with Instant Step Switchers:** Flip between views either by scrolling or by clicking step tabs directly above each sticky chart.
- **Complete Reference Matrix (Cheat Sheet):** Search, filter (by Mode, Family, or Business Model Archetype), and sort all 32 experiences side by side.
- **3D Six-Dimensional Explorer:** Switch between the **Economic cube** (`Supply cost × Revenue/hour × Platform moat`) and the **Biological cube** (`Cognitive load × Agency × Sensory bandwidth`), with vertical floor stems, wall projections, live 3D axis guides, one-click Mode/Family/Frontier isolation, and live rubric sliders.

## Development

```bash
npm install
npm run dev
npm run build
```
