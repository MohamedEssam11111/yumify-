import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ownerApi from "../apis/client.js";
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    pendingOrders: 0,
    revenue: 0,
  });

  const [ordersByHour, setOrdersByHour] = useState([]); // 12 points
  const [revenueByDay, setRevenueByDay] = useState([]); // 7 points
  const [revenueLabels, setRevenueLabels] = useState([]); // 7 labels
  const [topItems, setTopItems] = useState([]); // top 5
  const [weeklyRevenue, setWeeklyRevenue] = useState([]); // 5 weeks
  const [weeklyLabels, setWeeklyLabels] = useState([]); // 5 week labels
  const [orderStatusDistribution, setOrderStatusDistribution] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [positivePercentage, setPositivePercentage] = useState(0);
  const [latestReviewTime, setLatestReviewTime] = useState("");

  // New blocks state
  const [avgOrderValue, setAvgOrderValue] = useState(0);
  const [typeCounts, setTypeCounts] = useState({ delivery: 0, pickup: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [staffOnDuty, setStaffOnDuty] = useState(0);
  const [recentFeedback, setRecentFeedback] = useState([]);

  // Fetch orders and calculate stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [allOrders, inventory, staff, feedback] = await Promise.all([
          ownerApi.getOrders(),
          ownerApi.getInventory().catch(() => []),
          ownerApi.getStaff().catch(() => []),
          ownerApi.getFeedback().catch(() => []),
        ]);

        // Calculate today's date range
        const now = new Date();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Filter orders from today
        const ordersToday = allOrders.filter((order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= today && orderDate < tomorrow;
        });

        // Calculate stats
        const pendingOrders = allOrders.filter((o) => o.status === "pending").length;
        const revenue = ordersToday
          .filter((o) => o.status === "completed")
          .reduce((sum, o) => sum + o.total, 0);
        setStats({ ordersToday: ordersToday.length, pendingOrders, revenue });

        // Avg Order Value (today)
        const aov = ordersToday.length ? ordersToday.reduce((s, o) => s + o.total, 0) / ordersToday.length : 0;
        setAvgOrderValue(Number(aov.toFixed(2)));

        // Orders by type (today)
        const delivery = ordersToday.filter((o) => o.orderType === "delivery").length;
        const pickup = ordersToday.filter((o) => o.orderType === "pickup").length;
        setTypeCounts({ delivery, pickup });

        // Low stock preview (top 5 low_stock/out_of_stock)
        const low = (inventory || [])
          .filter((i) => i.status === "low_stock" || i.status === "out_of_stock")
          .sort((a, b) => (a.status === "out_of_stock" ? -1 : 1))
          .slice(0, 5);
        setLowStock(low);

        // Staff on duty (rough)
        const hour = now.getHours();
        const onDuty = (staff || []).filter((s) => {
          if (s.status !== "active") return false;
          if (s.shift === "full_day" || s.shift === "flexible") return true;
          if (s.shift === "morning") return hour >= 6 && hour < 15;
          if (s.shift === "evening") return hour >= 15 && hour < 24;
          return false;
        }).length;
        setStaffOnDuty(onDuty);

        // Recent feedback (latest 5)
        const latestFeedback = (feedback || []).slice(0, 3);
        setRecentFeedback(latestFeedback);

        // Recent orders (top 3)
        const recentOrders = allOrders
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);
        setOrders(recentOrders);

        // Orders by hour (sparkline - 12 values)
        const byHour = Array.from({ length: 24 }, () => 0);
        ordersToday.forEach((o) => {
          const h = new Date(o.createdAt).getHours();
          byHour[h] += 1;
        });
        const last12 = [];
        for (let i = 11; i >= 0; i--) {
          const h = (now.getHours() - i + 24) % 24;
          last12.push(byHour[h]);
        }
        setOrdersByHour(last12);

        // Revenue by day (last 7 days)
        const byDay = Array.from({ length: 7 }, () => 0);
        const labels = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          d.setHours(0, 0, 0, 0);
          const next = new Date(d);
          next.setDate(d.getDate() + 1);
          const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          labels.push(label);
          const dayRevenue = allOrders
            .filter((o) => {
              const t = new Date(o.createdAt);
              return t >= d && t < next && o.status === "completed";
            })
            .reduce((s, o) => s + o.total, 0);
          byDay[6 - i] = Math.round(dayRevenue);
        }
        setRevenueByDay(byDay);
        setRevenueLabels(labels);

        // Top items (by quantity)
        const itemCount = new Map();
        allOrders.slice(0, 300).forEach((o) => {
          (o.items || []).forEach((it) => {
            itemCount.set(it.name, (itemCount.get(it.name) || 0) + (it.quantity || 1));
          });
        });
        const top = Array.from(itemCount.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, qty]) => ({ name, qty }));
        setTopItems(top);

        // Weekly revenue trend (last 5 weeks)
        const weeklyData = [];
        const weeklyLabelsData = [];
        for (let i = 4; i >= 0; i--) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i * 7));
          weekStart.setHours(0, 0, 0, 0);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 7);
          
          const weekNumber = Math.ceil((weekStart - new Date(weekStart.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
          weeklyLabelsData.push(`Wk ${weekNumber}`);
          
          const weekRevenue = allOrders
            .filter((o) => {
              const t = new Date(o.createdAt);
              return t >= weekStart && t < weekEnd && o.status === "completed";
            })
            .reduce((s, o) => s + o.total, 0);
          weeklyData.push(Math.round(weekRevenue));
        }
        setWeeklyRevenue(weeklyData);
        setWeeklyLabels(weeklyLabelsData);

        // Order status distribution
        const statusCounts = {
          pending: 0,
          preparing: 0,
          ready: 0,
          out_for_delivery: 0,
          completed: 0,
          cancelled: 0,
        };
        allOrders.forEach((o) => {
          if (statusCounts[o.status] !== undefined) {
            statusCounts[o.status]++;
          }
        });
        const statusData = [
          { label: "Completed", value: statusCounts.completed },
          { label: "Preparing", value: statusCounts.preparing },
          { label: "Ready", value: statusCounts.ready },
          { label: "Pending", value: statusCounts.pending },
          { label: "Cancelled", value: statusCounts.cancelled },
        ].filter((s) => s.value > 0);
        setOrderStatusDistribution(statusData);

        // Feedback stats
        const allFeedback = feedback || [];
        setTotalReviews(allFeedback.length);
        if (allFeedback.length > 0) {
          const ratings = allFeedback.map((f) => f.rating || 0);
          const avg = ratings.reduce((s, r) => s + r, 0) / ratings.length;
          setAvgRating(Number(avg.toFixed(1)));
          
          const positive = ratings.filter((r) => r >= 4).length;
          setPositivePercentage(Number(((positive / ratings.length) * 100).toFixed(1)));
          
          // Latest review time
          const latest = allFeedback.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          if (latest) {
            const timeDiff = Date.now() - new Date(latest.createdAt).getTime();
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            if (hours > 0) {
              setLatestReviewTime(`${hours} hour${hours > 1 ? "s" : ""} ago`);
            } else if (minutes > 0) {
              setLatestReviewTime(`${minutes} minute${minutes > 1 ? "s" : ""} ago`);
            } else {
              setLatestReviewTime("Just now");
            }
          }
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
      // Refresh data (lightweight): recent orders + stats
      const allOrders = await ownerApi.getOrders();
      const recentOrders = allOrders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setOrders(recentOrders);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const ordersToday = allOrders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= today && orderDate < tomorrow;
      });

      const pendingOrders = allOrders.filter((order) => order.status === "pending").length;
      const revenue = ordersToday
        .filter((order) => order.status === "completed")
        .reduce((sum, order) => sum + order.total, 0);

      setStats({ ordersToday: ordersToday.length, pendingOrders, revenue });
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
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{avgRating} / 5</p>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-[rgba(59,130,246,0.08)] flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReviews}</p>
          </div>
        </div>

        {/* Positive Percentage */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.06)] flex-shrink-0">
            <Smile className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Positive %</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{positivePercentage}%</p>
          </div>
        </div>

        {/* Latest Review */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gray-100 dark:bg-[rgba(148,163,184,0.06)] flex-shrink-0">
            <Clock className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Latest Review</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{latestReviewTime || "No reviews"}</p>
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
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.ordersToday}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-[rgba(245,158,11,0.06)] flex-shrink-0">
            <Bell className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Pending Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-[rgba(16,185,129,0.06)] flex-shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Revenue (Today)</p>
            <p className="text-2xl font-bold" style={{ color: PRIMARY_COLOR }}>${stats.revenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Charts Row - Professional Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Revenue Trend - Area Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Average Revenue Trend (Weekly)</h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <AreaChart
                data={weeklyRevenue}
                labels={weeklyLabels}
                width={500}
                height={280}
                stroke={PRIMARY_COLOR}
                fill="rgba(255,122,24,0.15)"
                gridColor={typeof window !== 'undefined' ? (document.documentElement.classList.contains('dark') ? '#0b1a26' : '#e5e7eb') : '#e5e7eb'}
              />
            </div>
          </div>
        </div>

        {/* Order Status Distribution - Donut Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Order Status Distribution</h3>
          <div className="flex items-center justify-center mt-2">
            <DonutChart
              data={orderStatusDistribution}
              colors={[
                PRIMARY_COLOR,
                "#3b82f6",
                "#10b981",
                "#f59e0b",
                "#ef4444",
              ]}
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Orders (Last 12 Hours)</h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <Sparkline data={ordersByHour} width={500} height={120} />
            </div>
          </div>
        </div>

        {/* Revenue by Day - Bar Chart */}
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Revenue (Last 7 Days)</h3>
          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[500px]">
              <BarChart data={revenueByDay} labels={revenueLabels} height={160} color={PRIMARY_COLOR} />
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
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Avg Order Value (Today)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">${avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-4">Order Type (Today)</p>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                <Truck size={18} style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Delivery</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{typeCounts.delivery}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                <ShoppingBag size={18} style={{ color: PRIMARY_COLOR }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Pickup</p>
                <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{typeCounts.pickup}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-[rgba(139,92,246,0.06)] flex-shrink-0">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Staff On Duty (Now)</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{staffOnDuty}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Low Stock</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">All good — no low stock</p>
          ) : (
            <ul className="space-y-2">
              {lowStock.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-100">{i.name}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${i.status === "out_of_stock" ? "bg-red-100 text-red-700 dark:bg-[rgba(239,68,68,0.12)] dark:text-red-300" : "bg-yellow-100 text-yellow-800 dark:bg-[rgba(245,158,11,0.08)] dark:text-yellow-300"}`}>{i.status.replace("_", " ")}</span>
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
              {topItems.map((it) => (
                <li key={it.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-800 dark:text-gray-100">{it.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">× {it.qty}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Recent Ratings</h3>
          {recentFeedback.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No recent feedback</p>
          ) : (
            <ul className="space-y-2">
              {recentFeedback.map((fb) => (
                <li key={fb.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800 dark:text-gray-100">{fb.customerName}</span>
                    <span className="text-yellow-500">{renderStars(fb.rating)}</span>
                  </div>
                  {fb.comment && (
                    <p className="text-gray-600 dark:text-gray-400 truncate">{fb.comment}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(fb.createdAt).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-right">
            <Link to="/owner/feedback" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">View all</Link>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-[#071826] rounded-xl shadow-sm dark:shadow-md border border-gray-200 dark:border-[#15202b] p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Orders</h2>
          <Link to="/owner/orders" className="text-sm font-medium hover:underline" style={{ color: PRIMARY_COLOR }}>
            View All →
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400"><p>No recent orders</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ODashboard;
