import { useState, useEffect, useMemo } from "react";
import notificationAPI from "../apis/notification.api";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

// Helper: map notification type to an icon
const getTypeIcon = (type) => {
  const map = {
    booking: "🔔",
    order: "📦",
    review: "⭐",
    system: "⚙️",
  };
  return map[type] || "✉️";
};

/**
 * Notifications Page
 * Displays all notifications and allows marking as read
 */
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState("all"); // all | order | booking | review | system
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
      const response = await notificationAPI.get("/");

      setNotifications(Array.isArray(response.data) ? response.data : []);
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
    if (showUnreadOnly) list = list.filter((n) => !n.isRead);
    return list;
  }, [notifications, typeFilter, showUnreadOnly]);

  const visible = useMemo(
    () => filtered.slice(0, visibleCount),
    [filtered, visibleCount],
  );

  const handleMarkRead = async (id) => {
    try {
      await notificationAPI.patch(`/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.patch("/read-all");
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
        await notificationAPI.patch(`/${id}/read`);
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

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.isRead).length
    : 0;

  const handleDeleteNotification = async (id) => {
    try {
      await notificationAPI.delete(`/${id}`);
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.delete("/clear-all");
      setSelected({});
      fetchNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300 font-medium">
          Loading notifications...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Adapts from stacked list to inline row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "All notifications read"}
          </p>
        </div>
        {/* Responsive wrapping action buttons group */}
        <div className="flex flex-wrap items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-lg font-medium text-sm text-white flex-1 sm:flex-none text-center whitespace-nowrap transition-colors hover:brightness-110"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              Mark All Read
            </button>
          )}
          <button
            onClick={handleMarkSelected}
            className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 dark:border-[#25313a] dark:text-gray-200 dark:bg-transparent flex-1 sm:flex-none text-center transition-colors hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              Object.keys(selected).filter((id) => selected[id]).length === 0
            }
          >
            Mark Selected Read
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 text-sm font-medium flex-1 sm:flex-none text-center transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filters - Wrapping filter list and unread control */}
      <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { value: "all", label: "All" },
            { value: "booking", label: "Booking" },
            { value: "order", label: "Orders" },
            { value: "review", label: "Review" },
            { value: "system", label: "System" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setTypeFilter(opt.value);
                setVisibleCount(PAGE_STEP);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex-grow sm:flex-grow-0 text-center transition-all ${
                typeFilter === opt.value
                  ? "text-white shadow-sm"
                  : "text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800/50 dark:text-gray-200 dark:hover:bg-slate-800"
              }`}
              style={
                typeFilter === opt.value
                  ? { backgroundColor: PRIMARY_COLOR }
                  : {}
              }
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none shrink-0">
          <input
            type="checkbox"
            checked={showUnreadOnly}
            onChange={(e) => {
              setShowUnreadOnly(e.target.checked);
              setVisibleCount(PAGE_STEP);
            }}
            className="w-4 h-4 rounded accent-orange-500 dark:accent-orange-400"
          />
          Unread only
        </label>
      </div>

      {/* Notifications List - Adaptive row cards */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-lg">
            No notifications
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-lg shadow-sm border p-4 transition-all ${!notification.isRead ? "border-l-4" : "border"} bg-white dark:bg-[#071826]`}
              style={
                !notification.isRead
                  ? {
                      borderLeftColor: PRIMARY_COLOR,
                      borderColor: "transparent",
                    }
                  : { borderColor: undefined }
              }
            >
              {/* Dynamic layout: Flex-column on tiny displays, row on larger ones */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    className="mt-1.5 w-4 h-4 shrink-0 accent-orange-500 dark:accent-orange-400 cursor-pointer"
                    checked={!!selected[notification._id]}
                    onChange={() => toggleSelect(notification._id)}
                    aria-label="Select notification"
                  />
                  <span
                    className="text-2xl mt-0.5 shrink-0 select-none"
                    role="img"
                    aria-hidden="true"
                  >
                    {getTypeIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base break-words">
                      {notification.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm break-words leading-relaxed">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Inline operational buttons group */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-start w-full sm:w-auto justify-end">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkRead(notification._id)}
                      className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-[#2b3a42] dark:text-gray-200 dark:hover:bg-[#0d2a33] transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteNotification(notification._id)}
                    className="px-3 py-1 text-xs font-medium rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Load More Trigger */}
          {visible.length < filtered.length && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount((c) => c + PAGE_STEP)}
                className="px-4 py-2 rounded-lg font-medium text-sm border border-gray-300 text-gray-700 dark:border-[#23303a] dark:text-gray-200 w-full sm:w-auto transition-colors hover:bg-gray-50 dark:hover:bg-slate-800"
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
