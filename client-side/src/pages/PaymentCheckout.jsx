import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import cartAPI from "../apis/cart.api";
import { ArrowLeft } from "lucide-react";
import userAPI from "../apis/user.api";

export default function PaymentCheckout() {
  const [paymentMethod, setPaymentMethod] = useState("creditCard");
  const [showBack, setShowBack] = useState(false);
  const [walletSelected, setWalletSelected] = useState("");
  const [walletNumber, setWalletNumber] = useState("");
  const [cart, setCart] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigator = useNavigate();

  // card state as an object
  const [card, setCard] = useState({
    number: "",
    holder: "",
    expiry: "",
    cvv: "",
  });

  useEffect(() => {
  userAPI.get('/profile')
  .then((res) => {
    setUser(res.data)
  })
  .catch((err) => {
    console.log(err)
  })
})

  const handlePayNow = () => {
    // Validation based on payment method
    if (paymentMethod === "creditCard") {
      if (!card.number || !card.holder || !card.expiry || !card.cvv) {
        toast.error("Please fill in all credit card details.", {
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#b91c1c",
            fontWeight: "600",
          },
        });
        return;
      }

      // review card number length and digits only
      const cleanNumber = card.number.replace(/\s/g, ""); // remove spaces
      if (cleanNumber.length !== 16 || isNaN(cleanNumber)) {
        toast.error("Card number must be 16 digits.", {
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#b91c1c",
            fontWeight: "600",
          },
        });
        return;
      }

      // check expiry format MM/YY
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(card.expiry)) {
        toast.error("Expiry date must be in MM/YY format.", {
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#b91c1c",
            fontWeight: "600",
          },
        });
        return;
      }

      // check cvv length and digits only
      if (!/^\d{3}$/.test(card.cvv)) {
        toast.error("CVV must be 3 digits.", {
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#b91c1c",
            fontWeight: "600",
          },
        });
        return;
      }
    }

    // check for online wallet
    if (paymentMethod === "onlineWallet") {
      if (!walletSelected || !walletNumber) {
        toast.error("Please select a wallet and enter your number.", {
          position: "top-center",
          style: {
            background: "#ffe6e6",
            color: "#b91c1c",
            fontWeight: "600",
          },
        });
        return;
      }

      // validate wallet number format (starts with 01 and is 11 digits)
      if (!/^01\d{9}$/.test(walletNumber)) {
        toast.error(
          "Please enter a valid wallet number (11 digits starting with 01).",
          {
            position: "top-center",
            style: {
              background: "#ffe6e6",
              color: "#b91c1c",
              fontWeight: "600",
            },
          }
        );
        return;
      }
    }

    // if all validations pass
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      toast.success("Payment successful! Your order has been placed.", {
        position: "top-center",
        style: {
          background: "#e6ffed",
          color: "#1a7f37",
          fontWeight: "600",
        },
      });
    }, 2000);



    cartAPI
      .post("/checkout", {
        deliveryAddress: user.address , 
        paymentMethod: paymentMethod,
      })
      .then((response) => {
        console.log("Checkout response:", response.data);
      })
      .catch((error) => {
        console.error("Error during checkout:", error);
      });

    // Redirect to home after payment
    setTimeout(() => {
      navigator("/");
    }, 2500);
  };


  useEffect(() => {
    // Fetch cart data from API
    cartAPI
      .get("/")
      .then((response) => {
        setCart(response?.data || null);
      })
      .catch((error) => {
        console.error("Error fetching cart data:", error);
        setCart(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // default to credit card on load page
  useEffect(() => {
    setPaymentMethod("creditCard");
  }, []);

  console.log("cart items:", cart?.items);

  // Safe calculations with null checks
  let totalAmount =
    cart?.items?.reduce((total, item) => {
      const price = item?.food?.price || 0;
      const quantity = item?.quantity || 0;
      return total + price * quantity;
    }, 0) || 0;

  let amountAfterTax = (totalAmount * 1.05).toFixed(2);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffbf5] dark:bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 dark:border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // Empty cart check
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffbf5] dark:bg-[#0b1120] flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
            Your cart is empty
          </p>
          <button
            onClick={() => navigator("/")}
            className="px-6 py-3 bg-orange-500 dark:bg-orange-600 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
          >
            Go to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbf5] dark:bg-[#0b1120] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-poppins">
      <div className="max-w-4xl w-full bg-white dark:bg-[#071018] rounded-xl shadow-lg dark:shadow-[0_12px_40px_rgba(2,_6,_23,_0.6)] p-6 sm:p-8 flex flex-col lg:flex-row gap-8">
        {/* ----- Order Summary Column ----- */}
        <div className="lg:w-1/2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-4">
            <button
              onClick={() => navigator("/")}
              className="text-gray-700 dark:text-gray-200"
            >
              <ArrowLeft />
            </button>
            Payment Checkout
          </h2>

          <div className="bg-gray-50 dark:bg-[#08121a] p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Order Summary
            </h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {cart.items
                .filter((item) => item?.food)
                .map((item) => {
                  return (
                    <li
                      key={item?._id || Math.random()}
                      className="flex justify-between"
                    >
                      <span>
                        {item?.food?.name || "Unknown"} x {item?.quantity || 0}
                      </span>
                      <span className="dark:text-gray-200">
                        ${(item?.food?.price || 0).toFixed(2)}
                      </span>
                    </li>
                  );
                })}

              <li className="flex justify-between text-xl font-bold text-orange-600 dark:text-orange-400 pt-2 border-t-2 border-orange-200 dark:border-orange-700">
                <span>Total</span>
                <span>${amountAfterTax}</span>
              </li>
            </ul>
          </div>

          {/* ----- Payment Method Selection ----- */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">
              Payment Method
            </h3>
            <div className="space-y-3">
              {[
                { value: "creditCard", label: "Credit Card" },
                { value: "cash", label: "Cash on Delivery" },
                { value: "onlineWallet", label: "Online Wallet" },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`payment-method-label flex items-center p-3 rounded-lg shadow-sm cursor-pointer border ${
                    paymentMethod === method.value
                      ? "border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600"
                      : "border-gray-200 bg-white dark:bg-[#071018] dark:border-[#25313a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio h-3 w-3 text-orange-600 accent-orange-600 border-gray-300 focus:ring-orange-600 focus:ring-offset-1 transition-all duration-200"
                  />

                  <span className="ml-3 text-gray-800 dark:text-gray-100 font-medium">
                    {method.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ----- Payment Details Column ----- */}
        <div className="lg:w-1/2 space-y-6">
          {/* Credit Card Details */}
          {paymentMethod === "creditCard" && (
            <div id="creditCardSection">
              <div className="flex justify-center mb-6">
                <div
                  className="card-preview relative w-[300px] h-[180px] rounded-[15px] text-white shadow-lg transition-transform duration-700"
                  style={{
                    background:
                      "linear-gradient(135deg, #ff7043 20%, #ffb74d 100%)",
                    transformStyle: "preserve-3d",
                    transform: showBack ? "rotateY(180deg)" : "rotateY(0deg)",
                    transition: "transform 0.7s ease",
                  }}
                >
                  <div
                    className="absolute inset-0 flex flex-col justify-between p-5"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="w-[45px] h-[35px] bg-amber-300 rounded-md"></div>
                      <div className="font-bold text-xl">VISA</div>
                    </div>
                    <div className="text-lg tracking-[2px]">
                      {card.number || "#### #### #### ####"}
                    </div>
                    <div className="flex justify-between text-xs uppercase">
                      <div>
                        <span>Card Holder</span>
                        <div>{card.holder || "FULL NAME"}</div>
                      </div>
                      <div>
                        <span>Expires</span>
                        <div>{card.expiry || "MM/YY"}</div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="absolute inset-0 flex flex-col justify-start p-5 rounded-[15px]"
                    style={{
                      transform: "rotateY(180deg)",
                      backfaceVisibility: "hidden",
                      background:
                        "linear-gradient(135deg, #ff7043 20%, #ffb74d 100%)",
                    }}
                  >
                    <div className="h-10 bg-gray-800 w-full mt-4"></div>
                    <div className="ml-auto flex flex-col items-center mt-6">
                      <span>CVV</span>
                      <div className="w-20 text-right bg-white text-gray-800 p-2 rounded-md text-sm font-medium">
                        {card.cvv || "•••"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Form */}
              <div className="bg-gray-50 dark:bg-[#071018] p-6 rounded-lg shadow-sm space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={card.number}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      value = value.match(/.{1,4}/g)?.join(" ") || "";
                      setCard({ ...card, number: value });
                    }}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength={19}
                    className="mt-1 block w-full rounded-md border-gray-300 
                 dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 
                 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    value={card.holder}
                    onChange={(e) =>
                      setCard({ ...card, holder: e.target.value.toUpperCase() })
                    }
                    placeholder="FULL NAME"
                    className="mt-1 block w-full rounded-md border-gray-300 
                 dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 
                 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                  />
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={card.expiry}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 2)
                          value = value.slice(0, 2) + "/" + value.slice(2);
                        setCard({ ...card, expiry: value });
                      }}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="mt-1 block w-full rounded-md border-gray-300 
                   dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 
                   shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={card.cvv}
                      onChange={(e) =>
                        setCard({ ...card, cvv: e.target.value })
                      }
                      onFocus={() => setShowBack(true)}
                      onBlur={() => setShowBack(false)}
                      placeholder="XXX"
                      maxLength={3}
                      className="mt-1 block w-full rounded-md border-gray-300 
                   dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 
                   shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cash Section */}
          {paymentMethod === "cash" && (
            <div className="bg-gray-50 dark:bg-[#071018] p-6 rounded-lg shadow-sm text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-green-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Cash on Delivery
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Please have the total amount of{" "}
                <strong className="text-orange-600 dark:text-orange-400">
                  ${amountAfterTax}
                </strong>{" "}
                ready to pay the delivery agent.
              </p>
            </div>
          )}

          {/* Online Wallet Section */}
          {paymentMethod === "onlineWallet" && (
            <div className="bg-gray-50 dark:bg-[#071018] p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                Choose Your E-Wallet
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    name: "Vodafone Cash",
                    img: "/public/payment images/vodafoneCash.png",
                  },
                  {
                    name: "Orange Cash",
                    img: "/public/payment images/Orange_Money-Logo.wine.svg",
                  },
                  {
                    name: "Etisalat Cash",
                    img: "/public/payment images/etsalatCashLogo.png",
                  },
                  {
                    name: "We Pay",
                    img: "/public/payment images/wePayLogo.png",
                  },
                  {
                    name: "Fawry",
                    img: "/public/payment images/fawryLogo.png",
                  },
                ].map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => setWalletSelected(wallet.name)}
                    className={`wallet-btn border-2 p-3 rounded-lg text-sm font-semibold flex flex-col items-center justify-center transition-all ${
                      walletSelected === wallet.name
                        ? "border-orange-600 bg-orange-50 shadow-[0_0_0_2px_#f97316] dark:bg-orange-900/10 dark:border-orange-600"
                        : "border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 dark:bg-[#08121a] dark:border-[#25313a] dark:hover:border-orange-400 dark:hover:bg-orange-900/10"
                    }`}
                  >
                    {/* Wallet Image */}
                    <img
                      src={wallet.img}
                      alt={wallet.name}
                      className="w-13 h-12 object-contain mb-2"
                    />
                    {/* Wallet Name */}
                    <span className="dark:text-gray-100">{wallet.name}</span>
                  </button>
                ))}
              </div>

              {walletSelected && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Enter your {walletSelected} number
                  </label>
                  <input
                    type="tel"
                    value={walletNumber}
                    onChange={(e) => setWalletNumber(e.target.value)}
                    placeholder="01X XXXX XXXX"
                    className="mt-1 block w-full rounded-md border-gray-300 
             dark:border-[#25313a] dark:bg-[#0d1a26] dark:text-gray-100 
             shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2"
                  />
                </div>
              )}
            </div>
          )}

          {/* Pay Now Button */}
          <button
            onClick={handlePayNow}
            disabled={processing}
            className={`w-full py-3 px-4 font-semibold rounded-lg shadow-md text-white transition-all ${
              processing
                ? "bg-orange-400 cursor-not-allowed dark:bg-orange-500"
                : "bg-orange-600 hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-700"
            }`}
          >
            {processing
              ? "Processing..."
              : paymentMethod === "creditCard"
              ? "Pay Now"
              : paymentMethod === "cash"
              ? "Confirm Order"
              : "Confirm Wallet Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
