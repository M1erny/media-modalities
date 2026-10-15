import { useId, useMemo, type ReactNode } from 'react';
import { useSize } from '../hooks';
import { makeScale, placeLabels, type AxisSpec, type Box } from '../scales';
import type { TipState } from '../Tooltip';

export interface ScatterPoint {
  id: string;
  x: number;
  y: number;
  r: number; // radius as a share of the chart's max radius (0–1, area-true)
  color: string;
  label: string;
  hollow?: boolean;
}

export interface ChartCtx {
  sx: (v: number) => number;
  sy: (v: number) => number;
  plot: Box;
  width: number;
  height: number;
  maxR: number;
  pos: Map<string, { x: number; y: number; r: number }>;
}

interface Props {
  points: ScatterPoint[];
  xAxis: AxisSpec;
  yAxis: AxisSpec;
  highlight?: Set<string> | null;
  labels?: 'auto' | 'highlight' | 'none';
  background?: (c: ChartCtx) => ReactNode;
  foreground?: (c: ChartCtx) => ReactNode;
  obstacles?: (c: ChartCtx) => Box[];
  tip: (id: string) => ReactNode;
  onTip: (t: TipState | null) => void;
  ariaLabel: string;
  compact?: boolean;
}

export function Scatter({ points, xAxis, yAxis, highlight, labels = 'auto', background, foreground, obstacles, tip, onTip, ariaLabel, compact }: Props) {
  const [ref, { width, height }] = useSize<HTMLDivElement>();
  const clipId = 'clip' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const narrow = width < 520;
  const m = compact ? { l: 40, r: 10, t: 10, b: 38 } : { l: narrow ? 44 : 56, r: narrow ? 10 : 20, t: 16, b: narrow ? 44 : 52 };
  const plot: Box = { x: m.l, y: m.t, w: Math.max(10, width - m.l - m.r), h: Math.max(10, height - m.t - m.b) };
  const sx = makeScale(xAxis, plot.x, plot.x + plot.w);
  const sy = makeScale(yAxis, plot.y + plot.h, plot.y);
  const maxR = Math.max(10, Math.min(plot.w, plot.h) / (compact ? 14 : 11));

  const placed = useMemo(() => {
    const pos = new Map<string, { x: number; y: number; r: number }>();
    for (const p of points) pos.set(p.id, { x: sx(p.x), y: sy(p.y), r: Math.max(compact ? 3 : 4, p.r * maxR) });
    return pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, width, height, xAxis, yAxis]);

  const ctx: ChartCtx = { sx, sy, plot, width, height, maxR, pos: placed };
  const drawOrder = [...points].sort((a, b) => b.r - a.r);

  const labelPlacements = useMemo(() => {
    if (!width || labels === 'none') return [];
    const all = points.map((p) => ({ id: p.id, ...placed.get(p.id)!, text: p.label }));
    let candidates = [...all].sort((a, b) => b.r - a.r);
    if (labels === 'highlight' && highlight) candidates = candidates.filter((c) => highlight.has(c.id));
    else if (highlight) candidates = [...candidates.filter((c) => highlight.has(c.id)), ...candidates.filter((c) => !highlight.has(c.id))];
    return placeLabels(candidates, all, { x: plot.x + 2, y: plot.y + 2, w: plot.w - 4, h: plot.h - 4 }, obstacles ? obstacles(ctx) : [], narrow ? 6 : 6.4);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, highlight, labels, width]);

  const textOf = new Map(points.map((p) => [p.id, p.label]));

  const tipHandlers = (id: string) => ({
    onPointerEnter: (e: React.PointerEvent) => onTip({ x: e.clientX, y: e.clientY, content: tip(id) }),
    onPointerMove: (e: React.PointerEvent) => onTip({ x: e.clientX, y: e.clientY, content: tip(id) }),
    onPointerLeave: () => onTip(null),
    onFocus: (e: React.FocusEvent) => {
      const b = (e.currentTarget as Element).getBoundingClientRect();
      onTip({ x: b.left + b.width / 2, y: b.top, content: tip(id) });
    },
    onBlur: () => onTip(null),
  });

  return (
    <div ref={ref} className="chart" role="img" aria-label={ariaLabel}>
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <clipPath id={clipId}>
              <rect x={plot.x} y={plot.y} width={plot.w} height={plot.h} />
            </clipPath>
          </defs>
          <g className="axes">
            {xAxis.ticks.map((t) => (
              <g key={`x${t}`}>
                <line className="grid" x1={sx(t)} x2={sx(t)} y1={plot.y} y2={plot.y + plot.h} />
                <text className="tick" x={sx(t)} y={plot.y + plot.h + 16} textAnchor="middle">
                  {xAxis.format(t)}
                </text>
              </g>
            ))}
            {yAxis.ticks.map((t) => (
              <g key={`y${t}`}>
                <line className="grid" x1={plot.x} x2={plot.x + plot.w} y1={sy(t)} y2={sy(t)} />
                <text className="tick" x={plot.x - 7} y={sy(t) + 3.5} textAnchor="end">
                  {yAxis.format(t)}
                </text>
              </g>
            ))}
            <line className="base" x1={plot.x} x2={plot.x + plot.w} y1={plot.y + plot.h} y2={plot.y + plot.h} />
            <line className="base" x1={plot.x} x2={plot.x} y1={plot.y} y2={plot.y + plot.h} />
            <text className="axis-title" x={plot.x + plot.w / 2} y={height - 6} textAnchor="middle">
              {xAxis.title}
            </text>
            <text className="axis-title" transform={`translate(${compact ? 11 : 14},${plot.y + plot.h / 2}) rotate(-90)`} textAnchor="middle">
              {yAxis.title}
            </text>
          </g>
          <g clipPath={`url(#${clipId})`}>{background?.(ctx)}</g>
          <g className="marks">
            {drawOrder.map((p) => {
              const q = placed.get(p.id)!;
              const dim = highlight ? !highlight.has(p.id) : false;
              return (
                <g key={p.id} className="mark" style={{ transform: `translate(${q.x}px, ${q.y}px)`, opacity: dim ? 0.16 : 1 }}>
                  <circle
                    r={q.r}
                    fill={p.hollow ? 'var(--bg)' : p.color}
                    fillOpacity={p.hollow ? 1 : 0.88}
                    stroke={p.hollow ? p.color : 'var(--bg)'}
                    strokeWidth={p.hollow ? 1.75 : 2}
                    tabIndex={dim ? -1 : 0}
                    aria-label={p.label}
                    {...tipHandlers(p.id)}
                  />
                </g>
              );
            })}
          </g>
          <g className="labels">
            {labelPlacements.map((l) => (
              <text key={l.id} className="mark-label" x={l.x} y={l.y} textAnchor={l.anchor}>
                {textOf.get(l.id)}
              </text>
            ))}
          </g>
          {foreground?.(ctx)}
        </svg>
      )}
    </div>
  );
}
