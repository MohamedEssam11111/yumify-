import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ownerApi from "../apis/client.js";
import userAPI from "../apis/user.api.js";
import OrderCard from "../components/OrderCard.jsx";
import Sparkline from "../components/Sparkline.jsx";
import BarChart from "../components/BarChart.jsx";
import AreaChart from "../components/AreaChart.jsx";
import DonutChart from "../components/DonutChart.jsx";

import { 
  Home, ShoppingCart, Bell, Users, Settings, LogOut, Menu, ChevronLeft, ChevronRight, MessageCircle, Truck,
  ScrollText, ShoppingBag, Star, MessageSquare, Smile, Clock, TrendingUp, DollarSign
} from "lucide-react"; 

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Dashboard Page
 * Shows overview statistics and recent orders
 */
const ODashboard = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // First get user to find restaurant ID
        const user = await ownerApi.me();
        console.log('user from ODashboard:', user);
        
        if (!user.restaurant || !user.restaurant._id) {
          throw new Error("User does not have a restaurant");
        }

        const restaurantId = user.restaurant._id;
        
        // Fetch dashboard data from new endpoint
        const response = await userAPI.get(`/dashboard/${restaurantId}`);
        console.log('Dashboard data:', response.data);
        
        if (response.data.success) {
          setDashboardData(response.data.data);
        }

        // Fetch inventory separately (if needed)
        try {
          const inventoryData = await ownerApi.getInventory();
          setInventory(inventoryData);
          
          // Calculate low stock
          const low = (inventoryData || [])
            .filter((i) => i.status === "low_stock" || i.status === "out_of_stock")
            .sort((a, b) => (a.status === "out_of_stock" ? -1 : 1))
            .slice(0, 5);
          setLowStock(low);
        } catch (err) {
          console.log('Inventory fetch failed:', err);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle order status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ownerApi.updateOrderStatus(orderId, newStatus);
      
      // Refresh dashboard data
      const user = await ownerApi.getUser();
      const restaurantId = user.restaurant._id;
      const response = await userAPI.get(`/dashboard/${restaurantId}`);
      
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading dashboard...</div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">No dashboard data available</div>
      </div>
    );
  }

  const { statistics, charts, topItems, recentOrders, recentReviews } = dashboardData;
  const renderStars = (rating) => "⭐".repeat(Math.max(0, Math.min(5, rating || 0)));

  return (
    <div className="space-y-6 text-gray-900 dark:text-gray-100">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Overview of your restaurant</p>
      </div>

      {/* KPI Cards - Enhanced with icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Rating */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
            <Star className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Avg. Rating</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.reviews.averageRating} / 5
            </p>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-[rgba(59,130,246,0.08)] flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.reviews.total}
            </p>
          </div>
        </div>

        {/* Positive Percentage */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.06)] flex-shrink-0">
            <Smile className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Positive %</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.reviews.positivePercentage}%
            </p>
          </div>
        </div>

        {/* Latest Review */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-[rgba(148,163,184,0.06)] flex-shrink-0">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Latest Review</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {statistics.reviews.latestReviewTime || "No reviews"}
            </p>
          </div>
        </div>
      </div>

      {/* Additional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl flex-shrink-0" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
            <ShoppingCart className="w-6 h-6" style={{ color: PRIMARY_COLOR }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Orders Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.ordersToday}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-[rgba(245,158,11,0.06)] flex-shrink-0">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.pendingOrders}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.06)] flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Revenue (Today)</p>
            <p className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>
              ${statistics.revenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Trend - Area Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Average Revenue Trend (Weekly)
          </h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <AreaChart
                data={charts.weeklyRevenue}
                labels={charts.weeklyLabels}
                width={500}
                height={280}
                stroke={PRIMARY_COLOR}
                fill="rgba(255,122,24,0.15)"
                gridColor={
                  typeof window !== "undefined"
                    ? document.documentElement.classList.contains("dark")
                      ? "#0b1a26"
                      : "#e5e7eb"
                    : "#e5e7eb"
                }
              />
            </div>
          </div>
        </div>

        {/* Order Status Distribution - Donut Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Order Status Distribution
          </h3>
          <div className="flex items-center justify-center mt-2">
            <DonutChart
              data={charts.orderStatusDistribution}
              colors={[PRIMARY_COLOR, "#3b82f6", "#10b981", "#f59e0b", "#ef4444"]}
              width={300}
              height={240}
              thickness={18}
            />
          </div>
        </div>
      </div>

      {/* Additional Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Hour - Sparkline */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Orders (Last 12 Hours)
          </h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <Sparkline data={charts.ordersByHour} width={500} height={120} />
            </div>
          </div>
        </div>

        {/* Revenue by Day - Bar Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Revenue (Last 7 Days)
          </h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <BarChart
                data={charts.revenueByDay}
                labels={charts.revenueLabels}
                height={160}
                color={PRIMARY_COLOR}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-50 dark:bg-[rgba(6,182,212,0.06)] flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Avg Order Value (Today)
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${statistics.avgOrderValue.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">Staff Status</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-[rgba(139,92,246,0.06)]">
                <Users size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">On Duty</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {statistics.staff.onDuty}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-[rgba(16,185,129,0.06)]">
                <Users size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                  {statistics.staff.active}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-[rgba(139,92,246,0.06)] flex-shrink-0">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Staff
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {statistics.staff.total}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Low Stock</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">All good – no low stock</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-100">{i.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      i.status === "out_of_stock"
                        ? "bg-red-100 text-red-700 dark:bg-[rgba(239,68,68,0.12)] dark:text-red-300"
                        : "bg-yellow-100 text-yellow-800 dark:bg-[rgba(245,158,11,0.08)] dark:text-yellow-300"
                    }`}
                  >
                    {i.status.replace("_", " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Top Items</h3>
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No items yet</p>
          ) : (
            <ul className="space-y-2">
              {topItems.map((it, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-100">{it.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">× {it.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Ratings</h3>
          {recentReviews.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No recent feedback</p>
          ) : (
            <ul className="space-y-2">
              {recentReviews.map((review) => (
                <li key={review._id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {review.user?.name || "Anonymous"}
                    </span>
                    <span className="text-yellow-500">{renderStars(review.rating)}</span>
                  </div>
                  {review.comment && (
                    <p className="text-gray-600 dark:text-gray-400 truncate">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-right">
            <Link
              to="/owner/feedback"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
          <Link
            to="/owner/orders"
            className="text-sm font-medium hover:underline"
            style={{ color: PRIMARY_COLOR }}
          >
            View All →
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No recent orders</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentOrders.slice(0, 3).map((order) => (
              <OrderCard
                key={order._id}
                order={{
                  id: order._id,
                  customer: order.customer,
                  items: order.items,
                  total: order.subtotal,
                  status: order.status,
                  createdAt: order.createdAt,
                }}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ODashboard;