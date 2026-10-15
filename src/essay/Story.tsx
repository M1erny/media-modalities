import { useState, type ReactNode } from 'react';
import { modalitiesData as D, type Modality } from '../data/modalities';
import {
  ARCHETYPES,
  ARCHETYPE_ORDER,
  archetypeOf,
  correlate,
  economicFrontier,
  fmtHours,
  fmtMoney,
  fmtPrice,
  fmtRho,
  linearFit,
  medianPrice,
  modeOf,
  pricePerHour,
  supplyCost,
  supplyCost2030,
  supplyCostPerHour2030,
  fmtCost,
  type Archetype,
} from '../data/derive';
import { family, familyTotals, priceSpread, rel, totalHoursB, totalRevenueB } from '../data/facts';
import { FAMILY_CONFIG, MODE_CONFIG } from '../data/taxonomy';
import { Chapter } from './Chapter';
import { Scatter, type ChartCtx, type ScatterPoint } from './charts/Scatter';
import { costAxis, hoursAxis, priceAxis, scoreAxis } from './axes';
import { Treemap } from './charts/Treemap';
import { ModalityTip, Tooltip, type TipState } from './Tooltip';
import type { AxisSpec, Box } from './scales';

const byId = new Map(D.map((m) => [m.id, m]));
const maxRevenue = Math.max(...D.map((m) => m.revenueB));
const colorOf = (m: Modality) => MODE_CONFIG[modeOf(m)].color;
const radiusOf = (m: Modality) => Math.sqrt(m.revenueB / maxRevenue);
const ids = (pred: (m: Modality) => boolean) => new Set(D.filter(pred).map((m) => m.id));
const pct = (v: number) => `${Math.round(v * 1000) / 10}%`;
const medPrice = medianPrice(D);
const archetype = (m: Modality) => archetypeOf(m, medPrice);
const frontier = economicFrontier(D);

function points(x: (m: Modality) => number, y: (m: Modality) => number, extra?: (m: Modality) => Partial<ScatterPoint>): ScatterPoint[] {
  return D.map((m) => ({ id: m.id, x: x(m), y: y(m), r: radiusOf(m), color: colorOf(m), label: m.short, ...extra?.(m) }));
}

/** A small badge in the top-right corner; returns its box so labels steer clear. */
function cornerNote(c: ChartCtx, text: string, w = text.length * 7.2 + 20) {
  const box: Box = { x: c.plot.x + c.plot.w - w - 6, y: c.plot.y + 6, w, h: 26 };
  return {
    box,
    node: (
      <g className="corner-note">
        <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={5} />
        <text x={box.x + box.w / 2} y={box.y + 17} textAnchor="middle">
          {text}
        </text>
      </g>
    ),
  };
}

/* ── 01 Where the money is ───────────────────────────── */

function MoneyChapter({ onTip }: { onTip: (t: TipState | null) => void }) {
  const watch = family('Watch');
  const attend = family('Attend');
  const social = byId.get('social')!;
  const tv = byId.get('linear_tv')!;
  const states: { metric: 'revenue' | 'hours'; highlight: Set<string> | null }[] = [
    { metric: 'revenue', highlight: ids((m) => m.family === 'Watch') },
    { metric: 'revenue', highlight: new Set(['social', 'linear_tv']) },
    { metric: 'revenue', highlight: new Set(['newsletters', 'vr', 'ai_chat', 'podcasts']) },
    { metric: 'hours', highlight: ids((m) => m.family === 'Attend') },
  ];
  return (
    <Chapter
      id="money"
      number="01 · Where the money is"
      title={`${fmtMoney(totalRevenueB)} a year, half of it for watching`}
      intro="Each box is one experience, sized by what people and advertisers spend on it. Boxes are grouped into the six families and coloured by how attention is spent."
      steps={[
        <>
          <h3>Watch takes {pct(watch.revenueShare)} of the money</h3>
          <p>
            Feeds, YouTube, streaming, TV and sport add up to {fmtMoney(watch.revenueB)}. Play is next at {fmtMoney(family('Play').revenueB)}, then Read at{' '}
            {fmtMoney(family('Read').revenueB)}.
          </p>
        </>,
        <>
          <h3>Two pools of about $240B each</h3>
          <p>
            Social networks ({fmtMoney(social.revenueB)}) and linear TV ({fmtMoney(tv.revenueB)}) are the largest single experiences. They are moving in opposite
            directions: Meta's ad revenue grew 22% in 2025, while linear TV advertising fell about 4%.
          </p>
        </>,
        <>
          <h3>Small pools worth watching</h3>
          <p>
            Newsletters ({fmtMoney(byId.get('newsletters')!.revenueB)}), VR ({fmtMoney(byId.get('vr')!.revenueB)}), podcasts ({fmtMoney(byId.get('podcasts')!.revenueB)}) and AI chat (
            {fmtMoney(byId.get('ai_chat')!.revenueB)}) are small today. Hover any box for its numbers and sources.
          </p>
        </>,
        <>
          <h3>Now size it by hours</h3>
          <p>
            The map changes shape. Watch grows to {pct(watch.hoursShare)} of all attention, {fmtHours(totalHoursB)} a year in total. Out-of-home experiences nearly
            vanish: {pct(attend.revenueShare)} of the money but {pct(attend.hoursShare)} of the hours. That gap is the next chapter.
          </p>
        </>,
      ]}
      graphic={(a) => (
        <Treemap
          data={D}
          metric={states[a].metric}
          highlight={states[a].highlight}
          onTip={onTip}
          tip={(id) => <ModalityTip m={byId.get(id)!} />}
          format={states[a].metric === 'revenue' ? fmtMoney : fmtHours}
        />
      )}
      caption={(a) => (states[a].metric === 'revenue' ? 'Sized by annual revenue (consumer spend + advertising)' : 'Sized by annual hours of attention (estimated)')}
    />
  );
}

/* ── 02 An hour is not an hour ───────────────────────── */

const REVENUE_LINES = [1, 10, 100];

function PriceChapter({ onTip }: { onTip: (t: TipState | null) => void }) {
  const music = byId.get('music')!;
  const concerts = byId.get('concerts')!;
  const parks = byId.get('theme_parks')!;
  const ladder = [...familyTotals].sort((a, b) => a.price - b.price);
  const highlights: (Set<string> | null)[] = [
    null,
    new Set(['music', 'concerts']),
    new Set(['social', 'linear_tv', 'theme_parks', 'cinema']),
    null,
  ];
  const pts = points((m) => m.hoursB, pricePerHour);

  const background = (c: ChartCtx) => (
    <g className="iso">
      {REVENUE_LINES.map((R) => {
        const x0 = 0.1, x1 = 10_000;
        const p0 = { x: c.sx(x0), y: c.sy(R / x0) };
        const p1 = { x: c.sx(x1), y: c.sy(R / x1) };
        // Label just inside where the line enters the plot (top or left edge), the emptiest corner.
        const entryHours = Math.max(0.1, R / 100) * 1.35;
        const angle = (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI;
        return (
          <g key={R}>
            <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} />
            <text transform={`translate(${c.sx(entryHours)},${c.sy(R / entryHours) - 5}) rotate(${angle})`} textAnchor="start">
              {fmtMoney(R)} a year
            </text>
          </g>
        );
      })}
    </g>
  );

  const foreground = (a: number) => (c: ChartCtx) => {
    if (a !== 3) return null;
    return (
      <g className="ladder">
        {ladder.map((f) => {
          const y = c.sy(f.price);
          const x = c.plot.x + c.plot.w;
          return (
            <g key={f.family}>
              <line x1={x - 26} x2={x} y1={y} y2={y} stroke={MODE_CONFIG[FAMILY_CONFIG[f.family].mode].color} />
              <text x={x - 30} y={y + 4} textAnchor="end">
                {f.family} {fmtPrice(f.price)}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <Chapter
      id="price"
      number="02 · An hour is not an hour"
      title="Feeds win on hours. Live wins on price."
      intro="Left to right: hours of attention a year. Bottom to top: what each of those hours earns. Bubble area is revenue."
      steps={[
        <>
          <h3>Every experience on one chart</h3>
          <p>
            The diagonals are revenue lines. Anything on the same diagonal earns the same in total, whether it gets there on volume or on price. The cheapest hour and
            the dearest are {Math.round(priceSpread).toLocaleString('en-US')}× apart.
          </p>
        </>,
        <>
          <h3>Same artists, {Math.round(pricePerHour(concerts) / pricePerHour(music))}× the price</h3>
          <p>
            Recorded music fills {fmtHours(music.hoursB)} at {fmtPrice(pricePerHour(music))} an hour. Concerts fill {fmtHours(concerts.hoursB)} at{' '}
            {fmtPrice(pricePerHour(concerts))}. Both pools are worth $30–40B.
          </p>
        </>,
        <>
          <h3>Two ways to a big pool</h3>
          <p>
            Social networks and linear TV get past $200B on volume, at about {fmtPrice(pricePerHour(byId.get('social')!))} and {fmtPrice(pricePerHour(byId.get('linear_tv')!))}{' '}
            an hour. Theme parks reach {fmtMoney(parks.revenueB)} on price, at {fmtPrice(pricePerHour(parks))} an hour.
          </p>
        </>,
        <>
          <h3>The ladder</h3>
          <p>
            Per hour, {ladder.map((f, i) => `${f.family} earns ${fmtPrice(f.price)}${i < ladder.length - 1 ? ', ' : ''}`).join('')}. Ranked by hours the order flips, and
            across all 28 experiences hours and price run opposite (Spearman ρ = {fmtRho(rel.hoursPrice)}).
          </p>
          <p className="aside">
            Part of that is arithmetic, since price is revenue divided by hours. But revenue varies about 270× across the map and hours about 15,000×, so the pattern
            is mostly real.
          </p>
        </>,
      ]}
      graphic={(a) => (
        <Scatter
          ariaLabel="Hours of attention versus revenue per hour"
          points={pts}
          xAxis={hoursAxis}
          yAxis={priceAxis}
          highlight={highlights[a]}
          labels={highlights[a] ? 'highlight' : 'auto'}
          background={background}
          foreground={foreground(a)}
          obstacles={(c) =>
            a === 3
              ? ladder.map((f) => {
                  const w = (f.family.length + 7) * 7;
                  return { x: c.plot.x + c.plot.w - 30 - w, y: c.sy(f.price) - 9, w: w + 30, h: 16 };
                })
              : []
          }
          onTip={onTip}
          tip={(id) => <ModalityTip m={byId.get(id)!} />}
        />
      )}
      caption={() => 'Hours are estimates, most of them low-confidence. Revenue is sourced for every experience; see Method & data.'}
    />
  );
}

/* ── 03 Four ways to make money ──────────────────────── */

function ModelsChapter({ onTip }: { onTip: (t: TipState | null) => void }) {
  const groups = Object.fromEntries(ARCHETYPE_ORDER.map((a) => [a, D.filter((m) => archetype(m) === a)])) as Record<Archetype, Modality[]>;
  const names = (a: Archetype) => groups[a].map((m) => m.short).join(', ');
  const order: Archetype[] = ['Volume engines', 'Scale bets', 'Premium experiences', 'Margin niches'];
  const frontierList = D.filter((m) => frontier.has(m.id)).sort((a, b) => supplyCost(a) - supplyCost(b));
  const highlights: Set<string>[] = [...order.map((a) => new Set(groups[a].map((m) => m.id))), frontier];
  const pts = points(supplyCost, pricePerHour);

  const quadLabels = (c: ChartCtx) => {
    const yMid = c.sy(medPrice);
    const xMid = c.sx(50);
    return [
      { a: 'Margin niches' as Archetype, x: c.plot.x + 8, y: c.plot.y + 18, anchor: 'start' as const },
      { a: 'Premium experiences' as Archetype, x: c.plot.x + c.plot.w - 8, y: c.plot.y + 18, anchor: 'end' as const },
      { a: 'Volume engines' as Archetype, x: c.plot.x + 8, y: c.plot.y + c.plot.h - 10, anchor: 'start' as const },
      { a: 'Scale bets' as Archetype, x: c.plot.x + c.plot.w - 8, y: c.plot.y + c.plot.h - 10, anchor: 'end' as const },
    ].map((q) => ({ ...q, xMid, yMid }));
  };

  const background = (active: number) => (c: ChartCtx) => {
    const yMid = c.sy(medPrice);
    const xMid = c.sx(50);
    const stairs =
      active === 4
        ? frontierList
            .map((m, i) => {
              const p = c.pos.get(m.id)!;
              if (i === 0) return `M${c.plot.x},${p.y} L${p.x},${p.y}`;
              const prev = c.pos.get(frontierList[i - 1].id)!;
              return `L${prev.x},${p.y} L${p.x},${p.y}`;
            })
            .join(' ')
        : null;
    return (
      <g>
        <line className="quad-line" x1={xMid} x2={xMid} y1={c.plot.y} y2={c.plot.y + c.plot.h} />
        <line className="quad-line" x1={c.plot.x} x2={c.plot.x + c.plot.w} y1={yMid} y2={yMid} />
        <text className="quad-note" x={c.plot.x + c.plot.w - 6} y={yMid - 6} textAnchor="end">
          median {fmtPrice(medPrice)}/h
        </text>
        {stairs && <path className="frontier" d={stairs} />}
      </g>
    );
  };

  const foreground = (active: number) => (c: ChartCtx) => (
    <g>
      {quadLabels(c).map((q) => (
        <text key={q.a} className={`quad-label${active < 4 && order[active] === q.a ? ' on' : ''}`} x={q.x} y={q.y} textAnchor={q.anchor}>
          {q.a}
        </text>
      ))}
    </g>
  );

  const obstacles = (c: ChartCtx): Box[] =>
    quadLabels(c).map((q) => {
      const w = q.a.length * 7.6;
      return { x: q.anchor === 'start' ? q.x : q.x - w, y: q.y - 13, w, h: 17 };
    });

  return (
    <Chapter
      id="models"
      number="03 · Four business models"
      title="What an hour costs to make, against what it earns"
      intro="Left to right: the cost of making one new hour of the experience, from a free post to a new theme-park land. Bottom to top: revenue per hour. The lines split at $100k an hour and the median price."
      steps={[
        ...order.map((a) => (
          <>
            <h3>
              {a} <span className="count">{groups[a].length}</span>
            </h3>
            <p>{ARCHETYPES[a].description}</p>
            <p className="members">{names(a)}.</p>
          </>
        )),
        <>
          <h3>The efficient frontier</h3>
          <p>
            No other experience is both cheaper to make and better paid per hour than these {frontierList.length}: {frontierList.map((m) => m.short).join(', ')}. All of
            them are things you do rather than things you watch.
          </p>
        </>,
      ]}
      graphic={(a) => (
        <Scatter
          ariaLabel="Supply cost versus revenue per hour, split into four business models"
          points={pts}
          xAxis={costAxis}
          yAxis={priceAxis}
          highlight={highlights[a]}
          labels="highlight"
          background={background(a)}
          foreground={foreground(a)}
          obstacles={obstacles}
          onTip={onTip}
          tip={(id) => {
            const m = byId.get(id)!;
            return <ModalityTip m={m} rows={[['Supply cost', `${fmtCost(m.supplyCostPerHour)}/h`], ['Model', archetype(m)]]} />;
          }}
        />
      )}
      caption={() => 'Archetypes are assigned by these two cut lines, not by hand.'}
    />
  );
}

/* ── 04 What the biology predicts ────────────────────── */

interface RelStep {
  x: string;
  y: string;
  xAxis: AxisSpec;
  yAxis: AxisSpec;
  getX: (m: Modality) => number;
  getY: (m: Modality) => number;
  logY: boolean;
  focus?: string[];
  body: ReactNode;
}

function BiologyChapter({ onTip }: { onTip: (t: TipState | null) => void }) {
  const costYAxis: AxisSpec = { ...costAxis, title: 'Supply cost per hour (log)' };
  const ai = byId.get('ai_chat')!;
  const social = byId.get('social')!;
  const steps: RelStep[] = [
    {
      x: 'cog', y: 'hours', xAxis: scoreAxis('Cognitive load →'), yAxis: hoursAxis, getX: (m) => m.cognitiveLoad, getY: (m) => m.hoursB, logY: true,
      body: (
        <>
          <h3>Low friction wins hours</h3>
          <p>The less effort an experience asks, the more hours it collects (ρ = {fmtRho(rel.cogHours)}). Feeds, radio and music sit top left.</p>
        </>
      ),
    },
    {
      x: 'cog', y: 'price', xAxis: scoreAxis('Cognitive load →'), yAxis: priceAxis, getX: (m) => m.cognitiveLoad, getY: pricePerHour, logY: true,
      body: (
        <>
          <h3>…but not price</h3>
          <p>
            Effortful experiences earn more per hour (ρ = {fmtRho(rel.cogPrice)}). The first version of this model found low friction meant high yield (r = −0.61). Split
            yield into hours and price and the finding turns over: low friction wins volume and loses price.
          </p>
        </>
      ),
    },
    {
      x: 'sens', y: 'cost', xAxis: scoreAxis('Sensory bandwidth →'), yAxis: costYAxis, getX: (m) => m.sensoryBandwidth, getY: supplyCost, logY: false,
      body: (
        <>
          <h3>Immersion is expensive</h3>
          <p>The more of the senses an experience fills, the more an hour of it costs to make (ρ = {fmtRho(rel.sensCost)}). This held in the first version too, and it got stronger.</p>
        </>
      ),
    },
    {
      x: 'sens', y: 'price', xAxis: scoreAxis('Sensory bandwidth →'), yAxis: priceAxis, getX: (m) => m.sensoryBandwidth, getY: pricePerHour, logY: true,
      focus: D.filter((m) => m.family === 'Attend').map((m) => m.id),
      body: (
        <>
          <h3>…and it is priced</h3>
          <p>
            Presence is the dearest hour you can buy (ρ = {fmtRho(rel.sensPrice)}). The five best-paid hours on the map are all out-of-home: escape rooms, theatre,
            concerts, live sports and theme parks.
          </p>
        </>
      ),
    },
    {
      x: 'agency', y: 'price', xAxis: scoreAxis('Agency →'), yAxis: priceAxis, getX: (m) => m.agency, getY: pricePerHour, logY: true,
      focus: ['ai_chat', 'tabletop', 'social', 'short_video'],
      body: (
        <>
          <h3>Agency isn't priced yet</h3>
          <p>
            How much the audience steers the experience has no link to price per hour (ρ = {fmtRho(rel.agencyPrice)}) or to moat (ρ = {fmtRho(rel.agencyMoat)}). AI chat earns{' '}
            {fmtPrice(pricePerHour(ai))} an hour on subscriptions, about {Math.round(pricePerHour(ai) / pricePerHour(social))}× a social feed. That may be the first sign of
            agency getting a price.
          </p>
        </>
      ),
    },
  ];

  return (
    <Chapter
      id="biology"
      number="04 · What the biology predicts"
      title="Does what a medium asks of you predict what it earns?"
      intro="The biological lens scores each experience on cognitive load, agency and sensory bandwidth against written rubrics. Here those scores meet the measured economics. ρ is Spearman's rank correlation across all 28."
      steps={steps.map((s) => s.body)}
      graphic={(a) => {
        const s = steps[a];
        const { rho } = correlate(D, s.x, s.y);
        const xs = D.map(s.getX);
        const ys = D.map((m) => (s.logY ? Math.log10(s.getY(m)) : s.getY(m)));
        const fit = linearFit(xs, ys);
        const yAt = (x: number) => {
          const v = fit.intercept + fit.slope * x;
          return s.logY ? 10 ** v : v;
        };
        const note = (c: ChartCtx) => cornerNote(c, `ρ = ${fmtRho(rho)}`);
        return (
          <Scatter
            ariaLabel={`${s.xAxis.title} versus ${s.yAxis.title}`}
            points={points(s.getX, s.getY)}
            xAxis={s.xAxis}
            yAxis={s.yAxis}
            highlight={s.focus ? new Set(s.focus) : null}
            labels="auto"
            background={(c) => <line className="trend" x1={c.sx(0)} y1={c.sy(yAt(0))} x2={c.sx(100)} y2={c.sy(yAt(100))} />}
            foreground={(c) => note(c).node}
            obstacles={(c) => [note(c).box]}
            onTip={onTip}
            tip={(id) => {
              const m = byId.get(id)!;
              return (
                <ModalityTip
                  m={m}
                  rows={[
                    ['Cognitive load', String(m.cognitiveLoad)],
                    ['Agency', String(m.agency)],
                    ['Sensory', String(m.sensoryBandwidth)],
                  ]}
                />
              );
            }}
          />
        );
      }}
      caption={() => 'Line: least-squares trend. Scores follow the anchored rubrics in Method & data.'}
    />
  );
}

/* ── 05 Where AI moves it ────────────────────────────── */

function AIChapter({ onTip }: { onTip: (t: TipState | null) => void }) {
  const exposed = ids((m) => m.aiExposure >= 50);
  const resistant = ids((m) => m.aiExposure <= 10);
  const highlights = [exposed, resistant, null];
  const moved = (a: number) => a === 2;

  return (
    <Chapter
      id="ai"
      number="05 · Where AI moves it"
      title="AI makes the digital hour cheap. The physical hour stays scarce."
      intro="Same axes as chapter 03. Arrows show a 2030 scenario: AI divides the cost of making an hour by 10 to 100, depending on how much of production it can take over."
      steps={[
        <>
          <h3>The digital hour gets cheap</h3>
          <p>
            Audiobooks, music, comics, books and most video slide left. AI narration alone takes an audiobook hour from {fmtCost(byId.get('audiobooks')!.supplyCostPerHour)} to about{' '}
            {fmtCost(supplyCostPerHour2030(byId.get('audiobooks')!))}.
          </p>
        </>,
        <>
          <h3>Live barely moves</h3>
          <p>Concerts, theatre, stadiums and theme parks keep their cost, because the core of the experience is physical. AI can sell the ticket, not play the show.</p>
        </>,
        <>
          <h3>2030</h3>
          <p>
            When an hour becomes cheap to make, supply floods in and price per hour comes under pressure, as cinemas already feel. This chart moves cost only and holds price
            fixed. The direction is the point: AI makes attention cheaper to fill, which makes the physical, scarce hour relatively more valuable.
          </p>
          <p className="aside">Scenario, not a forecast. AI exposure is scored per the rubric; the cost rule is in Method & data.</p>
        </>,
      ]}
      graphic={(a) => (
        <Scatter
          ariaLabel="Supply cost now and in a 2030 AI scenario, against revenue per hour"
          points={points((m) => (moved(a) ? supplyCost2030(m) : supplyCost(m)), pricePerHour)}
          xAxis={costAxis}
          yAxis={priceAxis}
          highlight={highlights[a]}
          labels="highlight"
          obstacles={(c) =>
            moved(a)
              ? []
              : D.filter((m) => supplyCost(m) - supplyCost2030(m) > 4).map((m) => {
                  const p = c.pos.get(m.id)!;
                  const x2 = c.sx(supplyCost2030(m));
                  return { x: x2 - 4, y: p.y - 5, w: Math.max(0, p.x - p.r - x2 + 4), h: 10 };
                })
          }
          background={(c) => (
            <g>
              {!moved(a) &&
                D.filter((m) => supplyCost(m) - supplyCost2030(m) > 4).map((m) => {
                  const p = c.pos.get(m.id)!;
                  const x2 = c.sx(supplyCost2030(m));
                  const dim = highlights[a] && !highlights[a]!.has(m.id);
                  return <line key={m.id} className="arrow" x1={p.x - p.r} y1={p.y} x2={x2} y2={p.y} markerEnd="url(#arrowhead)" opacity={dim ? 0.15 : 0.9} />;
                })}
              {D.filter((m) => m.aiExposure <= 10).map((m) => {
                const p = c.pos.get(m.id)!;
                return <circle key={m.id} className="ring" cx={p.x} cy={p.y} r={p.r + 6} />;
              })}
              <defs>
                <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" className="arrowhead" />
                </marker>
              </defs>
            </g>
          )}
          onTip={onTip}
          tip={(id) => {
            const m = byId.get(id)!;
            return (
              <ModalityTip
                m={m}
                rows={[
                  ['AI exposure', String(m.aiExposure)],
                  ['Cost now', `${fmtCost(m.supplyCostPerHour)}/h`],
                  ['Cost 2030', `${fmtCost(supplyCostPerHour2030(m))}/h`],
                ]}
              />
            );
          }}
        />
      )}
      caption={(a) => (a === 2 ? 'Dots now sit at their 2030 cost. Ringed: AI exposure 10 or below.' : 'Ringed: AI exposure 10 or below.')}
    />
  );
}

/* ── Story ───────────────────────────────────────────── */

export function Story() {
  const [tip, setTip] = useState<TipState | null>(null);
  return (
    <>
      <MoneyChapter onTip={setTip} />
      <PriceChapter onTip={setTip} />
      <ModelsChapter onTip={setTip} />
      <BiologyChapter onTip={setTip} />
      <AIChapter onTip={setTip} />
      <Tooltip tip={tip} />
    </>
  );
}
