# Media Modalities

A map of the global attention economy: 28 media and entertainment experiences, what each hour of attention earns, what an hour costs to make, and where AI is about to move it.

It is told as a scrolling essay of flat charts and ends in a 3D explorer where every claim can be checked.

## What's in it

**The essay** (five chapters, then the 3D explorer)

1. **Where the money is.** A treemap of $1.68T a year by family and experience, which then re-sizes by hours.
2. **An hour is not an hour.** Hours of attention against revenue per hour, on log scales with equal-revenue diagonals. Live experiences earn up to ~1,700× more per hour than background audio.
3. **Four business models.** Supply cost against revenue per hour. Archetypes (volume engines, scale bets, premium experiences, margin niches) and the efficient frontier are derived from position.
4. **What the biology predicts.** The biological scores against the measured economics, with Spearman correlations.
5. **Where AI moves it.** A 2030 scenario in which AI cuts the cost of making a digital hour while physical experiences stay put.
6. **Explore it yourself.** The 3D explorer, with both lenses, colour by mode, family or sensory mix, a sortable list, per-node sources, and score sliders.

**Method & data** opens from the top bar. It has the scope, the decision tree, the rubrics, the archetype rules, the AI scenario rule, and a table of all 28 experiences with notes, sources and confidence grades.

## The model

**Unit of analysis.** Every node is a consumer experience. Technologies such as AI, VR headsets and voice are not nodes unless they are the experience itself.

**Families** come from an ordered decision tree, so each experience lands in exactly one:

| # | Question | Family | Mode |
|---|---|---|---|
| 1 | Do you have to be at a venue or event? | Attend | Out-of-home |
| 2 | Do you act inside a rule-based system that responds to you? | Play | Lean-forward |
| 3 | Is the content generated in dialogue with you? | Converse | Lean-forward |
| 4 | Is it mainly moving images? | Watch | Lean-back |
| 5 | Is it mainly sound? | Listen | Lean-back |
| 6 | Otherwise: static text and images | Read | Lean-back |

**Two lenses.**

| | X | Y | Z |
|---|---|---|---|
| **Biological** | Cognitive load | Agency | Sensory bandwidth |
| **Economic** | Supply cost ($ to make one hour, log) | Revenue per hour (log) | Platform moat |

**Measured vs scored.** Revenue is sourced for every node (consumer spend plus advertising, global, latest full year, with hardware and internet access excluded). Hours are estimates from time-use panels, platform figures and attendance counts, and each one carries a confidence grade. Scores (cognitive load, agency, sensory bandwidth, moat, AI exposure) follow anchored rubrics in [`src/data/rubrics.ts`](src/data/rubrics.ts).

## What the data says

| Relationship | Spearman ρ |
|---|---|
| Hours vs revenue per hour | −0.83 |
| Cognitive load vs hours | −0.43 |
| Cognitive load vs revenue per hour | +0.45 |
| Sensory bandwidth vs supply cost | +0.70 |
| Sensory bandwidth vs revenue per hour | +0.45 |
| Agency vs revenue per hour | +0.06 |

Low friction wins hours, not price. Immersion is expensive and is priced. Agency isn't priced yet. The first version of the model found that low friction meant high "yield" (r = −0.61). That finding came from mixing volume with price, and it turns over once the two are measured separately.

## Code

| Path | What it holds |
|---|---|
| [`src/data/modalities.ts`](src/data/modalities.ts) | All 28 experiences: scores, revenue, hours, notes, sources |
| [`src/data/taxonomy.ts`](src/data/taxonomy.ts) | Families, modes, decision tree |
| [`src/data/rubrics.ts`](src/data/rubrics.ts) | Anchored scoring rubrics and the AI scenario rule |
| [`src/data/derive.ts`](src/data/derive.ts) | Revenue per hour, cost scores, archetypes, frontier, statistics |
| [`src/essay/`](src/essay) | The scrolling essay and its SVG charts |
| [`src/explorer/`](src/explorer) | The 3D explorer (three.js, lazy-loaded) |

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check and production build
```

Built with React, TypeScript, Vite and Three.js (via `@react-three/fiber` and `drei`). The essay charts are hand-rolled SVG with no chart library. The 3D explorer loads only when it is needed.
