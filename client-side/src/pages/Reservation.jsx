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
            <nav className="relative mt-[50px] w-[320px] flex justify-between mb-[40px] p-[5px] bg-black rounded-[25px] max-sm:w-[280px]">
              <div
                className={`absolute bg-prim z-[0] rounded-[25px] w-[150px] h-[40px]   duration-[0.2s] max-sm:w-[125px] max-sm:h-[35px] ${
                  move == true
                    ? "translate-x-[160px] max-sm:translate-x-[145px]"
                    : "translate-x-[0px]"
                }`}
              ></div>
              <Link
                onClick={() => setMove(false)}
                className="z-[1] rounded-[25px]  text-[20px] w-[150px] h-[40px] flex justify-center items-center text-[20px] text-white max-sm:text-[16px] max-sm:h-[35px] max-sm:w-[135px]"
                to={"/reservation/customerBooking"}
              >
                customer View
              </Link>
              <Link
                onClick={() => setMove(true)}
                className="z-[1] rounded-[25px]   text-[20px] w-[150px] h-[40px] flex justify-center items-center text-white max-sm:text-[16px] max-sm:h-[35px] max-sm:w-[135px]"
                to={"/reservation/adminBooking"}
              >
                admin View
              </Link>
            </nav>
            <Routes>
              <Route path="/" element={<CustomerBooking />} />
              <Route path="customerBooking" element={<CustomerBooking />} />
              <Route path="adminBooking" element={<AdminBooking />} />
            </Routes>
            {/* <AdminBooking /> */}
            {/* <CustomerBooking /> */}
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
