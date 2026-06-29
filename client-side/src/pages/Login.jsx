import React, { useState } from "react";
import Logo from "../components/Logo";
import SmartRestaurant from "../components/SmartRestaurant";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigator = useNavigate();

  const [logEmail, setLogEmail] = useState("");
  const [logPassword, setLogPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return "Please enter a valid email";
    }

    return "";
  };

  const validatePassword = (password) => {
    if (!password.trim()) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;

    setLogEmail(value);

    setErrors((prev) => ({
      ...prev,
      email: validateEmail(value),
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setLogPassword(value);

    setErrors((prev) => ({
      ...prev,
      password: validatePassword(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(logEmail);
    const passwordError = validatePassword(logPassword);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    if (emailError || passwordError) {
      return;
    }

    try {
      setLoading(true);

      const res = await userAPI.post("/login", {
        email: logEmail,
        password: logPassword,
      });

      toast.success("Login successful 🎉");

      const { role } = res.data;

      if (role === "owner") {
        navigator("/owner/dashboard");
      } else {
        navigator("/");
      }
    } catch (err) {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);

      if (
        err.response?.status === 403 &&
        err.response?.data?.isVerified === false
      ) {
        return toast.error("Email not verified. Check your inbox 📧", {
          duration: 5000,
        });
      }

      toast.error(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="z-1000 login-body flex justify-center items-center min-h-screen dark:bg-[#0b1220]">
      <div
        className="
          login-container
          rounded-[20px]
          shadow-[0_10px_30px_rgba(0,0,0,0.1)]
          flex
          max-w-[900px]
          w-[90%]
          overflow-hidden
          max-md:flex-col
          dark:bg-[#0b0f15]
          dark:shadow-[0_12px_40px_rgba(2,6,23,0.6)]
        "
      >
        {/* Login Form */}
        <div className="flex-1 bg-[#FBFCFD] p-[40px] text-center dark:bg-[#0f1724] dark:text-[#e6eef8]">
          <Logo />
          <SmartRestaurant />

          <h1 className="text-[25px] font-[600] mt-6 mb-4 dark:text-white">
            Welcome Back!
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 items-center px-[35px]"
          >
            {/* Email */}
            <div className="w-full">
              <input
                type="email"
                placeholder="Email"
                value={logEmail}
                onChange={handleEmailChange}
                autoComplete="off"
                className={`w-full p-3 rounded-lg border-2 outline-none transition-all
                ${
                  errors.email
                    ? "border-red-500 focus:ring-2 focus:ring-red-300"
                    : "border-[#E0E0E0] focus:ring-2 focus:ring-orange-300"
                }
                dark:bg-[#071018]
                dark:border-[#25313a]
                dark:text-[#e6eef8]
                dark:placeholder-gray-400`}
              />

              {errors.email && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="w-full">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={logPassword}
                  onChange={handlePasswordChange}
                  autoComplete="off"
                  className={`w-full p-3 pr-12 rounded-lg border-2 outline-none transition-all
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-2 focus:ring-red-300"
                      : "border-[#E0E0E0] focus:ring-2 focus:ring-orange-300"
                  }
                  dark:bg-[#071018]
                  dark:border-[#25313a]
                  dark:text-[#e6eef8]
                  dark:placeholder-gray-400`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-orange-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[50px] rounded-lg font-semibold text-[18px] text-white flex items-center justify-center transition-all duration-300
                ${
                  loading
                    ? "bg-black cursor-not-allowed"
                    : "bg-[#f35f29] hover:bg-[#E65C2B] hover:-translate-y-1"
                }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Forgot Password */}
          <div className="mt-4 text-sm text-gray-600 pb-[15px] dark:text-gray-300">
            <Link
              to="/forgotPassword"
              className="font-[500] text-[#FF784E] hover:text-red-500 hover:underline transition duration-300 dark:text-[#FFB59A]"
            >
              Forgot password?
            </Link>
          </div>

          {/* Register */}
          <div className="dark:text-gray-300">
            <span className="pr-1">Don't have an account?</span>

            <Link
              to="/register"
              className="font-[500] text-[#FF784E] hover:text-red-500 hover:underline transition duration-300 dark:text-[#FFB59A]"
            >
              Register
            </Link>
          </div>
        </div>

        {/* Image Section */}
        <div
          className="
            md:flex-1
            overflow-hidden
            bg-[linear-gradient(135deg,#FF7043_0%,#FFCCBB_100%)]
            flex
            justify-center
            items-center
            max-md:max-h-[100px]
            dark:bg-gradient-to-br
            dark:from-[#0b1220]
            dark:to-[#1f2937]
          "
        >
          <img
            className="max-w-full h-full max-md:hidden"
            src="/berger.png"
            alt="Burger"
          />

          <img
            className="md:hidden w-full h-[600px]"
            src="/berger650.png"
            alt="Burger Mobile"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;
