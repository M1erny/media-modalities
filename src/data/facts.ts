import { modalitiesData as D, type Modality } from './modalities';
import { pricePerHour } from './derive';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_ORDER, type Family, type Mode } from './taxonomy';

export const totalRevenueB = D.reduce((s, m) => s + m.revenueB, 0);
export const totalHoursB = D.reduce((s, m) => s + m.hoursB, 0);
export const avgPricePerHour = totalRevenueB / totalHoursB;

export const familyNodes = (f: Family) => D.filter((m) => m.family === f);
export const familyCount = (f: Family) => familyNodes(f).length;
export const familyRevenue = (f: Family) => D.filter((m) => m.family === f).reduce((s, m) => s + m.revenueB, 0);
export const familyHours = (f: Family) => D.filter((m) => m.family === f).reduce((s, m) => s + m.hoursB, 0);
export const familyShare = (f: Family, metric: 'revenue' | 'hours') =>
  metric === 'revenue' ? familyRevenue(f) / totalRevenueB : familyHours(f) / totalHoursB;
export const familyAvgPrice = (f: Family) => familyRevenue(f) / Math.max(0.001, familyHours(f));

export const modeNodes = (mode: Mode) => D.filter((m) => FAMILY_CONFIG[m.family].mode === mode);
export const modeCount = (mode: Mode) => modeNodes(mode).length;
export const modeRevenue = (mode: Mode) =>
  D.filter((m) => FAMILY_CONFIG[m.family].mode === mode).reduce((s, m) => s + m.revenueB, 0);
export const modeHours = (mode: Mode) =>
  D.filter((m) => FAMILY_CONFIG[m.family].mode === mode).reduce((s, m) => s + m.hoursB, 0);
export const modeShare = (mode: Mode, metric: 'revenue' | 'hours') =>
  metric === 'revenue' ? modeRevenue(mode) / totalRevenueB : modeHours(mode) / totalHoursB;
export const modeAvgPrice = (mode: Mode) => modeRevenue(mode) / Math.max(0.001, modeHours(mode));

export const FAMILY_SUMMARY = FAMILY_ORDER.map((f) => ({
  family: f,
  mode: FAMILY_CONFIG[f].mode,
  color: FAMILY_CONFIG[f].color,
  rule: FAMILY_CONFIG[f].rule,
  description: FAMILY_CONFIG[f].description,
  scope: FAMILY_CONFIG[f].scope,
  count: familyCount(f),
  revenueB: familyRevenue(f),
  hoursB: familyHours(f),
  revShare: familyShare(f, 'revenue'),
  hoursShare: familyShare(f, 'hours'),
  avgPrice: familyAvgPrice(f),
  nodes: familyNodes(f),
}));

export const MODE_SUMMARY = MODE_ORDER.map((m) => ({
  mode: m,
  count: modeCount(m),
  revenueB: modeRevenue(m),
  hoursB: modeHours(m),
  revShare: modeShare(m, 'revenue'),
  hoursShare: modeShare(m, 'hours'),
  avgPrice: modeAvgPrice(m),
}));

export const byPriceDesc = [...D].sort((a, b) => pricePerHour(b) - pricePerHour(a));
export const priciest = byPriceDesc[0];
export const cheapest = byPriceDesc[byPriceDesc.length - 1];
export const priceSpread = Math.round(pricePerHour(priciest) / pricePerHour(cheapest));

export const isoRevenueLines = [1, 10, 100]; // $B

/** Ordinary least squares line + Pearson r on pre-extracted (x, y) pairs. */
export function olsLine(pts: { x: number; y: number }[]) {
  const n = pts.length;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  let num = 0, dx = 0, dy = 0;
  for (const p of pts) {
    num += (p.x - mx) * (p.y - my);
    dx += (p.x - mx) ** 2;
    dy += (p.y - my) ** 2;
  }
  const slope = num / (dx || 1);
  const intercept = my - slope * mx;
  const r = num / (Math.sqrt(dx * dy) || 1);
  return { slope, intercept, r, at: (x: number) => intercept + slope * x };
}

export const byId = new Map<string, Modality>(D.map((m) => [m.id, m]));
export { FAMILY_ORDER, MODE_ORDER };
