import { CalendarCheck, Package, Percent, Store, UserPlus } from "lucide-react";

const iconMap = {
  user: UserPlus,
  restaurant: Store,
  order: Package,
  reservation: CalendarCheck,
  promotion: Percent,
};

const colorMap = {
  user: "#4AE8FF",
  restaurant: "#FF901C",
  order: "#7C5CFF",
  reservation: "#22C55E",
  promotion: "#F72585",
};

const RecentActivity = ({ activities }) => {
  return (
    <section
      className="
        mt-16
        rounded-[28px]
        border
        border-white/10
        bg-[#0B1024]
        p-8
        shadow-[0_0_40px_rgba(124,92,255,.10)]
      "
    >
      {/* Header */}

      <div className="mb-10 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white">Recent Activity</h2>

          <p className="mt-2 text-[#AAB3D3]">
            Latest actions across the Yumify platform.
          </p>
        </div>

        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#AAB3D3]">
          {activities.length} Activities
        </div>
      </div>

      {/* Timeline */}

      <div className="relative">
        {/* Timeline line */}

        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-[#7C5CFF] via-[#41E9FF] to-transparent opacity-40" />

        <div className="space-y-8">
          {activities.map((activity) => {
            const Icon = iconMap[activity.type];

            const color = colorMap[activity.type] || "#FF901C";

            return (
              <div
                key={activity.id}
                className="
                  group
                  relative
                  flex
                  items-start
                  gap-6
                "
              >
                {/* Icon */}

                <div
                  className="
                    relative
                    z-10
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#111B38]
                    transition-all
                    duration-300
                    group-hover:scale-110
                  "
                  style={{
                    boxShadow: `0 0 25px ${color}30`,
                  }}
                >
                  <Icon
                    size={28}
                    style={{
                      color,
                    }}
                  />
                </div>

                {/* Content */}

                <div
                  className="
                    flex-1
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-5
                    transition-all
                    duration-300
                    group-hover:border-white/20
                    group-hover:bg-white/[0.05]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {activity.title}
                      </h3>

                      <p className="mt-2 leading-7 text-[#AAB3D3]">
                        {activity.description}
                      </p>
                    </div>

                    <span
                      className="
                        whitespace-nowrap
                        rounded-full
                        border
                        border-white/10
                        bg-[#111B38]
                        px-3
                        py-1.5
                        text-xs
                        text-[#6D7592]
                      "
                    >
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RecentActivity;
