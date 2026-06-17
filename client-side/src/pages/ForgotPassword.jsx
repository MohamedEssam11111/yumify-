import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import userAPI from "../apis/user.api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      return toast.error("Please enter your email");
    }

    try {
      setLoading(true);

      const res = await userAPI.post("/forgot-password", {
        email,
      });

      toast.success(res.data?.message || "Reset link sent successfully 📧", {
        duration: 5000,
      });

      setEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send reset link");

      console.error("Forgot password error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-orange-50 to-white dark:from-[#071018] dark:to-[#071426] font-poppins">
      <div
        className="
          bg-white
          dark:bg-[#071826]
          rounded-3xl
          shadow-xl
          dark:shadow-[0_10px_30px_rgba(2,6,23,0.7)]
          p-10
          max-w-md
          w-full
          animate-[popIn_0.4s_ease-out]
        "
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-orange-500"
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
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-3">
          Forgot Password?
        </h1>

        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Enter your email address and we'll send you a password reset link.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email Address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              px-4
              py-3
              rounded-xl
              border
              border-gray-200
              dark:border-[#25313a]
              bg-gray-50
              dark:bg-[#071018]
              dark:text-white
              outline-none
              focus:ring-2
              focus:ring-orange-400
              transition-all
            "
          />

          <button
            type="submit"
            disabled={loading}
            className={`
              w-full
              py-3
              rounded-xl
              font-semibold
              text-white
              flex
              items-center
              justify-center
              gap-2
              transition-all
              duration-300

              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-500 hover:bg-orange-600 hover:-translate-y-1"
              }
            `}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="
            w-full
            mt-6
            text-orange-500
            dark:text-orange-400
            hover:underline
            font-medium
          "
        >
          Back to Login
        </button>
      </div>

      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0.95);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
