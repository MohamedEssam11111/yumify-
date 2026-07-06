import {
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Cpu,
  Sparkles,
  Users,
} from "lucide-react";

const HeroSection = ({ adminProfile, dashboardStats }) => {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#0B1024] via-[#111B38] to-[#0B1024] p-8 shadow-[0_0_80px_rgba(124,92,255,.12)]">
      {/* Background Glow */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#7C5CFF]/20 blur-[120px]" />

      <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[#FF901C]/10 blur-[140px]" />

      <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-white/5 to-transparent" />

      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        {/* ================= LEFT ================= */}

        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/30 bg-[#22C55E]/10 px-4 py-2 text-sm text-[#22C55E]">
            <CheckCircle2 size={16} />
            All Platform Services Operational
          </div>

          <h1 className="mt-6 text-5xl font-black leading-tight text-white">
            Welcome back,
            <br />
            <span className="bg-gradient-to-r from-[#FF901C] via-[#FFC36A] to-[#FF901C] bg-clip-text text-transparent">
              {adminProfile?.name || "Administrator"}
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#AAB3D3]">
            Monitor users, restaurants, orders and platform performance from a
            single intelligent dashboard designed to keep the Yumify ecosystem
            running smoothly.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Users className="text-[#4AE8FF]" size={22} />

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6D7592]">
                    Users
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {dashboardStats.totalUsers}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Cpu className="text-[#7C5CFF]" size={22} />

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6D7592]">
                    Restaurants
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {dashboardStats.totalRestaurants}
                  </h3>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Bot className="text-[#FF901C]" size={22} />

                <div>
                  <p className="text-xs uppercase tracking-wider text-[#6D7592]">
                    AI Requests
                  </p>

                  <h3 className="text-2xl font-bold text-white">
                    {dashboardStats.aiRequestsToday}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          <button className="group mt-10 flex items-center gap-3 rounded-2xl bg-[#FF901C] px-7 py-4 font-semibold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_35px_rgba(255,144,28,.45)]">
            View Full Analytics
            <ArrowUpRight
              size={18}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </button>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="relative flex items-center justify-center">
          <div className="relative flex h-[350px] w-[350px] items-center justify-center rounded-full border border-[#7C5CFF]/20 bg-gradient-to-br from-[#7C5CFF]/10 via-[#0B1024] to-[#FF901C]/10 backdrop-blur-xl">
            <div className="absolute h-[250px] w-[250px] rounded-full border border-[#4AE8FF]/20 animate-pulse" />

            <div className="absolute h-[180px] w-[180px] rounded-full border border-[#FF901C]/20" />

            <Sparkles
              size={85}
              className="text-[#FF901C] drop-shadow-[0_0_40px_rgba(255,144,28,.8)]"
            />

            {/* Floating Card */}

            <div className="absolute left-0 top-8 rounded-2xl border border-white/10 bg-[#111B38]/90 px-5 py-3 shadow-xl backdrop-blur-xl">
              <p className="text-xs text-[#6D7592]">Revenue</p>

              <h3 className="mt-1 text-xl font-bold text-white">
                ${dashboardStats.totalRevenue}
              </h3>
            </div>

            <div className="absolute bottom-8 right-0 rounded-2xl border border-white/10 bg-[#111B38]/90 px-5 py-3 shadow-xl backdrop-blur-xl">
              <p className="text-xs text-[#6D7592]">Platform Rating</p>

              <h3 className="mt-1 text-xl font-bold text-white">
                ⭐ {dashboardStats.averageRating}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
