import { useState, useEffect, useMemo } from "react";
import ownerApi from "../apis/client.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Inventory Page
 * Manages restaurant inventory items
 */
const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal and form state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // 'create' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    status: "in_stock",
    supplier: "",
    lowStockThreshold: 0,
  });
  const [errors, setErrors] = useState({});

  // Toast
  const [toast, setToast] = useState({ open: false, message: "" });

  // Filters (optional simple status filter)
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const items = await ownerApi.getInventory();
      setInventory(items);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = useMemo(() => {
    if (statusFilter === "all") return inventory;
    return inventory.filter((i) => i.status === statusFilter );
  }, [inventory, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      in_stock: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      low_stock: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      out_of_stock: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200";
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setForm({ name: "", category: "", quantity: 0, unit: "", status: "in_stock", supplier: "", lowStockThreshold: 0 });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setModalMode("edit");
    setEditingId(item.id);
    setForm({
      name: item.name || "",
      category: item.category || "",
      quantity: item.quantity ?? 0,
      unit: item.unit || "",
      status: item.status || "in_stock",
      supplier: item.supplier || "",
      lowStockThreshold: item.lowStockThreshold ?? 0,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.category.trim()) e.category = "Category is required";
    if (form.quantity === "" || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = "Quantity must be 0 or more";
    if (!form.unit.trim()) e.unit = "Unit is required";
    const validStatuses = ["in_stock", "low_stock", "out_of_stock"];
    if (!validStatuses.includes(form.status)) e.status = "Invalid status";
    if (form.lowStockThreshold === "" || isNaN(Number(form.lowStockThreshold)) || Number(form.lowStockThreshold) < 0) e.lowStockThreshold = "Low-stock threshold must be 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (modalMode === "create") {
        await ownerApi.createItem({
          name: form.name.trim(),
          category: form.category.trim(),
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          status: form.status,
          supplier: form.supplier.trim(),
          lowStockThreshold: Number(form.lowStockThreshold),
        });
        setToast({ open: true, message: "Item created" });
      } else {
        await ownerApi.updateItem(editingId, {
          name: form.name.trim(),
          category: form.category.trim(),
          quantity: Number(form.quantity),
          unit: form.unit.trim(),
          status: form.status,
          supplier: form.supplier.trim(),
          lowStockThreshold: Number(form.lowStockThreshold),
        });
        setToast({ open: true, message: "Item updated" });
      }
      setModalOpen(false);
      await fetchInventory();
    } catch (error) {
      console.error("Save failed:", error);
      setToast({ open: true, message: "Failed to save item" });
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;
    try {
      await ownerApi.deleteItem(id);
      setToast({ open: true, message: "Item deleted" });
      await fetchInventory();
    } catch (error) {
      console.error("Delete failed:", error);
      setToast({ open: true, message: "Failed to delete item" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading inventory...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Inventory</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your restaurant inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a]"
          >
            <option value="all">All</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          
        </div>
      </div>

      {/* Inventory List */}
      {filteredInventory.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-lg">No inventory items</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-[#071826]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Category
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supplier
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#23303a]">
            {
              filteredInventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-[#0d2230]">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.category}</td>
                  <td className="px-6 py-4 text-sm text-center text-gray-700 dark:text-gray-300">
                    {item.quantity} {item.unit}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{item.supplier}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    {/* <button
                      className="text-gray-600 hover:text-gray-900 mr-4 dark:text-gray-200 dark:hover:text-white"
                      style={{ color: PRIMARY_COLOR }}
                      onClick={() => openEdit(item)}
                    >
                      Edit
                    </button> */}
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={modalMode === "create" ? "Add Inventory Item" : "Edit Inventory Item"}
        onClose={() => setModalOpen(false)}
        actions={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 dark:border-[#2b3a42] dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Save
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.category ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
              />
              {errors.category && <p className="text-sm text-red-600 mt-1">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Supplier</label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a]"
                style={{ "--tw-ring-color": PRIMARY_COLOR }}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.quantity ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
              />
              {errors.quantity && <p className="text-sm text-red-600 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unit</label>
              <input
                type="text"
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.unit ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
              />
              {errors.unit && <p className="text-sm text-red-600 mt-1">{errors.unit}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm((f) => ({ ...f, lowStockThreshold: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.lowStockThreshold ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
              />
              {errors.lowStockThreshold && <p className="text-sm text-red-600 mt-1">{errors.lowStockThreshold}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? "border-red-300 focus:ring-red-500" : "border-gray-300 dark:border-[#23303a]"} bg-white text-gray-900 dark:bg-[#071826] dark:text-gray-100`}
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
            {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
          </div>
        </form>
      </Modal>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: "" })} />
    </div>
  );
};

export default Inventory;
