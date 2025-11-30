import { useState, useEffect } from "react";
import ownerApi from "../apis/client.js";

import { 
  Star
} from "lucide-react";

// Primary accent color: #FF7A18
const PRIMARY_COLOR = "#FF7A18";

/**
 * Feedback Page
 * Displays customer feedback and reviews
 */
const Feedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const reviews = await ownerApi.getFeedback();
      setFeedback(reviews || []);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderStars = (rating) => {
    return "⭐".repeat(Math.max(0, Math.min(5, rating || 0)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-300">Loading feedback...</div>
      </div>
    );
  }

  console.log("Feedback:", feedback);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Feedback</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Reviews and feedback from customers</p>
      </div>

      {/* Feedback List */}
      {feedback.length === 0 ? (
        <div className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-12 text-center">
          <p className="text-gray-500 dark:text-gray-300 text-lg">No feedback yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-[#071826] rounded-lg shadow-sm border border-gray-200 dark:border-[#23303a] p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {review.customerName}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-lg mb-1">{renderStars(review.rating)}</div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              {review.comment && (
                <p className="text-gray-700 dark:text-gray-200">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Feedback;
