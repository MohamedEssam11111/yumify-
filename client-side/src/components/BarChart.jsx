const BarChart = ({ data = [], labels = [], height = 120, color = "#FF7A18" }) => {
  const max = Math.max(1, ...data);
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((v, i) => {
        const h = Math.round((v / max) * (height - 20));
        return (
          <div key={i} className="flex flex-col items-center" style={{ width: 20 }}>
            <div
              className="w-full rounded-t"
              style={{ height: h, backgroundColor: color }}
              aria-label={`${labels[i] || i}: ${v}`}
              title={`${labels[i] || i}: ${v}`}
            />
            <div className="text-[10px] text-gray-600 mt-1 truncate w-full text-center" title={labels[i] || String(i)}>
              {labels[i] || ""}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BarChart;
