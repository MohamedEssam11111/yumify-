const NeonBackground = () => {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-[#050816]">
      {/* Purple Glow */}

      <div
        className="
          absolute
          -top-40
          left-1/3
          h-[700px]
          w-[700px]
          rounded-full
          blur-[180px]
          opacity-20
          animate-pulse
        "
        style={{
          background: "#7C5CFF",
          animationDuration: "8s",
        }}
      />

      {/* Orange Glow */}

      <div
        className="
          absolute
          top-1/2
          -right-40
          h-[600px]
          w-[600px]
          rounded-full
          blur-[170px]
          opacity-15
          animate-pulse
        "
        style={{
          background: "#FF901C",
          animationDuration: "10s",
        }}
      />

      {/* Cyan Glow */}

      <div
        className="
          absolute
          bottom-0
          -left-40
          h-[500px]
          w-[500px]
          rounded-full
          blur-[170px]
          opacity-15
          animate-pulse
        "
        style={{
          background: "#41E9FF",
          animationDuration: "12s",
        }}
      />

      {/* Top Gradient */}

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050816]/20 to-[#050816]" />

      {/* Radial Gradient */}

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, transparent 0%, rgba(5,8,22,.45) 65%, rgba(5,8,22,.95) 100%)",
        }}
      />

      {/* Grid */}

      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Noise */}

      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Vignette */}

      <div className="absolute inset-0 shadow-[inset_0_0_250px_rgba(0,0,0,.85)]" />
    </div>
  );
};

export default NeonBackground;
