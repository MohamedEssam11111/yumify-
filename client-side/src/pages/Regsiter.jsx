import React, { useState } from "react";
import Logo from "../components/Logo";
import SmartRestaurant from "../components/SmartRestaurant";
import { Link, useNavigate } from "react-router-dom";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    terms: "",
  });

  const validateName = (name) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 3) return "Name must be at least 3 characters";
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) return "Email is required";
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(email)) return "Please enter a valid email";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 8) return "Password must be at least 8 characters";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Confirm password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      fullName: validateName(fullName),
      email: validateEmail(regEmail),
      password: validatePassword(createPassword),
      confirmPassword: validateConfirmPassword(createPassword, confirmPassword),
      role: role ? "" : "Please select a role",
      terms: termsAccepted ? "" : "You must accept the terms",
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) return;

    try {
      setLoading(true);

      await userAPI.post("/register", {
        name: fullName,
        email: regEmail,
        password: createPassword,
        role,
      });

      toast.success("Registration successful!");

      let seconds = 3;

      const toastId = toast.loading(
        `Verification email sent 📧 ${seconds}s...`,
      );

      const interval = setInterval(() => {
        seconds--;

        if (seconds > 0) {
          toast.loading(`Verification email sent 📧 ${seconds}s...`, {
            id: toastId,
          });
        } else {
          clearInterval(interval);

          toast.success("Redirecting...", {
            id: toastId,
          });

          navigate("/email-verification");
        }
      }, 1000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body flex justify-center items-center min-h-screen bg-[linear-gradient(135deg,#f0f2f5_0%,#e0e5ec_100%)] dark:bg-[linear-gradient(135deg,#06121a_0%,#0f1724_100%)]">
      <div className="login-container rounded-[20px] shadow-[0_10px_30px_rgba(0,_0,_0,_0.1)] flex max-w-[900px] w-[90%] overflow-hidden max-md:flex-col dark:bg-[#071018] dark:shadow-[0_12px_40px_rgba(2,_6,_23,_0.6)]">
        <div className="bg-[#FBFCFD] flex-1 p-[10px] text-center dark:bg-[#0f1724] dark:text-[#e6eef8]">
          <Logo logoSize="text-[35px]" />
          <SmartRestaurant textSize="text-[15px]" />

          <h1 className="text-[25px] font-[600] m-[20px_5px_15px_5px] dark:text-white">
            Create Your Account!
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-[15px] items-center p-[0px_35px]"
          >
            <div className="w-full">
              <input
                className="p-[12px] rounded-[8px] border-2 w-full dark:bg-[#071018] dark:border-[#25313a]"
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    fullName: validateName(e.target.value),
                  }));
                }}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="w-full">
              <input
                className="p-[12px] rounded-[8px] border-2 w-full dark:bg-[#071018] dark:border-[#25313a]"
                type="email"
                placeholder="Email"
                value={regEmail}
                onChange={(e) => {
                  setRegEmail(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    email: validateEmail(e.target.value),
                  }));
                }}
              />
              {errors.email && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="w-full relative">
              <input
                className="p-[12px] pr-12 rounded-[8px] border-2 w-full dark:bg-[#071018] dark:border-[#25313a]"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={createPassword}
                onChange={(e) => {
                  setCreatePassword(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    password: validatePassword(e.target.value),
                  }));
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="w-full relative">
              <input
                className="p-[12px] pr-12 rounded-[8px] border-2 w-full dark:bg-[#071018] dark:border-[#25313a]"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((p) => ({
                    ...p,
                    confirmPassword: validateConfirmPassword(
                      createPassword,
                      e.target.value,
                    ),
                  }));
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="w-full">
              <select
                className="p-[12px] rounded-[8px] border-2 w-full dark:bg-[#071018] dark:border-[#25313a]"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setErrors((p) => ({ ...p, role: "" }));
                }}
              >
                <option value="">Select Role</option>
                <option value="customer">Customer</option>
                <option value="owner">Owner</option>
              </select>
              {errors.role && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.role}
                </p>
              )}
            </div>

            <div className="w-full">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    setErrors((p) => ({ ...p, terms: "" }));
                  }}
                />
                I agree to the terms and conditions
              </label>
              {errors.terms && (
                <p className="text-red-500 text-sm text-left mt-1">
                  {errors.terms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[50px] rounded-lg text-white font-semibold transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#f35f29] hover:bg-[#E65C2B]"
              }`}
            >
              {loading ? "Creating Account..." : "Register"}
            </button>
          </form>

          <div className="p-[10px] dark:text-gray-300">
            <span className="pr-[5px]">Already have an account?</span>
            <Link to="/login" className="text-[#FF784E] hover:underline">
              Login
            </Link>
          </div>
        </div>

        <div className="md:flex-1 overflow-hidden bg-[linear-gradient(135deg,#FF7043_0%,#FFCCBB_100%)] flex justify-center items-center dark:bg-[linear-gradient(135deg,#06121a_0%,#0f1724_100%)]">
          <img className="max-md:hidden" src="/berger.png" alt="" />
          <img
            className="md:hidden w-full h-[600px]"
            src="/berger650.png"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
