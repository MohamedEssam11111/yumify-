import { ArrowLeft, ShoppingCartIcon, Star, Clock , Send } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import Review from "../components/review";
import foodAPI from "../apis/food.api";
import cartApi from "../apis/cart.api";
const FileDetails = () => {
  const [counter, setCounter] = useState(1);
  const [request, setRequest] = useState("");
  const [foodDetails, setFoodDetails] = useState(null);
  const [randomFoods, setRandomFoods] = useState([]);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const navigator = useNavigate();
  const foodId = useParams().foodid;
  useLayoutEffect(() => {
    foodAPI
      .get(`/get/${foodId}`)
      .then((response) => {
        setFoodDetails(response.data);
        console.log("Food details:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching food details:", error);
      });
  }, [foodId]);
  useLayoutEffect(() => {
    foodAPI
      .get(`/random-products`)
      .then((response) => {
        setRandomFoods(response.data);
        console.log("Random foods:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching random foods:", error);
      });
  }, []);
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Left Side: Back Arrow and Logo */}
            <div className="flex items-center gap-4">
              <button
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => navigator("/")}
                aria-label="Back to Menu"
              >
                {/* Lucide icon: arrow-left */}
                <ArrowLeft />
              </button>
              <span className="font-poppins text-2xl font-bold text-orange-brand">
                Yumify
              </span>
            </div>

            {/* Right Side: Cart and Profile */}
            <div className="flex items-center gap-4">
              <button
                className="relative text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => {
                  navigator("/cart");
                }}
                aria-label="Open Cart"
              >
                {/* Lucide icon: shopping-cart */}
                <ShoppingCartIcon />
                {/* High contrast badge: Orange bg, dark text */}
                <span
                  id="cart-badge"
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-brand text-gray-900 text-xs font-bold transition-all duration-300 transform scale-0"
                >
                  0
                </span>
              </button>
              <button
                className="h-10 w-10 p-1 rounded-full hover:ring-2 hover:ring-gray-300 transition-all"
                onClick={() => {
                  navigator("/profile");
                }}
                aria-label="Open Profile"
              >
                <img
                  src='http://localhost:5000/uploads/users/def.svg'
                  alt="Profile Avatar"
                  className="h-full w-full object-cover"
                />
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16">
          {/* Left Column: Food Image */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square w-[full] overflow-hidden rounded-3xl shadow-xl">
              <img
                src={
                  foodDetails
                    ? `http://localhost:5000/uploads/foods/${foodDetails.imageUrl}`
                    : "https://via.placeholder.com/400"
                }
                alt={foodDetails?.name || "Food Item"}
                className="h-full w-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <h1 className="font-poppins text-4xl font-bold text-gray-900 mb-3">
              {foodDetails?.name}
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 mb-4">
              {foodDetails?.description}
            </p>

            {/* Rating and Time */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                id="rating-link"
                className="flex items-center gap-2"
                aria-label="Scroll to reviews"
              >
                <div className="flex text-yellow-400">
                  {/* Lucide icon: star (filled) */}
                  {[...Array(5)].map((_, index) => {
  return (
    <Star
      key={index}
      onClick={() => setRating(index + 1)}
      onMouseEnter={() => setHovered(index + 1)}
      onMouseLeave={() => setHovered(rating)}
      className={`cursor-pointer transition 
        ${(index + 1) <= (hovered || rating) ? "fill-yellow-400 text-yellow-400" : "fill-none text-gray-400"}
      `}
      size={24}
    />
  );
})}

                </div>
                <span className="text-gray-600 font-medium hover:underline">
                  ({foodDetails?.reviews?.length || "no"} Reviews)
                </span>
              </button>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {/* Lucide icon: clock */}
                <Clock />
                Ready in 15–20 mins
              </span>
            </div>

            {/* Price */}
            <p className="font-poppins text-5xl font-bold text-brand-orange mb-6">
              ${foodDetails?.price || "not available"}
            </p>

            {/* Divider */}
            <hr className="border-gray-200 mb-6" />

            {/* Ingredients (What it comes with) */}
            {foodDetails && foodDetails.ingredients !== null || foodDetails?.ingredients?.length > 0 && (
              <>
                <h3 className="text-xl font-poppins font-bold text-gray-800 mb-3">
              Ingredients
            </h3>
            <div className="flex flex-wrap gap-3 mb-6">
              {foodDetails?.ingredients?.map((ingredient, index) => (
                <span
                  key={index}
                  className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  {ingredient}
                </span>
              ))}
            </div>
              </>
            )}

            {/* Special Request */}
            <label
              for="special-request"
              className="text-xl font-poppins font-bold text-gray-800 mb-3"
            >
              Add a note or special request:
            </label>

            <textarea
              id="special-request"
              rows="3"
              className="w-full rounded-2xl border-2 border-gray-300 p-4 text-gray-700 bg-white transition-all resize-none 
                           hover:border-orange-brand 
                           focus:border-orange-brand focus:outline-none focus:ring-0"
              placeholder="No onions, extra cheese, etc."
              value={request}
              onChange={(e)=>{setRequest(e.target.value)}}
            ></textarea>

            {/* Spacer to push button to bottom on desktop */}
            <div className="flex-grow"></div>

            {/* Action Row: Quantity and Add to Cart */}
            <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
              {/* Quantity Selector */}
              <div className="flex h-16 w-full md:w-auto items-center justify-between rounded-2xl bg-gray-100 p-2 shadow-inner">
                <button
                  id="qty-minus"
                  onClick={() => {
                    if(counter==1) return;  
                    setCounter((prev) => prev - 1);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-3xl font-bold text-orange-brand shadow transition-all active:scale-90"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  id="qty-input"
                  type="number"
                  value={counter}
                  onChange={(e)=>{
                    if(e.target.value>25 || e.target.value<1 ) return;
                    setCounter(Number(e.target.value));
                  }}
                  className="h-full w-16 border-none bg-transparent text-center text-2xl font-bold text-gray-900 focus:ring-0 focus:outline-none"
                  aria-label="Current quantity"
                />
                <button
                  id="qty-plus"
                  onClick={() => {
                    if(counter==25) return;  
                    setCounter((prev) => prev + 1);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-3xl font-bold text-orange-brand shadow transition-all active:scale-90"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id="add-to-cart-btn"
                onClick={()=>{cartApi.post('/addToCart',{
                  foodId:foodDetails._id,
                  quantity:counter,
                  request:request
                }).then((res)=>{
                    console.log("Added to cart:",res.data);
                  
                  }).catch((err)=>{
                    console.error("Error adding to cart:",err);
                  });
                }}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-brand-orange to-brand-darkOrange px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:from-orange-brand-dark hover:to-orange-brand-darker active:scale-95"
              >
                {/* Lucide icon: shopping-cart */}
                <ShoppingCartIcon />
                <span id="add-to-cart-text">Add to Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. Additional Sections */}
        <div className="mt-16 md:mt-24">
          {/* Recommended Items */}
          <section className="mb-16">
            <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {randomFoods.map((food) => (
                <div key={food._id} className="group relative my-4" onClick={()=>navigator(`/food/${food._id}`)}>
                  <div className="aspect-h-1 aspect-w-1 h-full w-full overflow-hidden rounded-2xl bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80 transition-all">
                    <img
                      src={`http://localhost:5000/uploads/foods/${food.imageUrl}`}
                      alt={`${food.name}`}
                      className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        <a href="#" className="hover:underline">
                          {food.name}
                        </a>
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {food.description}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-orange-brand">
                      {" "}
                      ${food.price}{" "}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          {/* Customer Reviews */}
          <section id="reviews">
            <h2 className="font-poppins text-3xl font-bold text-gray-900 mb-6">
              What People Are Saying
            </h2>
            {/* TextArea to add review */}
            <textarea
              name="NewReview"
              id="NewRevieww"
              rows="3"
              className="w-full rounded-2xl border-2 border-gray-300 p-4 text-gray-700 bg-white transition-all resize-none 
                           hover:border-orange-brand 
                           focus:border-orange-brand focus:outline-none focus:ring-0"
              placeholder={
                foodDetails?.reviews.length !== 0
                  ? "open to Share your thoughts?"
                  : "Be the first Review for this product?"
              }
            ></textarea>
            <div className="space-y-6">
              {foodDetails?.reviews?.length > 0 ? (
                foodDetails.reviews.map((review) => (
                  <Review key={review._id} reviewObj={review} />
                ))
              ) : (
                <p className="text-gray-600">
                  No reviews yet. Be the first to review this item!
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default FileDetails;
