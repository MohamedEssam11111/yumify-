import { useState, useEffect } from "react";
import ownerApi from "../apis/client.js";
import Modal from "../components/Modal.jsx";
import Toast from "../components/Toast.jsx";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Staff Page
 * Manages restaurant staff members
 */
const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // add | edit
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "waiter",
    position: "",
    shift: "morning",
    status: "active",
    salary: "",
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ open: false, message: "" });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const staffMembers = await ownerApi.getStaff();
      setStaff(staffMembers);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      on_leave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      inactive: "bg-gray-100 text-gray-800 dark:bg-white/5 dark:text-gray-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const openAdd = () => {
    setModalMode("add");
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", role: "waiter", position: "", shift: "morning", status: "active", salary: "" });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (member) => {
    setModalMode("edit");
    setEditingId(member._id);
    setForm({
      name: member.name || "",
      email: member.email || "",
      phone: member.phone || "",
      role: member.role || "waiter",
      position: member.position || "",
      shift: member.shift || "morning",
      status: member.status || "active",
      salary: member.salary ?? "",
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.position.trim()) e.position = "Position is required";
    const validRoles = ["chef", "waiter", "delivery", "manager"];
    if (!validRoles.includes(form.role)) e.role = "Invalid role";
    const validShifts = ["morning", "evening", "full_day", "flexible"];
    if (!validShifts.includes(form.shift)) e.shift = "Invalid shift";
    const validStatuses = ["active", "on_leave", "inactive"];
    if (!validStatuses.includes(form.status)) e.status = "Invalid status";
    if (form.salary !== "" && (isNaN(Number(form.salary)) || Number(form.salary) < 0)) e.salary = "Salary must be 0 or more";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (modalMode === "add") {
        await ownerApi.addStaff({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          position: form.position.trim(),
          shift: form.shift,
          status: form.status,
          salary: form.salary === "" ? undefined : Number(form.salary),
        });
        setToast({ open: true, message: "Staff added" });
      } else {
        await ownerApi.updateStaff(editingId, {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role,
          position: form.position.trim(),
          shift: form.shift,
          status: form.status,
          salary: form.salary === "" ? undefined : Number(form.salary),
        });
        setToast({ open: true, message: "Staff updated" });
      }
      setModalOpen(false);
      await fetchStaff();
    } catch (error) {
      console.error("Save failed:", error);
      setToast({ open: true, message: "Failed to save staff" });
    }
  };

  const handleRemove = async (id) => {
    const confirmed = window.confirm("Remove this staff member?");
    if (!confirmed) return;
    try {
      await ownerApi.deleteStaff(id);
      setToast({ open: true, message: "Staff removed" });
      await fetchStaff();
    } catch (error) {
      console.error("Remove failed:", error);
      setToast({ open: true, message: "Failed to remove staff" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading staff...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Staff</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your restaurant staff</p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg font-medium text-sm text-white shadow-sm"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          + Add Staff
        </button>
      </div>

      {/* Staff List */}
      {staff.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-lg">No staff members</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div
              key={member._id}
              className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {member.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{member.position}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    member.status
                  )}`}
                >
                  {getStatusLabel(member.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Email:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{member.email}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Phone:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{member.phone}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Role:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{member.role}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Shift:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{member.shift}</span>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[#1f2a30] flex gap-2">
                <button
                  onClick={() => openEdit(member)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-[#2b3a42] dark:text-gray-200 dark:hover:bg-[#0d2a33]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemove(member._id)}
                  className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800/40 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        title={modalMode === "add" ? "Add Staff" : "Edit Staff"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              />
              {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              />
              {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.phone ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              />
              {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Position</label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.position ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              />
              {errors.position && <p className="text-sm text-red-600 mt-1">{errors.position}</p>}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.role ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              >
                <option value="chef">Chef</option>
                <option value="waiter">Waiter</option>
                <option value="delivery">Delivery</option>
                <option value="manager">Manager</option>
              </select>
              {errors.role && <p className="text-sm text-red-600 mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Shift</label>
              <select
                value={form.shift}
                onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.shift ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="full_day">Full Day</option>
                <option value="flexible">Flexible</option>
              </select>
              {errors.shift && <p className="text-sm text-red-600 mt-1">{errors.shift}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.status ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
              >
                <option value="active">Active</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Salary (optional)</label>
            <input
              type="number"
              min="0"
              value={form.salary}
              onChange={(e) => setForm((f) => ({ ...f, salary: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.salary ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-orange-300"} bg-white dark:bg-[#071826] text-gray-900 dark:text-gray-100 dark:border-[#23303a]`}
            />
            {errors.salary && <p className="text-sm text-red-600 mt-1">{errors.salary}</p>}
          </div>
        </form>
      </Modal>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: "" })} />
    </div>
  );
};

export default Staff;
