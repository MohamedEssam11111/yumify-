import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import ownerApi from "../apis/client.js";
import Toast from "../components/Toast.jsx";
import { 
  Home, ShoppingCart, Bell, Users, Settings, LogOut, Menu, X,
  MessageCircle, ScrollText, Utensils, PanelLeftClose, PanelLeftOpen
} from "lucide-react"; 

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * OwnerSidebar Component
 * Modern responsive sidebar navigation for owner portal
 */
const OwnerSidebar = ({ isOpen, onClose, unreadCount, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await ownerApi.logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Navigate anyway since token is cleared
      navigate("/owner/login");
    }
  };

  const navLinks = [
    { path: "/owner/dashboard", label: "Dashboard", icon: <Home size={20}/> },
    { path: "/owner/menu", label: "Menu", icon: <Utensils size={20} /> },
    { path: "/owner/orders", label: "Orders", icon: <ShoppingCart size={20}/> },
    {
      path: "/owner/notifications",
      label: "Notifications",
      icon: <Bell size={20}/>,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { path: "/owner/inventory", label: "Inventory", icon: <ScrollText size={20} /> },
    { path: "/owner/staff", label: "Staff", icon: <Users size={20}/> },
    { path: "/owner/feedback", label: "Feedback", icon: <MessageCircle size={20} /> },
    { path: "/owner/settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm transition-opacity dark:bg-black/60"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full ${collapsed ? "w-20" : "w-72"}
           bg-gray-50 dark:bg-gray-900 shadow-md hover:shadow-xl transform transition-all duration-300 ease-in-out z-50 lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        aria-label="Main navigation"
        aria-expanded={!collapsed}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header with Collapse Button */}
          <div className={`relative p-6 border-b border-gray-200/60  dark:border-gray-100/5 bg-white/50 dark:bg-transparent ${collapsed ? "px-4" : "px-6"}  backdrop-blur-sm`}>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 dark:text-gray-300 dark:hover:bg-zinc-800"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            
            <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
              <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
                <div className="p-2 rounded-xl" style={{ backgroundColor: `${PRIMARY_COLOR}15` }}>
                  <h1 className={`font-bold ${collapsed ? "text-xl" : "text-2xl"}`} style={{ color: PRIMARY_COLOR }}>
                    {collapsed ? "Y" : "Yumify"}
                  </h1>
                </div>
              </div>
              
              {/* Desktop Collapse Button */}
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-gray-900"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? (
                  <PanelLeftOpen size={15} className="transition-transform" />
                ) : (
                  <PanelLeftClose size={15} className="transition-transform" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto py-6 px-3 bg-white dark:bg-[#071826]" aria-label="Navigation menu">
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive
                        ? "text-white font-semibold shadow-lg shadow-orange-500/20"
                        : "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800/60 dark:hover:text-gray-100"}`
                    }
                    style={({ isActive }) =>
                      isActive 
                        ? { 
                            backgroundColor: PRIMARY_COLOR,
                            transform: "translateX(4px)"
                          } 
                        : {}
                    }
                    aria-current="page"
                    title={collapsed ? link.label : undefined}
                  >
                    <span className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
                      <span 
                        className="transition-transform duration-200 group-hover:scale-110 group-[.active]:scale-110"
                        aria-hidden="true"
                      >
                        {link.icon}
                      </span>
                      {!collapsed && (
                        <span className="font-medium">{link.label}</span>
                      )}
                    </span>
                    {!collapsed && link.badge && (
                      <span
                        className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center animate-pulse"
                        aria-label={`${link.badge} unread notifications`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200/60 dark:border-[#15202b] bg-white/30 backdrop-blur-sm dark:bg-transparent">
            <button
              onClick={handleLogout}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 transition-all duration-200 font-medium ${collapsed ? "justify-center" : ""}`}
              aria-label="Logout"
              title={collapsed ? "Logout" : undefined}
            >
              <span className="text-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">
                <LogOut size={20} />
              </span>
              {!collapsed && <span className="dark:text-gray-100">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * OwnerTopbar Component
 * Modern top navigation bar with app name and profile
 */
const OwnerTopbar = ({ onMenuClick, owner, collapsed }) => {
  // Get owner's initials for avatar
  const getInitials = (name) => {
    if (!name) return "O";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header
      className="bg-white/80 dark:bg-[#071826] backdrop-blur-md shadow-sm dark:shadow-none border-b border-gray-200/60 dark:border-[#15202b] z-30 sticky top-0"
      role="banner"
    >
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-200 text-gray-700 dark:text-gray-200 hover:text-gray-900"
          aria-label="Toggle menu"
          aria-expanded="false"
        >
          <Menu size={22} />
        </button>

        {/* App/Restaurant Name */}
        <div className="flex-1 lg:flex-none lg:ml-0 ml-4">
          <h2 className="text-xl font-bold lg:text-2xl bg-gradient-to-r" style={{ 
            background: `linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #ff9d4d 100%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            {owner?.restaurant?.name || owner?.name || "Yumify"}
          </h2>
        </div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg transition-transform duration-200 hover:scale-110 cursor-pointer"
            style={{ 
              backgroundColor: PRIMARY_COLOR,
              boxShadow: `0 4px 14px 0 ${PRIMARY_COLOR}40`
            }}
            aria-label={`Profile for ${owner?.name || "Owner"}`}
            title={owner?.name || "Owner"}
          >
            {getInitials(owner?.name)}
          </div>
        </div>
      </div>
    </header>
  );
};

/**
 * DevToolsPanel Component
 * Development tools (only visible in non-production)
 */
const DevToolsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  const handleSimulateOrder = async () => {
    try {
      await ownerApi.simulateNewOrder();
      alert("New order simulated!");
    } catch (error) {
      console.error("Failed to simulate order:", error);
      alert("Failed to simulate order");
    }
  };

  const handleSimulateNotification = async () => {
    try {
      await ownerApi.simulateNewNotification();
      alert("New notification simulated!");
    } catch (error) {
      console.error("Failed to simulate notification:", error);
      alert("Failed to simulate notification");
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem("ownerToken");
    alert("ownerToken cleared! Please refresh the page.");
    window.location.reload();
  };

  return (
    <div className="fixed bottom-20 right-2 z-50 transform scale-75" aria-label="Development tools">
      {isOpen ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-xl p-4 border border-gray-200 dark:border-[#15202b] min-w-[200px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Dev Tools</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-300 hover:text-gray-700" aria-label="Close dev tools">✕</button>
          </div>
          <div className="space-y-2">
            <button onClick={handleSimulateOrder} className="w-full px-3 py-2 text-xs bg-blue-100 dark:bg-[rgba(59,130,246,0.08)] text-blue-700 dark:text-blue-200 rounded hover:bg-blue-200 transition-colors" aria-label="Simulate new order">Simulate Order</button>
            <button onClick={handleSimulateNotification} className="w-full px-3 py-2 text-xs bg-green-100 dark:bg-[rgba(16,185,129,0.06)] text-green-700 dark:text-green-200 rounded hover:bg-green-200 transition-colors" aria-label="Simulate new notification">Simulate Notification</button>
            <button onClick={handleClearToken} className="w-full px-3 py-2 text-xs bg-red-100 dark:bg-[rgba(239,68,68,0.06)] text-red-700 dark:text-red-200 rounded hover:bg-red-200 transition-colors" aria-label="Clear authentication token">Clear ownerToken</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Open dev tools" title="Development Tools">🔧</button>
      )}
    </div>
  );
};

/**
 * OwnerLayout Component
 * Main layout wrapper for owner portal pages
 * Includes sidebar, topbar, and dev tools
 */
const OwnerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState({ open: false, message: "" });
  const [collapsed, setCollapsed] = useState(false);
  const [owner, setOwner] = useState(null);

  // Fetch owner profile on mount
  useEffect(() => {
    const fetchOwnerProfile = async () => {
      try {
        const data = await ownerApi.me();
        setOwner(data.owner);
      } catch (error) {
        console.error("Failed to fetch owner profile:", error);
      }
    };

    fetchOwnerProfile();
  }, []);

  // Fetch unread notifications count and subscribe to events
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const notifications = await ownerApi.getNotifications();
        const unread = notifications.filter((n) => !n.read && !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to events
    const unsubscribe = ownerApi.subscribe((event) => {
      if (event.type === "new_notification") {
        setUnreadCount((prev) => prev + 1);
        setToast({ open: true, message: "New notification received" });
      }
      if (event.type === "new_order") {
        setToast({ open: true, message: `New order received!` });
      }
      if (event.type === "order_updated") {
        setToast({ open: true, message: `Order updated` });
      }
    });

    const interval = setInterval(fetchUnreadCount, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleCollapse = () => {
    setCollapsed((c) => !c);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071826] text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <OwnerSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        unreadCount={unreadCount}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />

      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        {/* Topbar */}
        <OwnerTopbar onMenuClick={toggleSidebar} owner={owner} collapsed={collapsed} />

        {/* Page Content */}
        <main className="p-4 lg:p-6" role="main">
          <Outlet />
        </main>
      </div>

      {/* Toast */}
      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: "" })} />

      {/* Dev Tools Panel */}
      <DevToolsPanel />
    </div>
  );
};

export default OwnerLayout;
