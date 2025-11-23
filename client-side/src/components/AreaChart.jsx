const AreaChart = ({ data = [], labels = [], width = 640, height = 280, stroke = "#FF7A18", fill = "rgba(255,122,24,0.15)", gridColor = "#e5e7eb" }) => {
  const padding = { top: 16, right: 24, bottom: 28, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const maxY = Math.max(1, ...data);
  const minY = 0;
  const rangeY = Math.max(1, maxY - minY);
  const stepX = innerW / Math.max(1, data.length - 1);

  const points = data.map((v, i) => {
    const x = padding.left + i * stepX;
    const y = padding.top + innerH - ((v - minY) / rangeY) * innerH;
    return { x, y };
  });

  const pathLine = points
    .map((p, i) => (i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`))
    .join(" ");

  const pathArea = `${pathLine} L ${padding.left + innerW},${padding.top + innerH} L ${padding.left},${padding.top + innerH} Z`;

  // gridlines (5 horizontal)
  const gridLines = Array.from({ length: 5 }).map((_, i) => {
    const y = padding.top + (innerH / 4) * i;
    const value = Math.round(maxY - (rangeY / 4) * i);
    return { y, value };
  });

  // x labels: show every Nth
  const xEvery = Math.ceil(labels.length / 7);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Gridlines */}
      {gridLines.map((g, idx) => (
        <g key={idx}>
          <line x1={padding.left} y1={g.y} x2={padding.left + innerW} y2={g.y} stroke={gridColor} strokeWidth="1" />
          <text x={padding.left - 8} y={g.y + 4} textAnchor="end" fontSize="10" fill="#6b7280">{g.value}</text>
        </g>
      ))}
      {/* Y axis */}
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerH} stroke="#9ca3af" strokeWidth="1.5" />
      {/* X axis */}
      <line x1={padding.left} y1={padding.top + innerH} x2={padding.left + innerW} y2={padding.top + innerH} stroke="#9ca3af" strokeWidth="1.5" />
      {/* X labels */}
      {points.map((p, i) => (
        i % xEvery === 0 ? (
          <text key={i} x={p.x} y={padding.top + innerH + 16} textAnchor="middle" fontSize="10" fill="#6b7280">
            {labels[i] || ""}
          </text>
        ) : null
      ))}
      {/* Area */}
      <path d={pathArea} fill={fill} />
      {/* Line */}
      <path d={pathLine} fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.5} fill={stroke} />
      ))}
    </svg>
  );
};

export default AreaChart;
