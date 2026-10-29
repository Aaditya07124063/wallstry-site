type LineProps = { values: number[]; label: string; height?: number };

/** Dependency-free SVG line chart with an accessible summary. */
export function LineChart({ values, label, height = 220 }: LineProps) {
  const w = 640, pad = 8;
  const lo = Math.min(...values), hi = Math.max(...values), span = hi - lo || 1;
  const pts = values.map((v, i) => `${(pad + (i / Math.max(values.length - 1, 1)) * (w - 2 * pad)).toFixed(1)},${(height - pad - ((v - lo) / span) * (height - 2 * pad)).toFixed(1)}`);
  const first = values[0], last = values[values.length - 1];
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${w} ${height}`} role="img" aria-label={`${label}. Starts at ${first.toFixed(2)}, ends at ${last.toFixed(2)}, low ${lo.toFixed(2)}, high ${hi.toFixed(2)}.`} preserveAspectRatio="none">
        <polyline points={pts.join(" ")} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption>
        <span>Low ${lo.toFixed(2)}</span><span>High ${hi.toFixed(2)}</span><span>Last ${last.toFixed(2)}</span>
      </figcaption>
    </figure>
  );
}
