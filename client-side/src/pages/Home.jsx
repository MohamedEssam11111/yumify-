import { useEffect, useState } from "react";
import foodAPI from "../apis/food.api";
import Food from "../components/Food.jsx";
import userAPI from "../apis/user.api.js";
import { Link, useNavigate } from "react-router";
import cartAPI from "../apis/cart.api.js";
import toast from "react-hot-toast";
import { Menu , ReceiptTextIcon , Heart, LogOut, Search, ShoppingCart } from "lucide-react";
import SplashScreen from "./SplashScreen.jsx";

const Home = () => {
  document.title = "Yumify - Home";
  const [sideBarOpened, setSideBarOpened] = useState(false); // false means closed, true means opened
  const [userData, setUserData] = useState(null);
  const [cartOpened, setCartOpened] = useState(false); // false means closed, true means opened
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const navigator = useNavigate();

  useEffect(() => {
    userAPI.get("/profile").then((res) => setUserData(res.data));
  }, []);
  useEffect(() => {
    cartAPI
      .get("/")
      .then((res) => setCart(res.data))
      .catch((err) => console.log("err fetching cart", err));
  }, []);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() === "") {
        foodAPI
          .get("/")
          .then((response) => {
            setFoods(response.data);
          })
          .catch((err) => {
            console.log(err);
          }).finally(() => setLoading(false));
      } else {
        foodAPI
          .get(`/search?q=${searchTerm.trim()}`)
          .then((response) => {
            setFoods(response.data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          id="sidebar"
          className={`sidebar fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-6 flex flex-col transform ${
            !sideBarOpened ? "-translate-x-full" : "translate-x-0"
          } transition-transform duration-300 ease-in-out `}
        >
          <h2 className="font-logo text-4xl text-orange-500 mb-8">Yumify</h2>
          <nav className="flex flex-col space-y-4 text-lg">
            <Link
              to="/"
              
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 bg-orange-50"
            >
              <Menu className="size-6" />
              <span className="flex items-center space-x-3 p-2 rounded-lg text-orange-500 font-bold" >Menu</span>
            </Link>
            <Link
              to="/myOrders"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
              <ReceiptTextIcon className="size-6" />
              <span>My Orders</span>
            </Link>
            <Link
              to="/favorites"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
              <Heart className="size-6" />
              <span>Favorites</span>
            </Link>
          </nav>
          <div className="mt-auto">
            <a
              href="#"
              className="flex items-center space-x-3 p-2 mt-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
              <LogOut className="size-6" />
              {" "}
              {userData ? (
                <span
                  onClick={() => {
                    userAPI.post("/logout").then(() => {
                      navigator("/login");
                    });
                  }}
                >
                  Logout
                </span>
              ) : (
                <span onClick={() => navigator("/login")}>Login</span>
              )}
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar  */}
          <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm">
            <button
              id="sidebar-toggle"
              className="p-2 rounded-full text-gray-700 hover:bg-gray-200"
              onClick={() => {
                setSideBarOpened(!sideBarOpened);
              }}
            >
              <Menu className="size-6" />
            </button>
            <div className="relative w-full max-w-md mx-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-input"
                placeholder="Search for dishes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
                {/* 
                  top 1/2 to center the icon 
                  transform -translate-y-1/2 to perfectly center it vertically
                  left-3 to give some space from the left edge
                */}
              <Search className="size-6 absolute top-1/2 transform -translate-y-1/2 left-3 text-gray-400 " />
            </div>
            <div className="flex items-center space-x-4">
              <button className="rounded-full hover:bg-gray-100 p-4 flex items-center justify-center" onClick={()=>{navigator('/cart')}}>
                <ShoppingCart className="size-6" />
              </button>
              {userData ? (
                <button
                  onClick={() => navigator("/profile")}
                  className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200"
                >
                  <div>
                    <img
                      src={`http://localhost:5000/uploads/users/${userData.imageUrl}`}
                      alt="Profile Pic"
                      className="rounded-full"
                    />
                  </div>
                </button>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>{" "}
                </svg>
              )}
            </div>
          </header>

          <main className="flex-1 p-6">
            {/* Category Tabs */}
            <section className="mb-8">
              <div className="flex items-center space-x-6 sm:space-x-10 border-b border-gray-200">
                <span
                  onClick={() => setSelectedCategory("all")}
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "all" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                >
                  All
                </span>
                <span
                  onClick={() => setSelectedCategory("Starter")}
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "Starter" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                >
                  Starters
                </span>
                <span
                  onClick={() => setSelectedCategory("MainDish")}
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "MainDish" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                >
                  Main Dishes
                </span>
                <span
                  onClick={() => setSelectedCategory("Appetizer")}
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "Appetizer" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                >
                  Appetizers
                </span>
                <span
                  onClick={() => setSelectedCategory("Dessert")}
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "Dessert" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                >
                  Desserts
                </span>
                <span
                  className={`menu-category-tab font-tabs py-3 text-lg cursor-pointer text-gray-500 hover:text-orange-500 transition-colors active ${ selectedCategory === "Drink" ? "border-b-2 border-orange-500 text-orange-500 font-bold" : "" }`}
                  onClick={() => setSelectedCategory("Drink")}
                >
                  Drinks
                </span>
              </div>
            </section>

            {/* Menu Grid */}
            <div
              id="menu-items-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {/* Menu items */}
              {foods
                .filter((food) =>
                  selectedCategory === "all"
                    ? true
                    : food.category === selectedCategory
                )
                .map((food) => (
                  <Food key={food._id} foodObj={food} userFavs={userData?.favourites}  setCart={setCart} />
                ))}
            </div>
            <div
              id="empty-category-message"
              className="hidden text-center text-slate-500 mt-10"
            >
              <p className="text-xl font-semibold">No dishes found!</p>
              <p>Try a different category or search term.</p>
            </div>
          </main>
        </div>
      </div>

      {/* Floating Cart & Drawer  */}
      <div
        id="floating-cart-button"
        onClick={() => setCartOpened(true)}
        className="fixed bottom-8 right-8 bg-slate-800 rounded-full shadow-lg cursor-pointer p-4 transition-transform hover:scale-110"
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
          ></path>
        </svg>
        <span
          id="cart-item-count"
          className="absolute top-0 right-0 px-2 py-0.5 bg-orange-500 text-white rounded-full font-semibold text-xs"
        >
          {
            cart && userData ? cart.items?.length : 0
          }
        </span>
      </div>
      <div
        id="overlay"
        className={`overlay fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
          cartOpened || sideBarOpened
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
        onClick={() => {
          setCartOpened(false);
          setSideBarOpened(false);
        }}
      ></div>
      <div
        id="mini-cart-drawer"
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-lg z-50 flex flex-col transform ${
          cartOpened ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-bold text-slate-800">Your Order</h2>
          <button
            id="close-cart-btn"
            onClick={() => setCartOpened(false)}
            className="text-2xl text-slate-500 hover:text-slate-800"
          >
            &times;
          </button>
        </div>
        <div
          id="cart-items-container"
          className="flex-grow p-5 overflow-y-auto"
        >
          {!userData ? (
            <p className="flex items-center justify-center text-gray-400 gap-1">
              You must <Link className="text-orange-400 underline" to='/login'> login </Link> to inspect/Add to your Cart
            </p>
          ) : !cart ? (
            <div
              id="empty-cart-message"
              class="text-center text-slate-500 mt-10"
            >
              <p className="text-lg">Your cart is empty.</p>
              <p>Start by adding your favorite dishes!</p>
            </div>
          ) : ( // -******************************************************************************
            cart.items?.map((item) => {
  return (
    <div key={item._id} className="flex items-center justify-between mb-4">
      <div className="flex items-center">
        <img
          src={`http://localhost:5000/uploads/foods/${item.food.imageUrl}`}
          alt={item.food.name}
          className="w-16 h-16 object-cover rounded-md mr-4"
        />
        <div>
          <p className="font-semibold text-slate-800">{item.food.name}</p>
          <p className="text-sm text-slate-500">
            ${item.food.price} x {item.quantity}
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <span className="font-bold mr-4 text-slate-800">
          ${item.food.price * item.quantity}
        </span>
        <button onClick={()=>{
          cartAPI.post("/removeFromCart",{foodId:item.food._id})
          .then((res)=>{setCart(res.data)
            // rerender cart without yhe removed item
            setCart(prev => ({
  ...prev,
  items: prev.items.filter(cartItem => cartItem.food !== item.food)
}));

          })
          .catch((err)=>console.log("err removing item from cart",err));
        }}
        className="text-red-500 font-bold text-lg">
          &times;
        </button>
      </div>
    </div>
  );
})

          )}
        </div>
        <div className="p-5 border-t bg-slate-50">
          {
            cart && userData?
            <div className="flex justify-between font-bold text-lg mb-4 text-slate-800">
            <span>Total:</span>
            <span id="cart-total">$
              {
                // calculates total price
                cart?.items?.reduce((total, item) => {
                  return total + item.quantity * item.food.price;
                }, 0)
              }
            </span>
          </div>:
          null
          }
          <button onClick={()=>{
            if(!userData){
              navigator('/login');
              return;
          }
          if(cart.items.length===0){
            toast.error("Your cart is empty");
            return;
          }
          navigator('/paymentCheckout');
          setCartOpened(false);
          }

          } className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition-colors">
            Checkout
          </button>
        </div>
      </div>

    </>
  );
};

export default Home;
