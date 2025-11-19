/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
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
      },
    },
    screens: {
      "max-2xl": { max: "1536px" },
      "max-xl": { max: "1280px" },
      "max-1170": { max: "1170px" },
      "max-lg": { max: "1024px" },
      "max-md": { max: "768px" },
      "max-sm": { max: "640px" },
      "max-xs": { max: "480px" },
    },
  },
  plugins: [],
};
