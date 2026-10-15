import type { Modality } from './modalities';
import { AI_COST_DECADES_AT_FULL_EXPOSURE } from './rubrics';
import { FAMILY_CONFIG, type Mode } from './taxonomy';

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

/* ── Core derived metrics ─────────────────────────────── */

/** Revenue per hour of attention, USD. */
export const pricePerHour = (m: Modality) => m.revenueB / m.hoursB;

/** Log score for a $/hour production cost: $100 → 0, $100M → 100. */
export const costScore = (usdPerHour: number) => clamp((100 / 6) * (Math.log10(Math.max(usdPerHour, 1)) - 2));

export const supplyCost = (m: Modality) => costScore(m.supplyCostPerHour);

/** 2030 scenario: AI divides supply cost by 10^(2 × exposure). See rubrics.ts. */
export const supplyCostPerHour2030 = (m: Modality) =>
  m.supplyCostPerHour / 10 ** ((AI_COST_DECADES_AT_FULL_EXPOSURE * m.aiExposure) / 100);
export const supplyCost2030 = (m: Modality) => costScore(supplyCostPerHour2030(m));

/** Log score for revenue per hour: $0.01 → 0, $0.10 → 25, $1 → 50, $10 → 75, $100 → 100. */
export const priceScore = (m: Modality) => clamp(25 * (Math.log10(pricePerHour(m)) + 2));

export const modeOf = (m: Modality): Mode => FAMILY_CONFIG[m.family].mode;

/* ── Archetypes, derived from position ────────────────── */

export type Archetype = 'Volume engines' | 'Margin niches' | 'Scale bets' | 'Premium experiences';

export const SUPPLY_COST_CUT = 50; // $100k per hour

export const ARCHETYPES: Record<Archetype, { rule: string; description: string }> = {
  'Volume engines': {
    rule: 'Supply cost below $100k/hour, revenue per hour below the median',
    description: 'Cheap to supply and monetised by sheer hours.',
  },
  'Margin niches': {
    rule: 'Supply cost below $100k/hour, revenue per hour above the median',
    description: 'Cheap to supply, and people pay well for each hour.',
  },
  'Scale bets': {
    rule: 'Supply cost of $100k/hour or more, revenue per hour below the median',
    description: 'Expensive to make and cheap per hour, so they need enormous audiences.',
  },
  'Premium experiences': {
    rule: 'Supply cost of $100k/hour or more, revenue per hour above the median',
    description: 'Expensive to make and priced high for every hour.',
  },
};

export const ARCHETYPE_ORDER: Archetype[] = ['Volume engines', 'Margin niches', 'Scale bets', 'Premium experiences'];

export const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

export const medianPrice = (list: Modality[]) => median(list.map(pricePerHour));

export function archetypeOf(m: Modality, medPrice: number): Archetype {
  const costly = supplyCost(m) >= SUPPLY_COST_CUT;
  const pricey = pricePerHour(m) >= medPrice;
  if (!costly) return pricey ? 'Margin niches' : 'Volume engines';
  return pricey ? 'Premium experiences' : 'Scale bets';
}

/* ── 3D lens positions (all 0–100) ────────────────────── */

export type Lens = 'biological' | 'economic';

export const LENS_AXES: Record<Lens, { x: string; y: string; z: string }> = {
  biological: { x: 'Cognitive load', y: 'Agency', z: 'Sensory bandwidth' },
  economic: { x: 'Supply cost', y: 'Revenue per hour', z: 'Platform moat' },
};

export function lensPosition(m: Modality, lens: Lens): [number, number, number] {
  if (lens === 'economic') return [supplyCost(m), priceScore(m), m.moat];
  return [m.cognitiveLoad, m.agency, m.sensoryBandwidth];
}

/**
 * Supply-efficiency frontier: no other experience is both cheaper to supply and earns
 * more per hour. Two dimensions only: adding moat as a third put 12 of 28 nodes on the
 * frontier, which carries no signal. The biological lens has no "better" direction,
 * so it gets no frontier at all.
 */
export function economicFrontier(list: Modality[]): Set<string> {
  const pts = list.map((m) => ({ id: m.id, c: supplyCost(m), p: pricePerHour(m) }));
  const ids = pts
    .filter((a) => !pts.some((b) => b.id !== a.id && b.c <= a.c && b.p >= a.p && (b.c < a.c || b.p > a.p)))
    .map((a) => a.id);
  return new Set(ids);
}

/* ── Statistics ───────────────────────────────────────── */

export function pearson(a: number[], b: number[]) {
  const n = a.length;
  const ma = a.reduce((s, v) => s + v, 0) / n;
  const mb = b.reduce((s, v) => s + v, 0) / n;
  let c = 0, va = 0, vb = 0;
  for (let i = 0; i < n; i++) {
    c += (a[i] - ma) * (b[i] - mb);
    va += (a[i] - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  }
  return c / Math.sqrt(va * vb);
}

const ranks = (xs: number[]) => {
  const order = xs.map((v, i) => [v, i] as const).sort((p, q) => p[0] - q[0]);
  const r = new Array<number>(xs.length);
  for (let i = 0; i < order.length; ) {
    let j = i;
    while (j + 1 < order.length && order[j + 1][0] === order[i][0]) j++;
    const avg = (i + j) / 2 + 1;
    for (let k = i; k <= j; k++) r[order[k][1]] = avg;
    i = j + 1;
  }
  return r;
};

/** Spearman rank correlation: robust to the log-scale outliers in hours and price. */
export const spearman = (a: number[], b: number[]) => pearson(ranks(a), ranks(b));

/** Least-squares line, for drawing trends. */
export function linearFit(xs: number[], ys: number[]) {
  const n = xs.length;
  const mx = xs.reduce((s, v) => s + v, 0) / n;
  const my = ys.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sxy += (xs[i] - mx) * (ys[i] - my);
    sxx += (xs[i] - mx) ** 2;
  }
  const slope = sxy / sxx;
  return { slope, intercept: my - slope * mx };
}

export interface Variable {
  key: string;
  label: string;
  lens: 'Biological' | 'Economic';
  get: (m: Modality) => number;
}

export const VARIABLES: Variable[] = [
  { key: 'cog', label: 'Cognitive load', lens: 'Biological', get: (m) => m.cognitiveLoad },
  { key: 'agency', label: 'Agency', lens: 'Biological', get: (m) => m.agency },
  { key: 'sens', label: 'Sensory bandwidth', lens: 'Biological', get: (m) => m.sensoryBandwidth },
  { key: 'hours', label: 'Hours (log)', lens: 'Economic', get: (m) => Math.log10(m.hoursB) },
  { key: 'price', label: 'Revenue per hour (log)', lens: 'Economic', get: (m) => Math.log10(pricePerHour(m)) },
  { key: 'revenue', label: 'Revenue (log)', lens: 'Economic', get: (m) => Math.log10(m.revenueB) },
  { key: 'cost', label: 'Supply cost', lens: 'Economic', get: (m) => supplyCost(m) },
  { key: 'moat', label: 'Platform moat', lens: 'Economic', get: (m) => m.moat },
];

export const variable = (key: string) => VARIABLES.find((v) => v.key === key)!;

export function correlate(list: Modality[], a: string, b: string) {
  const va = variable(a), vb = variable(b);
  const xs = list.map(va.get), ys = list.map(vb.get);
  return { rho: spearman(xs, ys), r: pearson(xs, ys) };
}

/* ── Formatting ───────────────────────────────────────── */

export const fmtPrice = (usd: number) =>
  usd >= 10 ? `$${usd.toFixed(0)}` : usd >= 1 ? `$${usd.toFixed(1)}` : usd >= 0.1 ? `$${usd.toFixed(2)}` : `${(usd * 100).toFixed(1)}¢`;

export const fmtMoney = (b: number) =>
  b >= 1000 ? `$${(b / 1000).toFixed(2)}T` : b >= 10 || Number.isInteger(b) ? `$${b.toFixed(0)}B` : b >= 1 ? `$${b.toFixed(1)}B` : `$${(b * 1000).toFixed(0)}M`;

export const fmtHours = (b: number) =>
  b >= 1000 ? `${(b / 1000).toFixed(1)}T h` : b >= 10 ? `${b.toFixed(0)}B h` : b >= 1 ? `${b.toFixed(1)}B h` : `${(b * 1000).toFixed(0)}M h`;

export const fmtCost = (usd: number) =>
  usd >= 1e6 ? `$${(usd / 1e6).toFixed(usd >= 1e7 ? 0 : 1)}M` : usd >= 1e3 ? `$${(usd / 1e3).toFixed(0)}k` : `$${usd.toFixed(0)}`;

export const fmtRho = (v: number) => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(2);
