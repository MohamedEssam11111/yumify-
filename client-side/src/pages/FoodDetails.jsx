import { ArrowLeft, ShoppingCartIcon, Star, Clock, Send } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Review from "../components/review";
import foodAPI from "../apis/food.api";
import cartApi from "../apis/cart.api";
import reviewAPI from "../apis/review.api";
import userAPI from "../apis/user.api";
import toast from "react-hot-toast";

const FoodDetails = () => {
  const [counter, setCounter] = useState(1);
  const [request, setRequest] = useState("");
  const [foodDetails, setFoodDetails] = useState(null);
  const [randomFoods, setRandomFoods] = useState([]);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewComment, setReviewComment] = useState("");
  const [userData, setUserData] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const navigator = useNavigate();
  const foodId = useParams().foodid;

  // Fetch user data
  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res?.data || null))
      .catch(() => setUserData(null));
  }, []);

  // Fetch food details
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

  // Fetch random foods
  useLayoutEffect(() => {
    foodAPI
      .get(`/random-products`)
      .then((response) => {
        setRandomFoods(response.data || []);
        console.log("Random foods:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching random foods:", error);
      });
  }, []);

  // Fetch reviews for this food item
  useLayoutEffect(() => {
    if (!foodId) return;
    
    reviewAPI
      .get(`/food/${foodId}`)
      .then((response) => {
        setReviews(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching reviews:", error);
        setReviews([]);
      });
  }, [foodId]);

  // Handle review submission
  const handleSubmitReview = async () => {
    if (!userData) {
      toast.error("Please login to submit a review");
      navigator("/login");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewComment.trim()) {
      toast.error("Please write a comment");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const response = await reviewAPI.post("/add", {
        foodId: foodId,
        restaurantId: foodDetails?.restaurant?._id || foodDetails?.restaurant,
        rating: rating,
        comment: reviewComment.trim(),
      });

      setReviews([response.data, ...reviews]);
      
      setReviewComment("");
      setRating(0);
      setHovered(0);

      toast.success("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      const errorMsg = error.response?.data?.message || "Failed to submit review";
      toast.error(errorMsg);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    if (!userData) {
      toast.error("Please login to add items to cart");
      navigator("/login");
      return;
    }

    cartApi
      .post("/addToCart", {
        foodId: foodDetails._id,
        quantity: counter,
        request: request,
      })
      .then((res) => {
        console.log("Added to cart:", res.data);
        toast.success("Added to cart successfully!");
      })
      .catch((err) => {
        console.error("Error adding to cart:", err);
        toast.error("Failed to add to cart");
      });
  };
  console.log("Food details:", foodDetails);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#071018]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-sm">
        <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className="text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => navigator("/")}
                aria-label="Back to Menu"
              >
                <ArrowLeft />
              </button>
              <span className="font-poppins text-2xl font-bold text-orange-500 dark:text-orange-400">
                Yumify
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                className="relative text-gray-600 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white transition-colors"
                onClick={() => navigator("/cart")}
                aria-label="Open Cart"
              >
                <ShoppingCartIcon />
                
              </button>
              <button
                className="h-10 w-10 p-1 rounded-full hover:ring-2 hover:ring-gray-300 dark:hover:ring-gray-700 transition-all"
                onClick={() => navigator("/profile")}
                aria-label="Open Profile"
              >
                <img
                  src={
                    userData?.imageUrl
                      ? `http://localhost:5000/uploads/users/${userData.imageUrl}`
                      : "http://localhost:5000/uploads/users/def.svg"
                  }
                  alt="Profile Avatar"
                  className="h-full w-full object-cover rounded-full"
                />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Left Column: Food Image */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-gray-100 dark:bg-[#0b1420]">
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

          {/* Right Column: Food Details */}
          <div className="flex flex-col">
            <h1 className="font-poppins text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {foodDetails?.name || "Loading..."}
            </h1>

            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
              {foodDetails?.description || ""}
            </p>

            {/* Rating and Time */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <button
                className="flex items-center gap-2"
                aria-label="Scroll to reviews"
                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              >
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`${index < (foodDetails?.rating || 0) ? "fill-yellow-400" : "fill-none"} text-yellow-400`}
                      size={20}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium hover:underline">
                  ({reviews.length} {reviews.length === 1 ? "Review" : "Reviews"})
                </span>
              </button>
              <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">|</span>
              <span className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-[#0f1724] px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock size={16} />
                Ready in 15–20 mins
              </span>
            </div>

            {/* Price */}
            <p className="font-poppins text-4xl md:text-5xl font-bold text-orange-500 dark:text-orange-400 mb-6">
              ${foodDetails?.price || "N/A"}
            </p>

            <hr className="border-gray-200 dark:border-gray-800 mb-6" />

            {/* Ingredients */}
            {foodDetails?.ingredients && foodDetails.ingredients.length > 0 && (
              <>
                <h3 className="text-lg md:text-xl font-poppins font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {foodDetails.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-gray-100 dark:bg-[#0f1724] px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </>
            )}

            {/* Special Request */}
            <label
              htmlFor="special-request"
              className="text-lg md:text-xl font-poppins font-bold text-gray-800 dark:text-gray-100 mb-3"
            >
              Add a note or special request:
            </label>

            <textarea
              id="special-request"
              rows="3"
              className="w-full rounded-2xl border-2 border-gray-200 dark:border-[#25313a] p-4 text-gray-700 dark:text-gray-100 bg-white dark:bg-[#0b1420] transition-all resize-none hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-0 mb-6"
              placeholder="No onions, extra cheese, etc."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            ></textarea>

            {/* Action Row: Quantity and Add to Cart */}
            <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Quantity Selector */}
              <div className="flex h-14 sm:h-16 items-center justify-between rounded-2xl bg-gray-100 dark:bg-[#0b1420] p-2 shadow-sm">
                <button
                  onClick={() => {
                    if (counter === 1) return;
                    setCounter((prev) => prev - 1);
                  }}
                  className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-white dark:bg-[#0f1724] text-2xl sm:text-3xl font-bold text-orange-500 shadow transition-all hover:bg-gray-50 dark:hover:bg-[#15202b] active:scale-90"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  type="number"
                  value={counter}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 25 || val < 1) return;
                    setCounter(val);
                  }}
                  className="h-full w-16 border-none bg-transparent text-center text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none"
                  aria-label="Current quantity"
                />
                <button
                  onClick={() => {
                    if (counter === 25) return;
                    setCounter((prev) => prev + 1);
                  }}
                  className="flex h-10 sm:h-12 w-10 sm:w-12 items-center justify-center rounded-xl bg-white dark:bg-[#0f1724] text-2xl sm:text-3xl font-bold text-orange-500 shadow transition-all hover:bg-gray-50 dark:hover:bg-[#15202b] active:scale-90"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="flex h-14 sm:h-16 flex-1 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 sm:px-8 py-4 text-lg sm:text-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 active:scale-95"
              >
                <ShoppingCartIcon size={20} />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-16 md:mt-24">
          {/* Recommended Items */}
          <section className="mb-16">
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {randomFoods.map((food) => (
                <div
                  key={food._id}
                  className="group relative cursor-pointer"
                  onClick={() => navigator(`/food/${food._id}`)}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#0b1420] group-hover:opacity-75 transition-all">
                    <img
                      src={`http://localhost:5000/uploads/foods/${food.imageUrl}`}
                      alt={food.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="mt-3 flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 truncate">
                        {food.name}
                      </h3>
                      <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {food.description}
                      </p>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-orange-500 dark:text-orange-400 whitespace-nowrap">
                      ${food.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Customer Reviews */}
          <section id="reviews">
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              What People Are Saying
            </h2>

            {/* Add Review Form */}
            <div className="mb-8 p-4 sm:p-6 bg-white dark:bg-[#0b1420] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Your Rating:</span>
                <div className="flex">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      onClick={() => setRating(index + 1)}
                      onMouseEnter={() => setHovered(index + 1)}
                      onMouseLeave={() => setHovered(rating)}
                      className={`cursor-pointer transition ${
                        index + 1 <= (hovered || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-none text-gray-400 dark:text-gray-600"
                      }`}
                      size={24}
                    />
                  ))}
                </div>
              </div>

              <textarea
                name="NewReview"
                id="NewReview"
                rows="4"
                className="w-full rounded-2xl border-2 border-gray-200 dark:border-[#25313a] p-4 text-gray-700 dark:text-gray-100 bg-white dark:bg-[#071018] transition-all resize-none hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-0 mb-4"
                placeholder={
                  reviews.length === 0
                    ? "Be the first to review this product!"
                    : "Share your thoughts about this dish..."
                }
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              ></textarea>

              <button
                onClick={handleSubmitReview}
                disabled={isSubmittingReview}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-orange-500 text-white text-base sm:text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 sm:space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Review key={review._id} reviewObj={review} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8 text-sm sm:text-base">
                  No reviews yet. Be the first to review this item!
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default FoodDetails;