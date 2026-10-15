import type { ReactNode } from 'react';
import { useActiveStep } from './hooks';

interface Props {
  id: string;
  number: string;
  title: string;
  intro?: ReactNode;
  steps: ReactNode[];
  graphic: (active: number) => ReactNode;
  caption?: (active: number) => ReactNode;
}

/** Scrollytelling chapter: steps scroll past a sticky chart, which follows the active step. */
export function Chapter({ id, number, title, intro, steps, graphic, caption }: Props) {
  const [active, setRef] = useActiveStep(steps.length);
  return (
    <section className="chapter" id={id} aria-labelledby={`${id}-title`}>
      <header className="chapter-head">
        <div className="kicker">{number}</div>
        <h2 id={`${id}-title`}>{title}</h2>
        {intro && <p className="chapter-intro">{intro}</p>}
      </header>
      <div className="chapter-body">
        <div className="chapter-graphic">
          <div className="graphic-frame">{graphic(active)}</div>
          {caption && <div className="graphic-caption">{caption(active)}</div>}
        </div>
        <div className="chapter-steps">
          {steps.map((s, i) => (
            <div key={i} ref={setRef(i)} className={`step${i === active ? ' is-active' : ''}`}>
              <div className="step-card">{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
