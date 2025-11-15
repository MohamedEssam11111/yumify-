import { useNavigate } from "react-router";

const OrderCard = ({ order }) => {
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
  const navigator = useNavigate();

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-6 mb-6 w-full max-w-md mx-auto md:max-w-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-lg ">Order ID: {order._id.slice(0, 8)}...</span>
        <span className={`font-semibold capitalize ${statusColor(order.status)}`}>{order.status}</span>
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
        <span className="font-medium">Payment Method:</span> {order.paymentMethod?.charAt(0).toUpperCase() + order.paymentMethod?.slice(1)}
      </div>
      <button
        onClick={() => { navigator(`/track/${order._id}`)} }
        className="w-full bg-orange-500 hover:bg-orange-600 transition-colors text-white font-bold py-3 rounded-lg"
      >
        Track Order
      </button>
    </div>
  );
};

export default OrderCard;