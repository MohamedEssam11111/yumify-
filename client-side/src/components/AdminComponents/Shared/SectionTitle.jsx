import { Sparkles } from "lucide-react";

const SectionTitle = ({ title, subtitle, badge, glowColor = "#7C5CFF" }) => {
  return (
    <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      {/* Left */}

      <div>
        <div className="flex items-center gap-3">
          <Sparkles
            size={22}
            style={{
              color: glowColor,
              filter: `drop-shadow(0 0 12px ${glowColor})`,
            }}
          />

          <h2 className="text-4xl font-black tracking-tight text-white">
            {title}
          </h2>
        </div>

        {subtitle && (
          <p className="mt-3 max-w-2xl text-[#AAB3D3] leading-7">{subtitle}</p>
        )}
      </div>

      {/* Badge */}

      {badge && (
        <div
          className="
            self-start
            rounded-full
            border
            border-white/10
            bg-white/5
            px-5
            py-2.5
            text-sm
            font-semibold
            backdrop-blur-xl
          "
          style={{
            color: glowColor,
            borderColor: `${glowColor}30`,
            boxShadow: `0 0 20px ${glowColor}15`,
          }}
        >
          {badge}
        </div>
      )}
    </div>
  );
};

export default SectionTitle;
