import { Suspense, lazy } from 'react';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_CONFIG, MODE_ORDER } from '../data/taxonomy';
import { fmtHours, fmtMoney } from '../data/derive';
import { hoursPerPersonPerDay, nodeCount, priceSpread, totalHoursB, totalRevenueB } from '../data/facts';
import { Story } from './Story';
import { useNearViewport } from './hooks';

const Explorer = lazy(() => import('../explorer/Explorer'));

const NAV = [
  { href: '#money', label: 'Money' },
  { href: '#price', label: 'Hours × price' },
  { href: '#models', label: 'Models' },
  { href: '#biology', label: 'Biology' },
  { href: '#ai', label: 'AI' },
  { href: '#explore', label: '3D' },
];

interface Props {
  onOpenMethod: () => void;
  onOpenExplorer: () => void;
  explorerOpen: boolean;
}

export function Essay({ onOpenMethod, onOpenExplorer, explorerOpen }: Props) {
  return (
    <div className="essay">
      <header className="topbar">
        <a href="#top" className="brand">
          Media Modalities
        </a>
        <nav aria-label="Chapters">
          {NAV.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
        <button className="btn-ghost" onClick={onOpenMethod}>
          Method &amp; data
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="eyebrow">The attention economy, mapped · 2026</div>
          <h1>Media Modalities</h1>
          <p className="dek">
            The world spends about {hoursPerPersonPerDay.toFixed(1)} hours a day per person on {nodeCount} kinds of media and entertainment, and pays{' '}
            {fmtMoney(totalRevenueB)} a year for them. This is a map of where that attention goes, what each hour earns, what it costs to make, and where AI is about to
            move it.
          </p>
          <dl className="hero-stats">
            <div>
              <dt>Revenue a year</dt>
              <dd>{fmtMoney(totalRevenueB)}</dd>
            </div>
            <div>
              <dt>Hours of attention a year</dt>
              <dd>{fmtHours(totalHoursB).replace(' h', '')}</dd>
            </div>
            <div>
              <dt>Gap between the cheapest and dearest hour</dt>
              <dd>{Math.round(priceSpread).toLocaleString('en-US')}×</dd>
            </div>
          </dl>

          <div className="howto">
            <h2 className="howto-title">Six families, one question each</h2>
            <p className="howto-sub">Every experience is placed by the first question it answers yes to, so nothing sits in two families.</p>
            <ol className="families">
              {FAMILY_ORDER.map((f) => (
                <li key={f} style={{ ['--c' as string]: MODE_CONFIG[FAMILY_CONFIG[f].mode].color }}>
                  <span className="fam-q">{FAMILY_CONFIG[f].rule}</span>
                  <span className="fam-name">{f}</span>
                  <span className="fam-desc">{FAMILY_CONFIG[f].description}</span>
                </li>
              ))}
            </ol>
            <div className="mode-key" aria-label="Colour key">
              {MODE_ORDER.map((m) => (
                <span key={m}>
                  <i style={{ background: MODE_CONFIG[m].color }} />
                  <b>{m}</b> {MODE_CONFIG[m].description}
                </span>
              ))}
            </div>
          </div>
        </section>

        <Story />

        <ExploreSection onOpen={onOpenExplorer} hidden={explorerOpen} />
      </main>

      <footer className="footer">
        <span>
          Data and scoring live in <code>src/data/modalities.ts</code>.
        </span>
        <button className="link" onClick={onOpenMethod}>
          Method &amp; data
        </button>
        <a href="https://github.com/M1erny/media-modalities" target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </footer>
    </div>
  );
}

function ExploreSection({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  const [ref, near] = useNearViewport<HTMLElement>('600px');
  return (
    <section className="explore" id="explore" ref={ref} aria-labelledby="explore-title">
      <div className="explore-copy">
        <div className="kicker">06 · Explore it yourself</div>
        <h2 id="explore-title">Both lenses, all 28 experiences, in 3D</h2>
        <p>
          The explorer plots every experience on the biological lens (cognitive load, agency, sensory bandwidth) and the economic lens (supply cost, revenue per hour,
          platform moat). Orbit it, click any node for its numbers and sources, and move a score to test the argument.
        </p>
        <button className="btn-primary" onClick={onOpen}>
          Open the 3D explorer
        </button>
      </div>
      <div className="explore-stage" aria-hidden="true">
        {near && !hidden ? (
          <Suspense fallback={<div className="stage-loading">Loading 3D…</div>}>
            <Explorer preview />
          </Suspense>
        ) : (
          <div className="stage-loading">3D preview</div>
        )}
      </div>
    </section>
  );
}
