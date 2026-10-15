import { useMemo, type ReactNode } from 'react';
import { useSize } from '../hooks';
import type { Modality } from '../../data/modalities';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_CONFIG, type Family } from '../../data/taxonomy';
import type { TipState } from '../Tooltip';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Squarified treemap layout (Bruls, Huizing, van Wijk). */
function squarify<T extends { value: number }>(items: T[], rect: Rect): (T & Rect)[] {
  const out: (T & Rect)[] = [];
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total || rect.w <= 0 || rect.h <= 0) return items.map((i) => ({ ...i, x: rect.x, y: rect.y, w: 0, h: 0 }));
  const scale = (rect.w * rect.h) / total;
  const queue = [...items].sort((a, b) => b.value - a.value).map((i) => ({ item: i, area: i.value * scale }));
  let { x, y, w, h } = rect;
  const worst = (row: { area: number }[], side: number) => {
    const s = row.reduce((a, r) => a + r.area, 0);
    const max = Math.max(...row.map((r) => r.area));
    const min = Math.min(...row.map((r) => r.area));
    return Math.max((side * side * max) / (s * s), (s * s) / (side * side * min));
  };
  while (queue.length) {
    const side = Math.min(w, h);
    const row = [queue.shift()!];
    while (queue.length && worst([...row, queue[0]], side) <= worst(row, side)) row.push(queue.shift()!);
    const s = row.reduce((a, r) => a + r.area, 0);
    if (w >= h) {
      const cw = s / h;
      let cy = y;
      for (const r of row) {
        const ch = r.area / cw;
        out.push({ ...r.item, x, y: cy, w: cw, h: ch });
        cy += ch;
      }
      x += cw;
      w -= cw;
    } else {
      const ch = s / w;
      let cx = x;
      for (const r of row) {
        const cw = r.area / ch;
        out.push({ ...r.item, x: cx, y, w: cw, h: ch });
        cx += cw;
      }
      y += ch;
      h -= ch;
    }
  }
  return out;
}

interface Props {
  data: Modality[];
  metric: 'revenue' | 'hours';
  highlight?: Set<string> | null;
  tip: (id: string) => ReactNode;
  onTip: (t: TipState | null) => void;
  format: (v: number) => string;
}

const GAP = 2;

export function Treemap({ data, metric, highlight, tip, onTip, format }: Props) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const value = (m: Modality) => (metric === 'revenue' ? m.revenueB : m.hoursB);

  const layout = useMemo(() => {
    const families = FAMILY_ORDER.map((f) => ({
      family: f as Family,
      value: data.filter((m) => m.family === f).reduce((s, m) => s + value(m), 0),
    }));
    const outer = squarify(families, { x: 0, y: 0, w: width, h: height });
    const total = families.reduce((s, f) => s + f.value, 0);
    return outer.map((f) => {
      const inner = squarify(
        data.filter((m) => m.family === f.family).map((m) => ({ m, value: value(m) })),
        { x: f.x + GAP, y: f.y + 22, w: Math.max(0, f.w - 2 * GAP), h: Math.max(0, f.h - 22 - GAP) },
      );
      return { ...f, share: f.value / total, inner };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, metric, width, height]);

  return (
    <div ref={ref} className="treemap" role="img" aria-label={`Treemap of ${metric} by family and experience`}>
      {layout.map((f) => {
        const color = MODE_CONFIG[FAMILY_CONFIG[f.family].mode].color;
        const showHead = f.w > 70 && f.h > 30;
        return (
          <div key={f.family} className="tm-family" style={{ left: f.x, top: f.y, width: f.w, height: f.h, ['--c' as string]: color }}>
            {showHead && (
              <div className="tm-family-head">
                <span>{f.family}</span>
                <span className="tm-share">{Math.round(f.share * 1000) / 10}%</span>
              </div>
            )}
            {f.inner.map((c) => {
              const dim = highlight ? !highlight.has(c.m.id) : false;
              const big = c.w > 64 && c.h > 34;
              return (
                <div
                  key={c.m.id}
                  className={`tm-cell${dim ? ' dim' : ''}`}
                  tabIndex={dim ? -1 : 0}
                  aria-label={`${c.m.name}: ${format(c.value)}`}
                  style={{ left: c.x - f.x, top: c.y - f.y, width: Math.max(0, c.w - GAP), height: Math.max(0, c.h - GAP) }}
                  onPointerEnter={(e) => onTip({ x: e.clientX, y: e.clientY, content: tip(c.m.id) })}
                  onPointerMove={(e) => onTip({ x: e.clientX, y: e.clientY, content: tip(c.m.id) })}
                  onPointerLeave={() => onTip(null)}
                  onFocus={(e) => {
                    const b = e.currentTarget.getBoundingClientRect();
                    onTip({ x: b.left + b.width / 2, y: b.top, content: tip(c.m.id) });
                  }}
                  onBlur={() => onTip(null)}
                >
                  {big && (
                    <>
                      <span className="tm-name">{c.m.short}</span>
                      <span className="tm-value">{format(c.value)}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
