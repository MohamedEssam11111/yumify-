import { Link, useNavigate } from "react-router";

const OrderCard = ({ order }) => {
  const statusColor = (status) => {
    switch (status) {
      case "confirmed": return "text-yellow-500";
      case "cooking": return "text-blue-500";
      case "on the way": return "text-orange-500";
      case "delivered": return "text-green-500";
      case "cancelled": return "text-red-500";
      default: return "text-gray-500 dark:text-gray-400";
    }
  };

  const navigator = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="
      bg-white dark:bg-[#0d1a26] 
      shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]
      rounded-xl p-6 mb-6 w-full max-w-md mx-auto md:max-w-lg
      border border-white dark:border-gray-700
    ">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
          Order ID: {order._id.slice(0, 8)}...
        </span>

        <span className={`font-semibold capitalize ${statusColor(order.overallStatus)}`}>
          {order.overallStatus}
        </span>
      </div>

      <div className="text-gray-700 dark:text-gray-300 mb-2">
        <span className="font-medium text-gray-900 dark:text-gray-200">Ordered At:</span>{" "}
        {formatDate(order.createdAt)}
      </div>

      <div className="text-gray-700 dark:text-gray-300 mb-2">
        <span className="font-medium text-gray-900 dark:text-gray-200">Delivery Address:</span>{" "}
        {order.deliveryAddress || "Not Provided"}
      </div>

      <div className="text-gray-700 dark:text-gray-300 mb-2">
        <span className="font-medium text-gray-900 dark:text-gray-200">Total Price:</span>{" "}
        ${(order.totalPrice?.toFixed(2) * 1.05).toFixed(2)}
      </div>

      <div className="text-gray-700 dark:text-gray-300 mb-4">
        <span className="font-medium text-gray-900 dark:text-gray-200">Payment Method:</span>{" "}
        {order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1)}
      </div>

      <button
        onClick={() => navigator(`/track/${order._id}`)}
        className="
          w-full bg-orange-500 hover:bg-orange-600
          transition-colors text-white font-bold py-3 rounded-lg
        "
      >
        Track Order
      </button>

      <Link to={`/invoice/${order._id}`}>
        <button
          className="
            w-full bg-orange-500 hover:bg-orange-600
            transition-colors mt-2 text-white font-bold py-3 rounded-lg
          "
        >
          Review order's Invoice
        </button>
      </Link>
    </div>
  );
};

export default OrderCard;
