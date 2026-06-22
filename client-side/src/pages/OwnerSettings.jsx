import { useEffect, useState } from "react";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";
import { User, Store, Mail, MapPin } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
const PRIMARY_COLOR = "#FF7A18";

const OwnerSettings = () => {
  const { darkMode, toggleTheme } = useTheme();
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(false);

  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [restaurantName, setRestaurantName] = useState("");

  const fetchOwnerData = async () => {
    try {
      const res = await userAPI.get("/profile");

      setOwner(res.data);
      setOwnerName(res.data.name || "");
      setAddress(res.data.address || "");
      setRestaurantName(res.data.restaurant?.name || "");
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch settings");
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleSaveProfile = async () => {
    // Check if nothing changed
    if (
      ownerName.trim() === owner?.name &&
      address.trim() === (owner?.address || "")
    ) {
      return toast("No changes detected", {
        icon: "ℹ️",
      });
    }

    try {
      setLoading(true);

      await userAPI.patch("/modifyUserData", {
        name: ownerName,
        address,
      });

      // Update local state
      setOwner((prev) => ({
        ...prev,
        name: ownerName,
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>

        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your restaurant and account information.
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
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
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
              value={owner?.email || ""}
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
      {/* Restaurant Information */}
      <div className="bg-white dark:bg-[#071826] rounded-2xl p-6 border border-gray-200 dark:border-[#1f2f3a] shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Store color={PRIMARY_COLOR} />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Restaurant Information
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-200">
              Restaurant Name
            </label>

            <input
              type="text"
              disabled
              value={restaurantName}
              className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522] dark:text-white opacity-70 cursor-not-allowed"
            />

            <p className="text-xs text-gray-500 mt-2">
              Restaurant name will be editable in future updates.
            </p>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-200">
              Restaurant Email
            </label>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522]">
              <Mail size={18} className="text-orange-500" />
              <span className="dark:text-white">
                {owner?.email || "No Email"}
              </span>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-gray-700 dark:text-gray-200">
              Restaurant Address
            </label>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-300 dark:border-[#24323b] dark:bg-[#0b1522]">
              <MapPin size={18} className="text-orange-500" />
              <span className="dark:text-white">
                {address || "No address provided"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerSettings;
