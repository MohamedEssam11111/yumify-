import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import bookingAPI from "../apis/booking.api";
import restaurantAPI from "../apis/restaurant.api";
import toast from "react-hot-toast";
import {
  ChevronDown,
  CalendarDays,
  Clock3,
  Users,
  MapPin,
  Sparkles,
  ShieldCheck,
  UtensilsCrossed,
  BadgeCheck,
  FileText,
  PartyPopper,
} from "lucide-react";
import CustomerSidebar from "../components/CustomerSidebar";
import userAPI from "../apis/user.api.js";

const CustomerBooking = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [editingBookingId, setEditingBookingId] = useState(null);
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);

      const res = await bookingAPI.get("/my-bookings");

      setBookings(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reservations");
    } finally {
      setBookingsLoading(false);
    }
  };
  const defaultBookingState = {
    restaurandId: "",
    date: null,
    time: "05:00",
    peopleNumber: 1,
    tableLocation: "Any Available",
    occasion: "",
    notes: "",
  };

  const [bookData, setBookData] = useState(defaultBookingState);

  const postBooking = async (newBooking) => {
    const res = await bookingAPI.post("/create", newBooking);
    return res.data;
  };

  useEffect(() => {
    restaurantAPI
      .get("/")
      .then((response) => setRestaurants(response.data))
      .catch(() => {
        toast.error("Failed to load restaurants");
      });
  }, []);
  const startRebook = (booking) => {
    setEditingBookingId(booking._id);

    const occasionMatch = booking.notes?.match(/Occasion:\s*(.*?)(\n|$)/);

    setBookData({
      restaurandId: booking.restaurant?._id || "",
      date: new Date(booking.date),
      time: booking.time,
      peopleNumber: booking.numberOfGuests,
      tableLocation: booking.locationPreference || "Any Available",
      occasion: occasionMatch?.[1] || "",
      notes: booking.notes?.replace(/Occasion:.*(\n)?/, "") || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

    toast.success("Edit your reservation and submit again");
  };
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
      notes: `Occasion: ${bookData.occasion || "None"}

${bookData.notes || ""}`,
    };

    try {
      setIsSubmitting(true);

      if (editingBookingId) {
        await bookingAPI.patch(`/${editingBookingId}`, payload);

        toast.success("Reservation updated successfully");

        setEditingBookingId(null);
      } else {
        await postBooking(payload);

        toast.success("🎉 Table booked successfully! See you soon.", {
          duration: 5000,
        });
      }

      setBookData(defaultBookingState);
      setEditingBookingId(null);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Unable to complete your reservation.",
      );
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
  const occasionOptions = [
    { value: "", label: "No Occasion" },
    { value: "Birthday", label: "🎂 Birthday" },
    { value: "Anniversary", label: "💖 Anniversary" },
    { value: "Business Meeting", label: "💼 Business Meeting" },
    { value: "Date Night", label: "🌹 Date Night" },
    { value: "Family Gathering", label: "👨‍👩‍👧‍👦 Family Gathering" },
  ];
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      minHeight: "58px",
      borderRadius: "18px",
      border: state.isFocused ? "2px solid #FF901C" : "2px solid #E5E7EB",
      boxShadow: state.isFocused
        ? "0 0 0 4px rgba(255,144,28,.15)"
        : "0 2px 10px rgba(0,0,0,.04)",
      transition: "all .2s ease",
      "&:hover": {
        borderColor: "#FF901C",
      },
    }),

    menu: (provided) => ({
      ...provided,
      borderRadius: "18px",
      overflow: "hidden",
      zIndex: 9999,
      boxShadow: "0 20px 40px rgba(0,0,0,.12)",
      border: "1px solid #FED7AA",
    }),

    option: (provided, state) => ({
      ...provided,
      padding: "14px 18px",
      backgroundColor: state.isSelected
        ? "#FF901C"
        : state.isFocused
          ? "#FFF7ED"
          : "#fff",
      color: state.isSelected ? "#fff" : "#374151",
    }),

    indicatorSeparator: () => ({ display: "none" }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "#FF901C",
    }),
  };

  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    userAPI
      .get("/profile")
      .then((res) => setUserData(res.data))
      .catch(() => setUserData(null));
  }, []);

  const selectedRestaurant = restaurants.find(
    (r) => r._id === bookData.restaurandId,
  );

  const isToday =
    bookData.date && bookData.date.toDateString() === new Date().toDateString();

  const availableTimes = [
    "05:00",
    "05:30",
    "06:00",
    "06:30",
    "07:00",
    "07:30",
    "08:00",
    "08:30",
    "09:00",
    "09:30",
    "10:00",
    "10:30",
  ].filter((time) => {
    if (!isToday) return true;

    const now = new Date();
    const [hours, minutes] = time.split(":");

    const selectedTime = new Date();
    selectedTime.setHours(hours, minutes, 0, 0);

    return selectedTime > now;
  });

  const openCancelModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedBookingId(null);
    setCancellationReason("");
  };
  const confirmCancellation = async () => {
    try {
      await bookingAPI.delete(`/${selectedBookingId}`, {
        data: {
          cancellationReason,
        },
      });

      toast.success("Reservation cancelled successfully");

      fetchBookings();

      closeCancelModal();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to cancel reservation",
      );
    }
  };
  return (
    <div className="yumify-bg-wrapper min-h-screen">
      <CustomerSidebar
        sideBarOpened={sideBarOpened}
        setSideBarOpened={setSideBarOpened}
        userData={userData}
      />

      {sideBarOpened && (
        <div
          onClick={() => setSideBarOpened(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        />
      )}

      <button
        onClick={() => setSideBarOpened(!sideBarOpened)}
        className="fixed top-4 left-4 z-50 p-3 rounded-full bg-gray-700 text-white shadow-lg"
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

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Hero */}
          <div className="bg-gradient-to-br from-[#FF901C] to-orange-600 rounded-[32px] shadow-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-white/10"></div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Sparkles size={18} />
                Premium Dining
              </span>

              <h1 className="text-4xl font-bold mt-6 leading-tight">
                Reserve Your Perfect Table
              </h1>

              <p className="mt-4 text-orange-50 text-lg">
                Book unforgettable dining experiences with Yumify and enjoy
                exceptional moments.
              </p>

              <div className="mt-10 space-y-4">
                {[
                  {
                    icon: <BadgeCheck />,
                    text: "Instant reservation confirmation",
                  },
                  {
                    icon: <UtensilsCrossed />,
                    text: "Premium restaurants selection",
                  },
                  {
                    icon: <MapPin />,
                    text: "Flexible seating preferences",
                  },
                  {
                    icon: <ShieldCheck />,
                    text: "Secure and reliable booking",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white/15 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4"
                  >
                    {item.icon}
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-[32px] shadow-2xl border border-orange-100 p-8 xl:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800">
                🍽️ Book Your Table
              </h2>

              <div className="w-24 h-1 bg-gradient-to-r from-[#FF901C] to-orange-400 rounded-full mx-auto mt-3"></div>

              <p className="mt-4 text-gray-500">
                Reserve your seat and enjoy an unforgettable experience.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Restaurant */}
              <div>
                <label className="font-semibold text-gray-700 mb-2 block">
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
                  placeholder="Choose restaurant"
                  styles={selectStyles}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {/* Date */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <CalendarDays size={18} />
                    Date
                  </label>

                  <DatePicker
                    required
                    selected={bookData.date}
                    onChange={(newDate) => handleDate("date", newDate)}
                    placeholderText="Select Date"
                    className="w-full h-[58px] rounded-2xl border-2 border-gray-200 px-5"
                    dateFormat="MM-dd-yyyy"
                    minDate={new Date()}
                    isClearable
                  />

                  <p className="text-xs text-gray-400 mt-2">
                    Reservations can be made in advance.
                  </p>
                </div>

                {/* Time */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock3 size={18} />
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
                      className="appearance-none w-full h-[58px] rounded-2xl border-2 border-gray-200 px-5"
                    >
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>

                    <ChevronDown className="absolute right-5 top-5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {/* Guests */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Users size={18} />
                    Guests
                  </label>

                  <div className="h-[58px] border-2 border-gray-200 rounded-2xl flex justify-between items-center px-4">
                    <button
                      type="button"
                      onClick={() =>
                        bookData.peopleNumber > 1 &&
                        setBookData((prev) => ({
                          ...prev,
                          peopleNumber: prev.peopleNumber - 1,
                        }))
                      }
                      className="w-10 h-10 rounded-full bg-orange-100 text-[#FF901C] text-2xl hover:scale-110 transition"
                    >
                      -
                    </button>

                    <span className="font-bold text-xl">
                      {bookData.peopleNumber}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        bookData.peopleNumber < 10 &&
                        setBookData((prev) => ({
                          ...prev,
                          peopleNumber: prev.peopleNumber + 1,
                        }))
                      }
                      className="w-10 h-10 rounded-full bg-orange-100 text-[#FF901C] text-2xl hover:scale-110 transition"
                    >
                      +
                    </button>
                  </div>
                </div>
                {/* Location */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2">
                    Seating Preference
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

                  <p className="text-xs text-gray-400 mt-2">
                    Choose your preferred seating area.
                  </p>
                </div>
                {/* occasion section */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <PartyPopper size={18} />
                    Special Occasion
                  </label>

                  <Select
                    options={occasionOptions}
                    value={
                      occasionOptions.find(
                        (option) => option.value === bookData.occasion,
                      ) || null
                    }
                    onChange={(selectedOption) =>
                      setBookData({
                        ...bookData,
                        occasion: selectedOption?.value || "",
                      })
                    }
                    styles={selectStyles}
                    isSearchable={false}
                    placeholder="Choose occasion"
                  />
                </div>
                {/* note section  */}
                <div>
                  <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={18} />
                    Additional Notes
                  </label>

                  <textarea
                    rows={5}
                    value={bookData.notes}
                    onChange={(e) =>
                      setBookData({
                        ...bookData,
                        notes: e.target.value,
                      })
                    }
                    placeholder="Birthday cake request, allergies, wheelchair access, special preferences..."
                    maxLength={500}
                    className="w-full rounded-3xl border-2 border-gray-200 px-5 py-4 resize-none focus:border-[#FF901C] focus:outline-none transition"
                  />

                  <div className="text-right text-xs text-gray-400 mt-2">
                    {bookData.notes.length}/500
                  </div>
                </div>
              </div>
              {/* Reservation summary  */}
              <div className="rounded-3xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 mb-5">
                  Reservation Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Restaurant</span>
                    <span className="font-semibold">
                      {selectedRestaurant?.name || "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Date</span>
                    <span className="font-semibold">
                      {bookData.date ? bookData.date.toLocaleDateString() : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Time</span>
                    <span className="font-semibold">{bookData.time}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Guests</span>
                    <span className="font-semibold">
                      {bookData.peopleNumber}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Seating</span>
                    <span className="font-semibold">
                      {bookData.tableLocation}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Occasion</span>
                    <span className="font-semibold">
                      {bookData.occasion || "None"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                disabled={
                  isSubmitting || !bookData.restaurandId || !bookData.date
                }
                className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-[#FF901C] to-orange-500 text-white font-bold text-lg shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="flex justify-center items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Booking...
                  </div>
                ) : editingBookingId ? (
                  "Update Reservation"
                ) : (
                  "Reserve Table"
                )}
              </button>

              {/* Reservation Policies */}
              <div className="rounded-3xl bg-gray-50 border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">
                  Reservation Policies
                </h3>

                <ul className="space-y-3 text-sm text-gray-600">
                  <li>• Please arrive 10 minutes before your reservation.</li>
                  <li>• Reservations are held for 15 minutes only.</li>
                  <li>• Large parties may require confirmation.</li>
                  <li>• Free cancellation is available anytime.</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
        {/* My Reservations */}
        <div className="mt-14">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-100">
              My Reservations
            </h2>

            <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-semibold">
              {bookings.length} Reservations
            </span>
          </div>

          {bookingsLoading ? (
            <div className="text-center py-20">Loading reservations...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow">
              <div className="text-6xl mb-4">🍽️</div>

              <h3 className="text-2xl font-bold text-gray-800">
                No Reservations Yet
              </h3>

              <p className="text-gray-500 mt-3">
                Your upcoming reservations will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="bg-white rounded-3xl shadow-lg border border-orange-100 p-6 hover:shadow-2xl transition"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">
                        {booking.restaurant?.name}
                      </h3>

                      <p className="text-gray-500 mt-2">
                        {new Date(booking.date).toLocaleDateString()} •{" "}
                        {booking.time}
                      </p>
                    </div>

                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold
              ${
                booking.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : booking.status === "Confirmed"
                    ? "bg-blue-100 text-blue-700"
                    : booking.status === "Seated"
                      ? "bg-green-100 text-green-700"
                      : booking.status === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : booking.status === "Cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
              }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-orange-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-500">Guests</p>
                      <p className="font-bold text-lg">
                        {booking.numberOfGuests}
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-2xl p-4">
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-bold">{booking.locationPreference}</p>
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mt-5">
                    <h4 className="font-semibold mb-2 text-gray-700">Notes</h4>

                    <div className="bg-gray-50 rounded-2xl p-4 text-gray-600">
                      {booking.notes || "No notes provided"}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 flex-wrap">
                    <button
                      onClick={() => startRebook(booking)}
                      className="flex-1 min-w-[120px] bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-semibold"
                    >
                      Rebook
                    </button>

                    {booking.status !== "Cancelled" && (
                      <button
                        onClick={() => openCancelModal(booking._id)}
                        className="flex-1 min-w-[120px] border border-red-300 text-red-600 hover:bg-red-50 py-3 rounded-2xl font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {cancelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeCancelModal}
            />

            <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-[popup_0.3s_ease-out]">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Cancel Reservation
              </h2>

              <p className="text-gray-500 mb-6">
                Please tell the restaurant why you're cancelling.
              </p>

              <textarea
                rows={5}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="w-full border-2 border-gray-200 rounded-2xl p-4 resize-none focus:border-[#FF901C] focus:outline-none"
              />

              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeCancelModal}
                  className="flex-1 border border-gray-300 rounded-2xl py-3 font-semibold hover:bg-gray-50"
                >
                  Keep Reservation
                </button>

                <button
                  onClick={confirmCancellation}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-3 font-semibold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerBooking;
