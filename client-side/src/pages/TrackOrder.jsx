import React, { useState, useEffect } from "react";
import { Check, ChefHat, Truck, PackageCheck, Phone } from "lucide-react";
import userAPI from "../apis/user.api"; // تأكد إن الباث صح
import { useParams } from "react-router";
import SplashScreen from "./SplashScreen";
import toast from "react-hot-toast";

export default function OrderTracking() {
  const orderId = useParams().orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI
      .get(`/trackOrder/${orderId}`)
      .then((res) => {
        setOrder(res.data);

        // ضبط الـ orderStatus حسب الـ API
        setOrderStatus({
          confirmed: res.data.status === "confirmed" || res.data.status === "cooking" || res.data.status === "on the way" || res.data.status === "delivered",
          cooking: res.data.status === "cooking" || res.data.status === "on the way" || res.data.status === "delivered",
          onTheWay: res.data.status === "on the way" || res.data.status === "delivered",
          delivered: res.data.status === "delivered",
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  const [orderStatus, setOrderStatus] = useState({
    confirmed: false,
    cooking: false,
    onTheWay: false,
    delivered: false,
  });

  const getProgressWidth = () => {
    if (orderStatus.delivered) return "100%";
    if (orderStatus.onTheWay) return "70%";
    if (orderStatus.cooking) return "40%";
    if (orderStatus.confirmed) return "10%";
    return "0%";
  };

  const getCurrentStatus = () => {
    if (orderStatus.delivered) return "Delivered!";
    if (orderStatus.onTheWay) return "On the way!";
    if (orderStatus.cooking) return "Cooking!";
    if (orderStatus.confirmed) return "Confirmed!";
    return "";
  };

  const handleConfirmDelivery = () => {
    if (orderStatus.onTheWay && !orderStatus.delivered) {
      setOrderStatus((prev) => ({ ...prev, delivered: true }));
      toast.success("Delivery confirmed! Enjoy your meal!");
      userAPI
        .patch(`/deliveredOrder/${orderId}`)
        .then((res) => {
          console.log("Delivery confirmed on server:", res.data);
        })
        .catch((err) => {
          console.error("Error confirming delivery on server:", err);
        });
    }
  };

  const showConfirmButton =
    orderStatus.confirmed && orderStatus.cooking && orderStatus.onTheWay;

  if (loading) return <SplashScreen />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-poppins">
      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="text-center md:text-left md:flex md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Your Order is{" "}
              <span className="text-orange-600">{getCurrentStatus()}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Order ID:{" "}
              <span className="font-medium text-gray-700">{order._id}</span>
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-center">
            <p className="text-sm text-gray-500">Estimated Delivery</p>
            <p className="text-lg font-bold text-gray-800">6:15 PM - 6:30 PM</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative flex justify-between items-start w-full my-10">
          <div className="absolute top-[20px] left-0 right-0 h-[4px] bg-gray-200 z-[1]" />
          <div
            className="absolute top-[20px] left-0 h-[4px] bg-orange-500 z-[2] transition-all duration-700"
            style={{ width: getProgressWidth() }}
          />
          {[ 
            { id: "confirmed", icon: <Check size={20} />, title: "Confirmed" },
            { id: "cooking", icon: <ChefHat size={20} />, title: "Cooking" },
            { id: "onTheWay", icon: <Truck size={20} />, title: "On the way" },
            { id: "delivered", icon: <PackageCheck size={20} />, title: "Delivered" },
          ].map((step, index) => {
            const isActive = orderStatus[step.id];
            const statusValues = Object.values(orderStatus);
            const lastTrueIndex = statusValues.lastIndexOf(true);
            const isCompleted = index < lastTrueIndex;
            return (
              <div
                key={step.id}
                className="flex flex-col items-center z-[3] relative w-20 text-center"
              >
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted
                      ? "bg-orange-500 text-white"
                      : isActive
                      ? "bg-orange-100 text-orange-600"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.icon}
                </div>
                <span
                  className={`mt-3 text-sm font-medium transition-colors duration-500 ${
                    isCompleted || isActive
                      ? "text-gray-800 font-semibold"
                      : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="my-8 pt-6 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h2>
          <ul className="space-y-3">
            {order.items?.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center text-gray-700"
              >
                <span>
                  {item.quantity}x {item.food.name}
                </span>
                <span className="font-medium">${item.quantity * item.food.price}</span>
              </li>
            ))}
            <li className="flex justify-between items-center text-gray-900 font-bold text-lg pt-2 border-t border-gray-100 mt-2">
              <span>Total</span>
              <span>${order.totalPrice}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3" >
          <button onClick={()=>{toast.error("you can't reach out to this restaurant at the moment...")}} className="w-full md:w-auto bg-orange-600 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2">
            <Phone className="inline-block -mt-1 mr-2 w-4 h-4" />
            Contact Restaurant
          </button>
          {showConfirmButton && (
            <button
              onClick={handleConfirmDelivery}
              disabled={!orderStatus.onTheWay || orderStatus.delivered}
              className={`w-full md:w-auto font-medium py-3 px-8 rounded-full shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                orderStatus.delivered
                  ? "bg-green-400 text-white cursor-not-allowed"
                  : orderStatus.onTheWay
                  ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {orderStatus.delivered ? "Delivered ✔" : "Confirm Delivery"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
