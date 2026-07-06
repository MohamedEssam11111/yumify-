import { Activity } from "lucide-react";

import OrdersTrendChart from "./OrdersTrendChart";
import UsersGrowthChart from "./UsersGrowthChart";

const AnalyticsSection = ({ ordersTrend, usersGrowth }) => {
  return (
    <section className="relative mt-16">
      {/* Background Glow */}

      <div className="absolute left-1/2 top-0 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-[#7C5CFF]/10 blur-[140px]" />

      {/* Header */}

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight text-white">
            Analytics
          </h2>

          <p className="mt-3 max-w-2xl text-[#AAB3D3]">
            Monitor platform performance, order activity, and user growth with
            real-time analytics designed to provide a complete overview of the
            Yumify ecosystem.
          </p>
        </div>

        {/* Live Badge */}

        <div
          className="
            inline-flex
            items-center
            gap-3
            self-start
            rounded-full
            border
            border-[#22C55E]/20
            bg-[#22C55E]/10
            px-5
            py-3
            text-sm
            font-semibold
            text-[#22C55E]
          "
        >
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#22C55E] opacity-75"></span>

            <span className="relative inline-flex h-3 w-3 rounded-full bg-[#22C55E]"></span>
          </span>
          <Activity size={18} />
          Live Analytics
        </div>
      </div>

      {/* Charts */}

      <div className="grid gap-8 xl:grid-cols-2">
        <OrdersTrendChart data={ordersTrend} />

        <UsersGrowthChart data={usersGrowth} />
      </div>
    </section>
  );
};

export default AnalyticsSection;
