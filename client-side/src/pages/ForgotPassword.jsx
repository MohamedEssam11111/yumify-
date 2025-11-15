import React from "react";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white px-6 font-poppins">
      <div className="bg-white rounded-2xl shadow-lg text-center p-10 max-w-md w-full animate-[popIn_0.5s_ease-out]">
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
        <h1 className="font-montserrat font-semibold text-2xl text-gray-800 mb-3">
          Forgot Your Password?
        </h1>

        {/* text */}
        <p className="text-gray-600 text-base leading-relaxed mb-6">
          We’ll send a password reset link to your email.
        </p>

        {/* Form */}
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            required
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-base bg-gray-50 shadow-inner focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300"
          />
          <button
            type="submit"
            className="w-full py-3 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Send Reset Link
          </button>
        </form>

        {/* Back to Login link */}
        <a
          href="#"
          className="inline-block mt-8 text-orange-500 font-medium hover:text-orange-600 hover:underline transition-colors duration-300"
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
