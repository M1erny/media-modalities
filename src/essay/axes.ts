import type { AxisSpec } from './scales';

export const priceAxis: AxisSpec = {
  type: 'log',
  domain: [0.01, 100],
  ticks: [0.01, 0.1, 1, 10, 100],
  format: (v) => (v < 1 ? `${Math.round(v * 100)}¢` : `$${v}`),
  title: 'Revenue per hour of attention (log)',
};

export const hoursAxis: AxisSpec = {
  type: 'log',
  domain: [0.1, 10_000],
  ticks: [0.1, 1, 10, 100, 1000, 10_000],
  format: (v) => (v >= 1000 ? `${v / 1000}T` : v >= 1 ? `${v}B` : `${v * 1000}M`),
  title: 'Hours of attention per year (log)',
};

export const costAxis: AxisSpec = {
  type: 'linear',
  domain: [0, 100],
  ticks: [0, 100 / 6, 200 / 6, 50, 400 / 6, 500 / 6, 100],
  format: (v) => ['$100', '$1k', '$10k', '$100k', '$1M', '$10M', '$100M'][Math.round(v / (100 / 6))],
  title: 'Supply cost: $ to make one hour (log)',
};

export const scoreAxis = (title: string): AxisSpec => ({
  type: 'linear',
  domain: [0, 100],
  ticks: [0, 25, 50, 75, 100],
  format: (v) => String(v),
  title,
});
