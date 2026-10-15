/**
 * Headline numbers used in the essay copy, computed from the data so the text
 * cannot drift from the charts.
 */
import { modalitiesData as D } from './modalities';
import { correlate, economicFrontier, medianPrice, pricePerHour } from './derive';
import { FAMILY_ORDER, type Family } from './taxonomy';

const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0);
const byId = (id: string) => D.find((m) => m.id === id)!;

export const totalRevenueB = sum(D.map((m) => m.revenueB));
export const totalHoursB = sum(D.map((m) => m.hoursB));
export const hoursPerPersonPerDay = (totalHoursB * 1e9) / 8.2e9 / 365;

const prices = D.map(pricePerHour);
export const priceSpread = Math.max(...prices) / Math.min(...prices);
export const medianPricePerHour = medianPrice(D);

export const familyTotals = FAMILY_ORDER.map((family: Family) => {
  const items = D.filter((m) => m.family === family);
  const revenueB = sum(items.map((m) => m.revenueB));
  const hoursB = sum(items.map((m) => m.hoursB));
  return { family, revenueB, hoursB, price: revenueB / hoursB, revenueShare: revenueB / totalRevenueB, hoursShare: hoursB / totalHoursB };
});
export const family = (f: Family) => familyTotals.find((t) => t.family === f)!;

export const rel = {
  hoursPrice: correlate(D, 'hours', 'price').rho,
  cogHours: correlate(D, 'cog', 'hours').rho,
  cogPrice: correlate(D, 'cog', 'price').rho,
  cogRevenue: correlate(D, 'cog', 'revenue').rho,
  sensCost: correlate(D, 'sens', 'cost').rho,
  sensPrice: correlate(D, 'sens', 'price').rho,
  agencyPrice: correlate(D, 'agency', 'price').rho,
  agencyMoat: correlate(D, 'agency', 'moat').rho,
  moatPrice: correlate(D, 'moat', 'price').rho,
  moatRevenue: correlate(D, 'moat', 'revenue').rho,
};

export const frontierIds = economicFrontier(D);
export const lowConfidenceHours = D.filter((m) => m.hoursConfidence === 'Low').length;
export const nodeCount = D.length;
export { byId };
