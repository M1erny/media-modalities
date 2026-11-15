import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { modalitiesData, type Modality } from '../data/modalities';
import { FAMILY_CONFIG } from '../data/taxonomy';
import { archetypeOf, fmtHours, fmtMoney, fmtPrice, medianPrice, pricePerHour } from '../data/derive';
import { totalHoursB, totalRevenueB } from '../data/facts';

export interface TipState {
  x: number;
  y: number;
  content: ReactNode;
}

const MED_PRICE = medianPrice(modalitiesData);

export function Tooltip({ tip }: { tip: TipState | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    if (!tip || !ref.current) return;
    const { offsetWidth: w, offsetHeight: h } = ref.current;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = tip.x + 16;
    if (tip.x > vw * 0.56 || left + w > vw - 12) {
      left = tip.x - w - 16;
    }
    left = Math.min(vw - w - 10, Math.max(10, left));
    let top = tip.y - h - 12;
    if (top < 64) top = tip.y + 18;
    top = Math.min(Math.max(64, vh - h - 10), Math.max(64, top));
    setPos({ left: Math.round(left), top: Math.round(top) });
  }, [tip]);
  return (
    <div ref={ref} className="tip" role="tooltip" style={{ ...pos, opacity: tip ? 1 : 0 }}>
      {tip?.content}
    </div>
  );
}

export function ModalityTip({ m, rows = [] }: { m: Modality; rows?: [string, string][] }) {
  const revPct = ((m.revenueB / totalRevenueB) * 100).toFixed(1);
  const hrsPct = ((m.hoursB / totalHoursB) * 100).toFixed(1);
  return (
    <>
      <div className="tip-head">
        <b>{m.name}</b>
        <span>${m.ticker}</span>
      </div>
      <div className="tip-sub">
        {m.family} · {FAMILY_CONFIG[m.family].mode} · {archetypeOf(m, MED_PRICE)}
      </div>
      <dl className="tip-rows">
        <dt>Revenue</dt>
        <dd>
          {fmtMoney(m.revenueB)} <span className="tip-pct">({revPct}%)</span>
        </dd>
        <dt>Hours / year</dt>
        <dd>
          {fmtHours(m.hoursB)} <span className="tip-pct">({hrsPct}%)</span>
        </dd>
        <dt>Yield / hour</dt>
        <dd>{fmtPrice(pricePerHour(m))}</dd>
        {rows.map(([k, v]) => (
          <span key={k} style={{ display: 'contents' }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </span>
        ))}
      </dl>
      <div className="tip-boundary">
        <div>
          <b>In:</b> {m.includes}
        </div>
        <div>
          <b>Out:</b> {m.excludes}
        </div>
      </div>
    </>
  );
}
