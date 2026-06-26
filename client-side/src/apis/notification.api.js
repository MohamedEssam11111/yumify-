import axios from "axios";

const notificationAPI = axios.create({
  baseURL: `${
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  }/api/notifications`,
  withCredentials: true,
});

notificationAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Notification API Error:", error);
    return Promise.reject(error);
  },
);

export default notificationAPI;
