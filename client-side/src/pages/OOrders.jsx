import { useState, useEffect } from "react";
import ownerApi from "../apis/client.js";

import OrderCard from "../components/OrderCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SkeletonList from "../components/SkeletonList.jsx";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

// -------------------- START OF DATE INPUT COMPONENT --------------------
const DateInput = ({ value, onChange, className, style, ...props }) => {
  const [displayValue, setDisplayValue] = useState(value || "");

  useEffect(() => {
    setDisplayValue(value || "");
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    // Validate and format date input (YYYY-MM-DD)
    if (inputValue === "") {
      onChange(e);
      return;
    }

    // Remove any non-digit characters except hyphens
    const cleaned = inputValue.replace(/[^\d-]/g, "");

    // Auto-format as user types: YYYY-MM-DD
    let formatted = cleaned;
    if (cleaned.length > 4 && cleaned[4] !== "-") {
      formatted = cleaned.slice(0, 4) + "-" + cleaned.slice(4);
    }
    if (formatted.length > 7 && formatted[7] !== "-") {
      formatted = formatted.slice(0, 7) + "-" + formatted.slice(7);
    }
    // Limit to 10 characters (YYYY-MM-DD)
    formatted = formatted.slice(0, 10);

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateRegex.test(formatted)) {
      // Validate that it's a valid date
      const date = new Date(formatted);
      if (!isNaN(date.getTime())) {
        const syntheticEvent = {
          ...e,
          target: { ...e.target, value: formatted },
        };
        onChange(syntheticEvent);
        setDisplayValue(formatted);
        return;
      }
    }

    setDisplayValue(formatted);
  };

  const handleBlur = (e) => {
    // On blur, ensure the value is in correct format or clear it
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (displayValue && !dateRegex.test(displayValue)) {
      setDisplayValue("");
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: "" },
      };
      onChange(syntheticEvent);
    } else if (displayValue) {
      // Ensure value matches display
      const syntheticEvent = {
        ...e,
        target: { ...e.target, value: displayValue },
      };
      onChange(syntheticEvent);
    }
  };

  return (
    <input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="YYYY-MM-DD"
      pattern="\d{4}-\d{2}-\d{2}"
      className={className}
      style={style}
      lang="en-US"
      dir="ltr"
      maxLength={10}
      {...props}
    />
  );
};
// -------------------- END OF DATE INPUT COMPONENT --------------------

/**
 * Orders Page
 * Displays all orders with filters and status management
 */
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [restaurantId, setRestaurantId] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(6);
  const [total, setTotal] = useState(0);

  // Filter options
  const filters = [
    { value: "all", label: "All" },
    { value: "pending", label: "Placed" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "on the way", label: "On the way" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getUserData = async () => {
    try {
      const res = await ownerApi.me();
      if (res.restaurant && res.restaurant._id) {
        setRestaurantId(res.restaurant._id);
      } else {
        console.error("No restaurant found for this user");
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const refetch = async () => {
    if (!restaurantId) return; // Don't fetch if we don't have restaurant ID yet

    try {
      setLoading(true);
      
      // Fetch all orders
      const filterParams = {
        ...(search.trim() ? { search: search.trim() } : {}),
      };
      const allOrders = await ownerApi.getOrders(filterParams);

      console.log('All orders:', allOrders);
      console.log('Restaurant ID:', restaurantId);

      // Log first order structure to debug
      if (allOrders.length > 0) {
        console.log('First order structure:', JSON.stringify(allOrders[0], null, 2));
      }

      // The orders are already transformed/flattened by the API
      // They already have restaurantName field, so we can filter directly by it
      // Get user's restaurant data to compare names
      const userData = await ownerApi.me();
      const userRestaurantName = userData.restaurant?.name;

      console.log('User restaurant name:', userRestaurantName);

      // Filter orders that belong to this restaurant
      const restaurantOrders = allOrders.filter((order) => {
        // Check if order has restaurantName field
        if (order.restaurantName) {
          console.log('Comparing:', order.restaurantName, 'with', userRestaurantName);
          return order.restaurantName === userRestaurantName;
        }
        return false;
      });

      console.log('Restaurant orders:', restaurantOrders);

      // Apply filters
      let filteredOrders = restaurantOrders;

      // Status filter
      if (statusFilter !== "all") {
        filteredOrders = filteredOrders.filter((order) => order.status === statusFilter);
      }

      // Date filters
      if (dateFrom) {
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= fromDate;
        });
      }

      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        filteredOrders = filteredOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate <= toDate;
        });
      }

      // Search filter (customer name or order ID)
      if (search.trim()) {
        const searchLower = search.trim().toLowerCase();
        filteredOrders = filteredOrders.filter((order) => {
          const customerName = order.customerName?.toLowerCase() || "";
          const orderId = order.id?.toLowerCase() || "";
          const orderNumber = order.orderNumber?.toLowerCase() || "";
          return customerName.includes(searchLower) || orderId.includes(searchLower) || orderNumber.includes(searchLower);
        });
      }

      console.log('Filtered orders:', filteredOrders);

      // Pagination
      setTotal(filteredOrders.length);
      const start = (page - 1) * pageSize;
      const paged = filteredOrders.slice(start, start + pageSize);
      setOrders(paged);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders when filters or restaurant ID changes
  useEffect(() => {
    if (restaurantId) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, dateFrom, dateTo, page, pageSize, restaurantId]);

  // Real-time refresh on events
  useEffect(() => {
    const unsubscribe = ownerApi.subscribe((event) => {
      if (event.type === "new_order" || event.type === "order_status_changed") {
        refetch();
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search, dateFrom, dateTo, page, pageSize, restaurantId]);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log('handleStatusUpdate called with:', { orderId, newStatus });
      
      // Validate orderId format
      if (!orderId || typeof orderId !== 'string') {
        throw new Error('Invalid order ID: must be a string');
      }
      
      if (!orderId.includes('-')) {
        throw new Error('Invalid order ID format: expected "mainOrderId-subOrderId"');
      }
      
      await ownerApi.updateOrderStatus(orderId, newStatus);
      console.log('Status update successful');
      
      // Local refresh; subscribe will also handle external updates
      refetch();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert(`Failed to update order status: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orders</h1>
        <p className="text-gray-600 mt-1 dark:text-gray-300">Manage and track all orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
          {/* Status Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  statusFilter === opt.value
                    ? "text-white"
                    : "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
                }`}
                style={
                  statusFilter === opt.value ? { backgroundColor: PRIMARY_COLOR } : {}
                }
                aria-label={`Filter orders by ${opt.label}`}
                aria-pressed={statusFilter === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order # or customer name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a]"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>

          {/* Date From */}
          <div lang="en-US" dir="ltr">
            <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">From</label>
            <DateInput
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 w-full dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a]"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>

          {/* Date To */}
          <div lang="en-US" dir="ltr">
            <label className="block text-sm text-gray-700 mb-1 dark:text-gray-300">To</label>
            <DateInput
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 w-full dark:bg-[#071826] dark:text-gray-100 dark:border-[#23303a]"
              style={{ "--tw-ring-color": PRIMARY_COLOR }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <SkeletonList rows={6} />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 text-lg dark:text-gray-300">No orders found</p>
          <p className="text-gray-400 text-sm mt-2 dark:text-gray-400">
            {restaurantId 
              ? "Adjust your filters or date range and try again" 
              : "Loading restaurant data..."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
          <div className="pt-4">
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Orders;