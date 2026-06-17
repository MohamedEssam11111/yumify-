import React from "react";

const Button = ({
  width = "w-[100%]",
  height = "h-[50px]",
  radius = "rounded-[8px]",
  buttonText,
  loading = false,
  disabled = false,
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`
        ${width}
        ${height}
        ${radius}
        font-[600]
        text-[20px]
        flex items-center
        justify-center
        gap-2
        text-white
        transition-all
        duration-300

        ${
          disabled || loading
            ? "bg-gray-400 cursor-not-allowed opacity-70"
            : "bg-[#f35f29] hover:bg-[#E65C2B] hover:-translate-y-[3px]"
        }
      `}
    >
      {loading ? (
        <>
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default Button;
