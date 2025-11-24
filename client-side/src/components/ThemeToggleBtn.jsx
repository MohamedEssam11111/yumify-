import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

function ThemeToggleBtn() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-between w-14 h-7 rounded-full transition-colors duration-300 ${
        darkMode ? "bg-gray-700" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
          darkMode ? "translate-x-[30px]" : "translate-x-[2px]"
        }`}
      />

      {/* Centered icons */}
      <Sun className="absolute left-[6px] top-1/2 -translate-y-1/2 w-4 h-4 text-yellow-500" />
      <Moon className="absolute right-[5px] top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
    </button>
  );
}

export default ThemeToggleBtn;
