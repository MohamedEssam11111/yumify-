import { useNavigate } from "react-router-dom";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * OrderCard Component
 * Presentational component for displaying order information
 * 
 * @param {Object} order - Order object
 * @param {Function} onStatusUpdate - Callback when status is updated
 */
const OrderCard = ({ order, onStatusUpdate }) => {
  const navigate = useNavigate();

  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status color - Professional colors consistent with orange theme
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      confirmed: "bg-blue-50 text-blue-700 border border-blue-200",
      preparing: "bg-orange-50 text-orange-700 border border-orange-200",
      ready: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      "on the way": "bg-cyan-50 text-cyan-700 border border-cyan-200",
      delivered: "bg-slate-100 text-slate-700 border border-slate-200",
      cancelled: "bg-rose-50 text-rose-700 border border-rose-200",
    };
    return colors[status] || "bg-slate-100 text-slate-700 border border-slate-200";
  };

  // Get status label
  const getStatusLabel = (status) => {
    // Handle "on the way" status
    if (status === "on the way") return "On The Way";
    
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get action buttons based on status - Professional colors consistent with theme
  const getActionButtons = () => {
    const buttons = [];

    switch (order.status) {
      case "pending":
        buttons.push({
          label: "Confirm Order",
          status: "confirmed",
          color: `text-white hover:opacity-90`,
          style: { backgroundColor: PRIMARY_COLOR },
        });
        buttons.push({
          label: "Cancel",
          status: "cancelled",
          color: "bg-rose-500 hover:bg-rose-600 text-white",
        });
        break;
      case "confirmed":
        buttons.push({
          label: "Start Preparing",
          status: "preparing",
          color: `text-white hover:opacity-90`,
          style: { backgroundColor: PRIMARY_COLOR },
        });
        break;
      case "preparing":
        buttons.push({
          label: "Mark Ready",
          status: "ready",
          color: "bg-emerald-500 hover:bg-emerald-600 text-white",
        });
        break;
      case "ready":
        buttons.push({
          label: "Out for Delivery",
          status: "on the way",
          color: "bg-cyan-500 hover:bg-cyan-600 text-white",
        });
        break;
      case "on the way":
        buttons.push({
          label: "Mark Delivered",
          status: "delivered",
          color: "bg-slate-500 hover:bg-slate-600 text-white",
        });
        break;
      default:
        // No action buttons for delivered or cancelled orders
        break;
    }

    return buttons;
  };

  const actionButtons = getActionButtons();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{order.orderNumber}</h3>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">{order.customerName}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg" style={{ color: PRIMARY_COLOR }}>
            ${order.total.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-3 text-sm text-gray-600 dark:text-gray-300">
        <p>
          <span className="font-medium">Type:</span> {order.orderType}
        </p>
        {order.orderType === "delivery" && order.deliveryAddress && (
          <p className="mt-1">
            <span className="font-medium">Address:</span> {order.deliveryAddress}
          </p>
        )}
        <p className="mt-1">
          <span className="font-medium">Items:</span> {order.items.length} item
          {order.items.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Action Buttons */}
      {actionButtons.length > 0 && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {actionButtons.map((button) => (
            <button
              key={button.status}
              onClick={() => {
                console.log('OrderCard button clicked:', { orderId: order.id, status: button.status });
                onStatusUpdate(order.id, button.status);
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${button.color}`}
              style={button.style || {}}
              aria-label={`Update order to ${button.label}`}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={() => navigate(`/owner/orders/${order.mainOrderId || order.id}`)}
        className="w-full mt-2 px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
        aria-label={`View details for order ${order.orderNumber}`}
      >
        View Details
      </button>
    </div>
  );
};

export default OrderCard;