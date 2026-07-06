import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const UsersGrowthChart = ({ data }) => {
  return (
    <div
      className="
      rounded-[28px]
      border
      border-white/10
      bg-[#0B1024]
      p-6
      shadow-[0_0_35px_rgba(74,232,255,.10)]
    "
    >
      {/* Header */}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">User Growth</h2>

          <p className="text-[#AAB3D3] mt-1">Registered users over time</p>
        </div>

        <div className="rounded-full bg-[#41E9FF]/10 px-4 py-2 text-sm text-[#41E9FF] border border-[#41E9FF]/20">
          Last 6 Months
        </div>
      </div>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#41E9FF" />

              <stop offset="100%" stopColor="#7C5CFF" />
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
              stroke: "#41E9FF",
              strokeWidth: 1,
            }}
            contentStyle={{
              background: "#111B38",
              border: "1px solid rgba(255,255,255,.08)",
              borderRadius: "16px",
              color: "#fff",
            }}
          />

          <Line
            type="monotone"
            dataKey="users"
            stroke="#41E9FF"
            strokeWidth={4}
            dot={{
              fill: "#41E9FF",
              r: 5,
            }}
            activeDot={{
              r: 8,
              fill: "#41E9FF",
            }}
            animationDuration={1700}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsersGrowthChart;
