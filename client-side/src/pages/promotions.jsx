import { useEffect, useState } from "react";
import { Percent, Trash2, Plus, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import promoAPI from "../apis/promotion.api";

const Promotion = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    minOrder: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);

      const res = await promoAPI.get("/");

      setPromos(res.data || []);
    } catch (error) {
      toast.error("Failed to fetch promotions");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      const res = await promoAPI.post("/", formData);

      setPromos((prev) => [res.data, ...prev]);

      toast.success("Promotion created successfully");

      setFormData({
        code: "",
        type: "percentage",
        value: "",
        minOrder: "",
        expiresAt: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create promotion",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await promoAPI.delete(`/${id}`);

      setPromos((prev) => prev.filter((promo) => promo._id !== id));

      toast.success("Promotion deleted");
    } catch (error) {
      toast.error("Failed to delete promotion");
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await promoAPI.patch(`/${id}/toggle`);

      setPromos((prev) =>
        prev.map((promo) => (promo._id === id ? res.data.promo : promo)),
      );

      toast.success("Promotion updated");
    } catch (error) {
      toast.error("Failed to update promotion");
    }
  };

  const activePromos = promos.filter((promo) => promo.active).length;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <Percent className="text-orange-500" size={32} />
        <h1 className="text-3xl font-bold">Promotions</h1>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-[#071826] rounded-xl p-6 shadow">
          <p className="text-gray-500">Total Coupons</p>
          <h2 className="text-3xl font-bold mt-2">{promos.length}</h2>
        </div>

        <div className="bg-white dark:bg-[#071826] rounded-xl p-6 shadow">
          <p className="text-gray-500">Active Coupons</p>
          <h2 className="text-3xl font-bold text-green-500 mt-2">
            {activePromos}
          </h2>
        </div>

        <div className="bg-white dark:bg-[#071826] rounded-xl p-6 shadow">
          <p className="text-gray-500">Expired / Disabled</p>
          <h2 className="text-3xl font-bold text-red-500 mt-2">
            {promos.length - activePromos}
          </h2>
        </div>
      </div>

      {/* Create Form */}

      <div className="bg-white dark:bg-[#071826] rounded-xl p-6 shadow mb-8">
        <h2 className="text-xl font-bold mb-6">Create Promotion</h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            name="code"
            placeholder="Coupon Code"
            value={formData.code}
            onChange={handleChange}
            className="border rounded-lg p-3 dark:bg-[#0b1220]"
            required
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border rounded-lg p-3 dark:bg-[#0b1220]"
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed Amount</option>
          </select>

          <input
            type="number"
            name="value"
            placeholder="Discount Value"
            value={formData.value}
            onChange={handleChange}
            className="border rounded-lg p-3 dark:bg-[#0b1220]"
            required
          />

          <input
            type="number"
            name="minOrder"
            placeholder="Minimum Order"
            value={formData.minOrder}
            onChange={handleChange}
            className="border rounded-lg p-3 dark:bg-[#0b1220]"
          />

          <input
            type="date"
            name="expiresAt"
            value={formData.expiresAt}
            onChange={handleChange}
            className="border rounded-lg p-3 dark:bg-[#0b1220]"
          />

          <button
            disabled={creating}
            className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-3 flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {creating ? "Creating..." : "Create Promotion"}
          </button>
        </form>
      </div>

      {/* Table */}

      <div className="bg-white dark:bg-[#071826] rounded-xl p-6 shadow overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-3">Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10">
                  Loading...
                </td>
              </tr>
            ) : promos.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10">
                  No promotions found
                </td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo._id} className="border-b">
                  <td className="py-4 font-bold">{promo.code}</td>

                  <td>{promo.type}</td>

                  <td>{promo.value}</td>

                  <td>${promo.minOrder}</td>

                  <td>
                    <button
                      onClick={() => handleToggle(promo._id)}
                      className={`px-3 py-1 rounded-full text-white ${
                        promo.active ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {promo.active ? "Active" : "Disabled"}
                    </button>
                  </td>

                  <td>
                    {promo.expiresAt
                      ? new Date(promo.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>

                  <td>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="text-red-500"
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Promotion;
