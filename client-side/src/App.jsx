
import "./App.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FoodDetails from './pages/FoodDetails'
import {Routes, Route, Navigate} from 'react-router'
import Register from "./pages/Regsiter";
import Login from "./pages/Login";
import PaymentCheckout from './pages/PaymentCheckout'
import NotFound from "./pages/NotFound"
import TrackOrder from './pages/TrackOrder'
import ProtectedRoute from "./pages/ProtectedRoute";
import Favorites from "./pages/Favourites";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";
import EmailVerification from "./pages/EmailVerification";
import Invoice from "./pages/Invoice";
import ForgotPassword from "./pages/ForgotPassword";
//============= OWNER ROUTES ================
import OwnerRoute from './pages/OwnerRoute';
import OwnerLayout from "./Layouts/OwnerLayout";
import ODashboard from "./pages/ODashboard";
import OOrders from "./pages/OOrders";
import OOrderDetails from "./pages/OOrderDetails";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Inventory from "./pages/Inventory";
import Menu from "./pages/Menu";
import Staff from "./pages/Staff";
import Suppliers from "./pages/Suppliers";
import Feedback from "./pages/Feedback";
import ThemeProvider from "./context/ThemeContext";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    
    <ThemeProvider>
      <Routes>  
        {/* User routes */}
        <Route path="/" element={<Home/>} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />
        <Route path='/food/:foodid' element={<FoodDetails/>} />
        <Route path="/track/:orderId" element={<ProtectedRoute><TrackOrder/></ProtectedRoute> }/>
        <Route path="/register" element={<Register/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/paymentCheckout" element={<ProtectedRoute><PaymentCheckout/></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><Favorites/></ProtectedRoute>} />
        <Route path="/myOrders" element={<ProtectedRoute><Orders/></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><Cart/></ProtectedRoute>} />
        <Route path="/emailVerfication" element={<EmailVerification/>} />
        <Route path="/invoice/:orderId" element={<ProtectedRoute><Invoice/></ProtectedRoute>} />
        <Route path="/forgotPassword" element={<ForgotPassword/>} />
        {/* Owner routes */}
        <Route path="" element={<OwnerRoute />}>
        <Route element={<OwnerLayout />}>
          {/* Dashboard routes */}
          <Route path="/owner/dashboard" element={<ProtectedRoute> <ODashboard/> </ProtectedRoute>} />
          <Route path="/owner" element={<Navigate replace to="/owner/dashboard" />} /> 

          {/* Orders routes */}
          <Route path="/owner/orders" element={<ProtectedRoute> <OOrders/> </ProtectedRoute>} />
          <Route path="/owner/orders/:id" element={<ProtectedRoute> <OOrderDetails/> </ProtectedRoute>} />

          {/* Other owner pages */}
          <Route path="/owner/notifications" element={<ProtectedRoute> <Notifications/> </ProtectedRoute>} />
          <Route path="/owner/inventory" element={ <ProtectedRoute> <Inventory /> </ProtectedRoute> } />
          <Route path="/owner/menu" element={<ProtectedRoute> <Menu /> </ProtectedRoute>} />
          <Route path="/owner/staff" element={<ProtectedRoute> <Staff /> </ProtectedRoute>} />
          <Route path="/owner/feedback" element={<ProtectedRoute> <Feedback /> </ProtectedRoute>} />
          <Route path="/owner/suppliers" element={<ProtectedRoute> <Suppliers /> </ProtectedRoute>} />
          <Route path="/owner/settings" element={<ProtectedRoute> <Settings /> </ProtectedRoute>} />
        </Route>
      </Route>
        {/* NotFound */}
        <Route path='*' element={<NotFound/>} />
      </Routes>
      {/* Chatbot - appears on all pages */}
      <Chatbot />
    </ThemeProvider>
    
  )
}

export default App;
