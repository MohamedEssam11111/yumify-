import { useEffect, useState } from "react";
import foodAPI from "../apis/food.api";
import Food from "../components/Food.jsx";
import userAPI from "../apis/user.api.js";
import { Link, useNavigate } from "react-router";
import cartAPI from "../apis/cart.api.js";
import toast from "react-hot-toast";
import {
  Menu,
  ReceiptTextIcon,
  Heart,
  LogOut,
  Search,
  ShoppingCart,
} from "lucide-react";
import SplashScreen from "./SplashScreen.jsx";
import ThemeToggleBtn from "../components/ThemeToggleBtn.jsx";

const Home = () => {
  document.title = "Yumify - Home";
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [userData, setUserData] = useState(null);
  const [cartOpened, setCartOpened] = useState(false);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigator = useNavigate();

  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res?.data || null))
      .catch((error) => {
        // Silently handle 401 errors (expected when user is not logged in)
        if (error.response?.status !== 401) {
          console.error("Failed to fetch user profile:", error);
        }
        setUserData(null);
      });
  }, []);

  useEffect(() => {
    foodAPI
      .get("getMenuForChatBot")
      .then((res) => console.log(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    cartAPI
      .get("/")
      .then((res) => setCart(res?.data || null))
      .catch((err) => {
        console.log("err fetching cart", err);
        setCart(null);
      });
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === "") {
        foodAPI
          .get("/")
          .then((response) =>
            setFoods(Array.isArray(response?.data) ? response.data : [])
          )
          .catch((err) => {
            console.log(err);
            setFoods([]);
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
        foodAPI
          .get(`/search?q=${searchTerm.trim()}`)
          .then((response) =>
            setFoods(Array.isArray(response?.data) ? response.data : [])
          )
          .catch((err) => {
            console.log(err);
            setFoods([]);
          });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  if (loading) return <SplashScreen />;

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`sidebar fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 shadow-lg z-50 p-6 flex flex-col transform ${
            !sideBarOpened ? "-translate-x-full" : "translate-x-0"
          } transition-transform duration-300 ease-in-out `}
        >
          <h2 className="font-logo text-4xl text-orange-500 mb-8">Yumify</h2>
          <nav className="flex flex-col space-y-4 text-lg flex-1">
            <Link
              to="/"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 bg-orange-50 dark:bg-orange-900/20"
            >
              <Menu className="size-6" />
              <span className="flex items-center space-x-3 p-2 rounded-lg text-orange-500 font-bold">
                Menu
              </span>
            </Link>
            <Link
              to="/myOrders"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <ReceiptTextIcon className="size-6" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Heart className="size-6" />
              <span>Favorites</span>
            </Link>

            <ThemeToggleBtn />

                      {userData ? (
            <button
              onClick={() => {
                userAPI.post("/logout").then(() => {
                  navigator("/login");
                });
              }}
              className="w-full flex items-center  space-x-3 p-2 mt-auto rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <LogOut className="size-6" />
              <span>Logout</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-3 p-2 mt-auto rounded-lg text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <LogOut className="size-6" />
              <span>Login</span>
            </Link>
          )}

          </nav>


        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-50 dark:bg-[#071018]">
          {/* Top Bar */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm dark:shadow-gray-800">
            <button
              id="sidebar-toggle"
              className="p-2 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={() => setSideBarOpened(!sideBarOpened)}
            >
              <Menu className="size-6" />
            </button>

            <div className="relative w-full max-w-md mx-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
                autoComplete="off"
                placeholder="Search for dishes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="size-6 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400 dark:text-gray-500" />
            </div>

            <div className="flex items-center space-x-4">
              <button
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 p-4 flex items-center justify-center text-gray-700 dark:text-gray-200"
                onClick={() => navigator("/cart")}
              >
                <ShoppingCart className="size-6" />
              </button>

              {userData ? (
                <button
                  onClick={() => navigator("/profile")}
                  className="p-2 w-14 h-14 rounded-full text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <img
                    src={`http://localhost:5000/uploads/users/${
                      userData.imageUrl || "default.png"
                    }`}
                    alt="Profile Pic"
                    className="rounded-full"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/56?text=User";
                    }}
                  />
                </button>
              ) : (
                <svg
                  className="w-6 h-6 text-gray-700 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              )}
            </div>
          </header>

          <main className="flex-1 p-6">
            {/* Category Tabs */}
            <section className="mb-8">
              <div className="flex items-center space-x-6 sm:space-x-10 border-b border-gray-200 dark:border-gray-700">
                {[
                  "all",
                  "Starter",
                  "MainDish",
                  "Appetizer",
                  "Dessert",
                  "Drink",
                ].map((cat) => (
                  <span
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500  hover:text-orange-500 transition-colors ${
                      selectedCategory === cat
                        ? "border-b-2 border-orange-500 text-orange-500 font-bold"
                        : ""
                    }`}
                  >
                    {cat === "all"
                      ? "All"
                      : cat === "MainDish"
                      ? "Main Dishes"
                      : cat === "Starter"
                      ? "Starters"
                      : cat === "Appetizer"
                      ? "Appetizers"
                      : cat === "Dessert"
                      ? "Desserts"
                      : "Drinks"}
                  </span>
                ))}
              </div>
            </section>

            {/* Menu Grid */}
            <div
              id="menu-items-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
            >
              {foods
                .filter((food) =>
                  selectedCategory === "all"
                    ? true
                    : food?.category === selectedCategory
                )
                .map((food) =>
                  food?._id ? (
                    <Food
                      key={food._id}
                      foodObj={food}
                      userFavs={userData?.favourites || []}
                      setCart={setCart}
                    />
                  ) : null
                )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Cart */}
      <div
        id="floating-cart-button"
        onClick={() => setCartOpened(true)}
        className="fixed bottom-20 right-14 bg-slate-800 dark:bg-gray-800 rounded-full shadow-lg cursor-pointer p-4 transition-transform hover:scale-110 size-11 flex items-center justify-center"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <span
          id="cart-item-count"
          className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500 text-white rounded-full font-semibold text-xs"
        >
          {cart?.items?.length || 0}
        </span>
      </div>

      {/* Overlay */}
      <div
        id="overlay"
        className={`overlay fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-40 transition-opacity duration-300 ease-in-out ${
          cartOpened || sideBarOpened
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => {
          setCartOpened(false);
          setSideBarOpened(false);
        }}
      ></div>

      {/* Mini Cart Drawer */}
      <div
        id="mini-cart-drawer"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-[#071826] shadow-lg dark:shadow-gray-900 z-[100] flex flex-col transform ${
          cartOpened ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">
            Your Order
          </h2>
          <button
            id="close-cart-btn"
            onClick={() => setCartOpened(false)}
            className="text-2xl text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-gray-200"
          >
            &times;
          </button>
        </div>

        <div
          id="cart-items-container"
          className="flex-grow p-5 overflow-y-auto bg-white dark:bg-[#071826]"
        >
          {!userData ? (
            <p className="flex items-center justify-center text-gray-400 dark:text-gray-500 gap-1">
              You must{" "}
              <Link
                className="text-orange-400 dark:text-orange-500 underline"
                to="/login"
              >
                login
              </Link>{" "}
              to inspect/Add to your Cart
            </p>
          ) : !cart || !cart.items || cart.items.length === 0 ? (
            <div
              id="empty-cart-message"
              className="text-center text-slate-500 dark:text-gray-400 mt-10"
            >
              <p className="text-lg">Your cart is empty.</p>
              <p>Start by adding your favorite dishes!</p>
            </div>
          ) : (
            cart.items.map((item) =>
              item?.food?._id ? (
                <div
                  key={item.food._id}
                  className="flex items-center justify-between mb-4 p-3 rounded-lg bg-gray-50 dark:bg-[#0d1f2e] border border-gray-200 dark:border-[#23303a]"
                >
                  <div className="flex items-center">
                    <img
                      src={`http://localhost:5000/uploads/foods/${
                        item.food.imageUrl || "default.jpg"
                      }`}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/64?text=Food";
                      }}
                      alt={item.food.name || "Food"}
                      className="w-16 h-16 object-cover rounded-md mr-4 ring-2 ring-gray-200 dark:ring-[#23303a]"
                    />
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-gray-100">
                        {item.food.name || "Unknown"}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-gray-400">
                        ${item.food.price || 0} x {item.quantity || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="font-bold mr-4 text-slate-800 dark:text-gray-100">
                      $
                      {((item.food.price || 0) * (item.quantity || 0)).toFixed(
                        2
                      )}
                    </span>

                    <button
                      onClick={() => {
                        cartAPI
                          .post("/removeFromCart", { foodId: item.food._id })
                          .then((res) => setCart(res?.data || null))
                          .catch((err) =>
                            console.log("err removing item from cart", err)
                          );
                      }}
                      className="text-red-500 dark:text-red-400 font-bold text-lg hover:text-red-600 dark:hover:text-red-300 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ) : null
            )
          )}
        </div>

        <div className="p-5 border-t border-gray-200 dark:border-[#23303a] bg-slate-50 dark:bg-[#0d1f2e]">
          {cart?.items?.length > 0 && userData ? (
            <div className="flex justify-between font-bold text-lg mb-4 text-slate-800 dark:text-gray-100">
              <span>Subtotal:</span>
              <span id="cart-total">
                $
                {cart.items
                  .reduce(
                    (total, item) =>
                      total + (item?.quantity || 0) * (item?.food?.price || 0),
                    0
                  )
                  .toFixed(2)}
              </span>
            </div>
          ) : null}

          <button
            onClick={() => {
              if (!userData) {
                navigator("/login");
                return;
              }

              if (!cart?.items?.length) {
                toast.error("Your cart is empty");
                return;
              }

              navigator("/paymentCheckout");
              setCartOpened(false);
            }}
            className="w-full bg-orange-500 dark:bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-600 dark:hover:bg-orange-700 transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
