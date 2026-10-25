import { useEffect, useRef, useState } from 'react';
import { modalitiesData as D, type Modality } from '../data/modalities';
import { RUBRICS, AI_COST_DECADES_AT_FULL_EXPOSURE } from '../data/rubrics';
import { ARCHETYPES, ARCHETYPE_ORDER, archetypeOf, fmtCost, fmtHours, fmtMoney, fmtPrice, medianPrice, pricePerHour } from '../data/derive';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_CONFIG } from '../data/taxonomy';
import { totalHoursB, totalRevenueB } from '../data/facts';

type SortKey = 'family' | 'revenue' | 'hours' | 'price' | 'cost';

const SORTS: Record<SortKey, (a: Modality, b: Modality) => number> = {
  family: (a, b) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family) || b.revenueB - a.revenueB,
  revenue: (a, b) => b.revenueB - a.revenueB,
  hours: (a, b) => b.hoursB - a.hoursB,
  price: (a, b) => pricePerHour(b) - pricePerHour(a),
  cost: (a, b) => b.supplyCostPerHour - a.supplyCostPerHour,
};

export function MethodPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sort, setSort] = useState<SortKey>('family');
  const closeRef = useRef<HTMLButtonElement>(null);
  const med = medianPrice(D);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const rows = [...D].sort(SORTS[sort]);
  const th = (key: SortKey, label: string) => (
    <th scope="col" aria-sort={sort === key ? 'descending' : undefined}>
      <button onClick={() => setSort(key)}>{label}</button>
    </th>
  );

  return (
    <div className="method-backdrop" onClick={onClose}>
      <aside className="method" role="dialog" aria-modal="true" aria-labelledby="method-title" onClick={(e) => e.stopPropagation()}>
        <header className="method-head">
          <h2 id="method-title">Method, MECE rules &amp; data</h2>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close method and data">
            ✕
          </button>
        </header>

        <section>
          <h3>Scope &amp; MECE guarantee</h3>
          <p>
            Each node is a distinct consumer attention experience. Revenue is consumer spend plus advertising at the point of the experience, global, in USD,
            for the latest full year (2024 or 2025). Device hardware (phones, TVs, consoles, headsets), raw broadband/cellular access and B2B enterprise
            software are excluded because they are conduits or work tools rather than consumer media experiences. Every consumer media, entertainment, gaming,
            conversational and venue experience is included, and each dollar and hour is assigned to <b>one node only</b>. Together, the {D.length} nodes total{' '}
            <b>{fmtMoney(totalRevenueB)}</b> and <b>{fmtHours(totalHoursB)}</b> a year.
          </p>
          <p>
            Where multi-service platforms span multiple modalities, explicit carve-outs prevent double-counting:
          </p>
          <ul className="changes">
            <li>
              <b>Live sports broadcasts</b> move from Linear TV and Streaming TV into <b>Sports viewing</b> (80/20 split, matching Ampere’s broadcaster vs
              streamer sports-rights share), while stadium tickets sit in <b>Live sports attendance</b> and sportsbooks/iGaming sit in{' '}
              <b>Betting, iGaming &amp; lotteries</b>.
            </li>
            <li>
              <b>Alphabet / YouTube</b> is split cleanly across three nodes: core creator video, Shorts and YouTube Premium sit in <b>YouTube</b>; YouTube TV
              bundles sit in <b>Linear &amp; pay TV</b>; YouTube Music sits in <b>Recorded music</b>.
            </li>
            <li>
              <b>Meta &amp; social platforms</b>: public algorithmic feeds (Instagram, Facebook, X, Reddit, LinkedIn, Pinterest) sit in <b>Social networks</b>;
              WhatsApp, Discord, Telegram and WeChat 1-on-1/group chats sit in <b>Messaging &amp; communities</b>; standalone vertical video apps (TikTok,
              Douyin, Kuaishou) sit in <b>Short-video apps</b>.
            </li>
            <li>
              <b>Book publishing &amp; reading</b>: narrated audio editions are carved out into <b>Audiobooks &amp; audio drama</b>; manga, graphic novels and
              webtoons sit in <b>Comics, manga &amp; webtoons</b>; daily word/logic puzzles (Wordle, NYT Games, Chess.com, Duolingo) sit in{' '}
              <b>Gamified learning &amp; daily puzzles</b>.
            </li>
          </ul>
          <p>
            Hours are estimates of global annual attention built from time-use panels (GWI via DataReportal), platform disclosures and venue attendance counts.
            Revenue per hour is annual revenue divided by annual hours.
          </p>
        </section>

        <section>
          <h3>Families: an ordered 6-gate decision tree</h3>
          <p>The first question that answers “Yes” claims the experience, guaranteeing that the six families are mutually exclusive and collectively exhaustive.</p>
          <ol className="tree">
            {FAMILY_ORDER.map((f, i) => (
              <li key={f}>
                <span className="tree-q">
                  <b>Gate {i + 1}.</b> {FAMILY_CONFIG[f].rule}
                </span>
                <span className="tree-a" style={{ ['--c' as string]: MODE_CONFIG[FAMILY_CONFIG[f].mode].color }}>
                  {f}
                </span>
                <span className="tree-mode">{FAMILY_CONFIG[f].mode}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3>Rubrics (0–100 anchored scales)</h3>
          <p>Every 0–100 score is set against five written anchors so any score can be audited or adjusted in the 3D explorer.</p>
          <div className="rubrics">
            {RUBRICS.map((r) => (
              <div key={r.key} className="rubric">
                <div className="rubric-head">
                  <b>{r.name}</b>
                  <span>{r.lens}</span>
                </div>
                <p className="rubric-q">{r.question}</p>
                <ul>
                  {r.anchors.map((a) => (
                    <li key={a.score}>
                      <span className="anchor-score">{a.score}</span>
                      {a.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>Business models</h3>
          <p>Assigned automatically from position on the Supply Cost × Revenue/Hour plane. The price cut is the median revenue per hour ({fmtPrice(med)}).</p>
          <dl className="defs">
            {ARCHETYPE_ORDER.map((a) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{ARCHETYPES[a].rule}.</dd>
              </div>
            ))}
          </dl>
          <p>
            The <b>efficient frontier</b> is the Pareto set of experiences that no other experience beats on both lower supply cost and higher revenue per hour.
          </p>
        </section>

        <section>
          <h3>2030 AI scenario</h3>
          <p>
            Supply cost in 2030 = today’s cost ÷ 10^({AI_COST_DECADES_AT_FULL_EXPOSURE} × AI exposure). An exposure of 50 makes an hour 10× cheaper to make, 100
            makes it 100× cheaper, 10 about 1.6×. It is a structural sensitivity test to make the direction visible, not a point forecast.
          </p>
        </section>

        <section>
          <h3>All {D.length} MECE experiences</h3>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {th('family', 'Experience')}
                  {th('revenue', 'Revenue')}
                  {th('hours', 'Hours')}
                  {th('price', '$/hour')}
                  {th('cost', 'Supply $/h')}
                  <th scope="col">Model</th>
                  <th scope="col">MECE boundary &amp; sources</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <span className="dot" style={{ background: MODE_CONFIG[FAMILY_CONFIG[m.family].mode].color }} />
                      <b>{m.name}</b>
                      <span className="sub">
                        {m.family} · ${m.ticker}
                      </span>
                    </td>
                    <td className="num">
                      {fmtMoney(m.revenueB)}
                      <span className={`conf conf-${m.revenueConfidence}`}>{m.revenueConfidence}</span>
                    </td>
                    <td className="num">
                      {fmtHours(m.hoursB)}
                      <span className={`conf conf-${m.hoursConfidence}`}>{m.hoursConfidence}</span>
                    </td>
                    <td className="num">{fmtPrice(pricePerHour(m))}</td>
                    <td className="num">{fmtCost(m.supplyCostPerHour)}</td>
                    <td>{archetypeOf(m, med)}</td>
                    <td className="notes">
                      <details>
                        <summary>{m.revenueYear} · boundary &amp; notes</summary>
                        <p>
                          <b>Included:</b> {m.includes}
                        </p>
                        <p>
                          <b>Carved out:</b> {m.excludes}
                        </p>
                        <p>
                          <b>Revenue:</b> {m.revenueNote}
                        </p>
                        <p>
                          <b>Hours:</b> {m.hoursNote}
                        </p>
                        <p>
                          <b>Supply cost:</b> {m.supplyCostNote}
                        </p>
                        <ul>
                          {m.sources.map((s) => (
                            <li key={s.url}>
                              <a href={s.url} target="_blank" rel="noreferrer">
                                {s.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </aside>
    </div>
  );
}
