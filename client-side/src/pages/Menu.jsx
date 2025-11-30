import { useState, useEffect, useCallback } from "react";
import ownerApi from "../apis/client.js";
import { 
  Plus, 
  Download, 
  Search, 
  Edit, 
  Trash2, 
  ChevronUp, 
  ChevronDown
} from "lucide-react";
import userAPI from "../apis/user.api.js";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Menu Management Page
 * Allows owners to manage menu items with search, filter, and CRUD operations
 */
const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isManageMode, setIsManageMode] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [userData, setUserData] = useState(null);

  // Fetch user data
  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res?.data || null))
      .catch(() => setUserData(null));
  }, []);

  // Categories
  const categories = [
    "all",
    "Starter",
    "MainDish",
    "Appetizer",
    "Dessert",
    "Drink",
  ];

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const items = await ownerApi.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // // Keyboard shortcut: Ctrl+N to add new item
  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     if ((e.ctrlKey || e.metaKey) && e.key === "n") {
  //       e.preventDefault();
  //       setShowAddModal(true);
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => window.removeEventListener("keydown", handleKeyDown);
  // }, []);

  // Filter and sort menu items
  const filteredAndSortedItems = menuItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "price") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = String(aValue || "").toLowerCase();
        bValue = String(bValue || "").toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Toggle availability
  const handleToggleAvailability = async (itemId, currentStatus) => {
    try {
      await ownerApi.updateMenuItem(itemId, {
        availability: !currentStatus,
      });
      fetchMenuItems();
    } catch (error) {
      console.error("Failed to update availability:", error);
      alert("Failed to update availability");
    }
  };

  // Handle delete
  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }
    try {
      await ownerApi.deleteMenuItem(itemId);
      fetchMenuItems();
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      alert("Failed to delete menu item");
    }
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(filteredAndSortedItems, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `menu-items-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Sort icon component
  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 opacity-30" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Menu Management</h1>
          <p className="text-gray-600 mt-1 dark:text-gray-300">
            the main menu of your restaurant that customers can see and order from.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:border-[#23303a] dark:text-gray-200 dark:hover:bg-zinc-800/60"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            <Plus className="w-4 h-4" />
            Add New Item
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-[#071826] dark:border-[#23303a]">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 dark:text-gray-400/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#0b2632] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1 dark:bg-[#082431]">
            <button
              onClick={() => setIsManageMode(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isManageMode
                  ? "bg-white text-gray-900 shadow-sm dark:bg-[#062227] dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300"
              }`}
            >
              Manage Mode
            </button>
            <button
              onClick={() => setIsManageMode(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isManageMode
                  ? "bg-white text-gray-900 shadow-sm dark:bg-[#062227] dark:text-gray-100"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300"
              }`}
            >
              Preview Mode
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center dark:bg-[#071826] dark:border-[#23303a]">
          <p className="text-gray-500 dark:text-gray-400">Loading menu items...</p>
        </div>
      ) : filteredAndSortedItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center dark:bg-[#071826] dark:border-[#23303a]">
          <p className="text-gray-500 text-lg dark:text-gray-300">No menu items found</p>
          <p className="text-gray-400 text-sm mt-2 dark:text-gray-400/80">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first menu item"}
          </p>
        </div>
      ) : isManageMode ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden dark:bg-[#071826] dark:border-[#23303a]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 dark:bg-[#071826] dark:border-[#23303a]">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("name")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200"
                    >
                      DISH
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("category")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200"
                    >
                      CATEGORY
                      <SortIcon field="category" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort("price")}
                      className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-200"
                    >
                      PRICE
                      <SortIcon field="price" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                    AVAILABILITY
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#23303a]">
                {
                filteredAndSortedItems
                .filter((item) => (String(item.restaurant._id) === String(userData?.restaurant._id)) )
                .map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors dark:hover:bg-[#062227]">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 dark:bg-[#0b2632]">
                          {item.imageUrl ? (
                            <img
                              src={`http://localhost:5000/uploads/foods/${item.imageUrl}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs dark:text-gray-400/80">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-sm text-gray-500 mt-0.5 dark:text-gray-400">
                            {item.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full dark:bg-[#082431] dark:text-gray-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleToggleAvailability(item._id, item.availability)
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          item.availability
                            ? ""
                            : "bg-gray-200"
                        }`}
                        style={
                          item.availability
                            ? { backgroundColor: PRIMARY_COLOR }
                            : {}
                        }
                        aria-label={`Toggle availability for ${item.name}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            item.availability ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-zinc-800/60"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-300 dark:hover:bg-red-900/20"
                          aria-label={`Delete ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Preview Mode - Grid View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedItems
          .filter((item) => String(item.restaurant._id) === String(userData?.restaurant._id) )
          .map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow dark:bg-[#071826] dark:border-[#23303a] dark:hover:shadow-lg"
            >
              <div className="aspect-video bg-gray-200 overflow-hidden dark:bg-[#0b2632]">
                {item.imageUrl ? (
                  <img
                    src={`http://localhost:5000/uploads/foods/${item.imageUrl}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-400/80">
                    No Image
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      item.available
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    } dark:bg-opacity-0`}
                  >
                    {item.available ? "Available" : "Unavailable"}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2 dark:text-gray-400">
                  {item.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
                    ${parseFloat(item.price || 0).toFixed(2)}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full dark:bg-[#082431] dark:text-gray-200">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <MenuModal
          item={editingItem}
          onClose={() => {
            setShowAddModal(false);
            setEditingItem(null);
          }}
          onSave={fetchMenuItems}
          categories={categories.filter((c) => c !== "all")}
        />
      )}
    </div>
  );
};

/**
 * Menu Item Modal Component
 * For adding and editing menu items
 */
const MenuModal = ({ item, onClose, onSave, categories }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: categories[0] || "",
    image: null,
    available: true,
  });
  console.log("MenuModal item",item);
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        category: item.category || categories[0] || "",
        image: item.imageUrl || "",
        available: item.available !== false,
      });
    }
  }, [item, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (item) {
        await ownerApi.updateMenuItem(item._id, formData);
      } else {
        await ownerApi.createMenuItem(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to save menu item:", error);
      alert("Failed to save menu item");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto dark:bg-[#071826] dark:border-[#23303a]">
        <div className="p-6 border-b border-gray-200 dark:border-[#23303a]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#0b2632] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#0b2632] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Price *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#0b2632] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a] dark:placeholder-gray-400"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
              Image 
            </label>
            <div className="relative">
  {/* hidden input */}
  <input
    id="imageUpload"
    type="file"
    className="hidden"
    onChange={(e) =>
      setFormData({ ...formData, image: e.target.files[0] })
    }
  />

  {/* styled button */}
  <label
    htmlFor="imageUpload"
    className={`
      block w-full text-center font-medium cursor-pointer
      px-4 py-2 rounded-lg
      bg-orange-500 text-white
      border-2 border-white
      dark:border-[#0b2632]
      hover:bg-orange-600 transition
    `}
  >
    Upload Image
  </label>
</div>

          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked })
                }
                className="w-4 h-4 rounded"
                style={{ accentColor: PRIMARY_COLOR }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Available</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-[#23303a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors dark:border-[#23303a] dark:text-gray-200 dark:hover:bg-zinc-800/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {item ? "Update" : "Create"} Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Menu;
