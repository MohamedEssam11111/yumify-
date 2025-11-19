import { useState } from "react";
import { toast } from "react-hot-toast";

export default function InputToastBox({ t, callback }) {
  const [value, setValue] = useState("");

  return (
    <div
      className={`
        bg-white border border-orange-300 shadow-lg rounded-xl p-5 w-80 
        animate-[popIn_0.3s_ease-out]
      `}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 font-montserrat">
        Enter your email
      </h3>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="example@gmail.com"
        autoFocus
        className="w-full border border-orange-300 rounded-lg px-3 py-2 
                   focus:outline-none focus:border-orange-500 
                   transition-all font-poppins"
      />

      <button
        onClick={() => {
          callback(value);
          toast.dismiss(t.id);
        }}
        className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg 
                   font-semibold hover:bg-orange-600 transition-all duration-300"
      >
        Submit
      </button>
    </div>
  );
}
