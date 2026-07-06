import { Link, useNavigate } from "react-router";

const OrderCard = ({ order }) => {
  const navigator = useNavigate();

  const statusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-gray-500";

      case "confirmed":
        return "text-yellow-500";

      case "preparing":
        return "text-blue-500";

      case "ready":
        return "text-indigo-500";

      case "on the way":
        return "text-orange-500";

      case "completed":
      case "delivered":
        return "text-green-500";

      case "cancelled":
        return "text-red-500";

      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);

    return (
      date.toLocaleDateString() +
      " • " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  return (
    <div
      className="
      bg-white dark:bg-[#0d1a26]
      shadow-md dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]
      rounded-xl p-6 mb-6 w-full max-w-md mx-auto md:max-w-lg
      border border-white dark:border-gray-700
    "
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-200">
          Order #{order._id.slice(0, 8)}
        </span>

        <span
          className={`font-semibold capitalize ${statusColor(order.overallStatus)}`}
        >
          {order.overallStatus}
        </span>
      </div>

      {/* Date */}
      <div className="mb-2 text-gray-700 dark:text-gray-300">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Ordered At:
        </span>{" "}
        {formatDate(order.createdAt)}
      </div>

      {/* Delivery Address */}
      <div className="mb-2 text-gray-700 dark:text-gray-300">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Delivery Address:
        </span>{" "}
        {order.delivery?.address || "Not Provided"}
      </div>

      {/* Phone */}
      <div className="mb-2 text-gray-700 dark:text-gray-300">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Phone Number:
        </span>{" "}
        {order.delivery?.phone || "Not Provided"}
      </div>

      {/* Delivery Note */}
      {order.delivery?.note && (
        <div className="mb-2 text-gray-700 dark:text-gray-300">
          <span className="font-medium text-gray-900 dark:text-gray-100">
            Delivery Note:
          </span>{" "}
          {order.delivery.note}
        </div>
      )}

      {/* Payment Method */}
      <div className="mb-2 text-gray-700 dark:text-gray-300">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Payment Method:
        </span>{" "}
        {order.paymentMethod
          ?.replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase())}
      </div>

      {/* Total */}
      <div className="mb-4 text-gray-700 dark:text-gray-300">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          Total Price:
        </span>{" "}
        ${Number(order.totalPrice || 0).toFixed(2)}
      </div>

      {/* Buttons */}
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
            transition-colors mt-3 text-white font-bold py-3 rounded-lg
          "
        >
          View Invoice
        </button>
      </Link>
    </div>
  );
};
export default OrderCard;
