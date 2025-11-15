import axios from "axios";

const BASE_URL = "http://localhost:5000/api/cart/";


const cartAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
   withCredentials: true, // Include cookies for authentication}
});

export default cartAPI;