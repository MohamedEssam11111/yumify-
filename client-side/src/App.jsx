
import "./App.css";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import FoodDetails from './pages/FoodDetails'
import {Routes,Route} from 'react-router'
import Register from "./pages/Regsiter";
import Login from "./pages/Login";
import PaymentCheckout from './pages/PaymentCheckout'
import NotFound from "./pages/NotFound"
import TrackOrder from './pages/TrackOrder'
import ProtectedRoute from "./pages/ProtectedRoute";
import Favorites from "./pages/Favourites";
import Orders from "./pages/Orders";
import Cart from "./pages/Cart";

function App() {
  return (
    < >
      <Routes>
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
        <Route path='*' element={<NotFound/>} />
      </Routes>
    </>
  )
}

export default App;
