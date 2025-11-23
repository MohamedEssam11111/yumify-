import axios from "axios";

const BASE_URL = "http://localhost:5000/api/reviews/";

const reviewAPI = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, 
});

export default reviewAPI;