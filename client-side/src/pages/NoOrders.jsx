import { useNavigate } from "react-router";

export default function NoOrders() {
  const navigator = useNavigate();
  return (
    <div className="bg-orange-50 min-h-screen flex items-center justify-center font-poppins p-4">
      <div className="text-center bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Chef Illustration */}
        <div className="mb-2">
            <img src="/public/Cheif.png" alt="Chef Illustration" className="mx-auto w-40 h-40" />
        </div>

        {/* Text Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          You have no orders yet...
        </h2>
        <p className="text-gray-600 mb-6">
          Your shopping cart looks empty. Let's fill it with some delicious
          dishes!
        </p>

        {/* Button */}
        <button
         className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-full text-lg shadow-lg transition duration-300"
         onClick={()=>{navigator('/')}}
         >
          Start Ordering
        </button>
      </div>
    </div>
  );
}
