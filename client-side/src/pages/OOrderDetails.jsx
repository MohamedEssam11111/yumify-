import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import orderAPI from "../apis/order.api";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * OrderDetails Page
 * Shows detailed information about a specific order
 */
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderAPI.get(`/trackOrder/${id}`);
        // if API returns res.data, ensure you pass res.data from your API wrapper
        setOrder(orderData);
      } catch (error) {
        console.error("Failed to fetch order:", error);
        alert("Order not found");
        navigate("/owner/orders");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color - Professional colors consistent with orange theme
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
      preparing: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
      ready: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
      out_for_delivery: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
      completed: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700",
      cancelled: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
    };
    return colors[status] || "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700";
  };

  // Get status label
  const getStatusLabel = (status) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-300">Order not found</p>
        <button
          onClick={() => navigate("/owner/orders")}
          className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: PRIMARY_COLOR }}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate("/owner/orders")}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-2 flex items-center gap-2"
          >
            ← Back to Orders
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Order {order.orderNumber}
          </h1>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Order Information */}
      <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-6 space-y-6 text-gray-800 dark:text-gray-100">
        {/* Customer Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Customer Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Customer Name</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{order.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Phone</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{order.customerPhone}</p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Order Date</p>
              <p className="font-medium text-gray-900 dark:text-gray-100">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Order Type</p>
              <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{order.orderType}</p>
            </div>
            {order.orderType === "delivery" && order.address && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">Delivery Address</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{order.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Items</h2>
          <div className="border border-gray-200 dark:border-[#23303a] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-[#08232d]">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                    Item
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 dark:text-gray-200">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 dark:text-gray-200">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-[#1f2f36]">
                {order.items.map((item, index) => (
                  <tr key={index} className="bg-white dark:bg-transparent">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                      ${Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-[#08232d]">
                <tr>
                  <td colSpan="3" className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    Total
                  </td>
                  <td
                    className="px-4 py-3 text-right font-bold text-lg"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    ${Number(order.total).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
