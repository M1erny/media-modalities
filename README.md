# Media Modalities

An interactive 3D framework that maps media formats as financial assets competing in the global attention economy.

Each of 25 media modalities, from open-world MMOs and podcasts to short-form video, theme park rides and generative AI, is a node in a 3D space. You can read the same set of formats two ways: by what they demand from a person, or by how they behave as a business.

## Two lenses

| | X axis | Y axis | Z axis |
|---|---|---|---|
| **Biological** (the human side) | Cognitive load: how much mental compute it takes | Systemic agency: how much the audience shapes what happens | Sensory bandwidth: how many senses it occupies |
| **Economic** (the capital side) | Supply barrier: CapEx and production cost | Extraction yield: monetisation per unit of attention | Retention moat: defensibility, switching costs, lifetime value |

Every modality also carries a global market size (TAM rating and $B estimate), an archetype (for example *Algorithmic Attention Sink*, *Deep Focus Moat* or *High-CapEx Spectacle*), an investment thesis and its key risks.

## Families

Modalities are grouped into six mutually exclusive families, each with its own color:

- **Interactive Gaming**: closed-loop simulations with real-time player feedback
- **Audio & Acoustic**: ambient and dedicated listening
- **Linear Audiovisual**: one-way streams of moving image and sound
- **Physical & Spatial**: embodied experiences in real space
- **Text & Symbolic**: reading and other symbolic decoding
- **Generative & Co-Creation**: conversational and prompt-driven media

## Features

- Orbit, pan and zoom around the 3D scene, with preset camera viewpoints.
- Switch between the biological and economic lenses; every node is re-plotted on the new axes.
- The Pareto-efficient frontier is calculated live for the current lens, and frontier modalities are badged.
- Search, filter by archetype, and browse a watchlist grouped by family.
- Two color modes: by family, or by the visual / auditory / physical mix of senses each format uses.
- A tour mode with an automatic cinematic orbit, for recording or presenting.

## Run it

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check and production build
```

Built with React, TypeScript, Vite, Three.js (via `@react-three/fiber` and `drei`) and Framer Motion. All scores live in [`src/data/modalities.ts`](src/data/modalities.ts), so the framework can be re-weighted by editing that one file.
