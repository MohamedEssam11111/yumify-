import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { parseISO, isSameDay, format } from "date-fns";
import bookingAPI from "../apis/booking.api";
import toast from "react-hot-toast";
const OwnerBooking = () => {
  const [sampleReservations, setSampleReservations] = useState([]);
  // Additional states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatusBooking, setSelectedStatusBooking] = useState(null);

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await bookingAPI.patch(`/${bookingId}/status`, {
        status,
      });

      setSampleReservations((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status } : booking,
        ),
      );

      setStatusModalOpen(false);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update reservation status");
    }
  };
  useEffect(() => {
    bookingAPI
      .get("/")
      .then((response) => {
        console.log("bookings API response:", response.data);
        console.log("First booking:", response.data[0]);
        const formatted = response.data.map((booking) => ({
          id: booking._id,
          name: booking.user?.name || "Guest",
          datetime: booking.date,
          guests: booking.numberOfGuests,
          location: booking.locationPreference,
          status: booking.status || "Pending",
          notes: booking.notes || "",
        }));

        setSampleReservations(formatted);
      })
      .catch((error) => {
        console.error("Error fetching bookings:", error);
      });
  }, []);

  // date selected on calendar (JS Date or undefined)
  const [selectedDate, setSelectedDate] = useState(undefined);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [confirmEditId, setConfirmEdit] = useState(undefined);

  // parsing date stored to calender fomate
  const reservations = useMemo(
    () =>
      sampleReservations.map((r) => ({ ...r, dateObj: parseISO(r.datetime) })),
    [sampleReservations],
  );

  // days that have reservations signed by orange dot
  const reservationDays = useMemo(
    () => reservations.map((r) => r.dateObj),
    [reservations],
  );

  // filtered list by selectedDate if none selected show all orders stored
  const filtered = useMemo(() => {
    let list = selectedDate
      ? reservations.filter((r) => isSameDay(r.dateObj, selectedDate))
      : reservations;

    if (searchTerm.trim()) {
      list = list.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "All") {
      list = list.filter((r) => r.status === statusFilter);
    }

    return list.slice().sort((a, b) => a.dateObj - b.dateObj);
  }, [reservations, selectedDate, searchTerm, statusFilter]);

  // statistics
  const todayReservations = reservations.filter((r) =>
    isSameDay(r.dateObj, new Date()),
  ).length;

  const pendingReservations = reservations.filter(
    (r) => r.status === "Pending",
  ).length;

  const seatedReservations = reservations.filter(
    (r) => r.status === "Seated",
  ).length;

  const totalGuestsToday = reservations
    .filter((r) => isSameDay(r.dateObj, new Date()))
    .reduce((acc, curr) => acc + curr.guests, 0);

  const openConfirm = (id) => {
    setConfirmCancelId(id);
  };

  // close confirm modal without deleting
  const closeConfirm = () => {
    setConfirmCancelId(null);
  };

  // confirm cancellation and remove reservation
  const confirmCancel = async () => {
    if (confirmCancelId == null) return;

    try {
      // 1) Call backend DELETE /<bookingId>
      await bookingAPI.delete(`/${confirmCancelId}`, {
        data: {
          cancellationReason: "Cancelled by restaurant owner",
        },
      });
      // 2) Update UI state
      setSampleReservations((prev) =>
        prev.filter((r) => r.id !== confirmCancelId),
      );

      console.log("Booking deleted:", confirmCancelId);
    } catch (error) {
      console.error("Error deleting booking:", error);

      toast.error(
        error.response?.data?.message || "Failed to cancel reservation",
      );
    } finally {
      // 3) Close modal either way
      setConfirmCancelId(null);
    }
  };

  const reservationToCancel =
    sampleReservations.find((r) => r.id === confirmCancelId) || null;

  const openConfirmEdit = (id) => setConfirmEdit(id);
  const closeConfirmEdit = () => setConfirmEdit(undefined);

  // immediate-edit handlers (used by the edit UI buttons)
  const setStatusToSeated = () => {
    if (confirmEditId == null) return;
    setSampleReservations((prev) =>
      prev.map((r) =>
        r.id === confirmEditId ? { ...r, status: "Seated" } : r,
      ),
    );
    // close the edit UI

    closeConfirmEdit();
  };

  const setStatusToConfirmed = () => {
    if (confirmEditId == null) return;
    setSampleReservations((prev) =>
      prev.map((r) =>
        r.id === confirmEditId ? { ...r, status: "Confirmed" } : r,
      ),
    );
    closeConfirmEdit();
    console.log(sampleReservations);
  };

  return (
    <div className="yumify-bg-wrapper min-h-screen py-0 px-0 m-0">
      <div className="flex flex-col justify-center items-center w-full">
        {/* Main layout container with fluid spacing tailored for all viewports */}
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header Dashboard Info */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2 w-2 rounded-full bg-[#FF901C] animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                  Yumify Premium Partner
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
                Owner Bookings
              </h1>
            </div>
          </div>

          {}
          {/* statistics section: 1-col on tiny mobile, 2-col on small screen, 4-col on tablet/desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Today's Reservations
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                    {todayReservations}
                  </h3>
                </div>
                <span className="p-2 rounded-xl bg-orange-100 text-[#FF901C]">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Pending
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-yellow-600 mt-2">
                    {pendingReservations}
                  </h3>
                </div>
                <span className="p-2 rounded-xl bg-yellow-100 text-yellow-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Seated
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
                    {seatedReservations}
                  </h3>
                </div>
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-300"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">
                    Guests Today
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">
                    {totalGuestsToday}
                  </h3>
                </div>
                <span className="p-2 rounded-xl bg-blue-100 text-blue-600">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {}
          {/* Main Workspace Split Layout: Stacks on mobile/tablet, side-by-side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Calendar Block (span 4 on desktop) */}
            <div className="lg:col-span-4 w-full">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-orange-50 text-[#FF901C]">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      Reservations Calendar
                    </h3>
                  </div>
                  {selectedDate && (
                    <button
                      onClick={() => setSelectedDate(undefined)}
                      className="text-xs text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 font-semibold px-2.5 py-1 rounded-lg transition-colors duration-150"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* DayPicker Container allowing smooth scrolling / overflow checks on tiny screens */}
                <div className="bg-slate-50/50 rounded-xl p-2 sm:p-3 flex flex-col items-center border border-slate-100 overflow-x-auto w-full">
                  <div className="min-w-[280px]">
                    <DayPicker
                      className="max-xs:text-[12px] m-0"
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      // mark days with reservations adding orange dot
                      modifiers={{ hasReservation: reservationDays }}
                      modifiersClassNames={{ hasReservation: "has-res" }}
                    />
                  </div>
                </div>

                {/* Selected Date indicator */}
                <div className="mt-4 space-y-2">
                  {selectedDate ? (
                    <div className="bg-orange-50/50 rounded-xl p-3 border border-orange-100 flex items-center justify-between text-slate-700">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-[#FF901C] flex-shrink-0">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </span>
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                          {format(selectedDate, "PPP")}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs bg-orange-600 text-white font-medium px-2 py-0.5 rounded-full flex-shrink-0">
                        Selected
                      </span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-3 text-center border border-dashed border-slate-200 text-slate-400 text-xs">
                      No day filter active. Select a day on the calendar to view
                      isolated slots.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {}
            {/* Search & Reservations List Blocks (span 8 on desktop) */}
            <div className="lg:col-span-8 space-y-6 w-full">
              {/* Premium Glassmorphic Search / Toolbar Area */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="relative w-full sm:flex-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search by customer name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <div className="relative w-full sm:w-auto min-w-[160px]">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                        />
                      </svg>
                    </span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm appearance-none focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer font-medium text-slate-700"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Seated">Seated</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="No Show">No Show</option>
                    </select>
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Reservations List Heading Banner */}
              <div className="flex items-center justify-between px-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <span>
                    {selectedDate
                      ? "Specific Slot Bookings"
                      : "All Upcoming Bookings"}
                  </span>
                  <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
                    {filtered.length} slots
                  </span>
                </h3>
              </div>

              {}
              {/* DESKTOP TABLE VIEW: Rendered strictly for medium breakpoints and up */}
              <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-y-auto max-h-[480px]">
                  <table className="w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50 sticky top-0 z-10">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50"
                        >
                          Customer & Details
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50"
                        >
                          Preferences
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 w-32"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 w-52"
                        >
                          Quick Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-12 px-6 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <div className="p-3 bg-orange-50 rounded-full text-[#FF901C]">
                                <svg
                                  className="w-8 h-8"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <h4 className="font-semibold text-slate-800 text-base">
                                No bookings match criteria
                              </h4>
                              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                                Try resetting the calendar filter or testing an
                                alternate search keyword.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filtered.map(
                          ({
                            id,
                            name,
                            datetime,
                            guests,
                            location,
                            status,
                            dateObj,
                          }) => (
                            <tr
                              key={id}
                              className="hover:bg-slate-50/70 transition-colors duration-150"
                            >
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-800 text-[15px]">
                                    {name}
                                  </span>
                                  <span className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                    <svg
                                      className="w-3.5 h-3.5 text-slate-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {format(dateObj, "yyyy-MM-dd ' @ ' HH:mm")}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                                    <svg
                                      className="w-3.5 h-3.5 text-slate-500"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                      />
                                    </svg>
                                    {guests} Guests
                                  </span>
                                  <span className="inline-flex items-center bg-orange-50 text-orange-700 text-xs px-2.5 py-1 rounded-lg font-medium">
                                    {location}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold shadow-sm border
                                  ${
                                    status === "Pending"
                                      ? "bg-amber-50 text-amber-800 border-amber-100"
                                      : status === "Confirmed"
                                        ? "bg-sky-50 text-sky-800 border-sky-100"
                                        : status === "Seated"
                                          ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                          : status === "Completed"
                                            ? "bg-teal-50 text-teal-800 border-teal-100"
                                            : status === "Cancelled"
                                              ? "bg-rose-50 text-rose-800 border-rose-100"
                                              : "bg-slate-50 text-slate-800 border-slate-100"
                                  }
                                `}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                                      status === "Pending"
                                        ? "bg-amber-500"
                                        : status === "Confirmed"
                                          ? "bg-sky-500"
                                          : status === "Seated"
                                            ? "bg-emerald-500"
                                            : status === "Completed"
                                              ? "bg-teal-500"
                                              : status === "Cancelled"
                                                ? "bg-rose-500"
                                                : "bg-slate-500"
                                    }`}
                                  ></span>
                                  {status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedReservation({
                                        id,
                                        name,
                                        datetime,
                                        guests,
                                        location,
                                        status,
                                        notes,
                                      });
                                      setDetailsModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 text-xs font-bold transition-all duration-150 transform active:scale-95"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedStatusBooking(id);
                                      setStatusModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 text-xs font-bold transition-all duration-150 transform active:scale-95"
                                  >
                                    Status
                                  </button>

                                  <button
                                    onClick={() => openConfirm(id)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all duration-150 transform active:scale-95"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ),
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {}
              {/* MOBILE CARDS VIEW: Automatically activated below md screen size to prevent horizontal scrolls */}
              <div className="block md:hidden space-y-4">
                {filtered.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                    <div className="p-3 bg-orange-50 rounded-full text-[#FF901C] inline-block mb-3">
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">
                      No reservations found
                    </h4>
                    <p className="text-slate-400 text-xs mt-1">
                      Try switching statuses or selection dates.
                    </p>
                  </div>
                ) : (
                  filtered.map(
                    ({
                      id,
                      name,
                      datetime,
                      guests,
                      location,
                      status,
                      dateObj,
                    }) => (
                      <div
                        key={id}
                        className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-4 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base truncate">
                              {name}
                            </h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <svg
                                className="w-3.5 h-3.5 text-slate-400 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span className="truncate">
                                {format(dateObj, "yyyy-MM-dd ' @ ' HH:mm")}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold border shadow-xs flex-shrink-0
                              ${
                                status === "Pending"
                                  ? "bg-amber-50 text-amber-800 border-amber-100"
                                  : status === "Confirmed"
                                    ? "bg-sky-50 text-sky-800 border-sky-100"
                                    : status === "Seated"
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                                      : status === "Completed"
                                        ? "bg-teal-50 text-teal-800 border-teal-100"
                                        : status === "Cancelled"
                                          ? "bg-rose-50 text-rose-800 border-rose-100"
                                          : "bg-slate-50 text-slate-800 border-slate-100"
                              }
                            `}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className="bg-slate-50 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border border-slate-100">
                            <strong>{guests}</strong> Guests
                          </span>
                          <span className="bg-orange-50/50 text-orange-700 text-xs px-2.5 py-1 rounded-lg font-semibold border border-orange-100 truncate max-w-full">
                            {location}
                          </span>
                        </div>

                        {/* Highly responsive button action layout for mobile card views */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              setSelectedReservation({
                                id,
                                name,
                                datetime,
                                guests,
                                location,
                                status,
                              });
                              setDetailsModalOpen(true);
                            }}
                            className="py-2.5 px-3 rounded-xl bg-sky-50 text-sky-600 font-bold text-[11px] sm:text-xs hover:bg-sky-100 text-center transition-colors"
                          >
                            View Info
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStatusBooking(id);
                              setStatusModalOpen(true);
                            }}
                            className="py-2.5 px-3 rounded-xl bg-amber-50 text-amber-600 font-bold text-[11px] sm:text-xs hover:bg-amber-100 text-center transition-colors"
                          >
                            Set Status
                          </button>

                          <button
                            onClick={() => openConfirm(id)}
                            className="py-2.5 px-3 rounded-xl bg-rose-50 text-rose-600 font-bold text-[11px] sm:text-xs hover:bg-rose-100 text-center transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {/* CONFIRM CANCELLATION MODAL */}
      {confirmCancelId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={closeConfirm}
          ></div>

          <div className="bg-white rounded-3xl shadow-2xl p-6 z-10 w-full max-w-md transform transition-all scale-100 duration-300 border border-slate-100 relative">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-4">
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              Confirm Cancellation
            </h3>

            <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed">
              Are you sure you want to cancel the reservation for{" "}
              <span className="font-extrabold text-slate-800">
                {reservationToCancel?.name}
              </span>
              {reservationToCancel
                ? ` scheduled on ${format(
                    parseISO(reservationToCancel.datetime),
                    "PPP ' @ ' HH:mm",
                  )}`
                : ""}
              ? This action is immediate.
            </p>

            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-50 transition active:scale-95"
                onClick={closeConfirm}
              >
                Go Back
              </button>
              <button
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 transition active:scale-95"
                onClick={confirmCancel}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK STATUS EDIT TOAST/MODAL */}
      {confirmEditId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={closeConfirmEdit}
          ></div>

          <div className="relative bg-white rounded-3xl shadow-2xl p-6 z-10 w-full max-w-sm border border-slate-100">
            <button
              onClick={closeConfirmEdit}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2 pr-6">
              Quick Status Update
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Instantly transition the reservation state.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <button
                onClick={setStatusToSeated}
                className="py-3 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-100 transition active:scale-95"
              >
                <span className="text-base sm:text-lg mb-1">🪑</span>
                <span className="text-xs font-bold">Seated</span>
              </button>
              <button
                onClick={setStatusToConfirmed}
                className="py-3 px-4 flex flex-col items-center justify-center text-center rounded-2xl bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-100 transition active:scale-95"
              >
                <span className="text-base sm:text-lg mb-1">✓</span>
                <span className="text-xs font-bold">Confirmed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DETAILS VIEW MODAL */}
      {detailsModalOpen && selectedReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDetailsModalOpen(false)}
          />

          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md z-10 border border-slate-100 relative">
            <button
              onClick={() => setDetailsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF901C]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Reservation Details
              </h2>
            </div>

            <div className="space-y-3 sm:space-y-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Customer
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800">
                  {selectedReservation.name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Date & Time
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {format(parseISO(selectedReservation.datetime), "PPP")}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Guests
                </span>
                <span className="text-xs sm:text-sm font-bold text-orange-600">
                  {selectedReservation.guests} covers
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200/50">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Seating Choice
                </span>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[11px] sm:text-[13px]">
                  {selectedReservation.location}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Current Status
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-slate-800 bg-white px-2.5 py-1 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500"></span>
                  {selectedReservation.status}
                </span>
                <p>
                  <strong>Notes:</strong>{" "}
                  {selectedReservation.notes || "No notes provided"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setDetailsModalOpen(false)}
              className="mt-6 w-full bg-[#FF901C] hover:bg-orange-600 text-white py-3 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-orange-100 transition duration-150 active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MASTER MODAL */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setStatusModalOpen(false)}
          />

          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md z-10 border border-slate-100 relative">
            <button
              onClick={() => setStatusModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="p-2 rounded-xl bg-orange-50 text-[#FF901C]">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                  />
                </svg>
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Update Status
              </h2>
            </div>

            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Transition booking record state.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                "Pending",
                "Confirmed",
                "Seated",
                "Completed",
                "Cancelled",
                "No Show",
              ].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    updateBookingStatus(selectedStatusBooking, status)
                  }
                  className="group flex items-center justify-between border border-slate-200 rounded-2xl p-3 hover:bg-orange-50 hover:border-orange-200 transition-all text-left font-medium text-slate-700 text-xs sm:text-sm active:scale-95"
                >
                  <span className="flex items-center gap-1.5 sm:gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        status === "Pending"
                          ? "bg-amber-400"
                          : status === "Confirmed"
                            ? "bg-sky-500"
                            : status === "Seated"
                              ? "bg-emerald-500"
                              : status === "Completed"
                                ? "bg-teal-500"
                                : status === "Cancelled"
                                  ? "bg-rose-500"
                                  : "bg-slate-400"
                      }`}
                    ></span>
                    {status}
                  </span>
                  <span className="text-slate-300 group-hover:text-orange-500 transition-colors text-xs">
                    ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STYLE OVERRIDES */}
      <style>{`
        /* Override day-picker day element sizing dynamically to keep layout highly cohesive */
        .rdp-day {
          border-radius: 8px !important;
          transition: all 150ms ease;
          font-weight: 500;
        }
        .rdp-day:hover {
          background: #ffedd5 !important;
          color: #ea580c !important;
        }
        .rdp-day_selected {
          background: #f97316 !important;
          color: white !important;
          font-weight: bold;
          border-color: #ea580c !important;
        }
        .rdp-day_today {
          background: #fff7ed !important;
          color: #f97316 !important;
          font-weight: 700;
          border: 1px solid #ffedd5;
        }
        .has-res {
          position: relative;
        }
        .has-res::after {
          content: "";
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          background-color: #f97316;
          border-radius: 999px;
        }
      `}</style>
    </div>
  );
};

export default OwnerBooking;
