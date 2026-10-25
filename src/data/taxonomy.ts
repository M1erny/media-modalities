/**
 * Taxonomy: one criterion per cut, so every experience lands in exactly one family.
 *
 * Families answer "what is the person doing?" and are assigned by an ordered decision
 * tree: the first rule that matches wins. Modes group families by how attention is spent.
 */

export type Family = 'Attend' | 'Play' | 'Converse' | 'Watch' | 'Listen' | 'Read';
export type Mode = 'Lean-back' | 'Lean-forward' | 'Out-of-home';

export interface FamilyConfig {
  mode: Mode;
  rule: string;        // the decision-tree test that assigns this family
  description: string;
  scope: string;       // MECE collective exhaustiveness guarantee for this bucket
  color: string;       // used only in the 3D "Family" colour mode
}

/** Ordered: the decision tree is evaluated top to bottom. */
export const FAMILY_ORDER: Family[] = ['Attend', 'Play', 'Converse', 'Watch', 'Listen', 'Read'];

export const FAMILY_CONFIG: Record<Family, FamilyConfig> = {
  Attend: {
    mode: 'Out-of-home',
    rule: 'Do you have to be physically at a venue or event?',
    description: 'Ticketed and destination venues outside the home: cinema, concerts & clubs, stadiums, theatre & comedy, theme parks, museums & zoos, immersive rooms.',
    scope: 'Captures all out-of-home cultural, live and location-based venues before home/mobile media are evaluated.',
    color: '#199e70',
  },
  Play: {
    mode: 'Lean-forward',
    rule: 'Do you act inside a rule-based system with state, score or stakes?',
    description: 'Games, puzzles and wagering: mobile, console, PC and VR games, tabletop & card games, gamified learning & daily puzzles, and betting, iGaming & lotteries.',
    scope: 'Captures all interactive rule-based systems, skill puzzles and wagering (outside destination venues).',
    color: '#d95926',
  },
  Converse: {
    mode: 'Lean-forward',
    rule: 'Is the experience generated in reciprocal dialogue with people or AI?',
    description: 'Turn-by-turn exchange, messaging and matching: messaging & group communities, dating & social discovery, and AI chat & companions.',
    scope: 'Captures all 1-on-1 and community dialogue where your messages, swipes or prompts co-create the session.',
    color: '#d55181',
  },
  Watch: {
    mode: 'Lean-back',
    rule: 'Is it moving images or a visual algorithmic feed?',
    description: 'Screen video and visual feeds: short-video apps, social networks, YouTube, live creator streams, streaming TV & film, linear TV, and live sports viewing.',
    scope: 'Captures all one-to-many video broadcasts, streams and mixed visual social feeds.',
    color: '#3987e5',
  },
  Listen: {
    mode: 'Lean-back',
    rule: 'Is it primarily sound and spoken word?',
    description: 'Eyes-free audio: recorded music, broadcast & satellite radio, podcasts, and audiobooks & audio drama.',
    scope: 'Captures all musical and spoken-word audio streams, broadcasts and downloads.',
    color: '#c98500',
  },
  Read: {
    mode: 'Lean-back',
    rule: 'Otherwise: static text and still-image publications.',
    description: 'Written and illustrated publishing: print & e-books (including web novels), news & consumer magazines, newsletters & blogs, and comics, manga & webtoons.',
    scope: 'Captures all remaining static text and sequential-art reading so no media experience is left unassigned.',
    color: '#9085e9',
  },
};

export const MODE_ORDER: Mode[] = ['Lean-back', 'Lean-forward', 'Out-of-home'];

/** Validated categorical palette (dark steps, adjacent and all-pairs CVD-safe for three slots). */
export const MODE_CONFIG: Record<Mode, { color: string; description: string }> = {
  'Lean-back': { color: '#3987e5', description: 'Content arrives as a stream, feed or page; you take it in.' },
  'Lean-forward': { color: '#d95926', description: 'You act, play, wager or reply, and the experience responds.' },
  'Out-of-home': { color: '#199e70', description: 'You leave home and share a physical venue, stage, park or gallery.' },
};

export const modeOf = (family: Family): Mode => FAMILY_CONFIG[family].mode;
