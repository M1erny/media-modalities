import { lazy, Suspense, useMemo, useState } from 'react';
import { modalitiesData as D } from '../data/modalities';
import {
  ARCHETYPE_ORDER,
  archetypeOf,
  economicFrontier,
  fmtCost,
  fmtHours,
  fmtMoney,
  fmtPrice,
  medianPrice,
  modeOf,
  pricePerHour,
  type Archetype,
} from '../data/derive';
import { FAMILY_ORDER, MODE_CONFIG, MODE_ORDER, type Family, type Mode } from '../data/taxonomy';
import { avgPricePerHour, byId, FAMILY_SUMMARY, MODE_SUMMARY, totalHoursB, totalRevenueB } from '../data/facts';
import { useNearViewport } from './hooks';
import { ChapterAI, ChapterBody, ChapterMind, ChapterModels, ChapterScale } from './Story';
import { Tooltip, type TipState } from './Tooltip';

const Explorer = lazy(() => import('../explorer/Explorer'));
const medPrice = medianPrice(D);
const frontierSet = economicFrontier(D);

type LedgerSort = 'family' | 'revenue' | 'hours' | 'price' | 'cost' | 'moat' | 'ai';

export function Essay({
  onOpenMethod,
  onOpenExplorer,
  explorerOpen,
}: {
  onOpenMethod: () => void;
  onOpenExplorer: () => void;
  explorerOpen?: boolean;
}) {
  const [tip, setTip] = useState<TipState | null>(null);
  const [spotlightId, setSpotlightId] = useState<string>('youtube');
  const [ledgerMode, setLedgerMode] = useState<Mode | 'All'>('All');
  const [ledgerFamily, setLedgerFamily] = useState<Family | 'All'>('All');
  const [ledgerArch, setLedgerArch] = useState<Archetype | 'All'>('All');
  const [ledgerQuery, setLedgerQuery] = useState('');
  const [ledgerSort, setLedgerSort] = useState<LedgerSort>('revenue');
  const [stageRef, stageNear] = useNearViewport<HTMLDivElement>('600px');

  const spotlight = byId.get(spotlightId) ?? D[0];
  const spotlightMode = modeOf(spotlight);

  const ledgerRows = useMemo(() => {
    const q = ledgerQuery.trim().toLowerCase();
    return D.filter((m) => (ledgerMode === 'All' ? true : modeOf(m) === ledgerMode))
      .filter((m) => (ledgerFamily === 'All' ? true : m.family === ledgerFamily))
      .filter((m) => (ledgerArch === 'All' ? true : archetypeOf(m, medPrice) === ledgerArch))
      .filter((m) => (!q ? true : `${m.name} ${m.short} ${m.examples} ${m.ticker} ${m.includes}`.toLowerCase().includes(q)))
      .sort((a, b) => {
        if (ledgerSort === 'family') return FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) || b.revenueB - a.revenueB;
        if (ledgerSort === 'revenue') return b.revenueB - a.revenueB;
        if (ledgerSort === 'hours') return b.hoursB - a.hoursB;
        if (ledgerSort === 'price') return pricePerHour(b) - pricePerHour(a);
        if (ledgerSort === 'cost') return b.supplyCostPerHour - a.supplyCostPerHour;
        if (ledgerSort === 'moat') return b.moat - a.moat;
        return b.aiExposure - a.aiExposure;
      });
  }, [ledgerMode, ledgerFamily, ledgerArch, ledgerQuery, ledgerSort]);

  return (
    <>
      <header className="topbar">
        <a href="#top" className="brand">
          Media Modalities
        </a>
        <nav aria-label="Sections">
          <a href="#taxonomy">MECE Map</a>
          <a href="#scale">1 · Scale</a>
          <a href="#models">2 · Models</a>
          <a href="#ai">3 · 2030 AI</a>
          <a href="#mind">4 · Mind</a>
          <a href="#body">5 · Body &amp; Moats</a>
          <a href="#ledger">Cheat Sheet</a>
          <a href="#explore">3D Space</a>
        </nav>
        <div className="topbar-actions">
          <button className="btn-ghost" onClick={onOpenMethod}>
            Method &amp; data
          </button>
          <button className="btn-topbar-3d" onClick={onOpenExplorer}>
            3D Explorer ↗
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="kicker">A MECE Map of the Global Attention Economy · {D.length} Consumer Experiences</div>
          <h1>What an hour of attention is worth</h1>
          <p className="dek">
            Every consumer media, entertainment, gaming, conversational and live venue experience on Earth mapped onto one{' '}
            <b>Mutually Exclusive, Collectively Exhaustive (MECE)</b> taxonomy: how many hours we give each experience, what the market collects for each hour,
            what a fresh hour costs to make, and how it engages the human mind and body.
          </p>

          <dl className="hero-stats">
            <div>
              <dt>Global annual revenue (spend + ads)</dt>
              <dd>{fmtMoney(totalRevenueB)}</dd>
            </div>
            <div>
              <dt>Global annual attention hours</dt>
              <dd>{fmtHours(totalHoursB)}</dd>
            </div>
            <div>
              <dt>Mean yield per hour of attention</dt>
              <dd>{fmtPrice(avgPricePerHour)}</dd>
            </div>
            <div>
              <dt>MECE coverage (3 Modes · 6 Families)</dt>
              <dd>{D.length} nodes</dd>
            </div>
          </dl>

          {/* Executive TL;DR: The 5 Laws at a glance */}
          <div className="tldr-strip" aria-label="Executive summary">
            <div className="tldr-header">
              <span className="kicker">Executive Summary · 5 Core Laws</span>
              <span className="tldr-hint">Click any law to jump to its interactive chart chapter</span>
            </div>
            <div className="tldr-grid">
              <a href="#scale" className="tldr-card">
                <span className="tldr-num">01 · Scale vs Yield</span>
                <b>Time and money flow to opposite places</b>
                <p>
                  Out-of-home venues capture <b>14% of revenue on 0.4% of hours</b> (~$5.70/h), while Watch, Listen &amp; Converse take <b>87% of hours</b> at
                  5¢–15¢/h.
                </p>
              </a>
              <a href="#models" className="tldr-card">
                <span className="tldr-num">02 · Business Models</span>
                <b>Supply cost × $/h defines 4 archetypes</b>
                <p>
                  Splitting at <b>$100k/h creation cost</b> and <b>{fmtPrice(medPrice)}/h median yield</b> sorts all {D.length} experiences into 4 quadrants and a{' '}
                  {frontierSet.size}-node Pareto frontier.
                </p>
              </a>
              <a href="#ai" className="tldr-card">
                <span className="tldr-num">03 · 2030 AI Shock</span>
                <b>Pixels &amp; prose compress; atoms stay scarce</b>
                <p>
                  Generative AI cuts creation costs 10×–60× in video, games, books and audio, concentrating scarcity value in physical venues and live stakes.
                </p>
              </a>
              <a href="#mind" className="tldr-card">
                <span className="tldr-num">04 · The Mind</span>
                <b>Mental effort &amp; agency don’t set hourly price</b>
                <p>
                  Cognitive load and agency cleanly separate <b>Lean-forward</b> from <b>Lean-back</b>, but show near-zero correlation with $/hour.
                </p>
              </a>
              <a href="#body" className="tldr-card">
                <span className="tldr-num">05 · Body &amp; Moats</span>
                <b>Senses drive $/h; moats drive total hours</b>
                <p>
                  Full-body sensory bandwidth commands dollars per hour (<b>r = 0.72</b>), while social-graph moats monetize via trillions of cheap hours.
                </p>
              </a>
            </div>
          </div>

          {/* MECE Architecture & Waterfall Decision Tree */}
          <div className="howto" id="taxonomy">
            <div className="section-head-row">
              <div>
                <div className="kicker">Strict MECE Architecture · Zero Double-Counting, 100% Coverage</div>
                <h2 className="howto-title">How the 3 Modes, 6 Families and {D.length} Experiences fit together</h2>
              </div>
              <button className="btn-ghost" onClick={onOpenMethod}>
                Full methodology &amp; sources →
              </button>
            </div>
            <p className="howto-sub">
              To ensure every dollar and every hour of consumer attention is counted <b>once and only once</b>, every experience passes through an{' '}
              <b>ordered 6-gate waterfall filter</b>. The first gate that answers <b>“Yes”</b> claims the experience. Click any experience chip below to inspect
              its exact <b>Includes / Excludes</b> boundary.
            </p>

            {/* 3 Modes Summary Bar */}
            <div className="modes-summary">
              {MODE_SUMMARY.map((ms) => {
                const c = MODE_CONFIG[ms.mode].color;
                return (
                  <div key={ms.mode} className="mode-card" style={{ ['--c' as string]: c }}>
                    <div className="mode-card-head">
                      <span className="mode-dot" style={{ background: c }} />
                      <b>{ms.mode}</b>
                      <span className="mode-count">{ms.count} experiences</span>
                    </div>
                    <p className="mode-card-desc">{MODE_CONFIG[ms.mode].description}</p>
                    <div className="mode-metrics">
                      <div>
                        <span>Revenue</span>
                        <b>
                          {fmtMoney(ms.revenueB)} <em>({Math.round(ms.revShare * 100)}%)</em>
                        </b>
                      </div>
                      <div>
                        <span>Attention</span>
                        <b>
                          {fmtHours(ms.hoursB)} <em>({(ms.hoursShare * 100).toFixed(1)}%)</em>
                        </b>
                      </div>
                      <div>
                        <span>Mean $/h</span>
                        <b>{fmtPrice(ms.avgPrice)}/h</b>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 6 Families Waterfall Decision Tree */}
            <ol className="families">
              {FAMILY_SUMMARY.map((fs, idx) => {
                const modeColor = MODE_CONFIG[fs.mode].color;
                const revPct = Math.round(fs.revShare * 100);
                const hrsPct = fs.hoursShare * 100 < 1 ? (fs.hoursShare * 100).toFixed(1) : Math.round(fs.hoursShare * 100);
                return (
                  <li key={fs.family} style={{ ['--c' as string]: modeColor }}>
                    <div className="fam-top">
                      <span className="fam-q">Gate {idx + 1} · {fs.rule}</span>
                      <span className="fam-mode-pill" style={{ borderColor: modeColor, color: modeColor }}>
                        {fs.mode}
                      </span>
                    </div>
                    <div className="fam-title-row">
                      <span className="fam-name">{fs.family}</span>
                      <span className="fam-avg-price">{fmtPrice(fs.avgPrice)}/h avg</span>
                    </div>
                    <span className="fam-desc">{fs.description}</span>

                    <div className="fam-bars">
                      <div className="fam-bar-row">
                        <span>Money</span>
                        <div className="fam-bar-track">
                          <div className="fam-bar-fill" style={{ width: `${Math.max(2, fs.revShare * 100)}%`, background: modeColor }} />
                        </div>
                        <b>
                          {fmtMoney(fs.revenueB)} ({revPct}%)
                        </b>
                      </div>
                      <div className="fam-bar-row">
                        <span>Time</span>
                        <div className="fam-bar-track">
                          <div className="fam-bar-fill fam-bar-time" style={{ width: `${Math.max(2, fs.hoursShare * 100)}%`, background: modeColor }} />
                        </div>
                        <b>
                          {fmtHours(fs.hoursB)} ({hrsPct}%)
                        </b>
                      </div>
                    </div>

                    <div className="fam-chips" role="group" aria-label={`${fs.family} experiences`}>
                      {fs.nodes.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`fam-node-chip${spotlightId === m.id ? ' active' : ''}`}
                          onClick={() => setSpotlightId(m.id)}
                        >
                          {m.short}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Interactive MECE Boundary & Node Spotlight */}
            <div className="spotlight-card" style={{ ['--c' as string]: MODE_CONFIG[spotlightMode].color }}>
              <div className="spotlight-main">
                <div className="spotlight-eyebrow">
                  <span className="tag" style={{ ['--c' as string]: MODE_CONFIG[spotlightMode].color }}>
                    {spotlight.family} · {spotlightMode}
                  </span>
                  <span className="tag tag-plain">{archetypeOf(spotlight, medPrice)}</span>
                  {frontierSet.has(spotlight.id) && <span className="tag tag-frontier">Efficient Frontier</span>}
                  <span className="spotlight-hint">Selected experience (click any chip above to switch)</span>
                </div>
                <div className="spotlight-title-row">
                  <h3>
                    {spotlight.name} <span className="ticker">${spotlight.ticker}</span>
                  </h3>
                  <span className="spotlight-examples">{spotlight.examples}</span>
                </div>
                <p className="spotlight-thesis">{spotlight.thesis}</p>
                <div className="spotlight-mece-grid">
                  <div className="mece-box mece-in">
                    <span className="mece-label">✓ Included in this node</span>
                    <p>{spotlight.includes}</p>
                  </div>
                  <div className="mece-box mece-out">
                    <span className="mece-label">⇄ Carved out to other nodes (zero overlap)</span>
                    <p>{spotlight.excludes}</p>
                  </div>
                </div>
              </div>
              <div className="spotlight-stats">
                <dl className="spotlight-kpis">
                  <div>
                    <dt>Annual Revenue</dt>
                    <dd>{fmtMoney(spotlight.revenueB)}</dd>
                  </div>
                  <div>
                    <dt>Annual Attention</dt>
                    <dd>{fmtHours(spotlight.hoursB)}</dd>
                  </div>
                  <div>
                    <dt>Yield / Hour</dt>
                    <dd>{fmtPrice(pricePerHour(spotlight))}/h</dd>
                  </div>
                  <div>
                    <dt>Supply Cost / Hour</dt>
                    <dd>{fmtCost(spotlight.supplyCostPerHour)}/h</dd>
                  </div>
                </dl>
                <div className="spotlight-scores">
                  <div className="mini-score">
                    <span>Cognitive load</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${spotlight.cognitiveLoad}%`, background: MODE_CONFIG[spotlightMode].color }} />
                    </div>
                    <b>{spotlight.cognitiveLoad}</b>
                  </div>
                  <div className="mini-score">
                    <span>User agency</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${spotlight.agency}%`, background: MODE_CONFIG[spotlightMode].color }} />
                    </div>
                    <b>{spotlight.agency}</b>
                  </div>
                  <div className="mini-score">
                    <span>Sensory bandwidth</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${spotlight.sensoryBandwidth}%`, background: MODE_CONFIG[spotlightMode].color }} />
                    </div>
                    <b>{spotlight.sensoryBandwidth}</b>
                  </div>
                  <div className="mini-score">
                    <span>Platform moat</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${spotlight.moat}%`, background: MODE_CONFIG[spotlightMode].color }} />
                    </div>
                    <b>{spotlight.moat}</b>
                  </div>
                  <div className="mini-score">
                    <span>AI exposure</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${spotlight.aiExposure}%`, background: '#a99bff' }} />
                    </div>
                    <b>{spotlight.aiExposure}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ChapterScale onTip={setTip} />
        <ChapterModels onTip={setTip} />
        <ChapterAI onTip={setTip} />
        <ChapterMind onTip={setTip} />
        <ChapterBody onTip={setTip} />

        {/* Interactive Full MECE Ledger & Cheat Sheet */}
        <section className="ledger-section" id="ledger" aria-labelledby="ledger-title">
          <div className="ledger-head">
            <div>
              <div className="kicker">Complete Reference Matrix · All {D.length} MECE Experiences</div>
              <h2 id="ledger-title">Compare every modality side by side</h2>
              <p className="chapter-intro">
                Filter by mode, family or business model, or click any column header to rank all {D.length} experiences by revenue, hours, hourly yield,
                creation cost, moat or AI exposure.
              </p>
            </div>
            <input
              type="search"
              className="ledger-search"
              placeholder="Search modality, platform, ticker..."
              value={ledgerQuery}
              onChange={(e) => setLedgerQuery(e.target.value)}
              aria-label="Search modalities"
            />
          </div>

          <div className="ledger-filters">
            <div className="filter-group" role="group" aria-label="Filter by mode">
              <span className="filter-label">Mode:</span>
              {(['All', ...MODE_ORDER] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`chip${ledgerMode === m ? ' active' : ''}`}
                  onClick={() => {
                    setLedgerMode(m);
                    setLedgerFamily('All');
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="filter-group" role="group" aria-label="Filter by family">
              <span className="filter-label">Family:</span>
              {(['All', ...FAMILY_ORDER] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`chip${ledgerFamily === f ? ' active' : ''}`}
                  onClick={() => setLedgerFamily(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="filter-group" role="group" aria-label="Filter by business model">
              <span className="filter-label">Archetype:</span>
              {(['All', ...ARCHETYPE_ORDER] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`chip${ledgerArch === a ? ' active' : ''}`}
                  onClick={() => setLedgerArch(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="table-wrap">
            <table className="data-table ledger-table">
              <thead>
                <tr>
                  <th scope="col" aria-sort={ledgerSort === 'family' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('family')}>Experience &amp; MECE Boundary</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'revenue' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('revenue')}>Revenue</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'hours' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('hours')}>Hours / yr</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'price' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('price')}>$ / hour</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'cost' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('cost')}>Supply $/h</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'moat' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('moat')}>Moat</button>
                  </th>
                  <th scope="col" aria-sort={ledgerSort === 'ai' ? 'descending' : undefined}>
                    <button onClick={() => setLedgerSort('ai')}>AI Exp.</button>
                  </th>
                  <th scope="col">Archetype</th>
                </tr>
              </thead>
              <tbody>
                {ledgerRows.map((m) => {
                  const mode = modeOf(m);
                  const c = MODE_CONFIG[mode].color;
                  return (
                    <tr key={m.id}>
                      <td>
                        <div className="ledger-name-cell">
                          <span className="dot" style={{ background: c }} />
                          <b>{m.name}</b>
                          <span className="ticker">${m.ticker}</span>
                        </div>
                        <span className="sub">
                          {m.family} · {mode} · {m.examples}
                        </span>
                        <div className="ledger-boundary">
                          <span>
                            <b>In:</b> {m.includes}
                          </span>
                          <span>
                            <b>Out:</b> {m.excludes}
                          </span>
                        </div>
                      </td>
                      <td className="num">
                        {fmtMoney(m.revenueB)}
                        <span className={`conf conf-${m.revenueConfidence}`}>{m.revenueConfidence}</span>
                      </td>
                      <td className="num">
                        {fmtHours(m.hoursB)}
                        <span className={`conf conf-${m.hoursConfidence}`}>{m.hoursConfidence}</span>
                      </td>
                      <td className="num">
                        <b>{fmtPrice(pricePerHour(m))}</b>
                      </td>
                      <td className="num">{fmtCost(m.supplyCostPerHour)}</td>
                      <td className="num">{m.moat}</td>
                      <td className="num">{m.aiExposure}</td>
                      <td>
                        <span className="tag tag-plain">{archetypeOf(m, medPrice)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="explore" id="explore" aria-labelledby="explore-title">
          <div className="explore-copy">
            <div className="kicker">Interactive 3D Space · Economic &amp; Biological Lenses</div>
            <h2 id="explore-title">Explore all six dimensions at once</h2>
            <p>
              Each chapter above is a two-dimensional slice of a six-dimensional space. Open the 3D explorer to rotate the economic cube (supply cost × revenue
              per hour × platform moat) or the biological cube (cognitive load × agency × sensory bandwidth), filter by mode or family, inspect vertical
              floor stems and wall projections, or adjust any rubric score yourself.
            </p>
            <div className="explore-actions">
              <button className="btn-primary" onClick={onOpenExplorer}>
                Open 3D explorer
              </button>
              <button className="btn-ghost" onClick={onOpenMethod}>
                Read full methodology &amp; sources
              </button>
            </div>
          </div>
          <div ref={stageRef} className="explore-stage" aria-hidden="true">
            {stageNear && !explorerOpen ? (
              <Suspense fallback={<div className="stage-loading">Loading 3D scene…</div>}>
                <Explorer preview />
              </Suspense>
            ) : (
              <div className="stage-loading">3D preview</div>
            )}
          </div>
        </section>

        <footer className="footer">
          <span>
            {D.length} MECE consumer experiences · {fmtMoney(totalRevenueB)} · {fmtHours(totalHoursB)} a year
          </span>
          <button className="link" onClick={onOpenMethod}>
            Method, rubrics &amp; full data table
          </button>
          <button className="link" onClick={onOpenExplorer}>
            Open 3D explorer
          </button>
        </footer>
      </main>

      <Tooltip tip={tip} />
    </>
  );
}
