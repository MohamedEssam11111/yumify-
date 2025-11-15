import { useState } from "react";
import cartAPI from "../apis/cart.api";

const CartItem = ({ item ,setCart}) => {
  const itemTotal = item.food.price * item.quantity;
  const [counter, setCounter] = useState(item.quantity);

  return (
    <div className="flex items-center justify-between py-4 border-b">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={`http://localhost:5000/uploads/foods/${item.food.imageUrl}`}
            alt={item.food.name}
            className={`w-full h-full object-cover`}
          />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{item.food.name}</h3>
          {console.log("Foood item", item.food)}
          <p className="text-sm text-gray-500">Price: $ {item.food.price} </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => {
              setCounter((prev) => prev - 1);
              cartAPI.post(`/addToCart`, { foodId: item.food._id, quantity: -1 , request: item.request });
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-lg"
          >
            -
          </button>
          <span className="p-2 text-lg font-medium">{counter}</span>
          <button
            onClick={() => {
              setCounter((prev) => prev + 1);
              cartAPI.post(`/addToCart`, { foodId: item.food._id, quantity: 1 , request: item.request });
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-lg"
          >
            +
          </button>
        </div>
        <span className="text-lg font-semibold w-20 text-right">
          ${itemTotal.toFixed(2)}
        </span>
        <button onClick={() => cartAPI.post(`/removeFromCart`,{foodId: item.food._id})
        .then((res) => setCart(res.data))} className="text-gray-400 hover:text-red-500 ml-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
