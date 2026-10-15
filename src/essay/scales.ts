export type ScaleType = 'linear' | 'log';

export interface AxisSpec {
  type: ScaleType;
  domain: [number, number];
  ticks: number[];
  format: (v: number) => string;
  title: string;
}

/** Maps a data value onto [r0, r1]. Log scales clamp at the domain floor. */
export function makeScale(axis: AxisSpec, r0: number, r1: number) {
  const [d0, d1] = axis.domain;
  if (axis.type === 'log') {
    const l0 = Math.log10(d0), l1 = Math.log10(d1);
    return (v: number) => r0 + ((Math.log10(Math.max(v, d0)) - l0) / (l1 - l0)) * (r1 - r0);
  }
  return (v: number) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
}

export interface LabelPoint {
  id: string;
  x: number;
  y: number;
  r: number;
  text: string;
}

export interface PlacedLabel {
  id: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Greedy label placement: try right, left, above, below each mark in priority order;
 * skip a label rather than let it collide with another label, a mark, or the frame.
 */
export function placeLabels(points: LabelPoint[], all: LabelPoint[], frame: Box, obstacles: Box[] = [], charW = 6.4, h = 14): PlacedLabel[] {
  const boxes: Box[] = [...obstacles];
  const out: PlacedLabel[] = [];
  const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const hitsCircle = (b: Box, p: LabelPoint) => {
    const cx = Math.max(b.x, Math.min(p.x, b.x + b.w));
    const cy = Math.max(b.y, Math.min(p.y, b.y + b.h));
    return (cx - p.x) ** 2 + (cy - p.y) ** 2 < (p.r + 1) ** 2;
  };
  for (const p of points) {
    const w = p.text.length * charW;
    const cands: [Box, PlacedLabel['anchor']][] = [
      [{ x: p.x + p.r + 5, y: p.y - h / 2, w, h }, 'start'],
      [{ x: p.x - p.r - 5 - w, y: p.y - h / 2, w, h }, 'end'],
      [{ x: p.x - w / 2, y: p.y - p.r - 4 - h, w, h }, 'middle'],
      [{ x: p.x - w / 2, y: p.y + p.r + 4, w, h }, 'middle'],
    ];
    for (const [b, anchor] of cands) {
      if (b.x < frame.x || b.x + b.w > frame.x + frame.w || b.y < frame.y || b.y + b.h > frame.y + frame.h) continue;
      if (boxes.some((o) => overlaps(b, o))) continue;
      if (all.some((q) => q.id !== p.id && hitsCircle(b, q))) continue;
      boxes.push(b);
      const x = anchor === 'start' ? b.x : anchor === 'end' ? b.x + w : b.x + w / 2;
      out.push({ id: p.id, x, y: b.y + h - 3.5, anchor });
      break;
    }
  }
  return out;
}
