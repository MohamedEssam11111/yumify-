import axios from "axios";

const BASE_URL = "http://localhost:5000/api/chatbot/";

const chatbotAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

/**
 * Send a message to the chatbot
 * @param {string} message - The user's message
 * @param {Array} history - Optional conversation history
 * @returns {Promise} The chatbot's response
 */
const sendMessage = async (message, history = []) => {
  try {
    const response = await chatbotAPI.post("/message", {
      message,
      history,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending message to chatbot:", error);
    
    // Handle rate limit errors
    if (error.response?.status === 429) {
      const rateLimitError = new Error(
        error.response?.data?.message || "Rate limit exceeded. Please wait before trying again."
      );
      rateLimitError.status = 429;
      rateLimitError.retryAfter = error.response?.data?.retryAfter;
      throw rateLimitError;
    }
    
    throw new Error(
      error.response?.data?.message ||
        "Failed to send message. Please try again later."
    );
  }
};

export default {
  sendMessage,
};

