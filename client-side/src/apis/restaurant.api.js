import axios from "axios";
import API_URL from "../config/api";
const BASE_URL = `${API_URL}/api/restaurants/`;

const restaurantAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

export default restaurantAPI;
