const polarToCartesian = (cx, cy, r, angleInDeg) => {
  const angleInRad = ((angleInDeg - 90) * Math.PI) / 180.0;
  return {
    x: cx + r * Math.cos(angleInRad),
    y: cy + r * Math.sin(angleInRad),
  };
};

const describeArc = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  const d = [
    "M", start.x, start.y,
    "A", r, r, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;
};

const DonutChart = ({ data = [], colors = [], width = 280, height = 200, thickness = 18 }) => {
  const cx = width / 2; // centered chart
  const cy = height / 2.5; // slightly higher to make room for legend
  const r = Math.min(cx, cy) - 20;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  let angle = 0;
  const segments = data.map((d, i) => {
    const valueAngle = (d.value / total) * 360;
    const start = angle;
    const end = angle + valueAngle;
    angle = end;
    return { start, end, label: d.label, value: d.value, color: colors[i % colors.length] };
  });

  // Calculate legend position (horizontal below chart)
  const legendY = height - 20;
  const legendItemWidth = width / segments.length;
  const legendStartX = 0;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height - 40} viewBox={`0 0 ${width} ${height - 40}`}>
        {/* Segments */}
        {segments.map((s, i) => (
          <g key={i}>
            <path d={describeArc(cx, cy, r, s.start, s.end)} stroke={s.color} strokeWidth={thickness} fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {/* Horizontal Legend */}
      <div className="flex items-center justify-center gap-4 flex-wrap mt-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-sm text-gray-700">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;
