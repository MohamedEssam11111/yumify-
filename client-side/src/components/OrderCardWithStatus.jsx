import { useNavigate } from "react-router";
import { useState } from "react";

const OrderCardWithStatus = ({ order, onStatusChange }) => {
  const [status, setStatus] = useState(order.status);
  const navigator = useNavigate();

  const statusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-yellow-500";
      case "cooking": return "text-blue-500";
      case "on the way": return "text-orange-500";
      case "delivered": return "text-green-500";
      case "cancelled": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (onStatusChange) onStatusChange(order._id, newStatus);
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6 w-full max-w-md mx-auto md:max-w-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg ">Order ID: {order._id.slice(0, 8)}...</span>
        <span className={`font-semibold capitalize ${statusColor(status)}`}>
          {status}
        </span>
      </div>

      <div className="text-gray-700 mb-2">
        <span className="font-medium">Ordered At:</span> {formatDate(order.createdAt)}
      </div>

      <div className="text-gray-700 mb-2">
        <span className="font-medium">Delivery Address:</span> {order.deliveryAddress || "Not Provided"}
      </div>

      <div className="text-gray-700 mb-2">
        <span className="font-medium">Total Price:</span> ${order.totalPrice?.toFixed(2)}
      </div>

      <div className="text-gray-700 mb-4">
        <span className="font-medium">Payment Method:</span>{" "}
        {order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1)}
      </div>

      {/* ----- STATUS OPTIONS SECTION ----- */}
      <div className="mb-4">
        <label className="font-medium text-gray-700">Change Status:</label>
        <select
          value={status}
          onChange={handleStatusChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="confirmed">Confirmed</option>
          <option value="cooking">Cooking</option>
          <option value="on the way">On The Way</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <button
        onClick={() => navigator(`/track/${order._id}`)}
        className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold py-3 rounded-lg"
      >
        Track Order
      </button>
    </div>
  );
};

export default OrderCardWithStatus;
