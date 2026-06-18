/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      scale: {
        0: "0",
        25: ".25",
        50: ".5",
        75: ".75",
        90: ".9",
        95: ".95",
        100: "1",
        105: "1.05",
        110: "1.1",
        125: "1.25",
        150: "1.5",
        200: "2",
      },
      colors: {
        prim: "#FF7043",
        brand: {
          darkOrange: "#C2410C",
          orange: "#F97316",
          lightOrange: "#FFEDD5",
        },
      },
      backgroundImage: {
        grad1: "linear-gradient(to right, #FF7043, #FFDAB9)",
      },
      fontFamily: {
        logofont: ["Pacifico", "cursive"],
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      keyframes: {
        rightToLeft: {
          "0%": { transform: "translateX(60px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "ymym-float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-8px)",
          },
        },
        "ymym-head": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(-3deg)",
          },
          "50%": {
            transform: "translateY(-2px) rotate(3deg)",
          },
        },

        "ymym-hat": {
          "0%, 100%": {
            transform: "translateY(0px) rotate(-1.5deg)",
          },
          "50%": {
            transform: "translateY(-1.5px) rotate(1.5deg)",
          },
        },

        "ymym-wave": {
          "0%, 100%": {
            transform: "rotate(0deg)",
          },
          "25%": {
            transform: "rotate(25deg)",
          },
          "75%": {
            transform: "rotate(-10deg)",
          },
        },

        "ymym-nod": {
          "0%, 100%": {
            transform: "rotate(0deg)",
          },
          "50%": {
            transform: "rotate(5deg)",
          },
        },

        "bubble-in": {
          from: {
            opacity: "0",
            transform: "translate(-50%, 8px) scale(0.95)",
          },
          to: {
            opacity: "1",
            transform: "translate(-50%, 0) scale(1)",
          },
        },
      },
      animation: {
        "ymym-float": "ymym-float 3.5s ease-in-out infinite",

        "ymym-head": "ymym-head 4.2s ease-in-out infinite",

        "ymym-hat": "ymym-hat 4.5s ease-in-out infinite",

        "ymym-wave": "ymym-wave 0.8s ease-in-out infinite",

        "ymym-nod": "ymym-nod 0.6s ease-in-out",

        "bubble-in": "bubble-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};
