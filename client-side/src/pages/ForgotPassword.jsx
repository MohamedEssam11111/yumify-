import  { useState } from "react";
import { useNavigate } from "react-router";
import userAPI from "../apis/user.api";

export default function ForgotPassword() {
  const navigator = useNavigate();
  const [email, setEmail] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-6 font-poppins dark:bg-gradient-to-br dark:from-[#071018] dark:to-[#071426]">
      <div className="bg-white rounded-2xl shadow-lg text-center p-10 max-w-md w-full animate-[popIn_0.5s_ease-out]
                      dark:bg-[#071826] dark:border dark:border-[rgba(255,255,255,0.03)] dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
        {/* lock icon */}
        <div className="text-orange-500 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>

        {/* title */}
        <h1 className="font-montserrat font-semibold text-2xl text-gray-800 dark:text-gray-100 mb-3">
          Forgot Your Password?
        </h1>

        {/* text */}
        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-6">
          We’ll send a password reset link to your email.
        </p>

        {/* Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-gray-50 shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300
                       dark:bg-[#071826] dark:border-[#25313a] dark:text-gray-100 dark:placeholder-gray-400 dark:focus:ring-orange-400"
          />
          <button
            type="submit"
            onClick={() => userAPI.post("/forgot-password", { email })}
            className="w-full py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login link */}
        <a
          href="#"
          onClick={() => navigator("/login")}
          className="inline-block mt-8 text-orange-500 font-medium hover:text-orange-600 hover:underline transition-colors duration-300 dark:text-orange-400"
        >
          Back to Login
        </a>
      </div>

      {/* Animation */}
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
