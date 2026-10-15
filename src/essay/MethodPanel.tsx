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
          <h2 id="method-title">Method &amp; data</h2>
          <button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close method and data">
            ✕
          </button>
        </header>

        <section>
          <h3>Scope</h3>
          <p>
            Each node is a consumer experience: something a person spends attention on. Revenue is consumer spend plus advertising at the point of the experience,
            global, in USD, for the latest full year (2024 or 2025). Hardware and internet access are excluded, as are person-to-person messaging, casino and lottery
            gambling, and education. Each dollar is assigned to one node only. The {D.length} nodes total {fmtMoney(totalRevenueB)} and {fmtHours(totalHoursB)} a year.
          </p>
          <p>
            Where a carve-out was needed it is stated in the node's note: sports rights move from TV and streaming to Sports viewing (80/20, the split Ampere reports
            for broadcasters and streamers); audiobooks are taken out of books; YouTube TV and NFL Sunday Ticket are taken out of YouTube.
          </p>
          <p>
            Hours are estimates of global annual attention, built from time-use panels (GWI via DataReportal), platform figures and attendance counts. Most are
            order-of-magnitude estimates and are graded Low. Revenue per hour is revenue divided by hours.
          </p>
        </section>

        <section>
          <h3>Families: an ordered decision tree</h3>
          <p>The first question that answers yes assigns the family, so every experience lands in exactly one.</p>
          <ol className="tree">
            {FAMILY_ORDER.map((f) => (
              <li key={f}>
                <span className="tree-q">{FAMILY_CONFIG[f].rule}</span>
                <span className="tree-a" style={{ ['--c' as string]: MODE_CONFIG[FAMILY_CONFIG[f].mode].color }}>
                  {f}
                </span>
                <span className="tree-mode">{FAMILY_CONFIG[f].mode}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h3>Rubrics</h3>
          <p>Every 0–100 score is set against written anchors, so any score can be challenged by pointing at one.</p>
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
          <p>Assigned from position, not by hand. The price cut is the median revenue per hour, currently {fmtPrice(med)}.</p>
          <dl className="defs">
            {ARCHETYPE_ORDER.map((a) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{ARCHETYPES[a].rule}.</dd>
              </div>
            ))}
          </dl>
          <p>
            The efficient frontier is the set of experiences that no other beats on both supply cost and revenue per hour. The biological lens has no better or worse
            direction, so it has no frontier.
          </p>
        </section>

        <section>
          <h3>2030 AI scenario</h3>
          <p>
            Supply cost in 2030 = today's cost ÷ 10^({AI_COST_DECADES_AT_FULL_EXPOSURE} × AI exposure). An exposure of 50 makes an hour 10× cheaper to make, 100 makes it
            100× cheaper, 10 about 1.6×. It is an assumption to make the direction visible, not a forecast.
          </p>
        </section>

        <section>
          <h3>All 28 experiences</h3>
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
                  <th scope="col">Notes &amp; sources</th>
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
                        <summary>{m.revenueYear} · details</summary>
                        <p>
                          <b>Revenue.</b> {m.revenueNote}
                        </p>
                        <p>
                          <b>Hours.</b> {m.hoursNote}
                        </p>
                        <p>
                          <b>Supply cost.</b> {m.supplyCostNote}
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

        <section>
          <h3>What changed from the first version</h3>
          <ul className="changes">
            <li>Nodes are now consumer experiences only. Generative AI became AI chat; VR, voice assistants and digital collectibles were folded in or dropped.</li>
            <li>Families are assigned by one decision tree instead of three overlapping criteria.</li>
            <li>
              Extraction yield was split into hours and revenue per hour, both measured. CapEx became supply cost per hour; its barrier-to-entry meaning moved into platform
              moat.
            </li>
            <li>Added mobile games, music, radio, audiobooks, YouTube, linear TV, sports (viewing, attendance and betting), newsletters, concerts and cinema.</li>
            <li>Every revenue figure now has a source; bubble area is proportional to revenue.</li>
            <li>Composite averages were removed; archetypes are derived from position.</li>
          </ul>
        </section>
      </aside>
    </div>
  );
}
