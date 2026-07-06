import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const OrdersTrendChart = ({ data }) => {
  return (
    <div
      className="
      rounded-[28px]
      border
      border-white/10
      bg-[#0B1024]
      p-6
      shadow-[0_0_35px_rgba(124,92,255,.10)]
    "
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">Orders Trend</h2>

          <p className="text-[#AAB3D3] mt-1">Monthly order activity</p>
        </div>

        <div className="rounded-full bg-[#7C5CFF]/10 px-4 py-2 text-sm text-[#7C5CFF] border border-[#7C5CFF]/20">
          Last 6 Months
        </div>
      </div>

      {/* Chart */}

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7C5CFF" />

              <stop offset="100%" stopColor="#4F8CFF" />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#1d2744" strokeDasharray="4 4" />

          <XAxis
            dataKey="month"
            stroke="#AAB3D3"
            tickLine={false}
            axisLine={false}
          />

          <YAxis stroke="#AAB3D3" tickLine={false} axisLine={false} />

          <Tooltip
            cursor={{
              fill: "#ffffff08",
            }}
            contentStyle={{
              background: "#111B38",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "16px",
              color: "#fff",
            }}
          />

          <Bar
            dataKey="orders"
            radius={[12, 12, 0, 0]}
            fill="url(#ordersGradient)"
            animationDuration={1500}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrdersTrendChart;
