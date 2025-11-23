const Sparkline = ({ data = [], width = 120, height = 36, stroke = "#FF7A18", fill = "rgba(255,122,24,0.15)" }) => {
  if (!data || data.length === 0) {
    return <svg width={width} height={height} />;
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const stepX = width / (data.length - 1 || 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={areaPoints} fill={fill} stroke="none" />
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

export default Sparkline;
