import { useNavigate } from "react-router";

export default function EmptyCart() {
  const navigator = useNavigate();
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F5F7] dark:bg-[#071018]">
        <div
          className="fade-up w-full max-w-[480px] bg-white dark:bg-[#071826] rounded-md shadow-2xl dark:shadow-[0_20px_50px_rgba(2,6,23,0.6)] p-12 sm:p-14 text-center"
          role="region"
          aria-label="Empty cart"
        >
          {/* SVG Illustration */}
          <div className="mx-auto w-48 h-48 mb-8 flex items-center justify-center">
            <svg
              className="w-[200px] h-[250px] max-w-full"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <defs>
                <linearGradient
                  id="bg-blob"
                  x1="0"
                  y1="0"
                  x2="200"
                  y2="200"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FFF0E0" />
                  <stop offset="1" stopColor="#FFF8F2" stopOpacity="0.5" />
                </linearGradient>
                <linearGradient
                  id="cart-gradient"
                  x1="50"
                  y1="50"
                  x2="150"
                  y2="150"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#FF7A00" />
                  <stop offset="1" stopColor="#FF9E42" />
                </linearGradient>
              </defs>

              {/* Main Blob */}
              <path
                className="animate-pulse-slow"
                d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z"
                fill="url(#bg-blob)"
              />

              {/* Floating Decorations */}
              <circle
                cx="150"
                cy="35"
                r="2"
                fill="#FFD4AA"
                className="animate-float"
                style={{ animationDelay: "0.2s" }}
              />
              <circle
                cx="40"
                cy="130"
                r="4"
                fill="#FFD4AA"
                className="animate-float-reverse"
                style={{ animationDelay: "0.5s" }}
              />
              <path
                d="M150 140L154 144M154 140L150 144"
                stroke="#FF7A00"
                strokeWidth="2"
                strokeLinecap="round"
                className="animate-float"
                style={{ animationDelay: "1s" }}
              />

              {/* Cart */}
              <g className="animate-float">
                <circle cx="85" cy="145" r="7" fill="#374151" />
                <circle cx="125" cy="145" r="7" fill="#374151" />

                <path
                  d="M65 135H145L155 65H55L65 135Z"
                  fill="white"
                  stroke="#374151"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M65 135H145L155 65H55L65 135Z"
                  fill="url(#cart-gradient)"
                  opacity="0.1"
                />

                <path
                  d="M75 65L82 135"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M105 65V135"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M135 65L128 135"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M60 100H150"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                <path
                  d="M155 65L165 45H180"
                  stroke="#FF7A00"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M95 90L115 90"
                  stroke="#FF7A00"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="4 4"
                  opacity="0.6"
                />
              </g>

              {/* Sparkle */}
              <g
                transform="translate(50, 50)"
                className="animate-float-reverse"
              >
                <path
                  d="M10 0L12 8L20 10L12 12L10 20L8 12L0 10L8 8L10 0Z"
                  fill="#FF7A00"
                />
              </g>
            </svg>
          </div>

          {/* Text */}
          <div className="space-y-4">
            <h1 className="text-[28px] font-bold text-gray-900 dark:text-gray-50">
              Your Cart is Empty
            </h1>
            <p className="text-gray-500 dark:text-gray-300 text-[16px] font-medium max-w-[320px] mx-auto">
              Looks like you haven’t added anything to your cart yet.
            </p>
          </div>

          {/* Button */}
          <div className="mt-10">
            <button
              type="button"
              onClick={()=>{navigator('/')}}
              className="w-full bg-[#FF7A00] hover:bg-[#E06900] dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold text-[17px] py-4 px-8 rounded-2xl transition-all duration-300 shadow-md active:scale-[0.98] group flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <span>Browse Menu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Keyframes & Animation Classes */}
      <style>{`
        /* Fade-up animation */
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-up {
          animation: fadeUp 0.5s forwards;
        }

        /* Float animations */
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes floatReverse {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-3deg); }
        }
        @keyframes pulseSlow {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.95; }
          100% { transform: scale(1); opacity: 1; }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: floatReverse 7s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulseSlow 4s ease-in-out infinite; }
      `}</style>
    </>
  );
}
