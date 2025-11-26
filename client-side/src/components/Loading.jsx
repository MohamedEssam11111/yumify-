import React, { useEffect } from "react";

export default function Loading() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      const splash = document.querySelector(".splash-container");
      splash.classList.add("animate-fadeOut");
      setTimeout(() => {
        // navigate to another page
        // window.location.href = "/login";
      }, 1000);
    }, 300000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative flex justify-center items-center min-h-screen overflow-hidden bg-gradient-to-br from-[#FFFBFA] to-[#FFF5ED] font-poppins">
      {/* content */}
      <div className="splash-container text-center relative z-10 opacity-0 animate-fadeIn">
        <h1 className="text-[4.5rem] font-montserrat font-bold text-[#FF7043] drop-shadow-[0_4px_15px_rgba(255,112,67,0.3)] inline-block transition-transform duration-500 ease-in-out">
          Yumify
        </h1>
        <p className="text-[1.5rem] text-[#616161] mt-2 font-normal">
          Smart Restaurant Management
        </p>
        <div className="w-10 h-10 border-4 border-gray-200 border-t-[#FF7043] rounded-full animate-spin mx-auto mt-8 shadow-md"></div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeIn { animation: fadeIn 1s ease-out forwards; }
        .animate-fadeOut { animation: fadeOut 1s ease-in forwards; }
      `}</style>
    </div>
  );
}
