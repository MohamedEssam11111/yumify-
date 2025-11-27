import axios from "axios";

const BASE_URL = "http://localhost:5000/api/user/";

const userAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json", // default
  },
  withCredentials: true, // Include cookies in requests
});

// Add response interceptor to handle 401 errors gracefully
userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently handle 401 errors (expected when user is not authenticated)
    // Don't log these to console as they're expected behavior
    if (error.response?.status === 401) {
      // Suppress the error message for 401 responses
      // Components can still catch this error in their .catch() handlers
      error.suppressLog = true;
      return Promise.reject(error);
    }
    // For other errors, log them
    if (!error.suppressLog) {
      console.error("API Error:", error);
    }
    return Promise.reject(error);
  }
);

export default userAPI;