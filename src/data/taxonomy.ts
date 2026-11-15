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
    description: 'Destination venues outside the home, segmented by venue format: cinema, live concerts, stadium sports, performing arts, theme parks, museums, and immersive venues.',
    scope: 'Gate 1 (Location): Captures all out-of-home cultural, live and location-based venues before personal/remote media are evaluated.',
    color: '#199e70',
  },
  Play: {
    mode: 'Lean-forward',
    rule: 'Do you act inside a rule-based system with state, score or stakes?',
    description: 'Interactive rule systems segmented by platform, analog table, skill drills and monetary stakes: mobile games, console games, PC games, VR gaming, tabletop games, skill puzzles, and real-money wagering.',
    scope: 'Gate 2 (Rule-Based Agency): Captures all interactive rule-based systems, skill puzzles and wagering outside destination venues.',
    color: '#d95926',
  },
  Converse: {
    mode: 'Lean-forward',
    rule: 'Is the experience generated in reciprocal dialogue with people or AI?',
    description: 'Turn-by-turn reciprocal exchange segmented by counterpart (existing contacts, new human matches, or synthetic agents): private messaging, dating apps, and conversational AI.',
    scope: 'Gate 3 (Dialogic Agency): Captures all 1-on-1 and community dialogue where your messages, calls, swipes or prompts co-create the session.',
    color: '#d55181',
  },
  Watch: {
    mode: 'Lean-back',
    rule: 'Is the primary sensory channel moving video or a visual feed?',
    description: 'Screen video segmented into 4 social/creator feeds and 3 studio/broadcast formats: short-form video, social feeds, creator video, live streaming, streaming video, linear TV, and sports broadcasts.',
    scope: 'Gate 4 (Visual Motion): Captures all one-to-many video broadcasts, studio streams and algorithmic visual feeds.',
    color: '#3987e5',
  },
  Listen: {
    mode: 'Lean-back',
    rule: 'Is the primary sensory channel eyes-free audio or spoken word?',
    description: 'Eyes-free audio segmented across a 2×2 of music vs spoken word and scheduled vs on-demand: recorded music, broadcast radio, podcasts, and audiobooks.',
    scope: 'Gate 5 (Eyes-Free Audio): Captures all musical and spoken-word audio streams, broadcasts and downloads.',
    color: '#c98500',
  },
  Read: {
    mode: 'Lean-back',
    rule: 'Is the primary medium written text or sequential illustration?',
    description: 'Written and illustrated publishing segmented by cadence and visual form: consumer books, news media, newsletters, and comic books.',
    scope: 'Gate 6 (Static Text & Art): Captures all remaining text and sequential-art reading so the 6 families are 100% collectively exhaustive.',
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
