import { useState, useEffect } from "react";

import orderAPI from "../apis/order.api";
import OrderCard from "../components/Order";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const navigator = useNavigate();

  useEffect(() => {
    orderAPI.get("/getOrders")
      .then((res) => {
        if (res.data) setOrders(res.data);
        else console.log("orders not returned");
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-2xl font-logo text-orange-500 flex items-center space-x-4 gap-4">
          <Link to="/" className="flex items-center">
            <ArrowLeft />
          </Link>
          Yumify Orders
        </h1>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigator("/profile")} className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200">
            <img 
              src={`http://localhost:5000/uploads/users/def.svg`} 
              alt="Profile" 
              className="rounded-full"
            />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))
          ) : (
            <p className="text-center w-full col-span-full text-gray-500">
              Loading orders...
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Orders;
