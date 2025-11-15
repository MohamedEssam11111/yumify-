
import { useEffect ,useState } from 'react';
import CartItem from '../components/CartItem';
import userAPI from '../apis/user.api';
import cartAPI from '../apis/cart.api';
import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';



const Cart = () => {

    const [cart, setCart] = useState(null);
    const [userData, setUserData] = useState(null);
    const navigator = useNavigate();

    useEffect(() => {
        cartAPI.get('/').then((res) => setCart(res.data)).catch((err) => console.log('err fetching cart', err));
        userAPI.get('/profile').then((res) => setUserData(res.data)).catch((err) => console.log('err fetching profile', err));
    }, []);
  
  const subtotal = cart?.items?.reduce((total, item) => total + item.food.price * item.quantity, 0);
  const TAX_RATE = 0.05; 
  const DELIVERY_FEE = 5.00;

  const taxes = subtotal * TAX_RATE;
  const total = subtotal + taxes + DELIVERY_FEE;


  const formatCurrency = (amount) => `$${Number(amount).toFixed(2)}`;
    console.log('cart', cart);
  return (
    <div className="min-h-screen bg-gray-50">
      

      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-600 flex items-center gap-4 ">
            <button>
                <ArrowLeft onClick={()=>{navigator('/')}} />
            </button>
            Yumify
        </h1>
        <div className="flex space-x-4">
            <button onClick={()=>{navigator('/profile')}} className="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200">
                <img className='rounded-full' src={userData ? `http://localhost:5000/uploads/users/${userData.imageUrl}` :`http://localhost:5000/uploads/users/def.svg` } alt="Profile pic" />
            </button>
        </div>
      </header>


      <main className="container mx-auto p-6 lg:p-10">
        <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
        
        <div className="flex flex-col lg:flex-row lg:space-x-10">
          

          <div className="lg:w-2/3 bg-white p-6 rounded-xl shadow-lg mb-8 lg:mb-0">
            {cart?.items?.map(item => (
              <CartItem key={item._id} item={item} setCart={setCart} />
            ))}
            <hr className="mt-4" />
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              

              <div className="mb-6">
                <h3 className="font-semibold mb-2">Order Options</h3>
                <div className="flex items-center justify-between bg-gray-100 p-1 rounded-full">
                  <span className="p-2 text-sm">Pickup</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                  <span className="p-2 text-sm font-bold text-orange-500">Delivery</span>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Promo Code</h3>
                <div className="flex space-x-2">
                  <input 
                    type="text" 
                    placeholder="Enter coupon code" 
                    className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button className="bg-orange-300 text-white font-semibold py-2 px-4 rounded-lg hover:bg-orange-400 transition duration-150">
                    Apply
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 mb-4 text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (5%)</span>
                  <span>{formatCurrency(taxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatCurrency(DELIVERY_FEE)}</span>
                </div>
              </div>
              
              <hr className="my-4" />
              
              <div className="flex justify-between items-center text-2xl font-bold mb-6">
                <span>Total</span>
                <span className="text-orange-600">{formatCurrency(total)}</span>
              </div>
              

              <button onClick={()=>{navigator('/paymentCheckout')}} className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition duration-150 shadow-lg">
                Proceed to Payment
              </button>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Cart;