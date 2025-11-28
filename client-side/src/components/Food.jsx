import { useNavigate } from "react-router";
import { Heart, ShoppingCart, ChefHat } from "lucide-react";
import cartAPI from "../apis/cart.api";
import userAPI from "../apis/user.api";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const Food = ({ foodObj, userFavs, setCart }) => {
  const { darkMode } = useTheme();
  const [favFoods, setFavFoods] = useState(userFavs || []);
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const navigator = useNavigate();

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      Starter: "Starter",
      MainDish: "Main Dish",
      Appetizer: "Appetizer",
      Dessert: "Dessert",
      Drink: "Drink",
    };
    return categoryMap[category] || category;
  };

  const handleToggleFavorite = async (e) => {
    e.stopPropagation();
    try {
      if (favFoods?.includes(foodObj?._id)) {
        await userAPI.post("/toggleFavourites", { foodId: foodObj?._id });
        toast.success("Removed from favorites");
        setFavFoods((prev) => prev?.filter((id) => id !== foodObj?._id));
      } else {
        await userAPI.post("/toggleFavourites", { foodId: foodObj?._id });
        toast.success("Added to favorites");
        setFavFoods((prev) => [...prev, foodObj?._id]);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorites");
    }
  };

  const handleAddToCart = async (e) => {
    if (e) e.stopPropagation();
    try {
      await cartAPI.post("/addToCart", { foodId: foodObj._id, quantity: 1 });

      setCart((prev) => {
        if (!prev || !prev.items) {
          return {
            items: [
              {
                food: foodObj,
                quantity: 1,
              },
            ],
          };
        }

        const exists = prev.items.find((item) => item.food._id === foodObj._id);

        if (exists) {
          return {
            ...prev,
            items: prev.items.map((item) =>
              item.food._id === foodObj._id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          };
        } else {
          return {
            ...prev,
            items: [
              ...prev.items,
              {
                food: foodObj,
                quantity: 1,
              },
            ],
          };
        }
      });

      toast.success(`${foodObj?.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    }
  };


  return (
    <div
      onClick={() => navigator(`/food/${foodObj._id}`)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-2xl overflow-hidden shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-2 
      ${darkMode ? "bg-[#071226] border border-white/5" : "bg-white"}`}
    >
      {/* Image Container */}
      <div className="relative rounded-2xl h-64 overflow-hidden">
        <img
          className={`w-full h-full rounded-2xl object-cover transition-transform duration-500 ${
            isHovered ? "scale-110" : "scale-100"
          }`}
          src={
            imageError
              ? "https://placehold.co/400x300?text=Food+Image"
              : `http://localhost:5000/uploads/foods/${foodObj.imageUrl}`
          }
          alt={foodObj.name}
          onError={() => setImageError(true)}
        />

        {/* Hover Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
        />

        {/* Category Badge */}
        {foodObj?.category && (
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm 
              ${
                darkMode
                  ? "bg-gray-800/80 text-orange-300"
                  : "bg-white/90 text-orange-600"
              }`}
            >
              <ChefHat className="w-3 h-3" />
              {getCategoryDisplayName(foodObj.category)}
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full backdrop-blur-sm transition-all duration-200 shadow-lg 
            ${
              darkMode
                ? "bg-gray-800/80 hover:bg-gray-700/90"
                : "bg-white/90 hover:bg-white"
            } hover:scale-110 active:scale-95`}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 
            ${
              favFoods?.includes(foodObj?._id)
                ? "fill-red-500 text-red-500 scale-110"
                : darkMode
                ? "text-gray-300 hover:text-red-400"
                : "text-gray-400 hover:text-red-500"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className={`p-5  ${darkMode ? "bg-[#071226]" : "bg-white"}`}>
        <h3
          className={`text-xl flex flex-col  font-bold mb-2 line-clamp-1 ${
            darkMode ? "text-gray-100" : "text-gray-900"
          }`}
        >
          <span>{foodObj?.name}</span>
          <span className=" text-gray-400 text-xs" >{foodObj?.restaurant.name}</span>
        </h3>

        <p
          className={`text-sm mb-4 line-clamp-2 h-10 ${
            darkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {foodObj?.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span
            className={`text-2xl font-bold ${
              darkMode ? "text-orange-400" : "text-orange-500"
            }`}
          >
            ${foodObj?.price?.toFixed(2)}
          </span>

          <button
            onClick={handleAddToCart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg bg-orange-500 hover:bg-orange-600"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Food;
