import axios from "axios";
import API_URL from "../config/api";

const notificationAPI = axios.create({
  baseURL: `${API_URL}/api/notifications`,
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
