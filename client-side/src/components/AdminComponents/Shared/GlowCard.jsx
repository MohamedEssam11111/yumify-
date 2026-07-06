const GlowCard = ({
  children,
  className = "",
  glowColor = "#7C5CFF",
  hover = true,
}) => {
  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-white/10
        bg-[#0B1024]
        backdrop-blur-xl
        transition-all
        duration-500
        ${hover ? "hover:-translate-y-1 hover:border-white/20" : ""}
        ${className}
      `}
      style={{
        boxShadow: `0 0 35px ${glowColor}12`,
      }}
    >
      {/* Glow */}

      <div
        className="
          pointer-events-none
          absolute
          -top-20
          -right-20
          h-52
          w-52
          rounded-full
          blur-[120px]
          opacity-25
          transition-opacity
          duration-500
        "
        style={{
          background: glowColor,
        }}
      />

      {/* Shine */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          opacity-0
          transition-opacity
          duration-500
          hover:opacity-100
        "
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,.04), transparent 35%)",
        }}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlowCard;
