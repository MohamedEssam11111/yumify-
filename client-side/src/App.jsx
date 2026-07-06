import "./App.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FoodDetails from "./pages/FoodDetails";
import { Routes, Route, Navigate, useLocation } from "react-router";
import Register from "./pages/Regsiter";
import Login from "./pages/Login";
import PaymentCheckout from "./pages/PaymentCheckout";
import NotFound from "./pages/NotFound";
import TrackOrder from "./pages/TrackOrder";
import ProtectedRoute from "./pages/ProtectedRoute";
import Favorites from "./pages/Favourites";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import EmailVerification from "./pages/EmailVerification";
import Invoice from "./pages/Invoice";
import ForgotPassword from "./pages/ForgotPassword";
//============= OWNER ROUTES ================
import OwnerRoute from "./pages/OwnerRoute";
import OwnerLayout from "./Layouts/OwnerLayout";
import ODashboard from "./pages/ODashboard";
import OOrders from "./pages/OOrders";
import OOrderDetails from "./pages/OOrderDetails";
import Notifications from "./pages/Notifications";
import OwnerSettings from "./pages/OwnerSettings";
import CustomerSettings from "./pages/CustomerSettings";
import CustomerBooking from "./components/CustomerBooking";
import OwnerBooking from "./components/OwnerBooking";
import Inventory from "./pages/Inventory";
import Menu from "./pages/Menu";
import Staff from "./pages/Staff";
import Suppliers from "./pages/Suppliers";
import Feedback from "./pages/Feedback";
import ThemeProvider from "./context/ThemeContext";
import Chatbot from "./components/Chatbot";
import ResetPassword from "./pages/ResetPassword";
import Promotion from "./pages/promotions";
import VerifyEmail from "./pages/VerifyEmail";
import RoleRoute from "./routes/RoleRoute";
import AdminDashboard from "./pages/AdminDashboard";
function App() {
  function AppContent() {
    const location = useLocation();

    const shouldShowChatbot = location.pathname === "/";
    return (
      <>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<Home />} />
          <Route path="/food/:foodid" element={<FoodDetails />} />
          <Route path="/profile" element={<Profile />} />
          {/* ========================= */}
          {/* Customer Routes */}
          {/* ========================= */}
          <Route element={<RoleRoute allowedRoles={["customer"]} />}>
            <Route path="/track/:orderId" element={<TrackOrder />} />
            <Route path="/paymentCheckout" element={<PaymentCheckout />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/customer/settings" element={<CustomerSettings />} />
            <Route path="/customer/booking" element={<CustomerBooking />} />
            <Route path="/myOrders" element={<Orders />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/invoice/:orderId" element={<Invoice />} />
          </Route>

          {/* ========================= */}
          {/* Owner Routes */}
          {/* ========================= */}
          <Route element={<RoleRoute allowedRoles={["owner"]} />}>
            <Route element={<OwnerLayout />}>
              <Route
                path="/owner"
                element={<Navigate replace to="/owner/dashboard" />}
              />

              <Route path="/owner/dashboard" element={<ODashboard />} />
              <Route path="/owner/orders" element={<OOrders />} />
              <Route path="/owner/orders/:id" element={<OOrderDetails />} />
              <Route path="/owner/notifications" element={<Notifications />} />
              <Route path="/owner/inventory" element={<Inventory />} />
              <Route path="/owner/reservation" element={<OwnerBooking />} />
              <Route path="/owner/menu" element={<Menu />} />
              <Route path="/owner/staff" element={<Staff />} />
              <Route path="/owner/feedback" element={<Feedback />} />
              <Route path="/owner/suppliers" element={<Suppliers />} />
              <Route path="/owner/settings" element={<OwnerSettings />} />
              <Route path="/owner/promotions" element={<Promotion />} />
            </Route>
          </Route>
          {/* ===================== ADMIN ROUTES ===================== */}

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Chatbot */}
        {shouldShowChatbot && <Chatbot />}
      </>
    );
  }
  return (
    // prettier-ignore
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
// CI/CD Test
