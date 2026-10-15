import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Modality } from '../data/modalities';
import { FAMILY_CONFIG } from '../data/taxonomy';
import { fmtHours, fmtMoney, fmtPrice, pricePerHour } from '../data/derive';

export interface TipState {
  x: number;
  y: number;
  content: ReactNode;
}

export function Tooltip({ tip }: { tip: TipState | null }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  useLayoutEffect(() => {
    if (!tip || !ref.current) return;
    const { offsetWidth: w, offsetHeight: h } = ref.current;
    const left = Math.min(window.innerWidth - w - 8, Math.max(8, tip.x + 14));
    let top = tip.y - h - 12;
    if (top < 60) top = tip.y + 18;
    setPos({ left, top });
  }, [tip]);
  return (
    <div ref={ref} className="tip" role="tooltip" style={{ ...pos, opacity: tip ? 1 : 0 }}>
      {tip?.content}
    </div>
  );
}

export function ModalityTip({ m, rows = [] }: { m: Modality; rows?: [string, string][] }) {
  return (
    <>
      <div className="tip-head">
        <b>{m.name}</b>
        <span>${m.ticker}</span>
      </div>
      <div className="tip-sub">
        {m.family} · {FAMILY_CONFIG[m.family].mode}
      </div>
      <dl className="tip-rows">
        <dt>Revenue</dt>
        <dd>{fmtMoney(m.revenueB)}</dd>
        <dt>Hours / year</dt>
        <dd>{fmtHours(m.hoursB)}</dd>
        <dt>Per hour</dt>
        <dd>{fmtPrice(pricePerHour(m))}</dd>
        {rows.map(([k, v]) => (
          <span key={k} style={{ display: 'contents' }}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </span>
        ))}
      </dl>
    </>
  );
}
