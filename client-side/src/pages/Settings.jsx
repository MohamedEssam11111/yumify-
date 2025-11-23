import { useEffect, useState } from "react";
import userAPI from "../apis/user.api";


// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Settings Page
 * Restaurant owner settings and preferences
 */
const Settings = () => {
  const [owner, setOwner] = useState(null);
  async function fetchOwnerData() {
    userAPI.get('/profile').then((res) => {
      if (res.data) setOwner(res.data);
      else console.log("user data doesnt return");
    }).catch((err) => console.log(err));
  }

  useEffect(() => {
    fetchOwnerData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your restaurant settings</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Assem will do this page ISA !!! 
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Owner Name
              </label>
              <input
                type="text"
                defaultValue={owner?.name || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={owner?.email || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
            <button
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Save Changes
            </button>
          </div> 
        </div>

         {/* Restaurant Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Restaurant Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                defaultValue={owner?.restaurant?.name || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <textarea
                rows={3}
                defaultValue={owner?.restaurant?.address || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <input
                type="tel"
                defaultValue={owner?.restaurant?.phone || ""}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
            <button
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Coming Soon Notice 
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Additional settings features coming soon!
          </p>
        </div>
        */}
      </div>
    </div>
  );
};

export default Settings;

