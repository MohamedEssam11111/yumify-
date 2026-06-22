import { useEffect, useState } from "react";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";
import { User, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import CustomerSidebar from "../components/CustomerSidebar";

const PRIMARY_COLOR = "#FF7A18";

const CustomerSettings = () => {
  const { darkMode, toggleTheme } = useTheme();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sideBarOpened, setSideBarOpened] = useState(false);

  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");

  const fetchUserData = async () => {
    try {
      const res = await userAPI.get("/profile");

      setUser(res.data);
      setUserName(res.data.name || "");
      setAddress(res.data.address || "");
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch settings");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSaveProfile = async () => {
    if (
      userName.trim() === user?.name &&
      address.trim() === (user?.address || "")
    ) {
      return toast("No changes detected", {
        icon: "ℹ️",
      });
    }

    try {
      setLoading(true);

      await userAPI.patch("/modifyUserData", {
        name: userName,
        address,
      });

      setUser((prev) => ({
        ...prev,
        name: userName,
        address,
      }));

      toast.success("Profile updated successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomerSidebar
        sideBarOpened={sideBarOpened}
        setSideBarOpened={setSideBarOpened}
        userData={user}
      />

      {/* Overlay */}
      {sideBarOpened && (
        <div
          onClick={() => setSideBarOpened(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
        />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-[#071018] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 relative">
          {/* Menu Button */}
          <button
            onClick={() => setSideBarOpened(!sideBarOpened)}
            className="fixed top-5 left-5 z-49 p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1a2a3a] transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>

          {/* Header */}
          <div className="text-center pt-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>

            <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
              Manage your personal information and customize your Yumify
              experience.
            </p>
          </div>

          {/* Profile Information */}
          <div className="bg-white dark:bg-[#071826] rounded-2xl p-6 border border-gray-200 dark:border-[#1f2f3a] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User color={PRIMARY_COLOR} />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-200">
                  Full Name
                </label>

                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522] dark:text-white focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": PRIMARY_COLOR }}
                />
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-200">
                  Email Address
                </label>

                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522] dark:text-white opacity-70 cursor-not-allowed"
                />

                <p className="text-xs text-gray-500 mt-2">
                  Email cannot be changed for security reasons.
                </p>
              </div>

              <div>
                <label className="block mb-2 text-gray-700 dark:text-gray-200">
                  Address
                </label>

                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522] dark:text-white resize-none focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": PRIMARY_COLOR }}
                />
              </div>

              <button
                disabled={loading}
                onClick={handleSaveProfile}
                className="px-6 py-3 rounded-xl text-white font-semibold disabled:opacity-60 transition-all"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-[#071826] rounded-2xl p-6 border border-gray-200 dark:border-[#1f2f3a] shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              {darkMode ? (
                <Moon color={PRIMARY_COLOR} />
              ) : (
                <Sun color={PRIMARY_COLOR} />
              )}

              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Theme Mode
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Switch between light and dark mode.
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                  darkMode ? "bg-orange-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 ${
                    darkMode ? "translate-x-9" : "translate-x-1"
                  }`}
                >
                  {darkMode ? (
                    <Moon size={14} className="text-orange-500" />
                  ) : (
                    <Sun size={14} className="text-yellow-500" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerSettings;
