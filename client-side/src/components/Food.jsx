import { useNavigate } from "react-router";
import { Heart } from "lucide-react";
import cartAPI from "../apis/cart.api";
import userAPI from "../apis/user.api";
import { useState } from "react";

const Food = ({ foodObj, userFavs, setCart }) => {
  const [favFoods, setFavFoods] = useState(userFavs || []);

  const navigator = useNavigate();
  console.log("userFavs in Food.jsx:", userFavs);
  return (
    <div
      onClick={() => navigator(`/food/${foodObj._id}`)}
      className="food-card rounded-2xl shadow-lg transition-transform hover:translate-y-[-5px] hover:shadow-xl relative cursor-pointer"
    >
      {/* favourite btn */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (favFoods.includes(foodObj._id)) {
            setFavFoods((prev) => prev.filter((id) => id !== foodObj._id));
            userAPI.post("/toggleFavourites", { foodId: foodObj._id });
            return;
          } else {
            setFavFoods((prev) => [...prev, foodObj._id]);
            userAPI.post("/toggleFavourites", { foodId: foodObj._id });
          }
        }}
        className={`absolute top-2 right-2 z-10 bg-white rounded-full  shadow-md hover:shadow-lg transition-shadow `}
      >
        <Heart
          className={`m-4  hover:text-red-500 transition-colors size-7 ${
            favFoods?.includes(foodObj._id)
              ? "fill-red-500 text-red-500"
              : "text-gray-300"
          } `}
        />
      </button>
      <img
        className="w-full h-56 object-cover rounded-t-2xl"
        src={`http://localhost:5000/uploads/foods/${foodObj.imageUrl}`}
        alt={foodObj.name}
      />
      <div className="p-6">
        <h3 className="text-2xl text-slate-900">{foodObj.name}</h3>
        <p className="text-slate-500 mt-2 text-sm">{foodObj.description}</p>
        <div className="flex justify-between items-center mt-5">
          <span className="text-2xl font-bold text-orange-500">
            ${foodObj.price.toFixed(2)}
          </span>
          <button
            className="add-to-cart-btn px-5 py-2 rounded-full font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              cartAPI
                .post("/addToCart", { foodId: foodObj._id, quantity: 1 })
                .then(() => {
                  setCart((prev) => {
                    const exists = prev.items.find(
                      (item) => item.food._id === foodObj._id
                    );

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
                })

                .catch((error) => {
                  console.log(error);
                });
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default Food;
