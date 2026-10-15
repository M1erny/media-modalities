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
  color: string;       // used only in the 3D "Family" colour mode
}

/** Ordered: the decision tree is evaluated top to bottom. */
export const FAMILY_ORDER: Family[] = ['Attend', 'Play', 'Converse', 'Watch', 'Listen', 'Read'];

export const FAMILY_CONFIG: Record<Family, FamilyConfig> = {
  Attend: {
    mode: 'Out-of-home',
    rule: 'Do you have to be at a venue or event?',
    description: 'Physical presence at a venue: cinema, concerts, stadiums, theatre, parks, rooms.',
    color: '#199e70',
  },
  Play: {
    mode: 'Lean-forward',
    rule: 'Do you act inside a rule-based system that responds to you?',
    description: 'Games and wagers, digital or on a table at home.',
    color: '#d95926',
  },
  Converse: {
    mode: 'Lean-forward',
    rule: 'Is the content generated in dialogue with you?',
    description: 'Conversation with an AI that produces the content on demand.',
    color: '#d55181',
  },
  Watch: {
    mode: 'Lean-back',
    rule: 'Is it mainly moving images?',
    description: 'Video in every form: feeds, creators, live streams, series, TV, sport.',
    color: '#3987e5',
  },
  Listen: {
    mode: 'Lean-back',
    rule: 'Is it mainly sound?',
    description: 'Music, radio, podcasts and audiobooks.',
    color: '#c98500',
  },
  Read: {
    mode: 'Lean-back',
    rule: 'Otherwise: static text and images.',
    description: 'Books, news, newsletters, comics.',
    color: '#9085e9',
  },
};

export const MODE_ORDER: Mode[] = ['Lean-back', 'Lean-forward', 'Out-of-home'];

/** Validated categorical palette (dark steps, adjacent and all-pairs CVD-safe for three slots). */
export const MODE_CONFIG: Record<Mode, { color: string; description: string }> = {
  'Lean-back': { color: '#3987e5', description: 'Content arrives; you take it in.' },
  'Lean-forward': { color: '#d95926', description: 'You act, and the experience responds.' },
  'Out-of-home': { color: '#199e70', description: 'You go somewhere and are physically there.' },
};

export const modeOf = (family: Family): Mode => FAMILY_CONFIG[family].mode;
