import { Eye, EyeClosed, ArrowLeft } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import userAPI from "../apis/user.api";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";

const Profile = () => {
  const [pass, setPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [reNewPass, setNewRePass] = useState("");
  const [passwordShowen, setPasswordShowen] = useState(false);
  const [passwordRepeatShowen, setPasswordRepeatShowen] = useState(false);
  const [confirmPasswordShowen, setConfirmPasswordShowen] = useState(false);

  const [userData, setUserData] = useState(null);

  // New states for phone and address inputs
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");

  const navigator = useNavigate();

  useLayoutEffect(() => {
    userAPI.get("/profile").then((res) => {
      if (res.data) {
        setUserData(res.data);
        setPhoneInput(res.data.phone || "");
        setAddressInput(res.data.address || "");
      } else console.log("user data doesnt return");
    });
  }, []);

  // Function to update phone/address immediately
  const updateUserData = async (field, value) => {
    try {
      const res = await userAPI.patch("/addUserData", { [field]: value });
      setUserData(res.data.user);
      toast.success(
        `${field.charAt(0).toUpperCase() + field.slice(1)} updated!`
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile info.");
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-8 bg-gray-100">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-main flex gap-4 justify-center items-center">
          <button>
            <ArrowLeft onClick={() => navigator("/")} />
          </button>
          Account Settings
        </h1>

        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-soft p-6 md:p-8 border border-[#e5e5e5]">
          <h2 className="text-xl font-semibold text-main mb-6">
            Profile Information
          </h2>
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <img
                id="profile-img"
                src={
                  userData
                    ? `http://localhost:5000/uploads/users/${userData.imageUrl}`
                    : "https://placehold.co/128x128/E5E5E5/999999?text=Upload"
                }
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100"
                alt="Profile ALT Picture"
              />
              <label
                htmlFor="profile-upload"
                className="block text-sm text-center text-orange-400 font-medium mt-2 cursor-pointer hover:underline"
              >
                Change Photo
              </label>
              <input
                type="file"
                id="profile-upload"
                onChange={async (e) => {
                  const selectedImage = e.target.files[0];
                  if (!selectedImage) return;

                  const formData = new FormData();
                  formData.append("profile", selectedImage);

                  try {
                    const response = await userAPI.put(
                      "/addUserProfile",
                      formData,
                      {
                        headers: { "Content-Type": "multipart/form-data" },
                      }
                    );
                    if (response.data && response.data.imageUrl) {
                      setUserData((prev) => ({
                        ...prev,
                        imageUrl: response.data.imageUrl,
                      }));
                      toast.success("Profile photo updated!");
                    }
                  } catch (err) {
                    console.error("Upload failed:", err);
                    toast.error("Failed to update profile photo.");
                  }
                }}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Profile Details */}
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="full-name"
                    className="block text-sm font-medium text-sub mb-1 text-gray-400"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="full-name"
                    readOnly
                    value={userData ? userData.name : "default name"}
                    className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-sub mb-1 text-gray-400"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userData ? userData.email : "example@provider.com"}
                    readOnly
                    className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-sub mb-1 text-gray-400"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-3 rounded-md border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-100 transition-all duration-300"
                  onClick={() => updateUserData("phone", phoneInput)}
                >
                  Save
                </button>
              </div>

              {/* Address */}
              <div className="flex items-end gap-2 mt-4">
                <div className="flex-1">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-sub mb-1 text-gray-400"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  className="px-3 py-3 rounded-md border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-100 transition-all duration-300"
                  onClick={() => updateUserData("address", addressInput)}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg shadow-soft p-6 md:p-8 border border-[#e5e5e5]">
          <h2 className="text-xl font-semibold text-main mb-6">
            Change Password
          </h2>
          <form id="password-form" className="space-y-4">
            {/* Current Password */}
            <div className="relative">
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-sub mb-1 text-gray-400"
              >
                Current Password
              </label>
              <input
                type={!passwordShowen ? "password" : "text"}
                id="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-sub text-center"
                onClick={() => setPasswordShowen(!passwordShowen)}
              >
                <Eye
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    !passwordShowen ? "" : "hidden"
                  }`}
                />
                <EyeClosed
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    passwordShowen ? "" : "hidden"
                  }`}
                />
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-sub mb-1 text-gray-400"
              >
                New Password
              </label>
              <input
                type={!passwordRepeatShowen ? "password" : "text"}
                id="new-password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                className="w-full p-3 rounded-md border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-sub"
                onClick={() => setPasswordRepeatShowen(!passwordRepeatShowen)}
              >
                <Eye
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    !passwordRepeatShowen ? "" : "hidden"
                  }`}
                />
                <EyeClosed
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    passwordRepeatShowen ? "" : "hidden"
                  }`}
                />
              </button>
            </div>

            {/* Confirm New Password */}
            <div className="relative">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-sub mb-1 text-gray-400"
              >
                Confirm New Password
              </label>
              <input
                type={!confirmPasswordShowen ? "password" : "text"}
                id="confirm-password"
                value={reNewPass}
                onChange={(e) => setNewRePass(e.target.value)}
                className="w-full p-3 rounded-md form-input border-2 border-solid border-gray-200 transition-shadow focus:border-orange-400 focus:shadow-sm focus:shadow-orange-400 focus:outline-none"
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-sub"
                onClick={() => setConfirmPasswordShowen(!confirmPasswordShowen)}
              >
                <Eye
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    !confirmPasswordShowen ? "" : "hidden"
                  }`}
                />
                <EyeClosed
                  className={`w-5 h-5 icon-eye text-gray-400 ${
                    confirmPasswordShowen ? "" : "hidden"
                  }`}
                />
              </button>
            </div>

            {/* Update Password Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 rounded-md border-2 border-orange-400 text-orange-400 font-semibold hover:bg-orange-100 transition-all duration-300"
                onClick={(e) => {
                  e.preventDefault();
                  if (reNewPass.length < 8 || newPass.length < 8) {
                    toast.error(
                      "Your password Length must be more than 8 characters"
                    );
                    return;
                  }
                  if (reNewPass !== newPass) {
                    toast.error(
                      "New password and confirm new password must match"
                    );
                    return;
                  }
                  userAPI
                    .put("/updatePassword", {
                      password: pass,
                      newPassword: newPass,
                    })
                    .catch(() => {
                      toast.error("Your password may be incorrect...");
                    });
                }}
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Profile;
