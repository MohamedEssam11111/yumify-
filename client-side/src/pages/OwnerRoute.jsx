import { useState, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import ownerApi from "../apis/client.js";

/**
 * OwnerRoute - Protected Route Component
 * 
 * Acts as a guard for owner portal routes using cookie-based JWT authentication.
 * - If user is authenticated (valid JWT in cookies): renders child routes via <Outlet />
 * - If user is not authenticated: redirects to /owner/login
 * - Preserves attempted path in state for redirect after login
 * 
 * @example
 * ```jsx
 * <Route path="/owner" element={<OwnerRoute />}>
 *   <Route path="dashboard" element={<Dashboard />} />
 * </Route>
 * ```
 */
const OwnerRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = loading, true/false = checked
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated by calling the /me endpoint
    const checkAuth = async () => {
      try {
        // The API will use the JWT cookie automatically
        await ownerApi.me();
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication check failed:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-gray-50"
        aria-label="Loading authentication"
      >
        <div className="flex flex-col items-center gap-4">
          {/* Loading spinner */}
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login with current location as state
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/owner/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // User is authenticated, render child routes
  return <Outlet />;
};

export default OwnerRoute;