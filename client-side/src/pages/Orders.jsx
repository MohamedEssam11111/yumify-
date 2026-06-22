import { useState, useEffect } from "react";
import orderAPI from "../apis/order.api";
import OrderCard from "../components/Order";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import NoOrders from "./NoOrders";
import API_URL from "../config/api";
import userAPI from "../apis/user.api.js";
import CustomerSidebar from "../components/CustomerSidebar";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigator = useNavigate();
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    orderAPI
      .get("/getOrders")
      .then((res) => {
        if (res.data) setOrders(res.data);
        else console.log("orders not returned");
      })
      .catch((err) => console.log(err));
  }, []);
  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res.data))
      .catch(() => setUserData(null));
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-[#0a121b]">
      <CustomerSidebar
        sideBarOpened={sideBarOpened}
        setSideBarOpened={setSideBarOpened}
        userData={userData}
      />
      {sideBarOpened && (
        <div
          onClick={() => setSideBarOpened(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
        />
      )}
      <header className="bg-white/80 dark:bg-[#0d1a26]/70 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
        <h1 className="text-2xl font-logo text-orange-500 flex items-center space-x-4 gap-4">
          <button
            onClick={() => setSideBarOpened(!sideBarOpened)}
            className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1a2a3a]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
          <span className="dark:text-gray-100">Yumify Orders</span>
        </h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigator("/profile")}
            className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200 dark:hover:bg-[#15202b] dark:text-gray-200"
          >
            <img
              src={`${API_URL}/uploads/users/def.svg`}
              alt="Profile"
              className="rounded-full border dark:border-gray-700"
            />
          </button>
        </div>
      </header>

      {orders.length > 0 ? (
        <main className="flex-1  p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        </main>
      ) : (
        <NoOrders />
      )}
    </div>
  );
};

export default Orders;
