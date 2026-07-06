import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import userAPI from "../apis/user.api";

const CustomerRoute = () => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await userAPI.get("/profile");

        if (res.data.role !== "customer") {
          setAuthorized(false);
        } else {
          setAuthorized(true);
        }
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default CustomerRoute;
