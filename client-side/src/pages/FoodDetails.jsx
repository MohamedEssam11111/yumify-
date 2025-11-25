import { ArrowLeft, ShoppingCartIcon, Star, Clock, Send } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import Review from "../components/review";
import foodAPI from "../apis/food.api";
import cartApi from "../apis/cart.api";
import reviewAPI from "../apis/review.api"; // You'll need to create this
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
    
    // Using the review API route: GET /api/reviews/food/:foodId
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
      // POST /api/reviews/add
      const response = await reviewAPI.post("/add", {
        foodId: foodId,
        restaurantId: foodDetails?.restaurant?._id || foodDetails?.restaurant,
        rating: rating,
        comment: reviewComment.trim(),
      });

      // Add new review to the beginning of the list
      setReviews([response.data, ...reviews]);
      
      // Reset form
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

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 ow-sm">
        <nav className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 dark:bg-[#071820]">
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
                <span
                  id="cart-badge"
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold"
                >
                  0
                </span>
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

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10 dark:bg-gray-950/95">
        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-16 ">
          {/* Left Column: Food Image */}
          <div className="mb-8 lg:mb-0">
            <div className="aspect-square w-full overflow-hidden rounded-3xl shadow-xl bg-gray-50 dark:bg-[#0b1420]">
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
            <h1 className="font-poppins text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              {foodDetails?.name || "Loading..."}
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {foodDetails?.description || ""}
            </p>

            {/* Rating and Time */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                id="rating-link"
                className="flex items-center gap-2"
                aria-label="Scroll to reviews"
                onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
              >
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={`${index < (foodDetails?.rating || 0) ? "fill-yellow-400" : "fill-none"} text-yellow-400 dark:text-yellow-400`}
                      size={20}
                    />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-300 font-medium hover:underline">
                  ({reviews.length} {reviews.length === 1 ? "Review" : "Reviews"})
                </span>
              </button>
              <span className="text-gray-400 hidden sm:inline">|</span>
              <span className="flex items-center gap-2 rounded-full bg-gray-100 dark:bg-[#0f1724] px-3 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Clock size={16} />
                Ready in 15–20 mins
              </span>
            </div>

            {/* Price */}
            <p className="font-poppins text-5xl font-bold text-orange-500 dark:text-orange-400 mb-6">
              ${foodDetails?.price || "N/A"}
            </p>

            <hr className="border-gray-200 dark:border-[rgba(255,255,255,0.04)] mb-6" />

            {/* Ingredients - Only show if there are ingredients */}
            {foodDetails?.ingredients && foodDetails.ingredients.length > 0 && (
              <>
                <h3 className="text-xl font-poppins font-bold text-gray-800 dark:text-gray-100 mb-3">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-3 mb-6">
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
              className="text-xl font-poppins font-bold text-gray-800 dark:text-gray-100 mb-3"
            >
              Add a note or special request:
            </label>

            <textarea
              id="special-request"
              rows="3"
              className="w-full rounded-2xl border-2 border-gray-300 dark:border-[#25313a] p-4 text-gray-700 dark:text-gray-100 bg-white dark:bg-[#071826] transition-all resize-none hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-0"
              placeholder="No onions, extra cheese, etc."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
            ></textarea>

            <div className="flex-grow"></div>

            {/* Action Row: Quantity and Add to Cart */}
            <div className="mt-8 flex flex-col md:flex-row items-center gap-6">
              {/* Quantity Selector */}
              <div className="flex h-16 w-full md:w-auto items-center justify-between rounded-2xl bg-gray-100 dark:bg-[#071826] p-2 shadow-inner">
                <button
                  id="qty-minus"
                  onClick={() => {
                    if (counter === 1) return;
                    setCounter((prev) => prev - 1);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-[#0b1620] text-3xl font-bold text-orange-500 shadow transition-all active:scale-90"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <input
                  id="qty-input"
                  type="number"
                  value={counter}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 25 || val < 1) return;
                    setCounter(val);
                  }}
                  className="h-full w-16 border-none bg-transparent text-center text-2xl font-bold text-gray-900 dark:text-gray-100 focus:ring-0 focus:outline-none"
                  aria-label="Current quantity"
                />
                <button
                  id="qty-plus"
                  onClick={() => {
                    if (counter === 25) return;
                    setCounter((prev) => prev + 1);
                  }}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-[#0b1620] text-3xl font-bold text-orange-500 shadow transition-all active:scale-90"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                id="add-to-cart-btn"
                onClick={handleAddToCart}
                className="flex h-16 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-xl font-bold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:from-orange-600 hover:to-orange-700 active:scale-95"
              >
                <ShoppingCartIcon />
                <span id="add-to-cart-text">Add to Cart</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-16 md:mt-24">
          {/* Recommended Items */}
          <section className="mb-16">
            <h2 className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {randomFoods.map((food) => (
                <div
                  key={food._id}
                  className="group relative cursor-pointer"
                  onClick={() => navigator(`/food/${food._id}`)}
                >
                  <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-[#071826] group-hover:opacity-75 transition-all">
                    <img
                      src={`http://localhost:5000/uploads/foods/${food.imageUrl}`}
                      alt={food.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {food.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {food.description}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-orange-500 dark:text-orange-400">
                      ${food.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Customer Reviews */}
          <section id="reviews">
            <h2 className="font-poppins text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              What People Are Saying
            </h2>

            {/* Add Review Form */}
            <div className="mb-8 p-6 bg-gray-50 dark:bg-[#071826] rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
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
                          : "fill-none text-gray-400 dark:text-gray-500"
                      }`}
                      size={28}
                    />
                  ))}
                </div>
              </div>

              <textarea
                name="NewReview"
                id="NewReview"
                rows="4"
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-[#25313a] p-4 text-gray-700 dark:text-gray-100 bg-white dark:bg-[#071826] transition-all resize-none hover:border-orange-500 focus:border-orange-500 focus:outline-none focus:ring-0 mb-4"
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
                className="flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white text-lg font-bold rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                {isSubmittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Review key={review._id} reviewObj={review} />
                ))
              ) : (
                <p className="text-gray-600 dark:text-gray-400 text-center py-8">
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

export default FoodDetails;
