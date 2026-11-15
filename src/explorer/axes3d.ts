import type { Lens } from '../data/derive';

export interface AxisTick3D {
  value: number;
  label: string;
}

export interface AxisInfo3D {
  x: readonly [string, string];
  y: readonly [string, string];
  z: readonly [string, string];
  ticks: {
    x: readonly AxisTick3D[];
    y: readonly AxisTick3D[];
    z: readonly AxisTick3D[];
  };
}

const SCORE_TICKS: readonly AxisTick3D[] = [
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 75, label: '75' },
  { value: 100, label: '100' },
];

export const AXIS_STYLE: Record<Lens, AxisInfo3D> = {
  biological: {
    x: ['X · Cognitive load', 'effortless → effortful'],
    y: ['Y · Agency', 'fixed → co-created'],
    z: ['Z · Sensory bandwidth', 'text → physical'],
    ticks: {
      x: SCORE_TICKS,
      y: SCORE_TICKS,
      z: SCORE_TICKS,
    },
  },
  economic: {
    x: ['X · Supply cost', '$100 → $100M per hour'],
    y: ['Y · Revenue per hour', '1¢ → $100'],
    z: ['Z · Platform moat', 'none → social graph'],
    ticks: {
      x: [
        { value: 0, label: '$100' },
        { value: 25, label: '$3.2k' },
        { value: 50, label: '$100k' },
        { value: 75, label: '$3.2M' },
        { value: 100, label: '$100M' },
      ],
      y: [
        { value: 25, label: '10¢' },
        { value: 50, label: '$1' },
        { value: 75, label: '$10' },
        { value: 100, label: '$100' },
      ],
      z: SCORE_TICKS,
    },
  },
} as const;
