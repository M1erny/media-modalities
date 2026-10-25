import type { ReactNode } from 'react';
import { MODE_CONFIG, MODE_ORDER } from '../data/taxonomy';
import { useActiveStep } from './hooks';

interface Props {
  id: string;
  number: string;
  title: string;
  intro?: ReactNode;
  takeaway?: ReactNode;
  stepLabels?: string[];
  steps: ReactNode[];
  graphic: (active: number) => ReactNode;
  caption?: (active: number) => ReactNode;
}

/** Scrollytelling chapter: steps scroll past a sticky chart, which follows the active step or clicked tab. */
export function Chapter({ id, number, title, intro, takeaway, stepLabels, steps, graphic, caption }: Props) {
  const [active, setRef, goTo] = useActiveStep(steps.length);
  return (
    <section className="chapter" id={id} aria-labelledby={`${id}-title`}>
      <header className="chapter-head">
        <div className="kicker">{number}</div>
        <h2 id={`${id}-title`}>{title}</h2>
        {intro && <p className="chapter-intro">{intro}</p>}
        {takeaway && (
          <div className="chapter-takeaway">
            <span className="takeaway-badge">Key Takeaway</span>
            <span>{takeaway}</span>
          </div>
        )}
      </header>
      <div className="chapter-body">
        <div className="chapter-graphic">
          <div className="graphic-toolbar">
            <div className="step-pills" role="tablist" aria-label={`${title} views`}>
              {steps.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === active}
                  className={`step-pill${i === active ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                >
                  <span className="step-pill-num">{i + 1}</span>
                  {stepLabels?.[i] ?? `Step ${i + 1}`}
                </button>
              ))}
            </div>
            <div className="mini-legend" aria-hidden="true">
              {MODE_ORDER.map((m) => (
                <span key={m}>
                  <i style={{ background: MODE_CONFIG[m].color }} />
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="graphic-frame">{graphic(active)}</div>
          {caption && <div className="graphic-caption">{caption(active)}</div>}
        </div>
        <div className="chapter-steps">
          {steps.map((s, i) => (
            <div key={i} ref={setRef(i)} className={`step${i === active ? ' is-active' : ''}`} onClick={() => goTo(i)}>
              <div className="step-card">
                <div className="step-badge">
                  Step {i + 1} of {steps.length}
                  {stepLabels?.[i] ? ` · ${stepLabels[i]}` : ''}
                </div>
                {s}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
