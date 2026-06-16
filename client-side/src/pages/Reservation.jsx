import { useEffect, useState } from "react";
import CustomerBooking from "../components/CustomerBooking";
import AdminBooking from "../components/AdminBooking";
import { Routes, Route, Link } from "react-router-dom";
import userAPI from "../apis/user.api";
import { CornerDownLeft } from "lucide-react";
const Reservation = () => {
  const [roleChange, setRoleChange] = useState({
    role: "owner",
  });
  useEffect(() => {
    userAPI
      .get("/profile")
      .then((response) => {
        setRoleChange({ role: response.data.role });
        console.log("user API response:", response.data);
      })
      .catch((error) => {
        console.error("Error fetching userAPI:", error);
      });
  }, []);
  const [move, setMove] = useState(false);

  return (
    <>
      <div className="yumify-bg-wrapper">
        {roleChange.role === "owner" && (
          <div className=" flex flex-col justify-center items-center ">
            <AdminBooking />
          </div>
        )}
        {roleChange.role === "customer" && (
          <div className="h-[100vh] flex justify-center items-center">
            <CustomerBooking />
          </div>
        )}
      </div>
      {roleChange.role === "customer" && (
        <Link
          to="/"
          className="absolute left-[30px] top-[50px] rounded-[50%] p-[10px] bg-white"
        >
          <CornerDownLeft />
        </Link>
      )}
      {roleChange.role === "owner" && (
        <Link
          to="/owner"
          className="absolute left-[30px] top-[50px] rounded-[50%] p-[10px] bg-white"
        >
          <CornerDownLeft />
        </Link>
      )}
    </>
  );
};

export default Reservation;
