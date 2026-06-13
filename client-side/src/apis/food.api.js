import axios from "axios";
import API_URL from "../config/api";
const BASE_URL = `${API_URL}/api/foods/`;

const foodAPI = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies in requests
});

export default foodAPI;
