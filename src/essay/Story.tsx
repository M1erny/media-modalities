import { useMemo } from 'react';
import { modalitiesData as D, type Modality } from '../data/modalities';
import {
  ARCHETYPES,
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
  supplyCost,
  supplyCost2030,
  supplyCostPerHour2030,
  type Archetype,
} from '../data/derive';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_CONFIG, type Family } from '../data/taxonomy';
import {
  byId,
  cheapest,
  familyHours,
  familyRevenue,
  familyShare,
  isoRevenueLines,
  olsLine,
  priceSpread,
  priciest,
  totalHoursB,
  totalRevenueB,
} from '../data/facts';
import { costAxis, hoursAxis, priceAxis, scoreAxis } from './axes';
import { Chapter } from './Chapter';
import { Scatter, type ChartCtx, type ScatterPoint } from './charts/Scatter';
import { Treemap } from './charts/Treemap';
import { ModalityTip, type TipState } from './Tooltip';

const maxRev = Math.max(...D.map((m) => m.revenueB));
const medPrice = medianPrice(D);
const frontier = economicFrontier(D);
const radius = (m: Modality) => Math.sqrt(m.revenueB / maxRev);
const color = (m: Modality) => MODE_CONFIG[modeOf(m)].color;

const LADDER_IDS = [
  'sports_attendance',
  'immersive',
  'concerts',
  'theme_parks',
  'betting',
  'museums',
  'cinema',
  'dating',
  'tabletop',
  'learning_play',
  'news',
  'ai_chat',
  'social',
  'short_video',
  'messaging',
  'youtube',
  'music',
  'podcasts',
];

export function ChapterScale({ onTip }: { onTip: (t: TipState | null) => void }) {
  const pts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.hoursB, y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const ladderSet = useMemo(() => new Set(LADDER_IDS), []);

  const steps = [
    <>
      <h3>Where the money goes: {fmtMoney(totalRevenueB)} a year</h3>
      <p>
        Every rectangle is one consumer experience; its area is annual global revenue (consumer spend plus ads at the point of use). <b>Watch</b> takes{' '}
        {Math.round(familyShare('Watch', 'revenue') * 100)}% of all dollars ({fmtMoney(familyRevenue('Watch'))}). <b>Play</b> is second at{' '}
        {Math.round(familyShare('Play', 'revenue') * 100)}% ({fmtMoney(familyRevenue('Play'))}), ahead of <b>Attend</b> at{' '}
        {Math.round(familyShare('Attend', 'revenue') * 100)}% ({fmtMoney(familyRevenue('Attend'))}).
      </p>
      <p className="aside">Hover or tap any block for its sources, confidence grade, and exact MECE boundary (what is included vs carved out).</p>
    </>,
    <>
      <h3>Now resize the same 32 blocks by time: {fmtHours(totalHoursB)} a year</h3>
      <p>
        <b>Attend</b> — cinemas, concerts, stadiums, theatre, theme parks, museums and immersive rooms — collapses to{' '}
        {(familyShare('Attend', 'hours') * 100).toFixed(1)}% of global hours ({fmtHours(familyHours('Attend'))}). Meanwhile <b>Watch</b>, <b>Listen</b> and{' '}
        <b>Converse</b> (led by messaging &amp; communities) swell to{' '}
        {(100 * (familyShare('Watch', 'hours') + familyShare('Listen', 'hours') + familyShare('Converse', 'hours'))).toFixed(0)}% of all human media attention.
      </p>
    </>,
    <>
      <h3>Hours × revenue per hour = total revenue</h3>
      <p>
        Put hours on the horizontal axis and revenue per hour on the vertical, both on log scales. Because revenue is their product, experiences on the same
        diagonal line earn the same total dollars: <b>Live sports attendance</b> ({fmtHours(byId.get('sports_attendance')!.hoursB)} ×{' '}
        {fmtPrice(pricePerHour(byId.get('sports_attendance')!))}/h = $60B) sits near the same diagonal as <b>YouTube</b> ({fmtHours(byId.get('youtube')!.hoursB)}{' '}
        × {fmtPrice(pricePerHour(byId.get('youtube')!))}/h = $54B) and <b>Messaging &amp; communities</b> ({fmtHours(byId.get('messaging')!.hoursB)} ×{' '}
        {fmtPrice(pricePerHour(byId.get('messaging')!))}/h = $45B).
      </p>
    </>,
    <>
      <h3>A {priceSpread}× ladder in the price of an hour</h3>
      <p>
        From <b>{priciest.name}</b> at {fmtPrice(pricePerHour(priciest))}/h down to <b>{cheapest.name}</b> at {fmtPrice(pricePerHour(cheapest))}/h, the rate the
        market collects for sixty minutes of human attention spans more than two orders of magnitude. Out-of-home venues sit at the top; ad-funded audio, video
        and messaging sit at the bottom.
      </p>
    </>,
  ];

  const isoBackground = ({ sx, sy }: ChartCtx) => (
    <g className="iso">
      {isoRevenueLines.map((rev) => {
        const x1 = hoursAxis.domain[0],
          y1 = rev / x1;
        const y2 = priceAxis.domain[0],
          x2 = rev / y2;
        const lx = Math.max(hoursAxis.domain[0] * 1.4, rev / (priceAxis.domain[1] * 0.55));
        const ly = rev / lx;
        return (
          <g key={rev}>
            <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} />
            <text x={sx(lx) + 6} y={sy(ly) + 4} textAnchor="start">
              ${rev}B rev
            </text>
          </g>
        );
      })}
    </g>
  );

  const ladderForeground = ({ sy, plot }: ChartCtx) => {
    const x0 = plot.x + plot.w * 0.18;
    const x1 = plot.x + plot.w * 0.78;
    return (
      <g className="ladder">
        {LADDER_IDS.map((id) => {
          const m = byId.get(id)!;
          const y = sy(pricePerHour(m));
          return (
            <g key={id}>
              <line x1={x0} x2={x1} y1={y} y2={y} stroke={color(m)} />
              <text x={x0 - 8} y={y + 4} textAnchor="end">
                {m.short}
              </text>
              <text className="num" x={x1 + 8} y={y + 4}>
                {fmtPrice(pricePerHour(m))}/h
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <Chapter
      id="scale"
      number="Chapter 1 · Scale & Attention"
      title="What we pay for is not what we spend time on"
      intro={`The 32 MECE experiences total ${fmtMoney(totalRevenueB)} and ${fmtHours(totalHoursB)} a year. Revenue is Hours × Price per hour — and those two numbers pull in opposite directions.`}
      takeaway={
        <>
          <b>Out-of-home (Attend)</b> captures <b>{(familyShare('Attend', 'revenue') * 100).toFixed(0)}% of all revenue</b> on just{' '}
          <b>{(familyShare('Attend', 'hours') * 100).toFixed(1)}% of all hours</b> (~$5.70/h), while <b>Watch, Listen &amp; Converse</b> capture{' '}
          <b>{(100 * (familyShare('Watch', 'hours') + familyShare('Listen', 'hours') + familyShare('Converse', 'hours'))).toFixed(0)}% of hours</b> at pennies
          per hour.
        </>
      }
      stepLabels={['Money ($B)', 'Time (Hours)', 'Hours × $/h', 'The 450× Ladder']}
      steps={steps}
      graphic={(step) =>
        step < 2 ? (
          <Treemap
            data={D}
            metric={step === 0 ? 'revenue' : 'hours'}
            tip={(id) => <ModalityTip m={byId.get(id)!} />}
            onTip={onTip}
            format={step === 0 ? fmtMoney : fmtHours}
          />
        ) : (
          <Scatter
            points={pts}
            xAxis={hoursAxis}
            yAxis={priceAxis}
            highlight={step === 3 ? ladderSet : null}
            labels={step === 3 ? 'none' : 'auto'}
            background={step === 2 ? isoBackground : undefined}
            obstacles={
              step === 2
                ? ({ sx, sy }) =>
                    isoRevenueLines.map((rev) => {
                      const lx = Math.max(hoursAxis.domain[0] * 1.4, rev / (priceAxis.domain[1] * 0.55));
                      const ly = rev / lx;
                      return { x: sx(lx) + 4, y: sy(ly) - 8, w: 58, h: 16 };
                    })
                : undefined
            }
            foreground={step === 3 ? ladderForeground : undefined}
            tip={(id) => <ModalityTip m={byId.get(id)!} />}
            onTip={onTip}
            ariaLabel="Hours of attention versus revenue per hour"
          />
        )
      }
      caption={(step) =>
        step < 2
          ? `Outer boxes are the 6 MECE families; inner boxes are the 32 experiences. Colour is mode. Click any step pill above to flip between Money and Time.`
          : `Bubble area is proportional to annual revenue. Diagonal lines show constant total revenue (Hours × $/hour).`
      }
    />
  );
}

export function ChapterModels({ onTip }: { onTip: (t: TipState | null) => void }) {
  const pts: ScatterPoint[] = useMemo(
    () =>
      D.map((m) => ({
        id: m.id,
        x: supplyCost(m),
        y: pricePerHour(m),
        r: radius(m),
        color: color(m),
        label: m.short,
      })),
    [],
  );

  const byArch = useMemo(() => {
    const map = new Map<Archetype, Modality[]>();
    for (const a of ARCHETYPE_ORDER) map.set(a, []);
    for (const m of D) map.get(archetypeOf(m, medPrice))!.push(m);
    return map;
  }, []);

  const steps = [
    ...ARCHETYPE_ORDER.map((a) => {
      const list = byArch.get(a)!;
      return (
        <div key={a}>
          <div className="eyebrow">{ARCHETYPES[a].rule}</div>
          <h3>
            {a} <span className="count">{list.length}</span>
          </h3>
          <p>{ARCHETYPES[a].description}</p>
          <p className="members">{list.map((m) => m.short).join(' · ')}</p>
        </div>
      );
    }),
    <>
      <h3>Six experiences sit on the efficient frontier</h3>
      <p>
        No other node beats them on both axes: <b>Short-video apps</b>, <b>Social networks</b>, <b>AI chat</b>, <b>Board &amp; tabletop</b>,{' '}
        <b>Escape rooms &amp; immersive</b> and <b>Live sports attendance</b>. Every other experience pays more to make an hour, earns less for it, or both.
      </p>
    </>,
  ];

  const highlightFor = (step: number): Set<string> | null => {
    if (step < 4) {
      const a = ARCHETYPE_ORDER[step];
      return new Set(byArch.get(a)!.map((m) => m.id));
    }
    return frontier;
  };

  const quadBackground = (activeArch: Archetype | null, showFrontier: boolean) => ({ sx, sy, plot, pos }: ChartCtx) => {
    const cx = sx(50);
    const cy = sy(medPrice);
    const quads: { arch: Archetype; x: number; y: number; anchor: 'start' | 'end' }[] = [
      { arch: 'Premium experiences', x: plot.x + plot.w - 10, y: plot.y + 18, anchor: 'end' },
      { arch: 'Margin niches', x: plot.x + 10, y: plot.y + 18, anchor: 'start' },
      { arch: 'Volume engines', x: plot.x + 10, y: plot.y + plot.h - 10, anchor: 'start' },
      { arch: 'Scale bets', x: plot.x + plot.w - 10, y: plot.y + plot.h - 10, anchor: 'end' },
    ];
    const frontierPts = [...frontier]
      .map((id) => ({ id, ...pos.get(id)!, cost: byId.get(id)!.supplyCostPerHour }))
      .sort((a, b) => a.cost - b.cost);
    const d = frontierPts.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' ');
    return (
      <g>
        <line className="quad-line" x1={cx} x2={cx} y1={plot.y} y2={plot.y + plot.h} strokeDasharray="4 4" />
        <line className="quad-line" x1={plot.x} x2={plot.x + plot.w} y1={cy} y2={cy} strokeDasharray="4 4" />
        <text className="quad-note" x={cx + 5} y={plot.y + plot.h - 6}>
          $100k/h cut
        </text>
        <text className="quad-note" x={plot.x + plot.w - 6} y={cy - 5} textAnchor="end">
          median {fmtPrice(medPrice)}/h
        </text>
        {quads.map((q) => (
          <text key={q.arch} className={`quad-label${activeArch === q.arch ? ' on' : ''}`} x={q.x} y={q.y} textAnchor={q.anchor}>
            {q.arch}
          </text>
        ))}
        {showFrontier && <path className="frontier" d={d} />}
      </g>
    );
  };

  return (
    <Chapter
      id="models"
      number="Chapter 2 · Business Models"
      title="Supply cost and price per hour sort media into four business models"
      intro="Replace consumer hours with what it costs the industry to make one fresh hour of content, from $100 of user-generated video to $30M of theatrical film."
      takeaway={
        <>
          Every experience falls into one of <b>4 structural quadrants</b> split at <b>$100k/h supply cost</b> and the <b>{fmtPrice(medPrice)}/h median yield</b>.
          Six experiences define the <b>Pareto efficient frontier</b>.
        </>
      }
      stepLabels={['Volume Engines', 'Margin Niches', 'Scale Bets', 'Premium Experiences', 'Efficient Frontier']}
      steps={steps}
      graphic={(step) => (
        <Scatter
          points={pts}
          xAxis={costAxis}
          yAxis={priceAxis}
          highlight={highlightFor(step)}
          background={quadBackground(step < 4 ? ARCHETYPE_ORDER[step] : null, step === 4)}
          obstacles={({ plot, sy }) => {
            const cy = sy(medPrice);
            return [
              { x: plot.x + 6, y: plot.y + 4, w: 110, h: 20 },
              { x: plot.x + plot.w - 150, y: plot.y + 4, w: 146, h: 20 },
              { x: plot.x + 6, y: plot.y + plot.h - 24, w: 122, h: 20 },
              { x: plot.x + plot.w - 94, y: plot.y + plot.h - 24, w: 90, h: 20 },
              { x: plot.x + plot.w - 110, y: cy - 18, w: 106, h: 16 },
            ];
          }}
          tip={(id) => {
            const m = byId.get(id)!;
            return <ModalityTip m={m} rows={[['Supply cost', `${fmtCost(m.supplyCostPerHour)}/h`], ['Model', archetypeOf(m, medPrice)]]} />;
          }}
          onTip={onTip}
          ariaLabel="Supply cost per hour versus revenue per hour"
        />
      )}
      caption={() =>
        `Vertical dashed line: $100k/h supply cost. Horizontal dashed line: median revenue per hour (${fmtPrice(medPrice)}). Archetypes are derived from position.`
      }
    />
  );
}

export function ChapterAI({ onTip }: { onTip: (t: TipState | null) => void }) {
  const todayPts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: supplyCost(m), y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const futurePts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: supplyCost2030(m), y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const ghostPts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: `ghost-${m.id}`, x: supplyCost(m), y: pricePerHour(m), r: radius(m), color: color(m), label: '', hollow: true })),
    [],
  );
  const anchored = useMemo(() => new Set(D.filter((m) => m.aiExposure <= 35).map((m) => m.id)), []);
  const bigMovers = useMemo(() => new Set(D.filter((m) => m.aiExposure >= 60).map((m) => m.id)), []);

  const arrows = ({ sx, sy }: ChartCtx) => (
    <g>
      <defs>
        <marker id="arr" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path className="arrowhead" d="M0,1 L7,4 L0,7 z" />
        </marker>
      </defs>
      {D.filter((m) => m.aiExposure >= 55).map((m) => {
        const x1 = sx(supplyCost(m));
        const x2 = sx(supplyCost2030(m));
        const y = sy(pricePerHour(m));
        if (x1 - x2 < 12) return null;
        return <line key={m.id} className="arrow" x1={x1} y1={y} x2={x2 + 6} y2={y} markerEnd="url(#arr)" />;
      })}
    </g>
  );

  const steps = [
    <>
      <h3>Today: studio craft is expensive; user uploads are cheap</h3>
      <p>
        The right half of the chart is expensive because cameras, sets, code, orchestras and newsrooms are paid by the hour. The left half is cheap because users
        and creators upload for free or for a revenue share.
      </p>
    </>,
    <>
      <h3>2030 scenario: rendered and written media slide left</h3>
      <p>
        Apply each experience’s AI exposure score to its supply cost: <code>cost ÷ 10^(2 × exposure)</code>. <b>Games</b>, <b>streaming TV</b>, <b>books</b>,{' '}
        <b>audiobooks</b>, <b>gamified learning</b> and <b>news</b> shift one to two orders of magnitude cheaper to make (hollow circles are 2025; filled are 2030).
      </p>
      <p className="aside">This is a scenario to make the direction visible, not a forecast. We keep revenue per hour fixed to isolate the supply shock.</p>
    </>,
    <>
      <h3>Physical venues and real-stakes events barely move</h3>
      <p>
        <b>Concerts</b>, <b>live sports</b>, <b>theme parks</b>, <b>museums &amp; zoos</b>, <b>theatre</b>, <b>escape rooms</b>, <b>tabletop</b> and{' '}
        <b>betting &amp; iGaming</b> are anchored by real bodies, real turf and real money. When every digital stream becomes cheap to synthesize, scarcity concentrates in
        what cannot be rendered.
      </p>
    </>,
  ];

  return (
    <Chapter
      id="ai"
      number="Chapter 3 · The 2030 Supply Shock"
      title="Where generative AI compresses supply cost — and where it cannot"
      intro="Generative AI does not touch every medium equally. It compresses the cost of pixels, prose, code and studio audio while leaving physical presence and live stakes intact."
      takeaway={
        <>
          High-exposure digital media (<b>Games, Video, Books, Audio, Learning</b>) compress <b>10×–60× in creation cost</b>, while physical venues and live stakes (<b>Attend, Sports, Tabletop, Betting</b>) become the ultimate scarcity anchor.
        </>
      }
      stepLabels={['2025 Baseline', '2030 AI Shift', 'The Physical Anchor']}
      steps={steps}
      graphic={(step) => (
        <Scatter
          points={step === 0 ? todayPts : [...ghostPts, ...futurePts]}
          xAxis={costAxis}
          yAxis={priceAxis}
          highlight={
            step === 0
              ? null
              : step === 1
                ? new Set([...bigMovers, ...[...bigMovers].map((id) => `ghost-${id}`)])
                : new Set([...anchored, ...[...anchored].map((id) => `ghost-${id}`)])
          }
          background={step >= 1 ? arrows : undefined}
          tip={(id) => {
            const m = byId.get(id.replace(/^ghost-/, ''))!;
            return (
              <ModalityTip
                m={m}
                rows={[
                  ['Supply cost today', `${fmtCost(m.supplyCostPerHour)}/h`],
                  ['2030 scenario', `${fmtCost(supplyCostPerHour2030(m))}/h`],
                  ['AI exposure', `${m.aiExposure} / 100`],
                ]}
              />
            );
          }}
          onTip={onTip}
          ariaLabel="Supply cost shift from 2025 to 2030 scenario"
        />
      )}
      caption={(step) =>
        step === 0
          ? '2025 baseline: supply cost per fresh hour versus revenue per hour.'
          : 'Hollow circles: 2025 supply cost. Filled circles and arrows: 2030 scenario (cost ÷ 10^(2 × AI exposure)).'
      }
    />
  );
}

export function ChapterMind({ onTip }: { onTip: (t: TipState | null) => void }) {
  const cogAxis = scoreAxis('Cognitive load (0 effortless → 100 demanding)');
  const agAxis = scoreAxis('Agency (0 fixed stream → 100 co-created)');

  const bioPts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.cognitiveLoad, y: m.agency, r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const cogPricePts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.cognitiveLoad, y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const agPricePts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.agency, y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );

  const cogFit = useMemo(() => olsLine(D.map((m) => ({ x: m.cognitiveLoad, y: Math.log10(pricePerHour(m)) }))), []);
  const agFit = useMemo(() => olsLine(D.map((m) => ({ x: m.agency, y: Math.log10(pricePerHour(m)) }))), []);

  const trend = (fit: ReturnType<typeof olsLine>) => ({ sx, sy, plot }: ChartCtx) => (
    <g>
      <line className="trend" x1={sx(0)} y1={sy(10 ** fit.at(0))} x2={sx(100)} y2={sy(10 ** fit.at(100))} strokeDasharray="5 4" />
      <g className="corner-note" transform={`translate(${plot.x + plot.w - 138}, ${plot.y + 10})`}>
        <rect width="128" height="28" rx="5" />
        <text x="64" y="18" textAnchor="middle">
          r = {fit.r.toFixed(2)} (flat)
        </text>
      </g>
    </g>
  );

  const steps = [
    <>
      <h3>Cognitive load and agency cleanly separate Lean-back from Lean-forward</h3>
      <p>
        When we plot mental effort against user control, the families sort themselves: <b>Play</b> and <b>Converse</b> (messaging, dating, AI chat) live in the
        upper-right (you think, act and reply); <b>Watch</b> and <b>Listen</b> live in the lower-left (the stream washes over you); <b>Read</b> sits in the
        high-effort, low-agency corner.
      </p>
    </>,
    <>
      <h3>Yet cognitive load does not predict price per hour (r = {cogFit.r.toFixed(2)})</h3>
      <p>
        Put revenue per hour on the vertical axis and the slope disappears. <b>Books</b>, <b>PC games</b> and <b>gamified learning</b> demand intense focus for
        35¢–45¢ an hour; <b>concerts</b> and <b>theme parks</b> ask very little mental effort and collect $7–$12. The market does not pay you for working harder.
      </p>
    </>,
    <>
      <h3>Agency does not predict price per hour either (r = {agFit.r.toFixed(2)})</h3>
      <p>
        <b>Messaging</b>, <b>AI chat</b> and <b>PC games</b> give you near-total control over what happens next and earn 5¢–37¢ an hour. <b>Cinema</b> and{' '}
        <b>live sports attendance</b> give you zero control over the outcome and earn $2–$12 an hour.
      </p>
    </>,
  ];

  return (
    <Chapter
      id="mind"
      number="Chapter 4 · The Biological Lens"
      title="Effort and agency do not set the price of an hour"
      intro="Each experience is scored 0–100 against written anchors for cognitive load and user agency (see Method & data for the full rubric)."
      takeaway={
        <>
          Mental effort (<b>r = {cogFit.r.toFixed(2)}</b>) and user agency (<b>r = {agFit.r.toFixed(2)}</b>) cleanly divide <b>Lean-back</b> from{' '}
          <b>Lean-forward</b> habits, but have <b>near-zero correlation</b> with what consumers pay per hour.
        </>
      }
      stepLabels={['Load × Agency', 'Load × $/hour', 'Agency × $/hour']}
      steps={steps}
      graphic={(step) =>
        step === 0 ? (
          <Scatter
            points={bioPts}
            xAxis={cogAxis}
            yAxis={agAxis}
            tip={(id) => {
              const m = byId.get(id)!;
              return <ModalityTip m={m} rows={[['Cognitive load', String(m.cognitiveLoad)], ['Agency', String(m.agency)]]} />;
            }}
            onTip={onTip}
            ariaLabel="Cognitive load versus agency"
          />
        ) : step === 1 ? (
          <Scatter
            points={cogPricePts}
            xAxis={cogAxis}
            yAxis={priceAxis}
            background={trend(cogFit)}
            obstacles={({ plot }) => [{ x: plot.x + plot.w - 142, y: plot.y + 6, w: 136, h: 36 }]}
            tip={(id) => {
              const m = byId.get(id)!;
              return <ModalityTip m={m} rows={[['Cognitive load', String(m.cognitiveLoad)]]} />;
            }}
            onTip={onTip}
            ariaLabel="Cognitive load versus revenue per hour"
          />
        ) : (
          <Scatter
            points={agPricePts}
            xAxis={agAxis}
            yAxis={priceAxis}
            background={trend(agFit)}
            obstacles={({ plot }) => [{ x: plot.x + plot.w - 142, y: plot.y + 6, w: 136, h: 36 }]}
            tip={(id) => {
              const m = byId.get(id)!;
              return <ModalityTip m={m} rows={[['Agency', String(m.agency)]]} />;
            }}
            onTip={onTip}
            ariaLabel="Agency versus revenue per hour"
          />
        )
      }
      caption={(step) =>
        step === 0
          ? 'Both axes are 0–100 rubric scores. Notice how Lean-forward (orange) and Lean-back (blue) separate cleanly.'
          : 'Dashed line: ordinary least-squares fit on log(revenue per hour). Pearson r is shown in the top-right box.'
      }
    />
  );
}

export function ChapterBody({ onTip }: { onTip: (t: TipState | null) => void }) {
  const sensAxis = scoreAxis('Sensory bandwidth (0 plain text → 100 full physical)');
  const moatAxis = scoreAxis('Platform moat (0 open commodity → 100 social graph)');

  const sensPts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.sensoryBandwidth, y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );
  const moatPts: ScatterPoint[] = useMemo(
    () => D.map((m) => ({ id: m.id, x: m.moat, y: pricePerHour(m), r: radius(m), color: color(m), label: m.short })),
    [],
  );

  const sensFit = useMemo(() => olsLine(D.map((m) => ({ x: m.sensoryBandwidth, y: Math.log10(pricePerHour(m)) }))), []);
  const moatFit = useMemo(() => olsLine(D.map((m) => ({ x: m.moat, y: Math.log10(pricePerHour(m)) }))), []);

  const steps = [
    <>
      <h3>Sensory bandwidth rises with price per hour (r = {sensFit.r.toFixed(2)})</h3>
      <p>
        Of the three biological axes, only <b>sensory bandwidth</b> — how much of the human sensory apparatus is engaged, from plain text on a screen to a body
        in a stadium, gallery or theme park — tracks what people pay per hour. The green <b>Out-of-home</b> cluster at the top-right is why: you are paying for
        a room, a crowd and a physical memory.
      </p>
    </>,
    <>
      <h3>Platform moat monetizes through volume of hours, not price per hour (r = {moatFit.r.toFixed(2)})</h3>
      <p>
        The strongest moats in media — <b>Messaging &amp; communities</b>, <b>YouTube</b>, <b>Social networks</b>, <b>Short-video apps</b> and <b>PC games</b> —
        do not charge $10 an hour. They use network effects to capture <i>billions of hours</i> at 5¢–35¢ an hour, while open formats like <b>books</b> and{' '}
        <b>cinema</b> must charge by the unit because they have no social graph holding you inside.
      </p>
    </>,
  ];

  const fitOverlay = (fit: ReturnType<typeof olsLine>, ringOutOfHome: boolean) => ({ sx, sy, plot, pos }: ChartCtx) => (
    <g>
      <line className="trend" x1={sx(0)} y1={sy(10 ** fit.at(0))} x2={sx(100)} y2={sy(10 ** fit.at(100))} strokeDasharray="5 4" />
      {ringOutOfHome &&
        D.filter((m) => m.family === 'Attend').map((m) => {
          const p = pos.get(m.id)!;
          return <circle key={m.id} className="ring" cx={p.x} cy={p.y} r={p.r + 5} />;
        })}
      <g className="corner-note" transform={`translate(${plot.x + 12}, ${plot.y + 10})`}>
        <rect width="118" height="28" rx="5" />
        <text x="59" y="18" textAnchor="middle">
          r = {fit.r.toFixed(2)}
        </text>
      </g>
    </g>
  );

  return (
    <Chapter
      id="body"
      number="Chapter 5 · Sensory Bandwidth & Moats"
      title="Sensory richness commands a high hourly price; network moats harvest massive hours"
      intro="Two different ways to win in media: engage the whole physical body to charge dollars per hour, or own the social graph to collect trillions of hours at pennies per hour."
      takeaway={
        <>
          <b>Sensory bandwidth (r = {sensFit.r.toFixed(2)})</b> is the primary biological driver of hourly price, whereas{' '}
          <b>Platform moat (r = {moatFit.r.toFixed(2)})</b> monetizes by locking in recurring daily hours rather than charging high hourly prices.
        </>
      }
      stepLabels={['Sensory × $/hour', 'Platform Moat × $/hour']}
      steps={steps}
      graphic={(step) =>
        step === 0 ? (
          <Scatter
            points={sensPts}
            xAxis={sensAxis}
            yAxis={priceAxis}
            background={fitOverlay(sensFit, true)}
            obstacles={({ plot }) => [{ x: plot.x + 8, y: plot.y + 6, w: 126, h: 36 }]}
            tip={(id) => {
              const m = byId.get(id)!;
              return <ModalityTip m={m} rows={[['Sensory bandwidth', String(m.sensoryBandwidth)]]} />;
            }}
            onTip={onTip}
            ariaLabel="Sensory bandwidth versus revenue per hour"
          />
        ) : (
          <Scatter
            points={moatPts}
            xAxis={moatAxis}
            yAxis={priceAxis}
            background={fitOverlay(moatFit, false)}
            obstacles={({ plot }) => [{ x: plot.x + 8, y: plot.y + 6, w: 126, h: 36 }]}
            tip={(id) => {
              const m = byId.get(id)!;
              return <ModalityTip m={m} rows={[['Platform moat', String(m.moat)]]} />;
            }}
            onTip={onTip}
            ariaLabel="Platform moat versus revenue per hour"
          />
        )
      }
      caption={(step) =>
        step === 0
          ? 'Green rings mark the seven Out-of-home (Attend) experiences in the high-sensory, high-price corner.'
          : 'High-moat platforms (right) earn their revenue through massive annual hours rather than high price per hour.'
      }
    />
  );
}

export { FAMILY_ORDER, FAMILY_CONFIG, type Family };
