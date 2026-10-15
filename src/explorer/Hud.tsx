import { useMemo, useState } from 'react';
import type { Modality } from '../data/modalities';
import {
  archetypeOf,
  economicFrontier,
  fmtCost,
  fmtHours,
  fmtMoney,
  fmtPrice,
  medianPrice,
  modeOf,
  pricePerHour,
  priceScore,
  supplyCost,
  type Lens,
} from '../data/derive';
import { FAMILY_CONFIG, FAMILY_ORDER, MODE_CONFIG, MODE_ORDER, type Family } from '../data/taxonomy';
import { modalitiesData } from '../data/modalities';
import { nodeColor, type CameraPreset, type ColorMode } from './colors';

interface Props {
  lens: Lens;
  setLens: (l: Lens) => void;
  colorMode: ColorMode;
  setColorMode: (c: ColorMode) => void;
  cameraPreset: CameraPreset;
  setCameraPreset: (p: CameraPreset) => void;
  tour: boolean;
  setTour: (on: boolean) => void;
  modalities: Modality[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdate: (m: Modality) => void;
  onReset: (id: string) => void;
  onResetAll: () => void;
  onClose?: () => void;
  onOpenMethod?: () => void;
}

interface Column {
  key: string;
  label: string;
  value: (m: Modality) => number;
  show: (m: Modality) => string;
}

const COLUMNS: Record<Lens, Column[]> = {
  economic: [
    { key: 'cost', label: 'Supply $/h', value: supplyCost, show: (m) => fmtCost(m.supplyCostPerHour) },
    { key: 'price', label: 'Rev/h', value: pricePerHour, show: (m) => fmtPrice(pricePerHour(m)) },
    { key: 'moat', label: 'Moat', value: (m) => m.moat, show: (m) => String(m.moat) },
    { key: 'revenue', label: 'Revenue', value: (m) => m.revenueB, show: (m) => fmtMoney(m.revenueB) },
  ],
  biological: [
    { key: 'cog', label: 'Cog', value: (m) => m.cognitiveLoad, show: (m) => String(m.cognitiveLoad) },
    { key: 'agency', label: 'Agency', value: (m) => m.agency, show: (m) => String(m.agency) },
    { key: 'sens', label: 'Sensory', value: (m) => m.sensoryBandwidth, show: (m) => String(m.sensoryBandwidth) },
    { key: 'revenue', label: 'Revenue', value: (m) => m.revenueB, show: (m) => fmtMoney(m.revenueB) },
  ],
};

const SLIDERS: { key: keyof Modality; label: string }[] = [
  { key: 'cognitiveLoad', label: 'Cognitive load' },
  { key: 'agency', label: 'Agency' },
  { key: 'sensoryBandwidth', label: 'Sensory bandwidth' },
  { key: 'moat', label: 'Platform moat' },
  { key: 'aiExposure', label: 'AI exposure' },
];

export function Hud(p: Props) {
  const [listOpen, setListOpen] = useState(false);
  const selected = p.modalities.find((m) => m.id === p.selectedId) ?? null;

  if (p.tour) {
    return (
      <div className="hud">
        <button className="hud-pill tour-exit" onClick={() => p.setTour(false)}>
          Exit tour (Esc)
        </button>
      </div>
    );
  }

  return (
    <div className="hud">
      <div className="hud-bar">
        <div className="hud-group">
          {p.onClose && (
            <button className="hud-btn" onClick={p.onClose}>
              ← Essay
            </button>
          )}
          <span className="hud-title">Media Modalities · 3D</span>
        </div>
        <div className="hud-group" role="group" aria-label="Lens">
          <Seg value={p.lens} set={p.setLens} options={[['economic', 'Economic'], ['biological', 'Biological']]} />
          <Seg value={p.colorMode} set={p.setColorMode} options={[['mode', 'Mode'], ['family', 'Family'], ['senses', 'Senses']]} />
        </div>
        <div className="hud-group" role="group" aria-label="Camera">
          <Seg value={p.cameraPreset} set={p.setCameraPreset} options={[['isometric', '3D'], ['xy', 'Front'], ['zy', 'Side'], ['xz', 'Top']]} />
          <button className="hud-btn" onClick={() => p.setTour(true)}>
            Tour
          </button>
        </div>
        <div className="hud-group">
          {p.onOpenMethod && (
            <button className="hud-btn" onClick={p.onOpenMethod}>
              Method
            </button>
          )}
          <button className={`hud-btn${listOpen ? ' active' : ''}`} onClick={() => setListOpen((o) => !o)} aria-expanded={listOpen}>
            List ({p.modalities.length})
          </button>
        </div>
      </div>

      <div className="hud-bottom">
        {selected ? <Inspector m={selected} {...p} /> : <div className="hud-hint">Click any node for its numbers, sources and scores.</div>}
        <Legend lens={p.lens} colorMode={p.colorMode} />
      </div>

      {listOpen && <List {...p} onClose={() => setListOpen(false)} />}
    </div>
  );
}

function Seg<T extends string>({ value, set, options }: { value: T; set: (v: T) => void; options: [T, string][] }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={v} className={v === value ? 'active' : ''} aria-pressed={v === value} onClick={() => set(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Bar({ label, value, display, color }: { label: string; value: number; display: string; color: string }) {
  return (
    <div className="bar-row">
      <span>{label}</span>
      <div className="bar-track">
        <div className="bar-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }} />
      </div>
      <b>{display}</b>
    </div>
  );
}

function Inspector({ m, lens, modalities, onSelect, onUpdate, onReset }: { m: Modality } & Props) {
  const [calibrate, setCalibrate] = useState(false);
  const med = useMemo(() => medianPrice(modalities), [modalities]);
  const onFrontier = useMemo(() => economicFrontier(modalities).has(m.id), [modalities, m.id]);
  const original = modalitiesData.find((o) => o.id === m.id)!;
  const edited = SLIDERS.some((s) => m[s.key] !== original[s.key]);
  const mode = modeOf(m);
  const accent = MODE_CONFIG[mode].color;

  return (
    <div className="inspector" role="region" aria-label={`${m.name} details`}>
      <div className="insp-head">
        <div>
          <div className="insp-tags">
            <span className="tag" style={{ ['--c' as string]: accent }}>
              {m.family} · {mode}
            </span>
            <span className="tag tag-plain">{archetypeOf(m, med)}</span>
            {onFrontier && <span className="tag tag-frontier">Efficient frontier</span>}
          </div>
          <h2>
            {m.name} <span className="ticker">${m.ticker}</span>
          </h2>
          <p className="insp-examples">{m.examples}</p>
        </div>
        <button className="icon-btn" onClick={() => onSelect(null)} aria-label="Close details">
          ✕
        </button>
      </div>

      <div className="insp-body">
        <dl className="insp-market">
          <div>
            <dt>Revenue</dt>
            <dd>
              {fmtMoney(m.revenueB)} <span className={`conf conf-${m.revenueConfidence}`}>{m.revenueConfidence}</span>
            </dd>
          </div>
          <div>
            <dt>Hours / year</dt>
            <dd>
              {fmtHours(m.hoursB)} <span className={`conf conf-${m.hoursConfidence}`}>{m.hoursConfidence}</span>
            </dd>
          </div>
          <div>
            <dt>Per hour</dt>
            <dd>{fmtPrice(pricePerHour(m))}</dd>
          </div>
        </dl>

        <div className="insp-bars">
          <div className="bars-title">{lens === 'economic' ? 'Economic lens' : 'Biological lens'}</div>
          {lens === 'economic' ? (
            <>
              <Bar label="Supply cost" value={supplyCost(m)} display={`${fmtCost(m.supplyCostPerHour)}/h`} color={accent} />
              <Bar label="Revenue / hour" value={priceScore(m)} display={fmtPrice(pricePerHour(m))} color={accent} />
              <Bar label="Platform moat" value={m.moat} display={String(m.moat)} color={accent} />
              <Bar label="AI exposure" value={m.aiExposure} display={String(m.aiExposure)} color="#8a909c" />
            </>
          ) : (
            <>
              <Bar label="Cognitive load" value={m.cognitiveLoad} display={String(m.cognitiveLoad)} color={accent} />
              <Bar label="Agency" value={m.agency} display={String(m.agency)} color={accent} />
              <Bar label="Sensory" value={m.sensoryBandwidth} display={String(m.sensoryBandwidth)} color={accent} />
            </>
          )}
        </div>

        <p className="insp-thesis">{m.thesis}</p>
        <p className="insp-risk">
          <b>Risk.</b> {m.risks}
        </p>

        <details className="insp-notes">
          <summary>How these numbers were built</summary>
          <p>
            <b>Revenue ({m.revenueYear}).</b> {m.revenueNote}
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

        <div className="calibrate">
          <button className="link" onClick={() => setCalibrate((c) => !c)} aria-expanded={calibrate}>
            {calibrate ? 'Hide score sliders' : 'Adjust scores'}
          </button>
          {calibrate && (
            <div className="sliders">
              {SLIDERS.map((s) => (
                <label key={String(s.key)}>
                  <span>
                    {s.label} <b>{String(m[s.key])}</b>
                  </span>
                  <input type="range" min={0} max={100} value={Number(m[s.key])} onChange={(e) => onUpdate({ ...m, [s.key]: Number(e.target.value) })} />
                </label>
              ))}
              {edited && (
                <button className="link" onClick={() => onReset(m.id)}>
                  Restore original scores
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Legend({ lens, colorMode }: { lens: Lens; colorMode: ColorMode }) {
  return (
    <div className="legend-card">
      {colorMode === 'mode' &&
        MODE_ORDER.map((m) => (
          <span key={m}>
            <i style={{ background: MODE_CONFIG[m].color }} />
            {m}
          </span>
        ))}
      {colorMode === 'family' &&
        FAMILY_ORDER.map((f) => (
          <span key={f}>
            <i style={{ background: FAMILY_CONFIG[f].color }} />
            {f}
          </span>
        ))}
      {colorMode === 'senses' && (
        <>
          <span>
            <i style={{ background: '#22b8e0' }} />
            Visual
          </span>
          <span>
            <i style={{ background: '#e0a020' }} />
            Auditory
          </span>
          <span>
            <i style={{ background: '#e02a8a' }} />
            Physical
          </span>
        </>
      )}
      <span className="legend-note">Area ∝ revenue · hover a node to see its shadow on each wall</span>
      {lens === 'economic' && (
        <span className="legend-note">
          <i className="ring-key" />
          Efficient frontier
        </span>
      )}
    </div>
  );
}

function List({ lens, modalities, selectedId, onSelect, colorMode, onResetAll, onClose }: Props & { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [family, setFamily] = useState<Family | 'All'>('All');
  const [sortKey, setSortKey] = useState<string>('revenue');
  const cols = COLUMNS[lens];
  const col = cols.find((c) => c.key === sortKey) ?? cols[cols.length - 1];
  const edited = modalities.some((m, i) => m !== modalitiesData[i]);

  const rows = modalities
    .filter((m) => family === 'All' || m.family === family)
    .filter((m) => !query || `${m.name} ${m.ticker} ${m.examples} ${m.family}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => col.value(b) - col.value(a));

  return (
    <aside className="list-drawer" aria-label="All experiences">
      <div className="list-head">
        <h2>All experiences</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close list">
          ✕
        </button>
      </div>
      <input className="search" type="search" placeholder="Search name, ticker or platform" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search experiences" />
      <div className="chips" role="group" aria-label="Filter by family">
        {(['All', ...FAMILY_ORDER] as const).map((f) => (
          <button key={f} className={`chip${family === f ? ' active' : ''}`} onClick={() => setFamily(f)} aria-pressed={family === f}>
            {f}
          </button>
        ))}
      </div>
      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th scope="col">Experience</th>
              {cols.map((c) => (
                <th key={c.key} scope="col" aria-sort={c.key === col.key ? 'descending' : undefined}>
                  <button onClick={() => setSortKey(c.key)}>{c.label}</button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className={m.id === selectedId ? 'selected' : ''} onClick={() => onSelect(m.id)}>
                <td>
                  <button className="row-btn" onClick={() => onSelect(m.id)}>
                    <i style={{ background: nodeColor(m, colorMode) }} />
                    {m.short}
                  </button>
                </td>
                {cols.map((c) => (
                  <td key={c.key} className="num">
                    {c.show(m)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edited && (
        <button className="link" onClick={onResetAll}>
          Restore all original scores
        </button>
      )}
    </aside>
  );
}
