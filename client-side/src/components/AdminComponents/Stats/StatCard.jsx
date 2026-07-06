import CountUp from "react-countup";
import { ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, icon: Icon, color, growth, sparkline }) => {
  return (
    <div
      className="
      group
      relative
      overflow-hidden
      rounded-[24px]
      border
      border-white/10
      bg-[#0B1024]
      p-6
      transition-all
      duration-500
      hover:-translate-y-2
      hover:border-white/20
      hover:shadow-[0_0_40px_rgba(124,92,255,.18)]
      "
    >
      {/* Glow */}

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500"
        style={{
          background: `radial-gradient(circle at top right, ${color}20 0%, transparent 65%)`,
        }}
      />

      {/* Icon */}

      <div
        className="
        flex
        h-16
        w-16
        items-center
        justify-center
        rounded-2xl
        border
        border-white/10
        bg-white/5
        backdrop-blur-xl
        "
      >
        <Icon
          size={30}
          style={{
            color,
            filter: `drop-shadow(0 0 15px ${color})`,
          }}
        />
      </div>

      {/* Title */}

      <p className="mt-6 text-sm text-[#AAB3D3]">{title}</p>

      {/* Value */}

      <h2 className="mt-2 text-4xl font-black text-white">
        <CountUp end={value} duration={2} separator="," />
      </h2>

      {/* Footer */}

      <div className="mt-7 flex items-center justify-between">
        <div
          className="
          flex
          items-center
          gap-2
          rounded-full
          bg-[#22C55E]/10
          px-3
          py-1.5
          text-sm
          font-semibold
          text-[#22C55E]
          "
        >
          <ArrowUpRight size={15} />

          {growth}
        </div>

        {sparkline && (
          <img
            src={sparkline}
            alt=""
            className="h-10 object-contain opacity-80"
          />
        )}
      </div>
    </div>
  );
};

export default StatCard;
