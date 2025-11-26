import { useState, useEffect, useMemo } from "react";
import userAPI from "../apis/user.api";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

// Helper: map notification type to an icon
const getTypeIcon = (type) => {
  const map = {
    order: "📦",
    inventory: "📋",
    feedback: "💬",
    system: "⚙️",
  };
  return map[type] || "🔔";
};

/**
 * Notifications Page
 * Displays all notifications and allows marking as read
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all"); // all | order | inventory | feedback | system
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  // Selection
  const [selected, setSelected] = useState({}); // id -> true

  // Incremental loading
  const [visibleCount, setVisibleCount] = useState(10);
  const PAGE_STEP = 10;

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await userAPI.get("/getNotification").then((res) => res.data).catch((err)=>{console.log(err)});
      setNotifications(Array.isArray(notifs) ? notifs : []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    let list = notifications;
    if (typeFilter !== "all") list = list.filter((n) => n.type === typeFilter);
    if (showUnreadOnly) list = list.filter((n) => !n.read);
    return list;
  }, [notifications, typeFilter, showUnreadOnly]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const handleMarkRead = async (id) => {
    try {
      await userAPI.patch('markAsRead',{id});
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userAPI.patch('/markAllAsRead'); 
      setSelected({});
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleMarkSelected = async () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    try {
      for (const id of ids) {
        await userAPI.patch('markAsRead',{id});
      }
      setSelected({});
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark selected as read:", error);
    }
  };

  const toggleSelect = (id) => {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  };

  const unreadCount = Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}` : "All notifications read"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-lg font-medium text-sm text-white"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={handleMarkSelected}
            className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 dark:border-[#25313a] dark:text-gray-200 dark:bg-transparent"
            disabled={Object.keys(selected).filter((id) => selected[id]).length === 0}
          >
            Mark Selected Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-4 flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "order", label: "Orders" },
            { value: "inventory", label: "Inventory" },
            { value: "feedback", label: "Feedback" },
            { value: "system", label: "System" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTypeFilter(opt.value);
                setVisibleCount(PAGE_STEP);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                typeFilter === opt.value
                  ? "text-white"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/50 dark:text-gray-200 dark:hover:bg-slate-800"
              }`}
              style={typeFilter === opt.value ? { backgroundColor: PRIMARY_COLOR } : {}}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 ml-auto text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => { setShowUnreadOnly(e.target.checked); setVisibleCount(PAGE_STEP); }}
            className="w-4 h-4 rounded accent-orange-500 dark:accent-orange-400"
          />
          Unread only
        </label>
      </div>

      {/* Notifications List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-lg">No notifications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification) => (
            <div
              key={notification.id}
              className={`rounded-lg shadow-sm border p-4 ${!notification.read ? "border-l-4" : "border"} bg-white dark:bg-[#071826]`}
              style={!notification.read ? { borderLeftColor: PRIMARY_COLOR, borderColor: "transparent" } : { borderColor: undefined }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <input
                    type="checkbox"
                    className="mt-1 w-4 h-4 accent-orange-500 dark:accent-orange-400"
                    checked={!!selected[notification.id]}
                    onChange={() => toggleSelect(notification.id)}
                    aria-label="Select notification"
                  />
                  <span className="text-2xl mt-1">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{notification.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => handleMarkRead(notification.id)}
                    className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-[#2b3a42] dark:text-gray-200 dark:hover:bg-[#0d2a33]"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}

          {visible.length < filtered.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_STEP)}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 dark:border-[#23303a] dark:text-gray-200"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
