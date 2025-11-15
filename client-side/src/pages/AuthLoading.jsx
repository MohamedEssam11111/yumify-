import React, { useEffect } from "react";

const AuthLoading = () => {
  useEffect(() => {
    // يا عاصم شوف هتحط الدايركشن فين هههههه بهزر معاك
    //  مثال بسيط لإعادة التوجيه بعد 3 ثواني (اختياري)
    // const timer = setTimeout(() => {
    //   window.location.href = "/dashboard";
    // }, 3000);
    // return () => clearTimeout(timer);
  }, []);

  const BG_URL =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80";

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center text-center overflow-hidden font-poppins bg-gradient-to-br from-[#FF7043] to-[#FFA785]">
      {/* Blurred background image */}
       <div
        className="absolute inset-0 bg-cover bg-center opacity-40 blur-[2px] brightness-75 animate-[backgroundZoom_20s_infinite_alternate]"
        style={{
          backgroundImage: `url("${BG_URL}"), linear-gradient(135deg, rgba(255,112,67,0.95), rgba(255,167,133,0.95))`,
          backgroundBlendMode: "overlay",
        }}
        aria-hidden="true"
      ></div>

      {/* Card Content */}
      <div className="relative z-10 bg-white/95 rounded-2xl shadow-2xl p-10 max-w-sm w-[90%]">
        <h1 className="font-montserrat font-bold text-[2.2rem] text-[#FF7043] mb-4">
          Yumify
        </h1>

        {/* Spinner */}
        <div className="mx-auto my-8 w-16 h-16 border-[6px] border-white/40 border-t-[#FF7043] rounded-full animate-spin"></div>

        <h2 className="font-montserrat font-semibold text-2xl text-gray-800 mb-3">
          Verifying your session...
        </h2>
        <p className="text-gray-600 text-base leading-relaxed">
          Please wait while we check your authentication.
        </p>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes backgroundZoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default AuthLoading;
