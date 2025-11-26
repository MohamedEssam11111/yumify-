import React, { useState, useEffect } from "react";
import { Check, ChefHat, Truck, PackageCheck, Phone } from "lucide-react";
import orderAPI from "../apis/order.api";
import { useParams } from "react-router";
import SplashScreen from "./SplashScreen";
import toast from "react-hot-toast";

export default function OrderTracking() {
  const orderId = useParams().orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [orderStatus, setOrderStatus] = useState({
    confirmed: false,
    cooking: false,
    onTheWay: false,
    delivered: false,
  });

  useEffect(() => {
    orderAPI
      .get(`/trackOrder/${orderId}`)
      .then((res) => {
        setOrder(res.data);

        const statuses = res.data.subOrders?.map((sub) => sub.status) || [];

        const hasDelivered = statuses.includes("delivered");
        const hasOnTheWay = statuses.includes("on the way");
        const hasPreparing = statuses.includes("preparing") || statuses.includes("ready");
        const hasConfirmed = statuses.includes("confirmed");

        setOrderStatus({
          confirmed: hasConfirmed || hasPreparing || hasOnTheWay || hasDelivered,
          cooking: hasPreparing || hasOnTheWay || hasDelivered,
          onTheWay: hasOnTheWay || hasDelivered,
          delivered: hasDelivered,
        });
      })
      .finally(() => setLoading(false));
  }, [orderId]);

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
    return "Pending";
  };

  const handleConfirmDelivery = () => {
    if (orderStatus.onTheWay && !orderStatus.delivered) {
      setOrderStatus((prev) => ({ ...prev, delivered: true }));
      toast.success("Delivery confirmed! Enjoy your meal!");
      orderAPI.patch(`/deliveredOrder/${orderId}`);
    }
  };

  const showConfirmButton =
    orderStatus.confirmed && orderStatus.cooking && orderStatus.onTheWay;

  if (loading) return <SplashScreen />;

  const totalPrice =
    order?.subOrders?.reduce((sum, sub) => sum + (sub.subtotal || 0), 0) || 0;

  const allItems =
    order?.subOrders?.flatMap((subOrder) =>
      subOrder.items?.map((item) => ({
        _id: item._id,
        quantity: item.quantity,
        food: item.food,
        restaurantName: subOrder.restaurant?.name || "Restaurant",
      }))
    ) || [];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-[#071018] font-poppins">
      <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-2xl shadow-xl dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)] w-full max-w-2xl mx-4">
        <div className="text-center md:text-left md:flex md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Your Order is <span className="text-orange-600">{getCurrentStatus()}</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Order ID:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">{order?._id}</span>
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Overall Status:{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200 capitalize">
                {order?.overallStatus}
              </span>
            </p>
          </div>

          <div className="mt-4 md:mt-0 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Delivery</p>
            <p className="text-lg font-bold text-gray-800 dark:text-gray-100">6:15 PM - 6:30 PM</p>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="relative flex justify-between items-start w-full my-10">
          <div className="absolute top-[20px] left-0 right-0 h-[4px] bg-gray-200 dark:bg-[#0b1220] z-[1]" />
          <div
            className="absolute top-[20px] left-0 h-[4px] bg-orange-500 dark:bg-orange-500 z-[2] transition-all duration-700"
            style={{ width: getProgressWidth() }}
          />

          {[
            { id: "confirmed", icon: <Check size={20} />, title: "Confirmed" },
            { id: "cooking", icon: <ChefHat size={20} />, title: "Cooking" },
            { id: "onTheWay", icon: <Truck size={20} />, title: "On the way" },
            { id: "delivered", icon: <PackageCheck size={20} />, title: "Delivered" },
          ].map((step, index) => {
            const statusValues = Object.values(orderStatus);
            const highestTrueIndex = statusValues.lastIndexOf(true);

            const isCompleted = index < highestTrueIndex;
            const isActive = index === highestTrueIndex;

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
                      ? "bg-orange-100 text-orange-600 dark:bg-[#0f1724] dark:text-orange-400 "
                      : "bg-gray-200 text-gray-400 dark:bg-[#0f1724] dark:text-gray-500"
                  }`}
                >
                  {step.icon}
                </div>

                <span
                  className={`mt-3 text-sm font-medium transition-colors duration-500 ${
                    isCompleted || isActive
                      ? "text-gray-800 dark:text-gray-100 font-semibold"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* RESTAURANT SUB-ORDER STATUS */}
        {order?.subOrders && order.subOrders.length > 1 && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
              Restaurant Status:
            </h3>
            <div className="space-y-2">
              {order.subOrders.map((subOrder, idx) => (
                <div key={subOrder._id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {subOrder.restaurant?.name || `Restaurant ${idx + 1}`}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400 capitalize">
                    {subOrder.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDER SUMMARY */}
        <div className="my-8 pt-6 border-t border-gray-200 dark:border-[rgba(255,255,255,0.02)]">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Order Summary
          </h2>

          <ul className="space-y-3">
            {allItems.map((item) => (
              <li
                key={item._id}
                className="flex justify-between items-center text-gray-700 dark:text-gray-200"
              >
                <span>
                  {item.quantity}x {item.food?.name}
                  {allItems.length > 1 && order?.subOrders?.length > 1 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      ({item.restaurantName})
                    </span>
                  )}
                </span>
                <span className="font-medium">
                  ${(item.quantity * (item.food?.price || 0)).toFixed(2)}
                </span>
              </li>
            ))}

            <li className="flex justify-between items-center text-gray-900 dark:text-gray-100 font-bold text-lg pt-2 border-t border-gray-100 dark:border-[rgba(255,255,255,0.02)] mt-2">
              <span>Total</span>
              <span>${(totalPrice * 1.05).toFixed(2)}</span>
            </li>
          </ul>
        </div>

        {/* ADDRESS */}
        {order?.deliveryAddress && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Delivery Address:
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {order.deliveryAddress}
            </p>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-3">
          <button
            onClick={() => toast.error("You can't reach out to this restaurant at the moment...")}
            className="w-full md:w-auto bg-orange-600 text-white font-medium py-3 px-8 rounded-full shadow-lg hover:bg-orange-700 transition-all duration-300"
          >
            <Phone className="inline-block -mt-1 mr-2 w-4 h-4" />
            Contact Restaurant
          </button>

          {showConfirmButton && (
            <button
              onClick={handleConfirmDelivery}
              disabled={!orderStatus.onTheWay || orderStatus.delivered}
              className={`w-full md:w-auto font-medium py-3 px-8 rounded-full shadow-md transition-all duration-300 ${
                orderStatus.delivered
                  ? "bg-green-400 text-white cursor-not-allowed"
                  : orderStatus.onTheWay
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-[#1f2937] dark:text-gray-400"
              }`}
            >
              {orderStatus.delivered ? "Delivered ✓" : "Confirm Delivery"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
