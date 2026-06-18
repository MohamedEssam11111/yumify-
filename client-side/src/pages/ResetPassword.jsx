import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [validToken, setValidToken] = useState(false);

  useEffect(() => {
    userAPI
      .get(`/reset-password/${token}`)
      .then(() => {
        setValidToken(true);
      })
      .catch(() => {
        setValidToken(false);
      })
      .finally(() => {
        setCheckingToken(false);
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      return toast.error("Please fill all fields");
    }

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);

      const res = await userAPI.post(`/reset-password/${token}`, {
        newPassword,
      });

      toast.success(res.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#071018]">
        <div className="flex items-center gap-3 text-lg font-semibold dark:text-white">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          Checking reset link...
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#071018] px-4">
        <div className="bg-white dark:bg-[#071826] p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Invalid Link</h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This password reset link is invalid or has expired.
          </p>

          <button
            onClick={() => navigate("/forgotPassword")}
            className="bg-[#f35f29] text-white px-6 py-3 rounded-lg hover:bg-[#e25522] transition"
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white dark:from-[#071018] dark:to-[#071426] px-4">
      <div className="bg-white dark:bg-[#071826] rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-500/10 p-4 rounded-full">
            <Lock className="text-[#f35f29]" size={30} />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">
          Reset Password
        </h1>

        <p className="text-gray-500 dark:text-gray-300 text-center mb-8">
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New Password */}
          <div>
            <label className="block mb-2 font-medium dark:text-gray-200">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#25313a] dark:bg-[#071018] dark:text-white rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Enter new password"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 font-medium dark:text-gray-200">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-300 dark:border-[#25313a] dark:bg-[#071018] dark:text-white rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Confirm password"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#f35f29] hover:bg-[#e25522]"
            }`}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
