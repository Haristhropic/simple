type Point = { date: string; views: number; visitors: number };

export function TrendChart({ data }: { data: Point[] }) {
  const W = 800;
  const H = 240;
  const PAD_X = 4;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 28;

  const max = Math.max(1, ...data.map((d) => d.views));
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const step = data.length > 1 ? innerW / (data.length - 1) : 0;
  const x = (i: number) => PAD_X + i * step;
  const y = (v: number) => PAD_TOP + innerH - (v / max) * innerH;

  const line = data.map((d, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(d.views)}`).join(" ");
  const area = data.length
    ? `${line} L ${x(data.length - 1)} ${PAD_TOP + innerH} L ${x(0)} ${PAD_TOP + innerH} Z`
    : "";
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Daily page views"
    >
      <defs>
        <linearGradient id="analytics-trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="text-border">
        {gridLines.map((g) => (
          <line
            key={g}
            x1={PAD_X}
            x2={W - PAD_X}
            y1={PAD_TOP + innerH * g}
            y2={PAD_TOP + innerH * g}
            stroke="currentColor"
            strokeWidth="1"
          />
        ))}
      </g>

      <g className="text-foreground">
        {area && <path d={area} fill="url(#analytics-trend-fill)" />}
        {line && (
          <path
            d={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
      </g>

      {data.length > 0 && (
        <g className="fill-muted-foreground text-[10px]">
          <text x={PAD_X} y={H - 8}>{data[0].date.slice(5)}</text>
          <text x={W - PAD_X} y={H - 8} textAnchor="end">
            {data[data.length - 1].date.slice(5)}
          </text>
        </g>
      )}
    </svg>
  );
}