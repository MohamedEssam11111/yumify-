import axios from "axios";
import API_URL from "../config/api";
const BASE_URL = `${API_URL}/api/orders/`;

const orderAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export default orderAPI;
