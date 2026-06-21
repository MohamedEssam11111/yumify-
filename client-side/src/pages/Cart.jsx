import { useEffect, useState } from "react";
import CartItem from "../components/CartItem";
import userAPI from "../apis/user.api";
import cartAPI from "../apis/cart.api";
import promotionAPI from "../apis/promotion.api";
import { useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";
import EmptyCart from "./EmptyCart";
import API_URL from "../config/api";
import toast from "react-hot-toast";

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delivery / Pickup
  const [isDelivery, setIsDelivery] = useState(true);

  // Promo Code
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [appliedPromo, setAppliedPromo] = useState(null);

  const navigator = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cartRes, userRes] = await Promise.all([
          cartAPI.get("/").catch(() => ({ data: null })),
          userAPI.get("/profile").catch(() => ({ data: null })),
        ]);

        setCart(cartRes?.data || null);
        setUserData(userRes?.data || null);
      } catch (err) {
        console.log("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==========================
  // Cart Calculations
  // ==========================

  const subtotal =
    cart?.items?.reduce((total, item) => {
      const price = item?.food?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0) || 0;

  const TAX_RATE = 0.05;
  const DELIVERY_FEE = isDelivery ? 5 : 0;

  const taxes = parseFloat((subtotal * TAX_RATE).toFixed(2));

  const totalBeforeDiscount = subtotal + taxes + DELIVERY_FEE;

  const total = Math.max(totalBeforeDiscount - discount, 0);

  const formatCurrency = (amount) => `$${Number(amount || 0).toFixed(2)}`;

  // ==========================
  // Apply Promo
  // ==========================

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      return toast.error("Please enter a promo code");
    }

    try {
      setPromoLoading(true);

      const res = await promotionAPI.post("/validate", {
        code: promoCode.trim(),
        subtotal,
      });

      setDiscount(res.data.discount);
      setAppliedPromo(res.data.promo);

      toast.success(`${res.data.promo.code} applied successfully`);
    } catch (error) {
      setDiscount(0);
      setAppliedPromo(null);

      toast.error(error.response?.data?.message || "Invalid promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 dark:border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading cart...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071018]">
      <header className="bg-white dark:bg-[#071820] dark:shadow-[0_2px_8px_rgba(2,6,23,0.6)] shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-4">
          <button
            onClick={() => navigator("/")}
            aria-label="Go back"
            className="text-gray-700 dark:text-gray-200"
          >
            <ArrowLeft />
          </button>
          Yumify
        </h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigator("/profile")}
            className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200 dark:hover:bg-[#0f1724] dark:text-gray-200"
            aria-label="Profile"
          >
            <img
              className="rounded-full w-full h-full object-cover"
              src={
                userData?.imageUrl
                  ? `${API_URL}/uploads/users/${userData.imageUrl}`
                  : `${API_URL}/uploads/users/def.svg`
              }
              alt="Profile pic"
              onError={(e) => {
                e.target.src = `${API_URL}/uploads/users/def.svg`;
              }}
            />
          </button>
        </div>
      </header>

      {cart?.items && cart.items.length > 0 ? (
        <main className="container mx-auto p-6 lg:p-10">
          <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-gray-50">
            Your Cart
          </h2>

          <div className="flex flex-col lg:flex-row lg:space-x-10">
            {/* Cart Items */}
            <div className="lg:w-2/3 bg-white dark:bg-[#071826] p-6 rounded-xl shadow-lg dark:shadow-[0_20px_50px_rgba(2,6,23,0.6)] mb-8 lg:mb-0">
              {cart.items
                .filter((item) => item?.food && item?.food?.price != null)
                .map((item) => (
                  <CartItem
                    key={item._id || item.food._id}
                    item={item}
                    setCart={setCart}
                  />
                ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white dark:bg-[#071826] p-6 rounded-lg shadow-md dark:shadow-[0_10px_30px_rgba(2,6,23,0.6)]">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-50">
                  Order Summary
                </h2>

                {/* Order Options */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Order Options
                  </h3>
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-[#0b1220] p-1 rounded-full">
                    <span className="p-2 text-sm text-gray-700 dark:text-gray-300">
                      Pickup
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-800/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                    <span className="p-2 text-sm font-bold text-orange-500">
                      Delivery
                    </span>
                  </div>
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">
                    Promo Code
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      disabled={!!appliedPromo}
                      placeholder="Enter coupon code"
                      className="flex-grow p-2 border border-gray-300 dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                    />

                    <button
                      onClick={handleApplyPromo}
                      disabled={promoLoading || !!appliedPromo}
                      className="bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-700 transition duration-150 disabled:opacity-50"
                    >
                      {promoLoading
                        ? "Checking..."
                        : appliedPromo
                          ? "Applied"
                          : "Apply"}
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 mb-4 text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes (5%)</span>
                    <span>{formatCurrency(taxes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>{formatCurrency(DELIVERY_FEE)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-500 font-semibold">
                      <span>Discount</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>

                <hr className="my-4 border-gray-200 dark:border-[rgba(255,255,255,0.02)]" />

                {/* Total */}
                <div className="flex justify-between items-center text-2xl font-bold mb-6 text-gray-900 dark:text-gray-50">
                  <span>Total</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    {formatCurrency(total)}
                  </span>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={() => navigator("/paymentCheckout")}
                  disabled={!cart?.items || cart.items.length === 0}
                  className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition duration-150 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <EmptyCart />
      )}
    </div>
  );
};

export default Cart;
