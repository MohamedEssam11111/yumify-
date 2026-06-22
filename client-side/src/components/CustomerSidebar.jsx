import { Link, useNavigate, useLocation } from "react-router";
import {
  Menu,
  ReceiptTextIcon,
  Heart,
  LogOut,
  CalendarCheck,
  Settings,
} from "lucide-react";

import userAPI from "../apis/user.api";
import ThemeToggleBtn from "./ThemeToggleBtn";

const CustomerSidebar = ({ sideBarOpened, setSideBarOpened, userData }) => {
  const navigator = useNavigate();
  const location = useLocation();

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path;

    return `
      flex items-center gap-3 p-3 rounded-xl transition-all duration-200
      ${
        isActive
          ? "bg-orange-100 dark:bg-orange-900/30 text-orange-500 font-semibold pointer-events-none cursor-default"
          : "text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 hover:translate-x-1"
      }
    `;
  };

  return (
    <aside
      id="sidebar"
      className={`fixed inset-y-0 left-0 w-72 bg-white dark:bg-gray-900 shadow-2xl z-50 p-6 flex flex-col transform ${
        !sideBarOpened ? "-translate-x-full" : "translate-x-0"
      } transition-transform duration-300 ease-in-out border-r border-gray-100 dark:border-gray-800`}
    >
      {/* Logo */}
      <div>
        <h2 className="font-logo text-4xl text-orange-500 mb-2">Yumify</h2>

        {userData && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            Welcome back,{" "}
            <span className="font-semibold text-orange-500">
              {userData.name}
            </span>
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <Link
          to="/"
          onClick={() => setSideBarOpened(false)}
          className={getNavLinkClass("/")}
        >
          <Menu className="size-5" />
          <span>Menu</span>
        </Link>

        <Link
          to="/myOrders"
          onClick={() => setSideBarOpened(false)}
          className={getNavLinkClass("/myOrders")}
        >
          <ReceiptTextIcon className="size-5" />
          <span>My Orders</span>
        </Link>

        <Link
          to="/customer/booking"
          onClick={() => setSideBarOpened(false)}
          className={getNavLinkClass("/customer/booking")}
        >
          <CalendarCheck className="size-5" />
          <span>Reservation</span>
        </Link>

        <Link
          to="/favorites"
          onClick={() => setSideBarOpened(false)}
          className={getNavLinkClass("/favorites")}
        >
          <Heart className="size-5" />
          <span>Favorites</span>
        </Link>

        <Link
          to="/customer/settings"
          onClick={() => setSideBarOpened(false)}
          className={getNavLinkClass("/customer/settings")}
        >
          <Settings className="size-5" />
          <span>Settings</span>
        </Link>

        {/* Theme */}
        <div className="mt-2">
          <ThemeToggleBtn />
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-800">
          {userData ? (
            <button
              onClick={() => {
                userAPI.post("/logout").then(() => {
                  setSideBarOpened(false);
                  navigator("/login");
                });
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all duration-200 hover:translate-x-1"
            >
              <LogOut className="size-5" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              onClick={() => setSideBarOpened(false)}
              className="flex items-center gap-3 p-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 transition-all duration-200 hover:translate-x-1"
            >
              <LogOut className="size-5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default CustomerSidebar;
