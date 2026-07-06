import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import orderAPI from "../apis/order.api";
import userAPI from "../apis/user.api";

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
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const orderData = await orderAPI.get(`/trackOrder/${id}`);
        setOrder(orderData.data);
        console.log("orderData::", orderData.data);
        // Fetch the current restaurant ID from API
        // Adjust the endpoint based on your API structure
        const restaurantData = await userAPI.get("/owner/restaurant"); // or '/owner/restaurant' or similar
        setRestaurantId(restaurantData.data._id || restaurantData.data.id);
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
      pending:
        "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-300",

      confirmed:
        "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300",

      preparing:
        "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",

      ready:
        "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300",

      "on the way":
        "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300",

      completed:
        "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300",

      cancelled:
        "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300",
    };

    return colors[status] || "bg-gray-100 text-gray-700 border border-gray-300";
  };

  // Get status label
  const getStatusLabel = (status) => {
    if (!status) return "Unknown";
    const strStatus = String(status);
    return strStatus
      ?.split("_")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      ?.join(" ");
  };

  // Filter subOrders to only include the current restaurant's suborder
  const restaurantSubOrders =
    order?.subOrders?.filter((sub) => sub.restaurant._id === restaurantId) ||
    [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">
          Loading order details...
        </div>
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
            order.overallStatus,
          )}`}
        >
          {getStatusLabel(order.overallStatus)}
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
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customer Name
              </p>

              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.customer?.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Phone Number
              </p>

              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.delivery?.phone || "Not Provided"}
              </p>
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
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Order Date
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Order Type
              </p>
              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.paymentMethod
                  ?.replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}{" "}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Delivery Address
              </p>

              <p className="font-medium text-gray-900 dark:text-gray-100">
                {order.delivery?.address || "Not Provided"}
              </p>
            </div>

            {order.delivery?.note && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Delivery Note
                </p>

                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {order.delivery.note}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Items
          </h2>
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
                {restaurantSubOrders?.map((sub, subIndex) =>
                  sub.items
                    ?.filter((item) => item != null)
                    .map((item, index) => {
                      // Handle both item.food and item.foodItem structures
                      const foodItem = item.food || item.foodItem || item;

                      // Skip if foodItem is null or doesn't have a name
                      if (!foodItem || !foodItem.name) {
                        console.warn("Invalid food item:", item);
                        return null;
                      }

                      const foodName = foodItem.name;
                      const foodPrice = Number(foodItem.price || 0);
                      const itemQuantity = item.quantity || 1;

                      return (
                        <tr
                          key={`${subIndex}-${index}`}
                          className="bg-white dark:bg-transparent"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {foodName}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            <p>{foodName}</p>

                            {item.request && (
                              <p className="text-xs text-orange-500 mt-1">
                                Request: {item.request}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-center text-gray-700 dark:text-gray-300">
                            {itemQuantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700 dark:text-gray-300">
                            ${foodPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                            ${(foodPrice * itemQuantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    }),
                )}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-[#08232d]">
                <tr>
                  <td
                    colSpan="3"
                    className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100"
                  >
                    Total
                  </td>
                  <td
                    className="px-4 py-3 text-right font-bold text-lg"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    $
                    {restaurantSubOrders
                      .reduce((total, sub) => total + (sub.subtotal || 0), 0)
                      .toFixed(2)}
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
