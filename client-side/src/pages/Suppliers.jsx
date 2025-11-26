import { useState, useEffect } from "react";
import ownerApi from "../apis/client.js";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Suppliers Page
 * Manages supplier relationships
 */
const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const suppliersList = await ownerApi.getSuppliers();
      setSuppliers(suppliersList || []);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    return "⭐".repeat(fullStars) + (hasHalfStar ? "½" : "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Suppliers</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Manage your supplier relationships</p>
        </div>
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm text-white"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          + Add Supplier
        </button>
      </div>

      {/* Suppliers List */}
      {suppliers.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No suppliers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {supplier.name}
                </h3>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {renderStars(supplier.rating)} {supplier.rating}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Contact:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{supplier.contactPerson}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Email:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{supplier.email}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Phone:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{supplier.phone}</span>
                </p>
                <p>
                  <span className="font-medium text-gray-800 dark:text-gray-100">Address:</span>{" "}
                  <span className="text-gray-600 dark:text-gray-300">{supplier.address}</span>
                </p>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 dark:text-gray-200 mb-1">Items Supplied:</p>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(supplier.itemsSupplied) && supplier.itemsSupplied.length > 0 ? (
                    supplier.itemsSupplied.map((item, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-[#0b2632] text-gray-700 dark:text-gray-200 text-xs rounded border border-transparent dark:border-[#18303a]"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="px-2 py-1 bg-gray-50 dark:bg-transparent text-gray-500 dark:text-gray-400 text-xs rounded">
                      No items listed
                    </span>
                  )}
                </div>
              </div>

              <button
                className="w-full px-4 py-2 rounded-lg font-medium text-sm text-white transition-shadow"
                style={{
                  backgroundColor: PRIMARY_COLOR,
                  boxShadow: "0 6px 18px rgba(255,122,24,0.18)",
                }}
              >
                Send Request
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Suppliers;
