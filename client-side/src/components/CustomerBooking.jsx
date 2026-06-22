import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import bookingAPI from "../apis/booking.api";
import restaurantAPI from "../apis/restaurant.api";
import toast from "react-hot-toast";
import { ChevronDown } from "lucide-react";
import CustomerSidebar from "../components/CustomerSidebar";
import userAPI from "../apis/user.api.js";

const CustomerBooking = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultBookingState = {
    restaurandId: "",
    date: null,
    time: "05:00",
    peopleNumber: 1,
    tableLocation: "Any Available",
  };

  const [bookData, setBookData] = useState(defaultBookingState);

  const postBooking = async (newBooking) => {
    const res = await bookingAPI.post("/create", newBooking);
    return res.data;
  };

  useEffect(() => {
    restaurantAPI
      .get("/")
      .then((response) => {
        setRestaurants(response.data);
      })
      .catch((error) => {
        console.error("Error fetching restaurants:", error);

        toast.error("Failed to load restaurants", {
          duration: 4000,
        });
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    const formattedDate = bookData.date
      ? bookData.date.toLocaleDateString("en-CA")
      : null;

    const payload = {
      restaurant: bookData.restaurandId,
      date: formattedDate,
      time: bookData.time,
      numberOfGuests: bookData.peopleNumber,
      locationPreference: bookData.tableLocation,
    };

    try {
      setIsSubmitting(true);

      await postBooking(payload);

      toast.success("🎉 Table booked successfully! See you soon.", {
        duration: 5000,
      });

      setBookData(defaultBookingState);
    } catch (error) {
      console.log(error);

      const errorMessage =
        error?.response?.data?.message ||
        "Unable to complete your reservation. Please try again.";

      toast.error(`❌ ${errorMessage}`, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDate = (field, value) => {
    setBookData((prev) => ({ ...prev, [field]: value }));
  };

  const restaurantOptions = restaurants.map((restaurant) => ({
    value: restaurant._id,
    label: `🍽️ ${restaurant.name}`,
  }));

  const locationOptions = [
    { value: "Any Available", label: "🍽️ Any Available" },
    { value: "Window", label: "🪟 Window" },
    { value: "Outdoor", label: "🌳 Outdoor" },
    { value: "Private Room", label: "🔒 Private Room" },
  ];

  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "52px",
      borderRadius: "16px",
      border: state.isFocused ? "2px solid #FF7A18" : "2px solid #E5E7EB",
      boxShadow: state.isFocused ? "0 0 0 4px rgba(255,122,24,0.15)" : "none",
      cursor: "pointer",
      "&:hover": {
        border: "2px solid #FF7A18",
      },
    }),

    menu: (provided) => ({
      ...provided,
      borderRadius: "16px",
      overflow: "hidden",
      zIndex: 9999,
    }),

    option: (provided, state) => ({
      ...provided,
      padding: "12px 16px",
      cursor: "pointer",
      backgroundColor: state.isSelected
        ? "#FF7A18"
        : state.isFocused
          ? "#FFF3E8"
          : "white",
      color: state.isSelected ? "white" : "#374151",
    }),

    placeholder: (provided) => ({
      ...provided,
      color: "#9CA3AF",
    }),

    indicatorSeparator: () => ({
      display: "none",
    }),

    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#FF7A18",
    }),
  };
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [userData, setUserData] = useState(null);
  // Fetch logged user
  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res.data))
      .catch(() => setUserData(null));
  }, []);
  return (
    <div className="yumify-bg-wrapper min-h-screen py-0 px-0 m-0">
      <CustomerSidebar
        sideBarOpened={sideBarOpened}
        setSideBarOpened={setSideBarOpened}
        userData={userData}
      />
      {sideBarOpened && (
        <div
          onClick={() => setSideBarOpened(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
        />
      )}
      <button
        onClick={() => setSideBarOpened(!sideBarOpened)}
        className="p-2 rounded-full text-gray-200 bg-gray-500 hover:text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1a2a3a] z-30 fixed top-4 left-4 "
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      </button>
      <div className="flex flex-col justify-center items-center"></div>

      <div className="w-[500px] rounded-xl bg-white border-[3px] border-[#FFBE86] shadow-xl p-10 max-xs:p-4 max-sm:w-[90%]">
        <h2 className="text-[2.3em] mb-2 font-serif font-bold text-gray-800 max-sm:text-[25px] flex justify-center items-center text-center">
          Book a Table
        </h2>

        <p className="text-base mb-5 font-medium text-[#707785] text-center max-sm:text-[15px]">
          Reserve your spot for an unforgettable dining experience.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 w-full mt-3"
        >
          {/* Restaurant Select */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Restaurant
            </label>

            <Select
              options={restaurantOptions}
              value={
                restaurantOptions.find(
                  (option) => option.value === bookData.restaurandId,
                ) || null
              }
              onChange={(selectedOption) =>
                setBookData({
                  ...bookData,
                  restaurandId: selectedOption?.value || "",
                })
              }
              placeholder="Select a restaurant"
              styles={selectStyles}
              isSearchable
            />
          </div>

          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Date
              </label>

              <DatePicker
                required
                selected={bookData.date}
                onChange={(newDate) => handleDate("date", newDate)}
                placeholderText="Select Date"
                className="w-full h-[52px] rounded-xl border-2 border-gray-200 focus:border-[#FF7A18] focus:ring-2 focus:ring-orange-100 outline-none px-4"
                dateFormat="MM-dd-yyyy"
                minDate={new Date()}
                isClearable
                todayButton="Today"
              />
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Time
              </label>

              <div className="relative">
                <select
                  value={bookData.time}
                  onChange={(e) =>
                    setBookData({
                      ...bookData,
                      time: e.target.value,
                    })
                  }
                  className="appearance-none w-full h-[52px] rounded-xl border-2 border-gray-200 focus:border-[#FF7A18] focus:ring-2 focus:ring-orange-100 outline-none px-4"
                  required
                >
                  <option value="05:00">05:00</option>
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

                <ChevronDown className="absolute right-4 top-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* People + Location */}
          <div className="flex gap-3">
            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Number of People
              </label>

              <div className="h-[52px] rounded-xl border-2 border-gray-200 flex justify-between items-center px-3">
                <button
                  type="button"
                  onClick={() => {
                    if (bookData.peopleNumber > 1) {
                      setBookData((prev) => ({
                        ...prev,
                        peopleNumber: prev.peopleNumber - 1,
                      }));
                    }
                  }}
                  className="text-2xl text-[#FF7A18] px-3 py-1 rounded-lg hover:bg-orange-50 transition"
                >
                  -
                </button>

                <span className="font-bold text-lg">
                  {bookData.peopleNumber}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    if (bookData.peopleNumber < 10) {
                      setBookData((prev) => ({
                        ...prev,
                        peopleNumber: prev.peopleNumber + 1,
                      }));
                    }
                  }}
                  className="text-2xl text-[#FF7A18] px-3 py-1 rounded-lg hover:bg-orange-50 transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col flex-1">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Table Location
              </label>

              <Select
                options={locationOptions}
                value={
                  locationOptions.find(
                    (option) => option.value === bookData.tableLocation,
                  ) || null
                }
                onChange={(selectedOption) =>
                  setBookData({
                    ...bookData,
                    tableLocation: selectedOption.value,
                  })
                }
                styles={selectStyles}
                isSearchable={false}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !bookData.restaurandId || !bookData.date}
            className="mt-3 h-[50px] rounded-xl bg-[#FF7A18] hover:bg-[#e86800] text-white font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Booking...
              </div>
            ) : (
              "Book Table"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerBooking;
