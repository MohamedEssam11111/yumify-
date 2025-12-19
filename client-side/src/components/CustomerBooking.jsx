import { useEffect, useState } from "react";
import Button from "./Button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import bookingAPI from "../apis/booking.api";
import restaurantAPI from "../apis/restaurant.api";

const CustomerBooking = () => {
  const [restaurants, setRestaurants] = useState([]);

  const [bookData, setBookData] = useState({
    restaurandId: "",
    date: null,
    time: "05:00",
    peopleNumber: 1,
    tableLocation: "Any Available",
  });
  const postBooking = async (newBooking) => {
    try {
      const res = await bookingAPI.post("/create", newBooking);
      console.log(res);
      console.log("created booking", res.data);
    } catch (error) {
      console.log("error in creating newBooking", error);
    }
  };

  useEffect(() => {
    restaurantAPI
      .get("/")
      .then((response) => {
        setRestaurants(response.data);
        console.log("Restaurants API response:", response.data);
        console.log("First restaurant:", response.data[0]);
      })
      .catch((error) => {
        console.error("Error fetching restaurants:", error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedDate = bookData.date
      ? bookData.date.toLocaleDateString("en-CA") // YYYY-MM-DD
      : null;

    const payload = {
      restaurant: bookData.restaurandId,
      date: formattedDate,
      time: bookData.time,
      numberOfGuests: bookData.peopleNumber,
      locationPreference: bookData.tableLocation,
    };

    console.log("Booking payload:", payload);
    postBooking(payload);
    alert("Your table has been booked!");
  };

  // useEffect(() => {
  //   console.log("bookData changed:", bookData);
  // }, [bookData.date]);

  const handleDate = (field, value) => {
    setBookData((prev) => ({ ...prev, [field]: value }));
  };
  return (
    <div className="w-[500px] rounded-[12px] p-[25px_30px_25px_30px]  flex flex-col justify-center items-center bg-white text-[15px] border-[3px] border-solid border-[#FFBE86] rounded-[8px] shadow-md p-[40px] max-xs:p-[13px] max-sm:w-[80%]">
      <h2 className="text-[2.3em] mb-[5px] font-serif font-bold text-gray-800 max-sm:text-[25px]">
        Book a Table
      </h2>
      <p className="text-[1em] mb-[15px] font-[500] text-[#707785] text-center w-[350px] max-sm:text-[15px] max-sm:w-auto ">
        Reserve your spot for an unforgettable dining experience.
      </p>
      {/* prettier-ignore */}
      <form onSubmit={handleSubmit} action="" className=" flex flex-col gap-[15px] w-[100%] mt-[10px]">

        {/* restaurant name chose */}
        <select
          required
          name="restaurandId"
          id="restaurandId"
          value={bookData.restaurandId || ""}   // controlled select
          onChange={(e) =>
            setBookData({ ...bookData, restaurandId: e.target.value })
          }
          className="w-[100%] h-[50px] rounded-[5px] border border-[2px] text-[1.07em] pl-[10px] max-sm:text-[12px] max-sm:h-[40px]"
        >
          <option value="" disabled>
            Select a restaurant
          </option>

          {restaurants.map((restaurant) => (
            <option key={restaurant._id} value={restaurant._id}>
              {restaurant.name}
            </option>
          ))}
        </select>


          {/* date and time */}

        <div className="flex gap-[10px] mt-[5px] text-[15px]">
          <div className="flex flex-col flex-1">
            <label htmlFor="data" className="text-[0.9em] block text-sm font-medium text-gray-700 max-sm:text-[12px]">Data</label>
            <DatePicker
            required
            id="date"
            selected={bookData.date}
            onChange={(newDate) => handleDate("date",newDate)}
            placeholderText="mm-dd-yyyy"
            className="h-[50px] rounded-[5px] border border-[2px] text-[1.07em] pl-[10px] max-sm:text-[12px] max-sm:h-[40px]"
            dateFormat="MM-dd-yyyy"
            isClearable
            todayButton="Today"
            />
          </div>

          {/* set the time */}

          <div className="flex flex-col flex-1">
            <label htmlFor="time" className="text-[0.9em] block text-sm font-medium text-gray-700 max-sm:text-[12px]">Time</label>
                <select
                  id="time"
                  name="time"
                  value={bookData.time}
                  onChange={(e)=>setBookData({...bookData ,time:e.target.value})}
                  className="h-[50px] rounded-[5px] border border-[2px] text-[1.07em] pl-[10px] max-sm:text-[12px] max-sm:h-[40px]"
                  required
                >
                  <option value="05:00" selected>05:00</option>
                  <option value="05:30">05:30</option>
                  <option value="06:00">06:00</option>
                  <option value="06:30">06:30</option>
                  <option value="07:00">07:00</option>
                  <option value="07:30">07:30</option>
                  <option value="08:00">08:00</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  </select>
          </div>
        </div>

        {/* counter and location */}

        <div className="flex gap-[10px] mt-[5px] text-[15px]">
          <div className="flex flex-col flex-1">
            <span className="text-[12px] block text-[0.9em] font-medium text-gray-700">Number of People</span>

            <div className="h-[50px] rounded-[5px] border border-[2px] text-[1.07em]  flex justify-between items-center p-[0px_10px_0px_10px] max-sm:h-[40px]">
              <button
                onClick={() => {
                  if (bookData.peopleNumber > 1) 
                    setBookData((prev)=>({...prev,peopleNumber: prev.peopleNumber-1}));
                }}
                className="text-[25px] text-prim p-[0px_10px_0px_10px] h-[90%] rounded-[8px] hover:bg-[#FFEDD5]"
                type="button"
              >
                -
              </button>
              <p className="text-[17px] font-[900] max-sm:text-[14px]">{bookData.peopleNumber}</p>
              <button
                onClick={() => {
                  if (bookData.peopleNumber < 10)
                    setBookData((prev)=>({...prev,peopleNumber: prev.peopleNumber+1}));
                }}
                className="text-[25px] text-prim p-[0px_10px_0px_10px] h-[90%]  rounded-[8px] hover:bg-[#FFEDD5]"
                type="button"
              >
                +
              </button>
            </div>
          </div>

          {/* select the location */}

          <div className="flex flex-col flex-1 mb-[15px] text-[15px]">
            <label className="text-[0.9em] block  font-medium text-gray-700 max-sm:text-[12px]" htmlFor="tableLocation">Table Location</label>
            <select
              required
              name="tableLocation"
              id="tableLocation"
              value={bookData.tableLocation}
              onChange={(e) => setBookData({...bookData ,tableLocation: e.target.value})}
              className="h-[50px] rounded-[5px] border border-[2px] text-[1.07em] pl-[10px] max-sm:text-[12px] max-sm:h-[40px]"
            >
              <option value="Any Available" selected>
                Any Available
              </option>
              <option value="Window">Window</option>
              <option value="Outdoor">Outdoor</option>
              <option value="Private Room">Private Room</option>
            </select>
          </div>
        </div>

        <Button
         buttonText={"Book Table"} fontSize="text-[15px]" height="h-[43px]"/>
      </form>
    </div>
  );
};

export default CustomerBooking;
