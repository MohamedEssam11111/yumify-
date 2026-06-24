import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import userAPI from "../apis/user.api";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const hasCalled = useRef(false);
  const [status, setStatus] = useState("loading");
  // loading | success | invalid | expired | already-verified | server-error

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hasCalled.current) return;

    hasCalled.current = true;
    verifyEmail();
  }, []);

  useEffect(() => {
    let timer;

    if (status === "success") {
      timer = setTimeout(() => {
        navigate("/login");
      }, 5000);
    }

    return () => clearTimeout(timer);
  }, [status, navigate]);

  const verifyEmail = async () => {
    try {
      const res = await userAPI.get(`/verify/${token}`);

      setStatus("success");
      setMessage(
        res.data.message || "Your email has been verified successfully.",
      );
    } catch (error) {
      const response = error.response;

      if (!response) {
        setStatus("server-error");
        setMessage("Unable to connect to the server.");
        return;
      }

      const backendStatus = response.data?.status;

      switch (backendStatus) {
        case "invalid":
          setStatus("invalid");
          break;

        case "expired":
          setStatus("expired");
          break;

        case "already-verified":
          setStatus("already-verified");
          break;

        default:
          setStatus("server-error");
      }

      setMessage(
        response.data?.message ||
          "Something went wrong. Please try again later.",
      );
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <Loader2 className="w-20 h-20 text-orange-500 animate-spin" />

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6">
              Verifying Email...
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-3">
              Please wait while we verify your email address.
            </p>
          </>
        );

      case "success":
        return (
          <>
            <CheckCircle className="w-20 h-20 text-green-500" />

            <h1 className="text-3xl font-bold text-green-600 mt-6">
              Email Verified!
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-3">{message}</p>

            <p className="text-sm text-gray-500 mt-4">
              Redirecting to login in 5 seconds...
            </p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Go to Login
            </button>
          </>
        );

      case "invalid":
        return (
          <>
            <XCircle className="w-20 h-20 text-red-500" />

            <h1 className="text-3xl font-bold text-red-600 mt-6">
              Invalid Link
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-3">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Go to Login
            </button>
          </>
        );

      case "expired":
        return (
          <>
            <AlertTriangle className="w-20 h-20 text-yellow-500" />

            <h1 className="text-3xl font-bold text-yellow-600 mt-6">
              Verification Link Expired
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-3">{message}</p>

            <div className="flex gap-4 mt-6 flex-wrap justify-center">
              <button
                onClick={() => navigate("/resend-verification")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Resend Email
              </button>

              <button
                onClick={() => navigate("/login")}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Login
              </button>
            </div>
          </>
        );

      case "already-verified":
        return (
          <>
            <Info className="w-20 h-20 text-blue-500" />

            <h1 className="text-3xl font-bold text-blue-600 mt-6">
              Already Verified
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-3">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              Go to Login
            </button>
          </>
        );

      case "server-error":
        return (
          <>
            <XCircle className="w-20 h-20 text-red-500" />

            <h1 className="text-3xl font-bold text-red-600 mt-6">
              Server Error
            </h1>

            <p className="text-gray-600 dark:text-gray-300 mt-3">{message}</p>

            <div className="flex gap-4 mt-6 flex-wrap justify-center">
              <button
                onClick={verifyEmail}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Try Again
              </button>

              <button
                onClick={() => navigate("/login")}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition"
              >
                Login
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-[#071018] dark:via-[#0B1522] dark:to-[#071826] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-[#071826] max-w-lg w-full rounded-3xl shadow-2xl border border-gray-200 dark:border-[#1f2f3a] p-10 text-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default VerifyEmail;
