import axios from "axios";
import API_URL from "../config/api";
const BASE_URL = `${API_URL}/api/cart/`;

const cartAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for authentication}
});

export default cartAPI;
