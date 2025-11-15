import { useEffect, useState } from "react";
import userAPI from "../apis/user.api.js";
import Food from "../components/Food.jsx";
import { Link, useNavigate } from "react-router";
import { Heart, Menu, ReceiptTextIcon } from "lucide-react";

const Favorites = () => {
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [userData, setUserData] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const navigator = useNavigate();

  // Fetch logged user
  useEffect(() => {
    userAPI.get("/profile")
      .then((res) => setUserData(res.data))
      .catch(() => setUserData(null));
  }, []);

  // Fetch Favourites
  useEffect(() => {
    userAPI
      .get("/userFavourites")
      .then((res) => {
        setFavourites(res.data.favourites || []);
      })
      .catch((err) => {
        console.log("Error fetching favourites", err);
      });
  }, []);

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`sidebar fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 p-6 flex flex-col transform ${
            !sideBarOpened ? "-translate-x-full" : "translate-x-0"
          } transition-transform duration-300 ease-in-out `}
        >
          <h2 className="font-logo text-4xl text-orange-500 mb-8">Yumify</h2>

          <nav className="flex flex-col space-y-4 text-lg">
            <Link
              to="/"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
                <Menu className="size-5"/>
              <span>Menu</span>
            </Link>

            <Link
              to="/myOrders"
              className="flex items-center space-x-3 p-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
                <ReceiptTextIcon className="size-5"/>
              <span>My Orders</span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center space-x-3 p-2 rounded-lg text-orange-500 font-bold bg-orange-50"
            >
                <Heart className="size-5"/>
              <span>Favorites</span>
            </Link>
          </nav>

          <div className="mt-auto">
            <a
              href="#"
              className="flex items-center space-x-3 p-2 mt-2 rounded-lg text-gray-700 hover:bg-orange-50"
            >
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
          {/* Top Bar */}
          <header className="bg-white/80 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm">
            <button
              onClick={() => setSideBarOpened(!sideBarOpened)}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <h1 className="text-2xl font-bold text-slate-700">Your Favourites</h1>

            <div>
              {userData ? (
                <button
                  onClick={() => navigator("/profile")}
                  className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200"
                >
                  <img
                    src={`http://localhost:5000/uploads/users/${userData.imageUrl}`}
                    alt="Profile Pic"
                    className="rounded-full"
                  />
                </button>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
          </header>

          {/* Favourites Grid */}
          <main className="flex-1 p-6">
            {favourites.length === 0 ? (
              <div className="text-center mt-10 text-slate-500">
                <p className="text-xl font-semibold">You have no favourite dishes yet.</p>
                <p>Start adding some delicious meals!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {favourites.map((food) => (
                  <Food key={food._id} foodObj={food} userFavs={favourites.map(f => f._id)} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`overlay fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out ${
          sideBarOpened ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSideBarOpened(false)}
      ></div>
    </>
  );
};

export default Favorites;
