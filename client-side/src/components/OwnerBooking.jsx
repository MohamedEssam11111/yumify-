// Install: npm i react-day-picker date-fns\
import React, { useEffect, useMemo, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { parseISO, isSameDay, format } from "date-fns";
import bookingAPI from "../apis/booking.api";

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

  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [reservationNotes, setReservationNotes] = useState("");
  // fetcing bookAPI
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
          status: "Confirmed",
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
      await bookingAPI.delete(`/${confirmCancelId}`);

      // 2) Update UI state
      setSampleReservations((prev) =>
        prev.filter((r) => r.id !== confirmCancelId),
      );

      console.log("Booking deleted:", confirmCancelId);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
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
      <div className=" flex flex-col justify-center items-center ">
        <div className="max-w-6xl mx-auto p-6 max-xs:p-0">
          {/* statistics section */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 shadow">
              <p className="text-gray-500 text-sm">Today's Reservations</p>
              <h3 className="text-3xl font-bold text-orange-500">
                {todayReservations}
              </h3>
            </div>

            <div className="bg-white rounded-xl p-5 shadow">
              <p className="text-gray-500 text-sm">Pending</p>
              <h3 className="text-3xl font-bold text-yellow-500">
                {pendingReservations}
              </h3>
            </div>

            <div className="bg-white rounded-xl p-5 shadow">
              <p className="text-gray-500 text-sm">Seated</p>
              <h3 className="text-3xl font-bold text-green-500">
                {seatedReservations}
              </h3>
            </div>

            <div className="bg-white rounded-xl p-5 shadow">
              <p className="text-gray-500 text-sm">Guests Today</p>
              <h3 className="text-3xl font-bold text-blue-500">
                {totalGuestsToday}
              </h3>
            </div>
          </div>
          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="">
              <h3 className="text-lg font-semibold mb-3 max-xs:text-[16px] max-xs:ml-[15px]">
                Reservations Calendar
              </h3>

              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <DayPicker
                  className="max-xs:text-[12px]"
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  // mark days with reservations adding orange dot
                  modifiers={{ hasReservation: reservationDays }}
                  modifiersClassNames={{ hasReservation: "has-res" }}
                />

                <div className="mt-3 flex gap-2 flex flex-col">
                  <button
                    className="bg-[#FF901C] px-3 py-1 text-sm rounded  border hover:bg-prim hover:translate-y-[-2px] transition-transform duration-[0.2s]"
                    onClick={() => setSelectedDate(undefined)}
                  >
                    Clear selection
                  </button>
                  {selectedDate && (
                    <div className="text-sm text-gray-600">
                      <strong>{format(selectedDate, "PPP")}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* search table section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 xl:col-span-2 mt-2">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search by customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-3"
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-4 py-3"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Confirmed</option>
                <option>Seated</option>
                <option>Completed</option>
                <option>Cancelled</option>
                <option>No Show</option>
              </select>
            </div>
          </div>
          {/* Reservations list */}
          <div className="">
            <h3 className="text-lg text-white font-semibold mb-3">
              {selectedDate
                ? `Reservations for ${format(selectedDate, "PPP")}`
                : "All Upcoming Reservations"}
            </h3>

            <div className="overflow-y-auto max-h-[420px] border rounded-lg">
              <table className="w-full divide-y divide-gray-200">
                {" "}
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-gray-500">
                        No reservations found.
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
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">
                              {name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {format(dateObj, "yyyy-MM-dd ' @ ' HH:mm")} •{" "}
                              {guests} guests • {location}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold
                            ${
                              status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : status === "Confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : status === "Seated"
                                    ? "bg-green-100 text-green-800"
                                    : status === "Completed"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : status === "Cancelled"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-gray-100 text-gray-800"
                            }
                          `}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2 ">
                              {" "}
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
                                className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStatusBooking(id);
                                  setStatusModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
                              >
                                Status
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedStatusBooking(id);
                                  setNotesModalOpen(true);
                                }}
                                className="px-3 py-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                              >
                                Notes
                              </button>
                              <button
                                onClick={() => openConfirm(id)}
                                className="px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
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
          {/* Confirm modal */}
          {confirmCancelId != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={closeConfirm}
              ></div>

              <div className="bg-white rounded-lg shadow-xl p-6 z-10 w-full max-w-sm animate-[popup_0.5s_ease-out_forwards]">
                <h3 className="text-lg font-semibold mb-2">
                  Confirm cancellation
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Are you sure you want to cancel the reservation{" "}
                  <span className="font-semibold">
                    {reservationToCancel?.name}
                  </span>
                  {reservationToCancel
                    ? ` on ${format(
                        parseISO(reservationToCancel.datetime),
                        "PPP ' @ ' HH:mm",
                      )}`
                    : ""}
                  ?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    className="px-3 py-1 rounded border hover:bg-gray-100"
                    onClick={closeConfirm}
                  >
                    Close
                  </button>
                  <button
                    className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                    onClick={confirmCancel}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* edit toast */}
          {confirmEditId != null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
              <div
                className="fixed inset-0 bg-black/50"
                onClick={closeConfirmEdit}
              ></div>
              <div className="relative h-auto bg-white rounded-lg shadow-xl p-6 z-10 w-[80%] max-w-sm animate-[popup_0.5s_ease-out_forwards]">
                <div className="flex justify-between gap-[15px] flex-wrap m-3">
                  <button
                    onClick={setStatusToSeated}
                    className="py-2 px-5 ml-12 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 hover:translate-y-[-2px] transition-transform duration-[0.2s]"
                  >
                    Seated
                  </button>
                  <button
                    onClick={setStatusToConfirmed}
                    className="py-2 px-5 mr-12 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 hover:translate-y-[-2px] transition-transform duration-[0.2s]"
                  >
                    Confirmed
                  </button>
                </div>
                <button
                  onClick={closeConfirmEdit}
                  className="absolute top-[10px] left-[90%]"
                >
                  <img
                    className="h-[20px] w-[20px] hover:h-[22px] hover:w-[22px] duration-[0.05s]"
                    src="/cancel.png"
                    alt=""
                  />
                </button>
              </div>
            </div>
          )}
          {/* details modal */}
          {detailsModalOpen && selectedReservation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setDetailsModalOpen(false)}
              />

              <div className="bg-white rounded-2xl p-6 w-full max-w-md z-10">
                <h2 className="text-2xl font-bold mb-5">Reservation Details</h2>

                <div className="space-y-3">
                  <p>
                    <strong>Customer:</strong> {selectedReservation.name}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {format(parseISO(selectedReservation.datetime), "PPP")}
                  </p>

                  <p>
                    <strong>Guests:</strong> {selectedReservation.guests}
                  </p>

                  <p>
                    <strong>Location:</strong> {selectedReservation.location}
                  </p>

                  <p>
                    <strong>Status:</strong> {selectedReservation.status}
                  </p>
                </div>

                <button
                  onClick={() => setDetailsModalOpen(false)}
                  className="mt-6 w-full bg-orange-500 text-white py-3 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* states model */}
          {statusModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setStatusModalOpen(false)}
              />

              <div className="bg-white rounded-2xl p-6 w-full max-w-sm z-10">
                <h2 className="font-bold text-xl mb-4">
                  Update Reservation Status
                </h2>

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
                      onClick={() => {
                        // call API here
                        setStatusModalOpen(false);
                      }}
                      className="border rounded-xl py-3 hover:bg-orange-100"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {/* note modal */}
          {notesModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black/50"
                onClick={() => setNotesModalOpen(false)}
              />

              <div className="bg-white rounded-2xl p-6 w-full max-w-md z-10">
                <h2 className="font-bold text-xl mb-4">Reservation Notes</h2>

                <textarea
                  rows={6}
                  value={reservationNotes}
                  onChange={(e) => setReservationNotes(e.target.value)}
                  className="w-full border rounded-xl p-4"
                  placeholder="Add notes..."
                />

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setNotesModalOpen(false)}
                    className="flex-1 border rounded-xl py-3"
                  >
                    Cancel
                  </button>

                  <button className="flex-1 bg-orange-500 text-white rounded-xl py-3">
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* custom styles for react-day-picker: orange hover, selected, dot */}
          <style jsx>{`
            /* react-day-picker base day is .rdp-day */
            .rdp-day {
              border-radius: 50%;
            }
            .rdp-day:hover {
              /* light orange background on hover */
              background: #fed7aa !important;
            }
            /* selected day */
            .rdp-day_selected {
              background: #f97316 !important;
              color: white !important;
              border-color: #ea580c !important;
            }
            /* today highlight (optional) */
            .rdp-day_today {
              background: #fff7ed !important;
              color: #f97316 !important;
              font-weight: 600;
            }
            /* small orange dot for days that have reservations */
            .has-res {
              position: relative;
            }
            .has-res::after {
              content: "";
              position: absolute;
              bottom: 6px;
              left: 50%;
              transform: translateX(-50%);
              width: 6px;
              height: 6px;
              background-color: #f97316;
              border-radius: 999px;
            }
          `}</style>
        </div>
      </div>
    </div>
  );
};

export default OwnerBooking;
