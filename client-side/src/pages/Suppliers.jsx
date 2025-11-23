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
      setSuppliers(suppliersList);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    return "⭐".repeat(fullStars) + (hasHalfStar ? "½" : "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading suppliers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600 mt-1">Manage your supplier relationships</p>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">No suppliers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((supplier) => (
            <div
              key={supplier.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {supplier.name}
                </h3>
                <span className="text-sm text-gray-600">
                  {renderStars(supplier.rating)} {supplier.rating}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p>
                  <span className="font-medium">Contact:</span> {supplier.contactPerson}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {supplier.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span> {supplier.phone}
                </p>
                <p>
                  <span className="font-medium">Address:</span> {supplier.address}
                </p>
              </div>
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-700 mb-1">Items Supplied:</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.itemsSupplied.map((item, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="w-full px-4 py-2 rounded-lg font-medium text-sm text-white"
                style={{ backgroundColor: PRIMARY_COLOR }}
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

