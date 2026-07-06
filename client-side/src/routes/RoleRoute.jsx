import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import userAPI from "../apis/user.api";

const RoleRoute = ({ allowedRoles }) => {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await userAPI.get("/profile");

        setUserRole(data.role);

        if (allowedRoles.includes(data.role)) {
          setAuthorized(true);
        } else {
          toast.error(`You are not authorized to access this page.`, {
            duration: 3000,
            position: "top-center",
          });

          setAuthorized(false);
        }
      } catch (error) {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [allowedRoles]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    switch (userRole) {
      case "owner":
        return <Navigate to="/owner/dashboard" replace />;

      case "customer":
        return <Navigate to="/" replace />;

      case "admin":
        return <Navigate to="/admin/dashboard" replace />;

      default:
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return <Outlet />;
};

export default RoleRoute;
