/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        brand: {
          darkOrange: "#C2410C",
          orange: "#F97316",
          lightOrange: "#FFEDD5",
        },
      },
    },
  },
  plugins: [],
};
