import {
  Activity,
  Bot,
  CheckCircle2,
  Database,
  HardDrive,
  Mail,
  Server,
} from "lucide-react";

import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

const statusConfig = [
  {
    key: "api",
    title: "API Gateway",
    icon: Server,
    color: "#4AE8FF",
  },
  {
    key: "mongodb",
    title: "MongoDB",
    icon: Database,
    color: "#22C55E",
  },
  {
    key: "awsS3",
    title: "AWS S3",
    icon: HardDrive,
    color: "#FF901C",
  },
  {
    key: "aiService",
    title: "Gemini AI",
    icon: Bot,
    color: "#7C5CFF",
  },
  {
    key: "emailService",
    title: "Email Service",
    icon: Mail,
    color: "#F72585",
  },
];

const PlatformHealth = ({ platformHealth }) => {
  const storageData = [
    {
      name: "Storage",
      value: platformHealth.storageUsage,
      fill: "#FF901C",
    },
  ];

  return (
    <section
      className="
      mt-16
      rounded-[28px]
      border
      border-white/10
      bg-[#0B1024]
      p-8
      shadow-[0_0_40px_rgba(74,232,255,.08)]
    "
    >
      {/* Header */}

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Platform Health</h2>

          <p className="mt-2 text-[#AAB3D3]">
            Real-time monitoring of Yumify infrastructure and services.
          </p>
        </div>

        <div
          className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-green-500/20
          bg-green-500/10
          px-4
          py-2
          text-green-400
          text-sm
          font-semibold
        "
        >
          <Activity size={16} />
          Operational
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[2fr_1fr]">
        {/* Services */}

        <div className="grid gap-5 sm:grid-cols-2">
          {statusConfig.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.key}
                className="
                group
                rounded-3xl
                border
                border-white/10
                bg-white/[0.03]
                p-5
                transition-all
                duration-300
                hover:border-white/20
                hover:bg-white/[0.05]
                hover:-translate-y-1
              "
              >
                <div className="flex items-center justify-between">
                  <div
                    className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                  "
                  >
                    <Icon
                      size={26}
                      style={{
                        color: item.color,
                        filter: `drop-shadow(0 0 15px ${item.color})`,
                      }}
                    />
                  </div>

                  <CheckCircle2 size={24} className="text-green-400" />
                </div>

                <h3 className="mt-6 text-lg font-bold text-white">
                  {item.title}
                </h3>

                <div
                  className="
                  mt-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  bg-green-500/10
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-green-400
                "
                >
                  <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

                  {platformHealth[item.key]}
                </div>
              </div>
            );
          })}
        </div>

        {/* Storage */}

        <div
          className="
          rounded-3xl
          border
          border-white/10
          bg-white/[0.03]
          p-6
          flex
          flex-col
          items-center
          justify-center
        "
        >
          <h3 className="text-xl font-bold text-white">Storage Usage</h3>

          <div className="mt-8 w-full h-64">
            <ResponsiveContainer>
              <RadialBarChart
                innerRadius="72%"
                outerRadius="100%"
                data={storageData}
                startAngle={90}
                endAngle={-270}
              >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />

                <RadialBar
                  dataKey="value"
                  cornerRadius={12}
                  background={{
                    fill: "#1d2744",
                  }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-5xl font-black text-[#FF901C]">
            {platformHealth.storageUsage}%
          </h2>

          <p className="mt-2 text-[#AAB3D3]">Used Storage Capacity</p>

          <div
            className="
            mt-6
            rounded-full
            bg-[#FF901C]/10
            border
            border-[#FF901C]/20
            px-4
            py-2
            text-sm
            text-[#FF901C]
          "
          >
            Plenty of storage remaining
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformHealth;
