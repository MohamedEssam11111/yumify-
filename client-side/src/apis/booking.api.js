import axios from "axios";

const BASE_URL = "http://localhost:5000/api/booking/";

// apis endpoints for you to use ya mohammed :)
// GET S
// "/" => gets all bookings
// "/my-bookings" => gets all bookings for logged in user
// "/restaurant/:restaurantId" => gets all bookings for a specific restaurant
// POST
// "/create" => creates a new booking
// PATCH
// "/:bookingId" => updates a booking
// DELETE
// "/:bookingId" => deletes a booking

// NOTE IMPORTANT !!!!!!!
// 1- all of those routes are using the protect middleware  make sure that you're logged in before using them aka have the token in the cookies
// 2- import the api and use it like that : bookingAPI.get("/my-bookings") as exapmple

// BOOKING MODEL
// user refrences to the user model (ID)
// restaurant refrences to the restaurant model (ID)
// date (Date)
// time (String)
// numberOfGuests (Number)
// locationPreference (String)

const bookingAPI = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Include cookies in requests
});

export default bookingAPI;