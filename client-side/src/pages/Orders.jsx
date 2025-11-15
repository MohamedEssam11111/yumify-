import {useState,useEffect} from 'react'

import userAPI from '../apis/user.api'


import OrderCard from '../components/Order'
import { Link , useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import OrderCardWithStatus from '../components/OrderCardWithStatus'


const Orders = () => {
    const [userData,setUserData] = useState(null)
    // const [ownerData,setOwnerData] = useState(null)
    const navigator = useNavigate()
    useEffect(()=>{
        userAPI.get('/getOrders').then((res)=>{
            if(res.data) setUserData(res.data)
            else console.log('user data doesnt return')
        })
    },[])
    // useEffect(()=>{
    //   userAPI.get('/getOwnerOrders').then((res)=>{
    //       if(res.data) setOwnerData(res.data)
    //       else console.log('user data doesnt return')
    //   })
    // },[])
  return (
    <>
        <div class="flex flex-col min-h-screen bg-gray-50">

  <header class="bg-white/80 backdrop-blur-lg sticky top-0 z-20 p-4 flex justify-between items-center shadow-sm">
    <h1 class="text-2xl font-logo text-orange-500 flex items-center space-x-4 gap-4">
        <Link to="/" class="flex items-center">
            <ArrowLeft  />
        </Link>
        Yumify Orders
        </h1>
    <div class="flex items-center space-x-4">
      <button onClick={()=>{navigator('/profile')}} class="p-2 w-14 h-14 rounded-full text-gray-700 hover:bg-gray-200">
        <img src={userData ? `http://localhost:5000/uploads/users/${userData.imageUrl}` :`http://localhost:5000/uploads/users/def.svg` } alt="Profile" class="rounded-full" />
      </button>
    </div>
  </header>

  <main class="flex-1 p-6">
    <div class=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {

            userData && userData.role === 'customer' ? userData.orders.map((order) => (
                <OrderCard key={order._id} order={order} />
            )) : <p className="text-center w-full col-span-full text-gray-500">
                    Loading orders...
                </p>

        }

    </div>
  </main>
</div>

    </>
  )
}

export default Orders;